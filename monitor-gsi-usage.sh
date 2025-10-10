#!/bin/bash

# Monitor GSI Query Usage vs Fallback Scans
# This script monitors CloudWatch logs to track GSI usage and fallback scans

set -e

echo "🔍 Monitoring GSI Query Usage vs Fallback Scans..."
echo "=================================================="

REGION="eu-central-1"
START_TIME=$(($(date +%s) - 3600))000  # Last hour

# Function names
FUNCTIONS=(
    "infinite-articles-api-dev"
    "infinite-ai-content-generator-dev"
    "infinite-apod-fetcher-dev"
    "infinite-apod-rss-fetcher-dev"
    "infinite-esa-fetcher-dev"
)

echo "📊 Monitoring period: Last 1 hour"
echo "🌍 Region: ${REGION}"
echo ""

for FUNCTION in "${FUNCTIONS[@]}"; do
    echo "🔍 Checking function: ${FUNCTION}"
    echo "----------------------------------------"
    
    LOG_GROUP="/aws/lambda/${FUNCTION}"
    
    # Check if log group exists
    if ! aws logs describe-log-groups --region "${REGION}" --log-group-name-prefix "${LOG_GROUP}" --query 'logGroups[0].logGroupName' --output text 2>/dev/null | grep -q "${LOG_GROUP}"; then
        echo "   ⚠️  Log group not found: ${LOG_GROUP}"
        continue
    fi
    
    # Count GSI query usage
    GSI_COUNT=$(aws logs filter-log-events \
        --region "${REGION}" \
        --log-group-name "${LOG_GROUP}" \
        --start-time "${START_TIME}" \
        --filter-pattern "type-originalDate-index OR status-index OR source-date-index OR guid-index OR slug-index OR category-originalDate-index OR status-originalDate-index" \
        --query 'events | length(@)' \
        --output text 2>/dev/null || echo "0")
    
    # Count fallback scan usage
    SCAN_COUNT=$(aws logs filter-log-events \
        --region "${REGION}" \
        --log-group-name "${LOG_GROUP}" \
        --start-time "${START_TIME}" \
        --filter-pattern "GSI not ready, falling back to scan" \
        --query 'events | length(@)' \
        --output text 2>/dev/null || echo "0")
    
    # Count total invocations
    TOTAL_INVOCATIONS=$(aws logs filter-log-events \
        --region "${REGION}" \
        --log-group-name "${LOG_GROUP}" \
        --start-time "${START_TIME}" \
        --filter-pattern "Lambda invoked" \
        --query 'events | length(@)' \
        --output text 2>/dev/null || echo "0")
    
    # Calculate GSI usage percentage
    if [ "${TOTAL_INVOCATIONS}" -gt 0 ]; then
        GSI_PERCENTAGE=$(echo "scale=1; ${GSI_COUNT} * 100 / ${TOTAL_INVOCATIONS}" | bc -l 2>/dev/null || echo "0")
    else
        GSI_PERCENTAGE="0"
    fi
    
    echo "   📈 Total Invocations: ${TOTAL_INVOCATIONS}"
    echo "   ✅ GSI Queries: ${GSI_COUNT}"
    echo "   ⚠️  Fallback Scans: ${SCAN_COUNT}"
    echo "   📊 GSI Usage: ${GSI_PERCENTAGE}%"
    
    if [ "${SCAN_COUNT}" -gt 0 ]; then
        echo "   🚨 WARNING: Fallback scans detected!"
    else
        echo "   ✅ No fallback scans detected"
    fi
    
    echo ""
done

echo "📋 Summary:"
echo "==========="
echo "✅ GSI monitoring completed for all functions"
echo "📊 Check the results above for GSI usage patterns"
echo "🚨 Watch for fallback scans - they indicate GSI issues"
echo ""
echo "💡 Tips:"
echo "   - GSI usage should be close to 100%"
echo "   - Fallback scans should be minimal or zero"
echo "   - If you see many fallback scans, check GSI status"
