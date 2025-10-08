#!/bin/bash

# Lambda Functions Setup for Infinite v1.0
# This script creates all required Lambda functions with proper configurations

set -e

echo "🚀 Setting up Lambda functions for Infinite v1.0..."

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

# IAM role name
LAMBDA_ROLE_NAME="InfiniteLambdaExecutionRole-${ENVIRONMENT}"

echo "📋 Setting up Lambda functions in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"
echo "🆔 Account ID: ${ACCOUNT_ID}"

# 1. Create IAM role for Lambda functions
echo "🔐 Creating IAM role for Lambda functions..."

# Trust policy for Lambda
cat > /tmp/lambda-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Create the role
aws iam create-role \
    --role-name ${LAMBDA_ROLE_NAME} \
    --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
    --description "Execution role for Infinite Lambda functions"

# Attach basic execution policy
aws iam attach-role-policy \
    --role-name ${LAMBDA_ROLE_NAME} \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach our custom policy
aws iam attach-role-policy \
    --role-name ${LAMBDA_ROLE_NAME} \
    --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/InfiniteFullAccess

# Get role ARN
LAMBDA_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${LAMBDA_ROLE_NAME}"

echo "✅ IAM role created: ${LAMBDA_ROLE_ARN}"

# 2. Create basic Lambda function code
echo "📝 Creating Lambda function code..."

# Content Generator function
cat > /tmp/content-generator.js << 'EOF'
exports.handler = async (event) => {
    console.log('Content Generator Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // TODO: Implement content generation logic
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Content generation completed',
                timestamp: new Date().toISOString(),
                event: event
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error in content generator:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Content generation failed',
                message: error.message
            })
        };
    }
};
EOF

# API Handler function
cat > /tmp/api-handler.js << 'EOF'
exports.handler = async (event) => {
    console.log('API Handler Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, path, queryStringParameters, body } = event;
        
        // TODO: Implement API routing logic
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                message: 'API request processed',
                method: httpMethod,
                path: path,
                query: queryStringParameters,
                timestamp: new Date().toISOString()
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error in API handler:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'API request failed',
                message: error.message
            })
        };
    }
};
EOF

# Image Processor function
cat > /tmp/image-processor.js << 'EOF'
exports.handler = async (event) => {
    console.log('Image Processor Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // TODO: Implement image processing logic
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image processing completed',
                timestamp: new Date().toISOString(),
                event: event
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error in image processor:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Image processing failed',
                message: error.message
            })
        };
    }
};
EOF

# APOD Fetcher function
cat > /tmp/apod-fetcher.js << 'EOF'
exports.handler = async (event) => {
    console.log('APOD Fetcher Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // TODO: Implement APOD fetching logic
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'APOD data fetched successfully',
                timestamp: new Date().toISOString(),
                event: event
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error in APOD fetcher:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'APOD fetching failed',
                message: error.message
            })
        };
    }
};
EOF

# ESA Fetcher function
cat > /tmp/esa-fetcher.js << 'EOF'
exports.handler = async (event) => {
    console.log('ESA Fetcher Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // TODO: Implement ESA Hubble fetching logic
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'ESA Hubble data fetched successfully',
                timestamp: new Date().toISOString(),
                event: event
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error in ESA fetcher:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'ESA fetching failed',
                message: error.message
            })
        };
    }
};
EOF

# 3. Create deployment packages
echo "📦 Creating deployment packages..."

# Create zip files for each function
cd /tmp
zip -q content-generator.zip content-generator.js
zip -q api-handler.zip api-handler.js
zip -q image-processor.zip image-processor.js
zip -q apod-fetcher.zip apod-fetcher.js
zip -q esa-fetcher.zip esa-fetcher.js

# 4. Create Lambda functions
echo "⚡ Creating Lambda functions..."

# Content Generator
aws lambda create-function \
    --function-name ${CONTENT_GENERATOR_FUNCTION} \
    --runtime nodejs20.x \
    --role ${LAMBDA_ROLE_ARN} \
    --handler content-generator.handler \
    --zip-file fileb://content-generator.zip \
    --description "Generates Slovak astronomy articles from raw content" \
    --timeout 300 \
    --memory-size 1024 \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'",
        "DYNAMODB_ARTICLES_TABLE":"InfiniteArticles-'${ENVIRONMENT}'",
        "S3_IMAGES_BUCKET":"infinite-images-'${ENVIRONMENT}'-'${ACCOUNT_ID}'",
        "OPENAI_SECRET_ARN":"arn:aws:secretsmanager:'${REGION}':'${ACCOUNT_ID}':secret:infinite/openai-api-key"
    }' \
    --region ${REGION}

# API Handler
aws lambda create-function \
    --function-name ${API_HANDLER_FUNCTION} \
    --runtime nodejs20.x \
    --role ${LAMBDA_ROLE_ARN} \
    --handler api-handler.handler \
    --zip-file fileb://api-handler.zip \
    --description "Handles API requests for the Infinite platform" \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_ARTICLES_TABLE":"InfiniteArticles-'${ENVIRONMENT}'",
        "DYNAMODB_USERS_TABLE":"InfiniteUsers-'${ENVIRONMENT}'",
        "DYNAMODB_ANALYTICS_TABLE":"InfiniteAnalytics-'${ENVIRONMENT}'"
    }' \
    --region ${REGION}

# Image Processor
aws lambda create-function \
    --function-name ${IMAGE_PROCESSOR_FUNCTION} \
    --runtime nodejs20.x \
    --role ${LAMBDA_ROLE_ARN} \
    --handler image-processor.handler \
    --zip-file fileb://image-processor.zip \
    --description "Processes and optimizes images for the Infinite platform" \
    --timeout 300 \
    --memory-size 1024 \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "S3_IMAGES_BUCKET":"infinite-images-'${ENVIRONMENT}'-'${ACCOUNT_ID}'"
    }' \
    --region ${REGION}

# APOD Fetcher
aws lambda create-function \
    --function-name ${APOD_FETCHER_FUNCTION} \
    --runtime nodejs20.x \
    --role ${LAMBDA_ROLE_ARN} \
    --handler apod-fetcher.handler \
    --zip-file fileb://apod-fetcher.zip \
    --description "Fetches daily APOD data from NASA API" \
    --timeout 60 \
    --memory-size 256 \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'",
        "NASA_SECRET_ARN":"arn:aws:secretsmanager:'${REGION}':'${ACCOUNT_ID}':secret:infinite/nasa-api-key"
    }' \
    --region ${REGION}

# ESA Fetcher
aws lambda create-function \
    --function-name ${ESA_FETCHER_FUNCTION} \
    --runtime nodejs20.x \
    --role ${LAMBDA_ROLE_ARN} \
    --handler esa-fetcher.handler \
    --zip-file fileb://esa-fetcher.zip \
    --description "Fetches weekly ESA Hubble data from RSS feed" \
    --timeout 60 \
    --memory-size 256 \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'"
    }' \
    --region ${REGION}

# 5. Create EventBridge rules for scheduled functions
echo "⏰ Creating EventBridge rules for scheduled functions..."

# Daily APOD fetcher (runs at 6 AM UTC)
aws events put-rule \
    --name "infinite-apod-daily-${ENVIRONMENT}" \
    --schedule-expression "cron(0 6 * * ? *)" \
    --description "Daily trigger for APOD data fetching" \
    --region ${REGION}

# Add permission for EventBridge to invoke APOD fetcher
aws lambda add-permission \
    --function-name ${APOD_FETCHER_FUNCTION} \
    --statement-id "allow-eventbridge-apod" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/infinite-apod-daily-${ENVIRONMENT}" \
    --region ${REGION}

# Add target to the rule
aws events put-targets \
    --rule "infinite-apod-daily-${ENVIRONMENT}" \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${APOD_FETCHER_FUNCTION}" \
    --region ${REGION}

# Weekly ESA fetcher (runs on Mondays at 8 AM UTC)
aws events put-rule \
    --name "infinite-esa-weekly-${ENVIRONMENT}" \
    --schedule-expression "cron(0 8 ? * MON *)" \
    --description "Weekly trigger for ESA Hubble data fetching" \
    --region ${REGION}

# Add permission for EventBridge to invoke ESA fetcher
aws lambda add-permission \
    --function-name ${ESA_FETCHER_FUNCTION} \
    --statement-id "allow-eventbridge-esa" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/infinite-esa-weekly-${ENVIRONMENT}" \
    --region ${REGION}

# Add target to the rule
aws events put-targets \
    --rule "infinite-esa-weekly-${ENVIRONMENT}" \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${ESA_FETCHER_FUNCTION}" \
    --region ${REGION}

# 6. Clean up temporary files
rm -f /tmp/lambda-trust-policy.json
rm -f /tmp/*.js
rm -f /tmp/*.zip

echo "✅ Lambda functions setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  ⚡ Content Generator: ${CONTENT_GENERATOR_FUNCTION}"
echo "  🌐 API Handler: ${API_HANDLER_FUNCTION}"
echo "  🖼️  Image Processor: ${IMAGE_PROCESSOR_FUNCTION}"
echo "  🚀 APOD Fetcher: ${APOD_FETCHER_FUNCTION}"
echo "  🛰️  ESA Fetcher: ${ESA_FETCHER_FUNCTION}"
echo "  🔐 IAM Role: ${LAMBDA_ROLE_NAME}"
echo "  ⏰ Scheduled Rules: APOD (daily), ESA (weekly)"
echo ""
echo "📝 Next steps:"
echo "  1. Test Lambda function invocations"
echo "  2. Implement actual function logic"
echo "  3. Set up API Gateway integration"
echo "  4. Configure monitoring and alerts"
echo ""
echo "💰 Cost estimate:"
echo "  - Lambda: ~$1-10/month (depends on invocations)"
echo "  - EventBridge: ~$1/month"
echo "  - Total: ~$2-11/month"
