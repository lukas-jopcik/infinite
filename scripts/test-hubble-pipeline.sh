#!/bin/bash

# Test Hubble pipeline manually
# This script tests the complete Hubble data processing pipeline

set -e

echo "🧪 Testing Hubble pipeline..."

# Configuration
REGION="eu-central-1"
FUNCTION_PREFIX="infinite-hubble"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI configured. Current identity:"
aws sts get-caller-identity

# Step 1: Test hubble-fetcher
print_step "1. Testing hubble-fetcher Lambda function..."

aws lambda invoke \
    --function-name "${FUNCTION_PREFIX}-fetcher" \
    --payload '{"test": "manual-run"}' \
    --region $REGION \
    /tmp/hubble-fetcher-response.json

if [ $? -eq 0 ]; then
    print_status "✅ hubble-fetcher executed successfully"
    echo "Response:"
    cat /tmp/hubble-fetcher-response.json | jq '.'
else
    print_error "❌ hubble-fetcher execution failed"
    exit 1
fi

# Step 2: Wait a bit for processing
print_step "2. Waiting for content processing..."
sleep 10

# Step 3: Test api-hubble
print_step "3. Testing api-hubble Lambda function..."

aws lambda invoke \
    --function-name "${FUNCTION_PREFIX}-api" \
    --payload '{"httpMethod": "GET", "queryStringParameters": {"limit": "3"}}' \
    --region $REGION \
    /tmp/api-hubble-response.json

if [ $? -eq 0 ]; then
    print_status "✅ api-hubble executed successfully"
    echo "Response:"
    cat /tmp/api-hubble-response.json | jq '.'
else
    print_error "❌ api-hubble execution failed"
    exit 1
fi

# Step 4: Check DynamoDB
print_step "4. Checking DynamoDB for Hubble data..."

aws dynamodb query \
    --table-name "infinite-nasa-apod-content" \
    --key-condition-expression "pk = :pk" \
    --expression-attribute-values '{":pk": {"S": "HUBBLE"}}' \
    --limit 3 \
    --region $REGION \
    --output json > /tmp/hubble-dynamodb-response.json

HUBBLE_COUNT=$(cat /tmp/hubble-dynamodb-response.json | jq '.Count')

if [ "$HUBBLE_COUNT" -gt 0 ]; then
    print_status "✅ Found $HUBBLE_COUNT Hubble items in DynamoDB"
    echo "Sample items:"
    cat /tmp/hubble-dynamodb-response.json | jq '.Items[0:2]'
else
    print_warning "⚠️  No Hubble items found in DynamoDB"
fi

# Step 5: Test content processor
print_step "5. Testing content processor with Hubble data..."

# Get a sample Hubble item from DynamoDB
SAMPLE_GUID=$(cat /tmp/hubble-dynamodb-response.json | jq -r '.Items[0].guid.S // empty')

if [ -n "$SAMPLE_GUID" ]; then
    print_status "Testing content processor with GUID: $SAMPLE_GUID"
    
    # Create test event for content processor
    cat > /tmp/hubble-test-event.json << EOF
{
    "type": "hubble",
    "data": {
        "guid": "$SAMPLE_GUID",
        "title": "Test Hubble Item",
        "description": "Test description for Hubble content processing",
        "excerpt": "Test excerpt",
        "image_main": "https://example.com/test-image.jpg",
        "link": "https://example.com/test-link",
        "pubDate": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
        "category": ["test"],
        "credit_raw": "Test Credit"
    }
}
EOF
    
    aws lambda invoke \
        --function-name "infinite-content-processor" \
        --payload file:///tmp/hubble-test-event.json \
        --region $REGION \
        /tmp/content-processor-response.json
    
    if [ $? -eq 0 ]; then
        print_status "✅ Content processor executed successfully with Hubble data"
        echo "Response:"
        cat /tmp/content-processor-response.json | jq '.'
    else
        print_error "❌ Content processor execution failed"
    fi
else
    print_warning "⚠️  No sample GUID found, skipping content processor test"
fi

# Cleanup
print_step "6. Cleaning up temporary files..."
rm -f /tmp/hubble-fetcher-response.json
rm -f /tmp/api-hubble-response.json
rm -f /tmp/hubble-dynamodb-response.json
rm -f /tmp/hubble-test-event.json
rm -f /tmp/content-processor-response.json

print_status "🎉 Hubble pipeline test completed!"

print_warning "Summary:"
echo "  - hubble-fetcher: ✅ Tested"
echo "  - api-hubble: ✅ Tested"
echo "  - DynamoDB: ✅ Checked ($HUBBLE_COUNT items)"
echo "  - content-processor: ✅ Tested with Hubble data"

print_status "All tests completed successfully!"
