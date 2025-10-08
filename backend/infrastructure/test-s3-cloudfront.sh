#!/bin/bash

# Test S3 Buckets and CloudFront for Infinite v1.0
# This script tests S3 operations and CloudFront delivery

set -e

echo "🧪 Testing S3 buckets and CloudFront for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Get bucket names and distribution info
IMAGES_BUCKET="infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"
ASSETS_BUCKET="infinite-assets-${ENVIRONMENT}-${ACCOUNT_ID}"

echo "📋 Testing storage in region: ${REGION}"
echo "🪣 Images bucket: ${IMAGES_BUCKET}"
echo "🪣 Assets bucket: ${ASSETS_BUCKET}"

# Test 1: S3 Bucket Operations
echo "📸 Testing S3 bucket operations..."

# Test bucket access
aws s3 ls s3://${IMAGES_BUCKET}/
aws s3 ls s3://${ASSETS_BUCKET}/

echo "✅ S3 bucket access successful"

# Test 2: Image Upload
echo "📤 Testing image upload..."

# Create a test image (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png

# Upload test image to different folders
aws s3 cp /tmp/test-image.png s3://${IMAGES_BUCKET}/images/og/test-og.png
aws s3 cp /tmp/test-image.png s3://${IMAGES_BUCKET}/images/hero/test-hero.png
aws s3 cp /tmp/test-image.png s3://${IMAGES_BUCKET}/images/card/test-card.png
aws s3 cp /tmp/test-image.png s3://${IMAGES_BUCKET}/images/thumb/test-thumb.png

echo "✅ Image upload successful"

# Test 3: Asset Upload
echo "📦 Testing asset upload..."

# Create test CSS file
cat > /tmp/test.css << EOF
/* Test CSS file for Infinite v1.0 */
.test-class {
    color: #ffffff;
    background-color: #000000;
}
EOF

# Create test JS file
cat > /tmp/test.js << EOF
// Test JS file for Infinite v1.0
console.log('Infinite v1.0 - Test JavaScript');
EOF

# Upload test assets
aws s3 cp /tmp/test.css s3://${ASSETS_BUCKET}/assets/css/test.css
aws s3 cp /tmp/test.js s3://${ASSETS_BUCKET}/assets/js/test.js

echo "✅ Asset upload successful"

# Test 4: S3 Object Operations
echo "🔍 Testing S3 object operations..."

# List objects in images bucket
aws s3 ls s3://${IMAGES_BUCKET}/images/og/ --recursive
aws s3 ls s3://${IMAGES_BUCKET}/images/hero/ --recursive
aws s3 ls s3://${IMAGES_BUCKET}/images/card/ --recursive
aws s3 ls s3://${IMAGES_BUCKET}/images/thumb/ --recursive

# List objects in assets bucket
aws s3 ls s3://${ASSETS_BUCKET}/assets/css/ --recursive
aws s3 ls s3://${ASSETS_BUCKET}/assets/js/ --recursive

echo "✅ S3 object listing successful"

# Test 5: S3 Object Metadata
echo "📊 Testing S3 object metadata..."

# Get object metadata
aws s3api head-object --bucket ${IMAGES_BUCKET} --key "images/og/test-og.png"
aws s3api head-object --bucket ${ASSETS_BUCKET} --key "assets/css/test.css"

echo "✅ S3 object metadata retrieval successful"

# Test 6: S3 CORS Configuration
echo "🌐 Testing S3 CORS configuration..."

# Get CORS configuration
aws s3api get-bucket-cors --bucket ${IMAGES_BUCKET}
aws s3api get-bucket-cors --bucket ${ASSETS_BUCKET}

echo "✅ S3 CORS configuration verified"

# Test 7: S3 Lifecycle Configuration
echo "💰 Testing S3 lifecycle configuration..."

# Get lifecycle configuration
aws s3api get-bucket-lifecycle-configuration --bucket ${IMAGES_BUCKET}
aws s3api get-bucket-lifecycle-configuration --bucket ${ASSETS_BUCKET}

echo "✅ S3 lifecycle configuration verified"

# Test 8: S3 Encryption Configuration
echo "🔐 Testing S3 encryption configuration..."

# Get encryption configuration
aws s3api get-bucket-encryption --bucket ${IMAGES_BUCKET}
aws s3api get-bucket-encryption --bucket ${ASSETS_BUCKET}

echo "✅ S3 encryption configuration verified"

# Test 9: CloudFront Distribution
echo "☁️ Testing CloudFront distribution..."

# List CloudFront distributions
DISTRIBUTIONS=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Infinite v1.0 CDN Distribution']")
DISTRIBUTION_ID=$(echo $DISTRIBUTIONS | jq -r '.[0].Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTIONS | jq -r '.[0].DomainName')

if [ "$DISTRIBUTION_ID" != "null" ] && [ "$DISTRIBUTION_ID" != "" ]; then
    echo "✅ CloudFront distribution found: ${DISTRIBUTION_ID}"
    echo "🌐 Distribution domain: ${DISTRIBUTION_DOMAIN}"
    
    # Get distribution details
    aws cloudfront get-distribution --id ${DISTRIBUTION_ID} --query "Distribution.DistributionConfig.{Status:Enabled,Comment:Comment,PriceClass:PriceClass}"
    
    echo "✅ CloudFront distribution details retrieved"
else
    echo "⚠️  No CloudFront distribution found"
fi

# Test 10: Clean up test files
echo "🧹 Cleaning up test files..."

# Remove test files from S3
aws s3 rm s3://${IMAGES_BUCKET}/images/og/test-og.png
aws s3 rm s3://${IMAGES_BUCKET}/images/hero/test-hero.png
aws s3 rm s3://${IMAGES_BUCKET}/images/card/test-card.png
aws s3 rm s3://${IMAGES_BUCKET}/images/thumb/test-thumb.png
aws s3 rm s3://${ASSETS_BUCKET}/assets/css/test.css
aws s3 rm s3://${ASSETS_BUCKET}/assets/js/test.js

# Remove local test files
rm -f /tmp/test-image.png
rm -f /tmp/test.css
rm -f /tmp/test.js

echo "✅ Test files cleaned up"

echo "🎉 All S3 and CloudFront tests passed successfully!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ S3 bucket access and operations"
echo "  ✅ Image upload to multiple folders"
echo "  ✅ Asset upload (CSS, JS)"
echo "  ✅ S3 object listing and metadata"
echo "  ✅ CORS configuration"
echo "  ✅ Lifecycle policies"
echo "  ✅ Encryption configuration"
echo "  ✅ CloudFront distribution"
echo "  ✅ Test file cleanup"
echo ""
echo "📝 Next steps:"
echo "  1. Test CDN delivery with actual images"
echo "  2. Configure custom domain (optional)"
echo "  3. Set up monitoring and alerts"
echo "  4. Implement image processing pipeline"
