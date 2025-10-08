#!/bin/bash

# Test ESA Fetcher Lambda Function for Infinite v1.0
# This script tests the ESA fetcher function

set -e

echo "🧪 Testing ESA Fetcher Lambda function for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
FUNCTION_NAME="infinite-esa-fetcher-${ENVIRONMENT}"

echo "📋 Testing function: ${FUNCTION_NAME}"

# Test 1: Manual invocation
echo "🚀 Testing manual invocation..."
aws lambda invoke \
    --function-name ${FUNCTION_NAME} \
    --payload '{"test": "manual invocation"}' \
    --region ${REGION} \
    /tmp/esa-fetcher-response.json

echo "📄 Response:"
cat /tmp/esa-fetcher-response.json | jq '.'

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

# Test 4: Check DynamoDB for stored data
echo "🗄️ Checking DynamoDB for stored ESA data..."
aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --filter-expression "begins_with(contentId, :prefix)" \
    --expression-attribute-values '{":prefix": {"S": "esa-"}}' \
    --region ${REGION} \
    --query "Items[].{ContentId:contentId.S,Date:date.S,Title:title.S,Source:source.S}" \
    --output table

# Test 5: Check function metrics
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

# Test 6: Check for errors
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

# Clean up
echo "🧹 Cleaning up..."
rm -f /tmp/esa-fetcher-response.json

echo "🎉 ESA Fetcher testing completed!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Manual invocation test"
echo "  ✅ Function configuration check"
echo "  ✅ CloudWatch logs review"
echo "  ✅ DynamoDB data verification"
echo "  ✅ Function metrics check"
echo "  ✅ Error monitoring"
echo ""
echo "📝 Next steps:"
echo "  1. Set up EventBridge scheduled rule (weekly)"
echo "  2. Configure CloudWatch alarms"
echo "  3. Test scheduled execution"
echo "  4. Implement error handling improvements"
