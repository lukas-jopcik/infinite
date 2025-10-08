#!/bin/bash

# Deploy APOD RSS Fetcher Lambda Function
# This script deploys the APOD RSS fetcher Lambda function to AWS

set -e

echo "🚀 Deploying APOD RSS Fetcher Lambda Function..."

# Configuration
FUNCTION_NAME="infinite-apod-rss-fetcher-dev"
REGION="eu-central-1"
ROLE_ARN="arn:aws:iam::349660737637:role/InfiniteLambdaExecutionRole-dev"

# Navigate to the function directory
cd ../functions/scheduled

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r apod-rss-fetcher.zip . -x "*.git*" "*.md" "test/*" "*.test.js"

# Deploy to Lambda
echo "🚀 Deploying to Lambda..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://apod-rss-fetcher.zip \
    --region $REGION

# Update environment variables
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables='{"ENVIRONMENT":"dev","REGION":"eu-central-1","DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-dev"}' \
    --region $REGION

# Clean up
rm apod-rss-fetcher.zip

echo "✅ APOD RSS Fetcher Lambda Function deployed successfully!"
