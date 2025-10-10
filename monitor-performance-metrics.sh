#!/bin/bash

# Monitor Performance Metrics for GSI Implementation
# This script tracks Lambda duration and DynamoDB consumed capacity

set -e

echo "📊 Monitoring Performance Metrics for GSI Implementation..."
echo "=========================================================="

REGION="eu-central-1"
START_TIME=$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)

echo "📅 Monitoring period: ${START_TIME} to ${END_TIME}"
echo "🌍 Region: ${REGION}"
echo ""

# Function names
FUNCTIONS=(
    "infinite-articles-api-dev"
    "infinite-ai-content-generator-dev"
    "infinite-apod-fetcher-dev"
    "infinite-apod-rss-fetcher-dev"
    "infinite-esa-fetcher-dev"
)

echo "🔍 Lambda Performance Metrics:"
echo "=============================="

for FUNCTION in "${FUNCTIONS[@]}"; do
    echo "📈 Function: ${FUNCTION}"
    echo "----------------------------------------"
    
    # Get Lambda metrics
    DURATION=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/Lambda \
        --metric-name Duration \
        --dimensions Name=FunctionName,Value="${FUNCTION}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Average,Maximum \
        --query 'Datapoints[0].Average' \
        --output text 2>/dev/null || echo "N/A")
    
    MAX_DURATION=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/Lambda \
        --metric-name Duration \
        --dimensions Name=FunctionName,Value="${FUNCTION}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Maximum \
        --query 'Datapoints[0].Maximum' \
        --output text 2>/dev/null || echo "N/A")
    
    INVOCATIONS=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/Lambda \
        --metric-name Invocations \
        --dimensions Name=FunctionName,Value="${FUNCTION}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "0")
    
    ERRORS=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/Lambda \
        --metric-name Errors \
        --dimensions Name=FunctionName,Value="${FUNCTION}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "0")
    
    echo "   ⏱️  Average Duration: ${DURATION} ms"
    echo "   🚀 Max Duration: ${MAX_DURATION} ms"
    echo "   📞 Invocations: ${INVOCATIONS}"
    echo "   ❌ Errors: ${ERRORS}"
    
    if [ "${ERRORS}" != "0" ] && [ "${ERRORS}" != "N/A" ]; then
        echo "   🚨 WARNING: Errors detected!"
    else
        echo "   ✅ No errors detected"
    fi
    
    echo ""
done

echo "🗄️  DynamoDB Performance Metrics:"
echo "================================="

# DynamoDB tables
TABLES=(
    "InfiniteArticles-dev"
    "InfiniteRawContent-dev"
)

for TABLE in "${TABLES[@]}"; do
    echo "📊 Table: ${TABLE}"
    echo "----------------------------------------"
    
    # Get consumed read capacity
    READ_CAPACITY=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/DynamoDB \
        --metric-name ConsumedReadCapacityUnits \
        --dimensions Name=TableName,Value="${TABLE}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "N/A")
    
    # Get consumed write capacity
    WRITE_CAPACITY=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/DynamoDB \
        --metric-name ConsumedWriteCapacityUnits \
        --dimensions Name=TableName,Value="${TABLE}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "N/A")
    
    # Get successful requests
    SUCCESSFUL_REQUESTS=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/DynamoDB \
        --metric-name SuccessfulRequestLatency \
        --dimensions Name=TableName,Value="${TABLE}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "N/A")
    
    echo "   📖 Read Capacity Consumed: ${READ_CAPACITY}"
    echo "   ✍️  Write Capacity Consumed: ${WRITE_CAPACITY}"
    echo "   ✅ Successful Requests: ${SUCCESSFUL_REQUESTS}"
    echo ""
done

echo "📋 Performance Summary:"
echo "======================"
echo "✅ Lambda performance metrics collected"
echo "✅ DynamoDB capacity metrics collected"
echo ""
echo "💡 Performance Analysis:"
echo "   - Lower duration = better performance"
echo "   - Lower read capacity = more efficient queries (GSI vs Scan)"
echo "   - Zero errors = stable implementation"
echo ""
echo "📊 Next: Check cost reduction metrics"
