#!/bin/bash

# Deployment script for ESA Hubble Picture of the Week Lambda function
# This script packages and deploys the Lambda function code

set -e

# Configuration
ENVIRONMENT=${1:-dev}
FUNCTION_NAME="infinite-esa-hubble-potw-fetcher-${ENVIRONMENT}"
LAMBDA_DIR="backend/functions/scheduled"
PACKAGE_DIR="esa-hubble-potw-fetcher"

echo "🚀 Deploying ESA Hubble POTW Lambda function for environment: ${ENVIRONMENT}"
echo "Function name: ${FUNCTION_NAME}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if function exists
if ! aws lambda get-function --function-name "${FUNCTION_NAME}" > /dev/null 2>&1; then
    echo "❌ Lambda function ${FUNCTION_NAME} does not exist."
    echo "Please run setup-esa-hubble-lambda.sh first."
    exit 1
fi

# Navigate to the Lambda directory
cd "../functions/scheduled"

# Check if the main function file exists
if [ ! -f "esa-hubble-potw-fetcher.js" ]; then
    echo "❌ Main function file esa-hubble-potw-fetcher.js not found in ${LAMBDA_DIR}"
    exit 1
fi

# Create deployment package directory
echo "📦 Creating deployment package..."
rm -rf "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}"

# Copy main function file
cp esa-hubble-potw-fetcher.js "${PACKAGE_DIR}/"

# Install dependencies
echo "📥 Installing dependencies..."
cd "${PACKAGE_DIR}"

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "esa-hubble-potw-fetcher",
  "version": "1.0.0",
  "description": "Lambda function to fetch ESA Hubble Picture of the Week RSS feed",
  "main": "esa-hubble-potw-fetcher.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0",
    "rss-parser": "^3.13.0",
    "uuid": "^9.0.0"
  }
}
EOF
fi

# Install dependencies
npm install --production

# Create deployment zip
echo "🗜️  Creating deployment package..."
zip -r ../esa-hubble-potw-fetcher.zip . -x "*.git*" "*.DS_Store*" "node_modules/.cache/*"

# Go back to parent directory
cd ..

# Deploy to AWS Lambda
echo "☁️  Deploying to AWS Lambda..."
aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file "fileb://esa-hubble-potw-fetcher.zip"

# Update function configuration
echo "⚙️  Updating function configuration..."
aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}" \
    --timeout 300 \
    --memory-size 512 \
    --environment Variables="{ENVIRONMENT=${ENVIRONMENT}}"

# Test the function
echo "🧪 Testing the function..."
echo "Invoking function manually for testing..."

# Get the function ARN for testing
FUNCTION_ARN=$(aws lambda get-function --function-name "${FUNCTION_NAME}" --query 'Configuration.FunctionArn' --output text)
echo "Function ARN: ${FUNCTION_ARN}"

# Invoke function for testing
echo "Running test invocation..."
TEST_RESULT=$(aws lambda invoke \
    --function-name "${FUNCTION_NAME}" \
    --payload '{}' \
    --cli-binary-format raw-in-base64-out \
    response.json)

echo "Test result: ${TEST_RESULT}"

# Display response
if [ -f "response.json" ]; then
    echo "Function response:"
    cat response.json | jq '.' 2>/dev/null || cat response.json
    rm response.json
fi

# Cleanup
echo "🧹 Cleaning up..."
rm -rf "${PACKAGE_DIR}"
rm -f esa-hubble-potw-fetcher.zip

echo ""
echo "🎉 ESA Hubble POTW Lambda deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Function name: ${FUNCTION_NAME}"
echo "  - Function ARN: ${FUNCTION_ARN}"
echo "  - Environment: ${ENVIRONMENT}"
echo ""
echo "📝 Next steps:"
echo "  1. Check CloudWatch logs for any errors"
echo "  2. Monitor the next scheduled execution (Tuesday 8:00 AM CET)"
echo "  3. Verify that content is being fetched and stored in DynamoDB"
echo ""
echo "🔍 Useful commands:"
echo "  - View logs: aws logs tail /aws/lambda/${FUNCTION_NAME} --follow"
echo "  - Invoke manually: aws lambda invoke --function-name ${FUNCTION_NAME} --payload '{}' response.json"
echo "  - Check function status: aws lambda get-function --function-name ${FUNCTION_NAME}"
