#!/bin/bash

# Deploy Hubble Lambda functions to AWS
# This script deploys hubble-fetcher and api-hubble Lambda functions

set -e

echo "🚀 Deploying Hubble Lambda functions..."

# Configuration
REGION="eu-central-1"
FUNCTION_PREFIX="infinite-hubble"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI configured. Current identity:"
aws sts get-caller-identity

# Deploy hubble-fetcher
print_status "Deploying hubble-fetcher Lambda function..."

cd aws/lambda/hubble-fetcher

# Install dependencies
print_status "Installing dependencies for hubble-fetcher..."
npm install --production

# Create deployment package
print_status "Creating deployment package for hubble-fetcher..."
zip -r hubble-fetcher.zip . -x "*.git*" "*.DS_Store*" "test*" "*.md"

# Deploy to AWS
print_status "Uploading hubble-fetcher to AWS Lambda..."
aws lambda update-function-code \
    --function-name "${FUNCTION_PREFIX}-fetcher" \
    --zip-file fileb://hubble-fetcher.zip \
    --region $REGION

# Update function configuration
print_status "Updating hubble-fetcher configuration..."
aws lambda update-function-configuration \
    --function-name "${FUNCTION_PREFIX}-fetcher" \
    --timeout 300 \
    --memory-size 256 \
    --environment Variables='{
        "HUBBLE_RSS_URL":"https://feeds.feedburner.com/esahubble/images/potw/",
        "PROCESSOR_FUNCTION":"infinite-content-processor",
        "REGION":"'$REGION'"
    }' \
    --region $REGION

print_status "✅ hubble-fetcher deployed successfully"

# Deploy api-hubble
print_status "Deploying api-hubble Lambda function..."

cd ../api-hubble

# Install dependencies
print_status "Installing dependencies for api-hubble..."
npm install --production

# Create deployment package
print_status "Creating deployment package for api-hubble..."
zip -r api-hubble.zip . -x "*.git*" "*.DS_Store*" "test*" "*.md"

# Deploy to AWS
print_status "Uploading api-hubble to AWS Lambda..."
aws lambda update-function-code \
    --function-name "${FUNCTION_PREFIX}-api" \
    --zip-file fileb://api-hubble.zip \
    --region $REGION

# Update function configuration
print_status "Updating api-hubble configuration..."
aws lambda update-function-configuration \
    --function-name "${FUNCTION_PREFIX}-api" \
    --timeout 30 \
    --memory-size 128 \
    --environment Variables='{
        "DYNAMODB_TABLE_NAME":"infinite-nasa-apod-content",
        "REGION":"'$REGION'"
    }' \
    --region $REGION

print_status "✅ api-hubble deployed successfully"

# Clean up
print_status "Cleaning up deployment packages..."
rm -f ../hubble-fetcher/hubble-fetcher.zip
rm -f api-hubble.zip

cd ../../..

print_status "🎉 All Hubble Lambda functions deployed successfully!"

# Display function information
print_status "Deployed functions:"
echo "  - ${FUNCTION_PREFIX}-fetcher (hubble-fetcher)"
echo "  - ${FUNCTION_PREFIX}-api (api-hubble)"

print_warning "Next steps:"
echo "  1. Create EventBridge rule for weekly cron job"
echo "  2. Update API Gateway to include Hubble endpoints"
echo "  3. Test the functions manually"
echo "  4. Set up monitoring and logging"

print_status "Deployment completed!"
