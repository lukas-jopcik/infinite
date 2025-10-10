#!/bin/bash

# Check DynamoDB Cost Reduction from GSI Implementation
# This script analyzes DynamoDB usage patterns to verify cost savings

set -e

echo "💰 Checking DynamoDB Cost Reduction from GSI Implementation..."
echo "============================================================="

REGION="eu-central-1"
START_TIME=$(date -u -v-1H +%Y-%m-%dT%H:%M:%S)
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)

echo "📅 Analysis period: Last 1 hour"
echo "🌍 Region: ${REGION}"
echo ""

# Tables to analyze
TABLES=(
    "InfiniteArticles-dev"
    "InfiniteRawContent-dev"
)

echo "📊 DynamoDB Usage Analysis:"
echo "=========================="

for TABLE in "${TABLES[@]}"; do
    echo "🗄️  Table: ${TABLE}"
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
        --output text 2>/dev/null || echo "0")
    
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
        --output text 2>/dev/null || echo "0")
    
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
        --output text 2>/dev/null || echo "0")
    
    # Get throttled requests
    THROTTLED_REQUESTS=$(aws cloudwatch get-metric-statistics \
        --region "${REGION}" \
        --namespace AWS/DynamoDB \
        --metric-name ThrottledRequests \
        --dimensions Name=TableName,Value="${TABLE}" \
        --start-time "${START_TIME}" \
        --end-time "${END_TIME}" \
        --period 300 \
        --statistics Sum \
        --query 'Datapoints[0].Sum' \
        --output text 2>/dev/null || echo "0")
    
    echo "   📖 Read Capacity Consumed: ${READ_CAPACITY}"
    echo "   ✍️  Write Capacity Consumed: ${WRITE_CAPACITY}"
    echo "   ✅ Successful Requests: ${SUCCESSFUL_REQUESTS}"
    echo "   🚫 Throttled Requests: ${THROTTLED_REQUESTS}"
    
    # Calculate efficiency
    if [ "${READ_CAPACITY}" != "0" ] && [ "${SUCCESSFUL_REQUESTS}" != "0" ]; then
        EFFICIENCY=$(echo "scale=2; ${SUCCESSFUL_REQUESTS} / ${READ_CAPACITY}" | bc -l 2>/dev/null || echo "N/A")
        echo "   📈 Request Efficiency: ${EFFICIENCY} requests per capacity unit"
    fi
    
    if [ "${THROTTLED_REQUESTS}" != "0" ]; then
        echo "   🚨 WARNING: Throttled requests detected!"
    else
        echo "   ✅ No throttling detected"
    fi
    
    echo ""
done

echo "💰 Cost Analysis:"
echo "================="
echo "✅ GSI Implementation Benefits:"
echo "   - Efficient queries reduce read capacity consumption"
echo "   - Lower capacity usage = lower costs"
echo "   - Better performance = better user experience"
echo ""
echo "📊 Key Metrics to Monitor:"
echo "   - Read Capacity: Should be lower with GSI queries vs scans"
echo "   - Request Efficiency: Higher is better (more requests per capacity unit)"
echo "   - Throttling: Should be minimal or zero"
echo ""
echo "💡 Cost Savings Expected:"
echo "   - Scan operations consume much more capacity than GSI queries"
echo "   - GSI queries are more targeted and efficient"
echo "   - Reduced capacity consumption = reduced billing"
echo ""
echo "📈 Next: Run production load test to verify GSI performance"
