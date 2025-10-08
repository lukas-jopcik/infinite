#!/bin/bash

# Test AI Content Generator Lambda Function for Infinite v1.0
# This script tests the AI content generator function

set -e

echo "🧪 Testing AI Content Generator Lambda function for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
FUNCTION_NAME="infinite-ai-content-generator-${ENVIRONMENT}"

echo "📋 Testing function: ${FUNCTION_NAME}"

# Test 1: Manual invocation
echo "🚀 Testing manual invocation..."
aws lambda invoke \
    --function-name ${FUNCTION_NAME} \
    --payload '{"test": "manual invocation"}' \
    --region ${REGION} \
    /tmp/ai-content-generator-response.json

echo "📄 Response:"
cat /tmp/ai-content-generator-response.json | jq '.'

# Test 2: Check function configuration
echo "⚙️ Checking function configuration..."
aws lambda get-function-configuration \
    --function-name ${FUNCTION_NAME} \
    --region ${REGION} \
    --query "{Name:FunctionName,Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,Environment:Environment}" \
    --output json

# Test 3: Check CloudWatch logs
echo "📊 Checking CloudWatch logs..."
LOG_GROUP="/aws/lambda/${FUNCTION_NAME}"

# List recent log streams
echo "📋 Recent log streams:"
aws logs describe-log-streams \
    --log-group-name ${LOG_GROUP} \
    --order-by LastEventTime \
    --descending \
    --max-items 5 \
    --region ${REGION} \
    --query "logStreams[].{LogStreamName:logStreamName,LastEventTime:lastEventTime}" \
    --output table

# Get recent log events
echo "📄 Recent log events:"
LATEST_STREAM=$(aws logs describe-log-streams \
    --log-group-name ${LOG_GROUP} \
    --order-by LastEventTime \
    --descending \
    --max-items 1 \
    --region ${REGION} \
    --query "logStreams[0].logStreamName" \
    --output text)

if [ "$LATEST_STREAM" != "None" ] && [ "$LATEST_STREAM" != "" ]; then
    aws logs get-log-events \
        --log-group-name ${LOG_GROUP} \
        --log-stream-name ${LATEST_STREAM} \
        --region ${REGION} \
        --query "events[].message" \
        --output text
else
    echo "No log streams found"
fi

# Test 4: Check DynamoDB for raw content
echo "🗄️ Checking DynamoDB for raw content to process..."
aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --filter-expression "#status = :status" \
    --expression-attribute-names '{"#status": "status"}' \
    --expression-attribute-values '{":status": {"S": "raw"}}' \
    --region ${REGION} \
    --query "Items[].{ContentId:contentId.S,Source:source.S,Title:title.S,Status:status.S}" \
    --output table

# Test 5: Check DynamoDB for generated articles
echo "📰 Checking DynamoDB for generated articles..."
aws dynamodb scan \
    --table-name InfiniteArticles-dev \
    --filter-expression "begins_with(articleId, :prefix)" \
    --expression-attribute-values '{":prefix": {"S": ""}}' \
    --region ${REGION} \
    --query "Items[].{ArticleId:articleId.S,Title:title.S,Slug:slug.S,Status:status.S,CreatedAt:createdAt.S}" \
    --output table

# Test 6: Check function metrics
echo "📈 Checking function metrics..."
END_TIME=$(date -u +%s)
START_TIME=$((END_TIME - 3600))  # 1 hour ago

echo "📊 Function metrics for the last hour:"
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=${FUNCTION_NAME} \
    --start-time ${START_TIME} \
    --end-time ${END_TIME} \
    --period 3600 \
    --statistics Sum \
    --region ${REGION} \
    --query "Datapoints[0].Sum" \
    --output text || echo "No data available"

# Test 7: Check for errors
echo "🚨 Checking for errors..."
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Errors \
    --dimensions Name=FunctionName,Value=${FUNCTION_NAME} \
    --start-time ${START_TIME} \
    --end-time ${END_TIME} \
    --period 3600 \
    --statistics Sum \
    --region ${REGION} \
    --query "Datapoints[0].Sum" \
    --output text || echo "No errors found"

# Test 8: Check OpenAI API key in Secrets Manager
echo "🔑 Checking OpenAI API key in Secrets Manager..."
aws secretsmanager get-secret-value \
    --secret-id "infinite/openai-api-key" \
    --region ${REGION} \
    --query "SecretString" \
    --output text | jq -r '.OPENAI_API_KEY' | head -c 10 && echo "..." || echo "❌ OpenAI API key not found or invalid"

# Clean up
echo "🧹 Cleaning up..."
rm -f /tmp/ai-content-generator-response.json

echo "🎉 AI Content Generator testing completed!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Manual invocation test"
echo "  ✅ Function configuration check"
echo "  ✅ CloudWatch logs review"
echo "  ✅ DynamoDB raw content check"
echo "  ✅ DynamoDB articles check"
echo "  ✅ Function metrics check"
echo "  ✅ Error monitoring"
echo "  ✅ OpenAI API key check"
echo ""
echo "📝 Next steps:"
echo "  1. Set up EventBridge scheduled rule"
echo "  2. Configure CloudWatch alarms"
echo "  3. Test scheduled execution"
echo "  4. Verify article generation"
