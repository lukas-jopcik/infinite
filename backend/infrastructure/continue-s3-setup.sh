#!/bin/bash

# Continue S3 and CloudFront Setup for Infinite v1.0
# This script continues the setup from where we left off

set -e

echo "🚀 Continuing S3 and CloudFront setup for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# S3 bucket names
IMAGES_BUCKET="infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"
ASSETS_BUCKET="infinite-assets-${ENVIRONMENT}-${ACCOUNT_ID}"

echo "📋 Continuing setup in region: ${REGION}"
echo "🪣 Images bucket: ${IMAGES_BUCKET}"
echo "🪣 Assets bucket: ${ASSETS_BUCKET}"

# 1. Configure S3 bucket policies
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
        }
    ]
}
EOF

# Apply bucket policies
aws s3api put-bucket-policy --bucket ${IMAGES_BUCKET} --policy file:///tmp/images-bucket-policy.json
aws s3api put-bucket-policy --bucket ${ASSETS_BUCKET} --policy file:///tmp/assets-bucket-policy.json

# 2. Configure CORS policies
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

# 3. Configure lifecycle policies for cost optimization
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

# 4. Enable versioning
echo "📝 Enabling versioning..."
aws s3api put-bucket-versioning --bucket ${IMAGES_BUCKET} --versioning-configuration Status=Enabled
aws s3api put-bucket-versioning --bucket ${ASSETS_BUCKET} --versioning-configuration Status=Enabled

# 5. Enable server-side encryption
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

# 6. Create folder structure in S3
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

# 7. Clean up temporary files
rm -f /tmp/images-bucket-policy.json
rm -f /tmp/assets-bucket-policy.json
rm -f /tmp/cors-config.json
rm -f /tmp/lifecycle-config.json

echo "✅ S3 setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  🪣 Images bucket: ${IMAGES_BUCKET}"
echo "  🪣 Assets bucket: ${ASSETS_BUCKET}"
echo "  🔒 Public access configured"
echo "  🌐 CORS policies set"
echo "  💰 Lifecycle policies configured"
echo "  📝 Versioning enabled"
echo "  🔐 Encryption enabled"
echo "  📁 Folder structure created"
echo ""
echo "📝 Next steps:"
echo "  1. Test S3 operations"
echo "  2. Set up CloudFront distribution (optional)"
echo "  3. Update environment variables"
echo "  4. Test image upload functionality"
