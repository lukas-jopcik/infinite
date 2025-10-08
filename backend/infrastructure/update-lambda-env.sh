#!/bin/bash

# Update Lambda Environment Variables for Infinite v1.0
# This script updates environment variables for all Lambda functions

set -e

echo "🔧 Updating Lambda environment variables for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Function names
CONTENT_GENERATOR_FUNCTION="infinite-content-generator-${ENVIRONMENT}"
API_HANDLER_FUNCTION="infinite-api-handler-${ENVIRONMENT}"
IMAGE_PROCESSOR_FUNCTION="infinite-image-processor-${ENVIRONMENT}"
APOD_FETCHER_FUNCTION="infinite-apod-fetcher-${ENVIRONMENT}"
ESA_FETCHER_FUNCTION="infinite-esa-fetcher-${ENVIRONMENT}"

echo "📋 Updating environment variables in region: ${REGION}"

# Create environment variable files
echo "📝 Creating environment variable files..."

# Content Generator environment variables
cat > /tmp/content-generator-env.json << EOF
{
    "ENVIRONMENT": "${ENVIRONMENT}",
    "REGION": "${REGION}",
    "DYNAMODB_RAW_CONTENT_TABLE": "InfiniteRawContent-${ENVIRONMENT}",
    "DYNAMODB_ARTICLES_TABLE": "InfiniteArticles-${ENVIRONMENT}",
    "S3_IMAGES_BUCKET": "infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"
}
EOF

# API Handler environment variables
cat > /tmp/api-handler-env.json << EOF
{
    "ENVIRONMENT": "${ENVIRONMENT}",
    "REGION": "${REGION}",
    "DYNAMODB_ARTICLES_TABLE": "InfiniteArticles-${ENVIRONMENT}",
    "DYNAMODB_USERS_TABLE": "InfiniteUsers-${ENVIRONMENT}",
    "DYNAMODB_ANALYTICS_TABLE": "InfiniteAnalytics-${ENVIRONMENT}"
}
EOF

# Image Processor environment variables
cat > /tmp/image-processor-env.json << EOF
{
    "ENVIRONMENT": "${ENVIRONMENT}",
    "REGION": "${REGION}",
    "S3_IMAGES_BUCKET": "infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"
}
EOF

# APOD Fetcher environment variables
cat > /tmp/apod-fetcher-env.json << EOF
{
    "ENVIRONMENT": "${ENVIRONMENT}",
    "REGION": "${REGION}",
    "DYNAMODB_RAW_CONTENT_TABLE": "InfiniteRawContent-${ENVIRONMENT}"
}
EOF

# ESA Fetcher environment variables
cat > /tmp/esa-fetcher-env.json << EOF
{
    "ENVIRONMENT": "${ENVIRONMENT}",
    "REGION": "${REGION}",
    "DYNAMODB_RAW_CONTENT_TABLE": "InfiniteRawContent-${ENVIRONMENT}"
}
EOF

# Update environment variables
echo "🔧 Updating Content Generator environment variables..."
aws lambda update-function-configuration \
    --function-name ${CONTENT_GENERATOR_FUNCTION} \
    --environment Variables="$(cat /tmp/content-generator-env.json)" \
    --region ${REGION}

echo "🔧 Updating API Handler environment variables..."
aws lambda update-function-configuration \
    --function-name ${API_HANDLER_FUNCTION} \
    --environment Variables="$(cat /tmp/api-handler-env.json)" \
    --region ${REGION}

echo "🔧 Updating Image Processor environment variables..."
aws lambda update-function-configuration \
    --function-name ${IMAGE_PROCESSOR_FUNCTION} \
    --environment Variables="$(cat /tmp/image-processor-env.json)" \
    --region ${REGION}

echo "🔧 Updating APOD Fetcher environment variables..."
aws lambda update-function-configuration \
    --function-name ${APOD_FETCHER_FUNCTION} \
    --environment Variables="$(cat /tmp/apod-fetcher-env.json)" \
    --region ${REGION}

echo "🔧 Updating ESA Fetcher environment variables..."
aws lambda update-function-configuration \
    --function-name ${ESA_FETCHER_FUNCTION} \
    --environment Variables="$(cat /tmp/esa-fetcher-env.json)" \
    --region ${REGION}

# Clean up temporary files
rm -f /tmp/*-env.json

echo "✅ Lambda environment variables updated successfully!"
echo ""
echo "📋 Updated functions:"
echo "  ⚡ Content Generator: ${CONTENT_GENERATOR_FUNCTION}"
echo "  🌐 API Handler: ${API_HANDLER_FUNCTION}"
echo "  🖼️  Image Processor: ${IMAGE_PROCESSOR_FUNCTION}"
echo "  🚀 APOD Fetcher: ${APOD_FETCHER_FUNCTION}"
echo "  🛰️  ESA Fetcher: ${ESA_FETCHER_FUNCTION}"
echo ""
echo "📝 Next steps:"
echo "  1. Test Lambda function invocations"
echo "  2. Set up EventBridge scheduled rules"
echo "  3. Implement actual function logic"
