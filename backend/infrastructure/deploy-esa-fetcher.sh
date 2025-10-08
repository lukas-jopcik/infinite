#!/bin/bash

# Deploy ESA Fetcher Lambda Function for Infinite v1.0
# This script packages and deploys the ESA fetcher function

set -e

echo "🚀 Deploying ESA Fetcher Lambda function for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
FUNCTION_NAME="infinite-esa-fetcher-${ENVIRONMENT}"
FUNCTION_DIR="/Users/jopcik/Desktop/infinite-v2/backend/functions/scheduled"

echo "📋 Deploying function: ${FUNCTION_NAME}"
echo "📁 Function directory: ${FUNCTION_DIR}"

# Navigate to function directory
cd ${FUNCTION_DIR}

# Create deployment package
echo "📦 Creating deployment package..."
zip -r esa-fetcher.zip esa-fetcher.js package.json node_modules/ -x "*.test.js" "*.spec.js"

# Deploy to Lambda
echo "🚀 Deploying to Lambda..."
aws lambda update-function-code \
    --function-name ${FUNCTION_NAME} \
    --zip-file fileb://esa-fetcher.zip \
    --region ${REGION}

# Update environment variables
echo "🔧 Updating environment variables..."
cat > /tmp/esa-fetcher-env.json << EOF
{
    "Variables": {
        "ENVIRONMENT": "${ENVIRONMENT}",
        "REGION": "${REGION}",
        "DYNAMODB_RAW_CONTENT_TABLE": "InfiniteRawContent-${ENVIRONMENT}"
    }
}
EOF

aws lambda update-function-configuration \
    --function-name ${FUNCTION_NAME} \
    --environment file:///tmp/esa-fetcher-env.json \
    --region ${REGION}

# Clean up
echo "🧹 Cleaning up..."
rm -f esa-fetcher.zip
rm -f /tmp/esa-fetcher-env.json

echo "✅ ESA Fetcher deployed successfully!"
echo ""
echo "📋 Function details:"
echo "  📛 Name: ${FUNCTION_NAME}"
echo "  🌍 Region: ${REGION}"
echo "  📁 Runtime: Node.js 20.x"
echo "  💾 Memory: 256MB"
echo "  ⏱️  Timeout: 60s"
echo ""
echo "📝 Next steps:"
echo "  1. Test the function manually"
echo "  2. Set up EventBridge scheduled rule (weekly)"
echo "  3. Configure CloudWatch monitoring"
echo "  4. Test end-to-end ESA fetching"
