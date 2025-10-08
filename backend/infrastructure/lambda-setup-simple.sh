#!/bin/bash

# Simplified Lambda Functions Setup for Infinite v1.0
# This script creates Lambda functions with basic configurations

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

# Get role ARN (assuming it was created in previous run)
LAMBDA_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${LAMBDA_ROLE_NAME}"

# 1. Create basic Lambda function code
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

# 2. Create deployment packages
echo "📦 Creating deployment packages..."

# Create zip files for each function
cd /tmp
zip -q content-generator.zip content-generator.js
zip -q api-handler.zip api-handler.js
zip -q image-processor.zip image-processor.js
zip -q apod-fetcher.zip apod-fetcher.js
zip -q esa-fetcher.zip esa-fetcher.js

# 3. Create Lambda functions (without environment variables for now)
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
    --region ${REGION}

# 4. Update environment variables separately
echo "🔧 Setting environment variables..."

# Content Generator environment variables
aws lambda update-function-configuration \
    --function-name ${CONTENT_GENERATOR_FUNCTION} \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'",
        "DYNAMODB_ARTICLES_TABLE":"InfiniteArticles-'${ENVIRONMENT}'",
        "S3_IMAGES_BUCKET":"infinite-images-'${ENVIRONMENT}'-'${ACCOUNT_ID}'"
    }' \
    --region ${REGION}

# API Handler environment variables
aws lambda update-function-configuration \
    --function-name ${API_HANDLER_FUNCTION} \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_ARTICLES_TABLE":"InfiniteArticles-'${ENVIRONMENT}'",
        "DYNAMODB_USERS_TABLE":"InfiniteUsers-'${ENVIRONMENT}'",
        "DYNAMODB_ANALYTICS_TABLE":"InfiniteAnalytics-'${ENVIRONMENT}'"
    }' \
    --region ${REGION}

# Image Processor environment variables
aws lambda update-function-configuration \
    --function-name ${IMAGE_PROCESSOR_FUNCTION} \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "S3_IMAGES_BUCKET":"infinite-images-'${ENVIRONMENT}'-'${ACCOUNT_ID}'"
    }' \
    --region ${REGION}

# APOD Fetcher environment variables
aws lambda update-function-configuration \
    --function-name ${APOD_FETCHER_FUNCTION} \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'"
    }' \
    --region ${REGION}

# ESA Fetcher environment variables
aws lambda update-function-configuration \
    --function-name ${ESA_FETCHER_FUNCTION} \
    --environment Variables='{
        "ENVIRONMENT":"'${ENVIRONMENT}'",
        "REGION":"'${REGION}'",
        "DYNAMODB_RAW_CONTENT_TABLE":"InfiniteRawContent-'${ENVIRONMENT}'"
    }' \
    --region ${REGION}

# 5. Clean up temporary files
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
echo ""
echo "📝 Next steps:"
echo "  1. Test Lambda function invocations"
echo "  2. Set up EventBridge scheduled rules"
echo "  3. Implement actual function logic"
echo "  4. Set up API Gateway integration"
echo ""
echo "💰 Cost estimate:"
echo "  - Lambda: ~$1-10/month (depends on invocations)"
echo "  - Total: ~$1-10/month"
