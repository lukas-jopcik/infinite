#!/bin/bash

# Configuration
ENVIRONMENT="dev"
REGION="eu-central-1"
ACCOUNT_ID="349660737637"

# Function names
AI_CONTENT_GENERATOR_FUNCTION_NAME="infinite-ai-content-generator-${ENVIRONMENT}"

# Table names
RAW_CONTENT_TABLE="InfiniteRawContent-${ENVIRONMENT}"
ARTICLES_TABLE="InfiniteArticles-${ENVIRONMENT}"

# S3 bucket names
IMAGES_BUCKET="infinite-images-${ENVIRONMENT}-${ACCOUNT_ID}"

# Secrets Manager ARNs
OPENAI_SECRET_ARN="arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:infinite/openai-api-key-l4iBim"

echo "🚀 Deploying updated AI Content Generator with image processing for Infinite v1.0..."
echo "📋 Deploying in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"
echo "🆔 Account ID: ${ACCOUNT_ID}"
echo "⚡ Function: ${AI_CONTENT_GENERATOR_FUNCTION_NAME}"

# Create deployment packages directory if it doesn't exist
mkdir -p deployment_packages

# 1. Install dependencies and create deployment package
echo "📦 Creating deployment package for AI Content Generator with image processing..."
cd ../functions/scheduled

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating ZIP package..."
zip -r9 ../../deployment_packages/ai-content-generator-updated.zip . -x "*.git*" "*.DS_Store*" "node_modules/.cache/*"

cd - > /dev/null # Go back to original directory

# 2. Deploy to Lambda
echo "🚀 Deploying to Lambda..."
aws lambda update-function-code \
    --function-name "${AI_CONTENT_GENERATOR_FUNCTION_NAME}" \
    --zip-file "fileb://deployment_packages/ai-content-generator-updated.zip" \
    --region "${REGION}"

# 3. Update environment variables
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name "${AI_CONTENT_GENERATOR_FUNCTION_NAME}" \
    --environment "Variables={
        ENVIRONMENT=${ENVIRONMENT},
        REGION=${REGION},
        DYNAMODB_RAW_CONTENT_TABLE=${RAW_CONTENT_TABLE},
        DYNAMODB_ARTICLES_TABLE=${ARTICLES_TABLE},
        S3_IMAGES_BUCKET=${IMAGES_BUCKET},
        OPENAI_SECRET_ARN=${OPENAI_SECRET_ARN}
    }" \
    --region "${REGION}"

# 4. Update function configuration for image processing
echo "⚙️ Updating function configuration for image processing..."
aws lambda update-function-configuration \
    --function-name "${AI_CONTENT_GENERATOR_FUNCTION_NAME}" \
    --memory-size 1024 \
    --timeout 300 \
    --region "${REGION}"

# 5. Verify deployment
echo "✅ Verifying deployment..."
aws lambda get-function-configuration \
    --function-name "${AI_CONTENT_GENERATOR_FUNCTION_NAME}" \
    --query '{Name: FunctionName, Runtime: Runtime, MemorySize: MemorySize, Timeout: Timeout, LastModified: LastModified}' \
    --output json \
    --region "${REGION}" | jq .

echo "🎉 AI Content Generator with image processing deployed successfully!"

echo ""
echo "📋 Summary:"
echo "  ⚡ Function: ${AI_CONTENT_GENERATOR_FUNCTION_NAME}"
echo "  🧠 Features: OpenAI integration, Slovak content generation, image processing"
echo "  🖼️  Image Processing: Sharp library, WebP conversion, multiple sizes"
echo "  📦 Dependencies: Sharp, Axios, AWS SDK v3"
echo "  💾 Memory: 1024 MB (increased for image processing)"
echo "  ⏱️  Timeout: 300 seconds (5 minutes)"
echo ""
echo "📝 Next steps:"
echo "  1. Test the updated function"
echo "  2. Verify image processing functionality"
echo "  3. Check S3 uploads"
echo "  4. Monitor CloudWatch logs"
echo ""
echo "💰 Cost estimate:"
echo "  - Lambda: ~$0.20 per 1M requests + $0.0000166667 per GB-second"
echo "  - S3: ~$0.023 per GB storage + $0.0004 per 1K PUT requests"
echo "  - Total: ~$5-10/month for moderate usage"
