#!/bin/bash

# Deploy Analytics API Lambda Function
# This script creates and deploys the analytics API Lambda function

set -e

echo "🚀 Deploying Analytics API Lambda Function..."

# Configuration
FUNCTION_NAME="infinite-analytics-api-dev"
ROLE_NAME="InfiniteLambdaExecutionRole-dev"
REGION="eu-central-1"
API_GATEWAY_NAME="infinite-api-gateway-dev"

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

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📥 Installing dependencies..."
    npm install --production
fi

# Create zip file
echo "🗜️ Creating zip file..."
zip -r analytics-api.zip . -x "*.git*" "*.DS_Store*" "test/*" "*.md" "*.txt"

# Deploy or update Lambda function
if [ "$UPDATE_MODE" = true ]; then
    echo "🔄 Updating Lambda function code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://analytics-api.zip \
        --region $REGION
    
    echo "⚙️ Updating Lambda function configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --runtime nodejs20.x \
        --handler analytics-api.handler \
        --timeout 30 \
        --memory-size 512 \
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
        --zip-file fileb://analytics-api.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $REGION
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f analytics-api.zip
cd ../../..

echo "✅ Analytics API Lambda function deployed successfully!"

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

echo "🎉 Analytics API deployment completed!"
