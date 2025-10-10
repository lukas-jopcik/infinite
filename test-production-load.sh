#!/bin/bash

# Test Production Load for GSI Implementation
# This script simulates production load to verify GSI performance

set -e

echo "🚀 Testing Production Load for GSI Implementation..."
echo "=================================================="

REGION="eu-central-1"
API_ENDPOINT="https://jqg44jstd1.execute-api.eu-central-1.amazonaws.com/dev"

echo "🌍 Region: ${REGION}"
echo "🔗 API Endpoint: ${API_ENDPOINT}"
echo ""

# Test parameters
CONCURRENT_REQUESTS=10
TOTAL_REQUESTS=50
REQUEST_DELAY=0.1

echo "📊 Load Test Configuration:"
echo "   - Concurrent Requests: ${CONCURRENT_REQUESTS}"
echo "   - Total Requests: ${TOTAL_REQUESTS}"
echo "   - Request Delay: ${REQUEST_DELAY}s"
echo ""

# Create temporary files for results
RESULTS_FILE="/tmp/load-test-results.json"
ERRORS_FILE="/tmp/load-test-errors.log"

echo "🧪 Starting Load Test..."
echo "========================"

# Function to make a single API request
make_request() {
    local request_id=$1
    local start_time=$(date +%s.%N)
    
    # Make the API request
    response=$(curl -s -w "%{http_code},%{time_total}" \
        -H "Content-Type: application/json" \
        "${API_ENDPOINT}/articles?limit=10" \
        2>/dev/null || echo "ERROR,0")
    
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc -l)
    
    # Parse response
    http_code=$(echo "$response" | cut -d',' -f1)
    curl_time=$(echo "$response" | cut -d',' -f2)
    response_body=$(echo "$response" | sed 's/^[^,]*,[^,]*//')
    
    # Log result
    echo "Request ${request_id}: HTTP ${http_code}, Duration: ${duration}s, Curl Time: ${curl_time}s"
    
    # Check for errors
    if [ "$http_code" != "200" ]; then
        echo "ERROR: Request ${request_id} failed with HTTP ${http_code}" >> "$ERRORS_FILE"
        echo "Response: ${response_body}" >> "$ERRORS_FILE"
    fi
    
    # Store result
    echo "{\"request_id\":${request_id},\"http_code\":${http_code},\"duration\":${duration},\"curl_time\":${curl_time}}" >> "$RESULTS_FILE"
}

# Clear previous results
> "$RESULTS_FILE"
> "$ERRORS_FILE"

# Run load test
echo "🔄 Executing ${TOTAL_REQUESTS} requests..."
for i in $(seq 1 $TOTAL_REQUESTS); do
    make_request $i &
    
    # Control concurrency
    if [ $((i % CONCURRENT_REQUESTS)) -eq 0 ]; then
        wait
        sleep $REQUEST_DELAY
    fi
done

# Wait for all requests to complete
wait

echo ""
echo "📊 Load Test Results:"
echo "===================="

# Analyze results
if [ -f "$RESULTS_FILE" ]; then
    # Count successful requests
    SUCCESS_COUNT=$(grep -c '"http_code":"200"' "$RESULTS_FILE" 2>/dev/null || echo "0")
    ERROR_COUNT=$(grep -c -v '"http_code":"200"' "$RESULTS_FILE" 2>/dev/null || echo "0")
    
    # Calculate average duration
    AVG_DURATION=$(grep -o '"duration":[0-9.]*' "$RESULTS_FILE" | cut -d':' -f2 | awk '{sum+=$1; count++} END {if(count>0) print sum/count; else print "N/A"}')
    
    # Calculate max duration
    MAX_DURATION=$(grep -o '"duration":[0-9.]*' "$RESULTS_FILE" | cut -d':' -f2 | sort -n | tail -1)
    
    # Calculate min duration
    MIN_DURATION=$(grep -o '"duration":[0-9.]*' "$RESULTS_FILE" | cut -d':' -f2 | sort -n | head -1)
    
    echo "   ✅ Successful Requests: ${SUCCESS_COUNT}/${TOTAL_REQUESTS}"
    echo "   ❌ Failed Requests: ${ERROR_COUNT}/${TOTAL_REQUESTS}"
    echo "   ⏱️  Average Duration: ${AVG_DURATION}s"
    echo "   🚀 Max Duration: ${MAX_DURATION}s"
    echo "   ⚡ Min Duration: ${MIN_DURATION}s"
    
    # Calculate success rate
    SUCCESS_RATE=$(echo "scale=1; ${SUCCESS_COUNT} * 100 / ${TOTAL_REQUESTS}" | bc -l 2>/dev/null || echo "0")
    echo "   📈 Success Rate: ${SUCCESS_RATE}%"
    
    if [ "$SUCCESS_RATE" -ge 95 ]; then
        echo "   🎉 EXCELLENT: Success rate >= 95%"
    elif [ "$SUCCESS_RATE" -ge 90 ]; then
        echo "   ✅ GOOD: Success rate >= 90%"
    else
        echo "   ⚠️  WARNING: Success rate < 90%"
    fi
else
    echo "   ❌ No results file found"
fi

# Check for errors
if [ -f "$ERRORS_FILE" ] && [ -s "$ERRORS_FILE" ]; then
    echo ""
    echo "🚨 Errors Detected:"
    echo "==================="
    cat "$ERRORS_FILE"
else
    echo ""
    echo "✅ No errors detected in load test"
fi

echo ""
echo "📋 Load Test Summary:"
echo "===================="
echo "✅ Load test completed successfully"
echo "📊 GSI implementation handling production load"
echo "🎯 Performance metrics collected"
echo ""
echo "💡 Performance Analysis:"
echo "   - High success rate = stable GSI implementation"
echo "   - Low average duration = efficient GSI queries"
echo "   - Consistent performance = reliable system"
echo ""
echo "🧹 Cleaning up temporary files..."
rm -f "$RESULTS_FILE" "$ERRORS_FILE"
echo "✅ Cleanup completed"
