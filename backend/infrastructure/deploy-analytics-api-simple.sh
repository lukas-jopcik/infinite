#!/bin/bash

# Deploy Simple Analytics API Lambda Function
# This script creates and deploys a minimal analytics API Lambda function

set -e

echo "🚀 Deploying Simple Analytics API Lambda Function..."

# Configuration
FUNCTION_NAME="infinite-analytics-api-dev"
ROLE_NAME="InfiniteLambdaExecutionRole-dev"
REGION="eu-central-1"

# Check if Lambda function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "📝 Updating existing Lambda function: $FUNCTION_NAME"
    UPDATE_MODE=true
else
    echo "🆕 Creating new Lambda function: $FUNCTION_NAME"
    UPDATE_MODE=false
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd backend/functions/api

# Copy the simple version
cp analytics-api-simple.js analytics-api.js
cp package-simple.json package.json

# Create zip file with just the necessary files
echo "🗜️ Creating zip file..."
zip -r analytics-api-simple.zip analytics-api.js package.json

# Deploy or update Lambda function
if [ "$UPDATE_MODE" = true ]; then
    echo "🔄 Updating Lambda function code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://analytics-api-simple.zip \
        --region $REGION
    
    echo "⚙️ Updating Lambda function configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --runtime nodejs20.x \
        --handler analytics-api.handler \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION
else
    echo "🆕 Creating Lambda function..."
    
    # Get the role ARN
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
    
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs20.x \
        --role $ROLE_ARN \
        --handler analytics-api.handler \
        --zip-file fileb://analytics-api-simple.zip \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f analytics-api-simple.zip
cd ../../..

echo "✅ Simple Analytics API Lambda function deployed successfully!"

# Test the function
echo "🧪 Testing Lambda function..."
aws lambda invoke \
    --function-name $FUNCTION_NAME \
    --payload '{"httpMethod":"GET","path":"/analytics/stats","queryStringParameters":{}}' \
    --region $REGION \
    response.json

echo "📄 Lambda response:"
cat response.json | jq '.'
rm -f response.json

echo "🎉 Simple Analytics API deployment completed!"
