#!/bin/bash

# Deploy Articles API Lambda Function
# This script deploys the Articles API Lambda function to AWS

set -e

echo "🚀 Deploying Articles API Lambda Function..."

# Configuration
FUNCTION_NAME="infinite-articles-api-dev"
REGION="eu-central-1"
ROLE_ARN="arn:aws:iam::349660737637:role/InfiniteLambdaExecutionRole-dev"

# Navigate to the function directory
cd ../functions/api

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r articles-api.zip . -x "*.git*" "*.md" "test/*" "*.test.js"

# Deploy to Lambda
echo "🚀 Deploying to Lambda..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://articles-api.zip \
    --region $REGION

# Update environment variables
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment file://articles-api-env-vars.json \
    --region $REGION

# Clean up
rm articles-api.zip

echo "✅ Articles API deployment completed successfully!"
echo "📋 Function details:"
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION --query 'Configuration.{FunctionName:FunctionName,Runtime:Runtime,LastModified:LastModified,State:State}' --output table
