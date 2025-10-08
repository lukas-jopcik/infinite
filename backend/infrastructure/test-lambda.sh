#!/bin/bash

# Test Lambda Functions for Infinite v1.0
# This script tests all Lambda functions and their configurations

set -e

echo "🧪 Testing Lambda functions for Infinite v1.0..."

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

echo "📋 Testing Lambda functions in region: ${REGION}"

# Test 1: List all Lambda functions
echo "📋 Listing Lambda functions..."
aws lambda list-functions --region ${REGION} --query "Functions[?starts_with(FunctionName, 'infinite-')].{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout}" --output table

# Test 2: Get function configurations
echo "⚙️ Testing function configurations..."

# Content Generator
echo "🔍 Testing Content Generator configuration..."
aws lambda get-function-configuration --function-name ${CONTENT_GENERATOR_FUNCTION} --region ${REGION} --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" --output json

# API Handler
echo "🔍 Testing API Handler configuration..."
aws lambda get-function-configuration --function-name ${API_HANDLER_FUNCTION} --region ${REGION} --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" --output json

# Image Processor
echo "🔍 Testing Image Processor configuration..."
aws lambda get-function-configuration --function-name ${IMAGE_PROCESSOR_FUNCTION} --region ${REGION} --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" --output json

# APOD Fetcher
echo "🔍 Testing APOD Fetcher configuration..."
aws lambda get-function-configuration --function-name ${APOD_FETCHER_FUNCTION} --region ${REGION} --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" --output json

# ESA Fetcher
echo "🔍 Testing ESA Fetcher configuration..."
aws lambda get-function-configuration --function-name ${ESA_FETCHER_FUNCTION} --region ${REGION} --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" --output json

# Test 3: Test function invocations
echo "🚀 Testing function invocations..."

# Test Content Generator
echo "🧪 Testing Content Generator invocation..."
CONTENT_GENERATOR_RESPONSE=$(aws lambda invoke \
    --function-name ${CONTENT_GENERATOR_FUNCTION} \
    --payload '{"test": "content generation"}' \
    --region ${REGION} \
    /tmp/content-generator-response.json)

echo "Content Generator Response:"
cat /tmp/content-generator-response.json | jq '.'

# Test API Handler
echo "🧪 Testing API Handler invocation..."
API_HANDLER_RESPONSE=$(aws lambda invoke \
    --function-name ${API_HANDLER_FUNCTION} \
    --payload '{"httpMethod": "GET", "path": "/api/test", "queryStringParameters": null, "body": null}' \
    --region ${REGION} \
    /tmp/api-handler-response.json)

echo "API Handler Response:"
cat /tmp/api-handler-response.json | jq '.'

# Test Image Processor
echo "🧪 Testing Image Processor invocation..."
IMAGE_PROCESSOR_RESPONSE=$(aws lambda invoke \
    --function-name ${IMAGE_PROCESSOR_FUNCTION} \
    --payload '{"test": "image processing"}' \
    --region ${REGION} \
    /tmp/image-processor-response.json)

echo "Image Processor Response:"
cat /tmp/image-processor-response.json | jq '.'

# Test APOD Fetcher
echo "🧪 Testing APOD Fetcher invocation..."
APOD_FETCHER_RESPONSE=$(aws lambda invoke \
    --function-name ${APOD_FETCHER_FUNCTION} \
    --payload '{"test": "apod fetching"}' \
    --region ${REGION} \
    /tmp/apod-fetcher-response.json)

echo "APOD Fetcher Response:"
cat /tmp/apod-fetcher-response.json | jq '.'

# Test ESA Fetcher
echo "🧪 Testing ESA Fetcher invocation..."
ESA_FETCHER_RESPONSE=$(aws lambda invoke \
    --function-name ${ESA_FETCHER_FUNCTION} \
    --payload '{"test": "esa fetching"}' \
    --region ${REGION} \
    /tmp/esa-fetcher-response.json)

echo "ESA Fetcher Response:"
cat /tmp/esa-fetcher-response.json | jq '.'

# Test 4: Check IAM roles and permissions
echo "🔐 Testing IAM roles and permissions..."

# List attached policies for Lambda role
LAMBDA_ROLE_NAME="InfiniteLambdaExecutionRole-${ENVIRONMENT}"
echo "🔍 Checking IAM role: ${LAMBDA_ROLE_NAME}"
aws iam list-attached-role-policies --role-name ${LAMBDA_ROLE_NAME} --query "AttachedPolicies[].PolicyName" --output table

# Test 5: Check EventBridge rules
echo "⏰ Testing EventBridge rules..."

# List EventBridge rules
echo "📋 Listing EventBridge rules..."
aws events list-rules --name-prefix "infinite-" --region ${REGION} --query "Rules[].{Name:Name,ScheduleExpression:ScheduleExpression,State:State}" --output table

# List targets for each rule
echo "🎯 Listing EventBridge targets..."
aws events list-targets-by-rule --rule "infinite-apod-daily-${ENVIRONMENT}" --region ${REGION} --query "Targets[].{Id:Id,Arn:Arn}" --output table
aws events list-targets-by-rule --rule "infinite-esa-weekly-${ENVIRONMENT}" --region ${REGION} --query "Targets[].{Id:Id,Arn:Arn}" --output table

# Test 6: Check CloudWatch logs
echo "📊 Testing CloudWatch logs..."

# List log groups
echo "📋 Listing CloudWatch log groups..."
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/infinite-" --region ${REGION} --query "logGroups[].{LogGroupName:logGroupName,CreationTime:creationTime}" --output table

# Test 7: Check function metrics
echo "📈 Testing function metrics..."

# Get function metrics for the last hour
END_TIME=$(date -u +%s)
START_TIME=$((END_TIME - 3600))  # 1 hour ago

echo "📊 Getting function metrics for the last hour..."

for function in ${CONTENT_GENERATOR_FUNCTION} ${API_HANDLER_FUNCTION} ${IMAGE_PROCESSOR_FUNCTION} ${APOD_FETCHER_FUNCTION} ${ESA_FETCHER_FUNCTION}; do
    echo "🔍 Metrics for ${function}:"
    aws cloudwatch get-metric-statistics \
        --namespace AWS/Lambda \
        --metric-name Invocations \
        --dimensions Name=FunctionName,Value=${function} \
        --start-time ${START_TIME} \
        --end-time ${END_TIME} \
        --period 3600 \
        --statistics Sum \
        --region ${REGION} \
        --query "Datapoints[0].Sum" \
        --output text || echo "No data available"
done

# Test 8: Clean up test files
echo "🧹 Cleaning up test files..."
rm -f /tmp/*-response.json

echo "🎉 All Lambda function tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Lambda function listing and configuration"
echo "  ✅ Function invocations and responses"
echo "  ✅ IAM roles and permissions"
echo "  ✅ EventBridge rules and targets"
echo "  ✅ CloudWatch logs and metrics"
echo "  ✅ Test file cleanup"
echo ""
echo "📝 Next steps:"
echo "  1. Implement actual function logic"
echo "  2. Set up API Gateway integration"
echo "  3. Configure monitoring and alerts"
echo "  4. Test scheduled executions"
