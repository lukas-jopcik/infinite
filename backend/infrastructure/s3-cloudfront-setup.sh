#!/bin/bash

# S3 Buckets and CloudFront Setup for Infinite v1.0
# This script creates S3 buckets and CloudFront distribution for image storage and CDN

set -e

echo "🚀 Setting up S3 buckets and CloudFront for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# S3 bucket names (must be globally unique)
IMAGES_BUCKET="infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"
ASSETS_BUCKET="infinite-assets-${ENVIRONMENT}-${ACCOUNT_ID}"

echo "📋 Setting up storage in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"
echo "🆔 Account ID: ${ACCOUNT_ID}"
echo "🪣 Images bucket: ${IMAGES_BUCKET}"
echo "🪣 Assets bucket: ${ASSETS_BUCKET}"

# 1. Create S3 bucket for images
echo "📸 Creating S3 bucket for images..."
aws s3 mb s3://${IMAGES_BUCKET} --region ${REGION}

# 2. Create S3 bucket for assets
echo "📦 Creating S3 bucket for assets..."
aws s3 mb s3://${ASSETS_BUCKET} --region ${REGION}

# 3. Configure public access settings
echo "🔓 Configuring public access settings..."
aws s3api put-public-access-block --bucket ${IMAGES_BUCKET} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
aws s3api put-public-access-block --bucket ${ASSETS_BUCKET} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 4. Configure S3 bucket policies
echo "🔒 Configuring S3 bucket policies..."

# Images bucket policy
cat > /tmp/images-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${IMAGES_BUCKET}/*"
        },
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${IMAGES_BUCKET}/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/*"
                }
            }
        }
    ]
}
EOF

# Assets bucket policy
cat > /tmp/assets-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${ASSETS_BUCKET}/*"
        },
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${ASSETS_BUCKET}/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/*"
                }
            }
        }
    ]
}
EOF

# Apply bucket policies
aws s3api put-bucket-policy --bucket ${IMAGES_BUCKET} --policy file:///tmp/images-bucket-policy.json
aws s3api put-bucket-policy --bucket ${ASSETS_BUCKET} --policy file:///tmp/assets-bucket-policy.json

# 5. Configure CORS policies
echo "🌐 Configuring CORS policies..."

# CORS configuration
cat > /tmp/cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors --bucket ${IMAGES_BUCKET} --cors-configuration file:///tmp/cors-config.json
aws s3api put-bucket-cors --bucket ${ASSETS_BUCKET} --cors-configuration file:///tmp/cors-config.json

# 6. Configure lifecycle policies for cost optimization
echo "💰 Configuring lifecycle policies..."

# Lifecycle configuration
cat > /tmp/lifecycle-config.json << EOF
{
    "Rules": [
        {
            "ID": "InfiniteImagesLifecycle",
            "Status": "Enabled",
            "Filter": {
                "Prefix": ""
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 365,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "NoncurrentVersionTransitions": [
                {
                    "NoncurrentDays": 30,
                    "StorageClass": "STANDARD_IA"
                }
            ],
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            }
        }
    ]
}
EOF

# Apply lifecycle configuration
aws s3api put-bucket-lifecycle-configuration --bucket ${IMAGES_BUCKET} --lifecycle-configuration file:///tmp/lifecycle-config.json
aws s3api put-bucket-lifecycle-configuration --bucket ${ASSETS_BUCKET} --lifecycle-configuration file:///tmp/lifecycle-config.json

# 7. Enable versioning
echo "📝 Enabling versioning..."
aws s3api put-bucket-versioning --bucket ${IMAGES_BUCKET} --versioning-configuration Status=Enabled
aws s3api put-bucket-versioning --bucket ${ASSETS_BUCKET} --versioning-configuration Status=Enabled

# 8. Enable server-side encryption
echo "🔐 Enabling server-side encryption..."
aws s3api put-bucket-encryption --bucket ${IMAGES_BUCKET} --server-side-encryption-configuration '{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }
    ]
}'

aws s3api put-bucket-encryption --bucket ${ASSETS_BUCKET} --server-side-encryption-configuration '{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }
    ]
}'

# 9. Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."

# CloudFront distribution configuration
cat > /tmp/cloudfront-config.json << EOF
{
    "CallerReference": "infinite-cdn-$(date +%s)",
    "Comment": "Infinite v1.0 CDN Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 2,
        "Items": [
            {
                "Id": "S3-${IMAGES_BUCKET}",
                "DomainName": "${IMAGES_BUCKET}.s3.${REGION}.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginPath": "/images"
            },
            {
                "Id": "S3-${ASSETS_BUCKET}",
                "DomainName": "${ASSETS_BUCKET}.s3.${REGION}.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginPath": "/assets"
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${IMAGES_BUCKET}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "CacheBehaviors": {
        "Quantity": 1,
        "Items": [
            {
                "PathPattern": "/assets/*",
                "TargetOriginId": "S3-${ASSETS_BUCKET}",
                "ViewerProtocolPolicy": "redirect-to-https",
                "TrustedSigners": {
                    "Enabled": false,
                    "Quantity": 0
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {
                        "Forward": "none"
                    }
                },
                "MinTTL": 0,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100",
    "HttpVersion": "http2",
    "IsIPV6Enabled": true
}
EOF

# Create CloudFront distribution
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json)
DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')

echo "⏳ CloudFront distribution created: ${DISTRIBUTION_ID}"
echo "🌐 Distribution domain: ${DISTRIBUTION_DOMAIN}"

# 10. Create folder structure in S3
echo "📁 Creating folder structure..."

# Create folders in images bucket
aws s3api put-object --bucket ${IMAGES_BUCKET} --key "images/og/" --content-length 0
aws s3api put-object --bucket ${IMAGES_BUCKET} --key "images/hero/" --content-length 0
aws s3api put-object --bucket ${IMAGES_BUCKET} --key "images/card/" --content-length 0
aws s3api put-object --bucket ${IMAGES_BUCKET} --key "images/thumb/" --content-length 0

# Create folders in assets bucket
aws s3api put-object --bucket ${ASSETS_BUCKET} --key "assets/css/" --content-length 0
aws s3api put-object --bucket ${ASSETS_BUCKET} --key "assets/js/" --content-length 0
aws s3api put-object --bucket ${ASSETS_BUCKET} --key "assets/fonts/" --content-length 0

# 11. Clean up temporary files
rm -f /tmp/images-bucket-policy.json
rm -f /tmp/assets-bucket-policy.json
rm -f /tmp/cors-config.json
rm -f /tmp/lifecycle-config.json
rm -f /tmp/cloudfront-config.json

echo "✅ S3 and CloudFront setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  🪣 Images bucket: ${IMAGES_BUCKET}"
echo "  🪣 Assets bucket: ${ASSETS_BUCKET}"
echo "  ☁️  CloudFront distribution: ${DISTRIBUTION_ID}"
echo "  🌐 CDN domain: ${DISTRIBUTION_DOMAIN}"
echo ""
echo "📝 Next steps:"
echo "  1. Update environment variables with bucket names and distribution ID"
echo "  2. Test image upload functionality"
echo "  3. Verify CDN delivery"
echo "  4. Configure custom domain (optional)"
echo ""
echo "💰 Cost estimate:"
echo "  - S3 storage: ~$1-5/month (depends on usage)"
echo "  - CloudFront: ~$1-10/month (depends on traffic)"
echo "  - Total: ~$2-15/month"
