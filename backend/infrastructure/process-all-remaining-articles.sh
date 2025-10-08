#!/bin/bash

# Process All Remaining Raw Articles
# This script processes all remaining raw articles one by one

set -e

echo "🚀 Processing all remaining raw articles..."

# Configuration
DYNAMODB_RAW_CONTENT_TABLE="InfiniteRawContent-dev"
AI_CONTENT_GENERATOR_FUNCTION_NAME="infinite-ai-content-generator-dev"
REGION="eu-central-1"

# Function to get raw articles count
get_raw_count() {
    aws dynamodb scan \
        --table-name $DYNAMODB_RAW_CONTENT_TABLE \
        --region $REGION \
        --filter-expression "attribute_exists(contentId) AND #status = :status" \
        --expression-attribute-names '{"#status":"status"}' \
        --expression-attribute-values '{":status":{"S":"raw"}}' \
        --select COUNT \
        --output text \
        --query 'Count'
}

# Function to get one raw article
get_one_raw_article() {
    aws dynamodb scan \
        --table-name $DYNAMODB_RAW_CONTENT_TABLE \
        --region $REGION \
        --filter-expression "attribute_exists(contentId) AND #status = :status" \
        --expression-attribute-names '{"#status":"status"}' \
        --expression-attribute-values '{":status":{"S":"raw"}}' \
        --max-items 1 \
        --query 'Items[0]' \
        --output json
}

# Get initial count
INITIAL_COUNT=$(get_raw_count)
echo "📋 Found $INITIAL_COUNT raw articles to process"

if [ "$INITIAL_COUNT" -eq 0 ]; then
    echo "No raw articles to process. Exiting."
    exit 0
fi

PROCESSED_COUNT=0
FAILED_COUNT=0

# Process articles one by one
while [ $(get_raw_count) -gt 0 ]; do
    echo ""
    echo "Processing article $((PROCESSED_COUNT + 1)) of $INITIAL_COUNT..."
    
    # Get one raw article
    RAW_ARTICLE=$(get_one_raw_article)
    
    if [ "$RAW_ARTICLE" = "null" ] || [ -z "$RAW_ARTICLE" ]; then
        echo "No more raw articles found"
        break
    fi
    
    CONTENT_ID=$(echo $RAW_ARTICLE | jq -r '.contentId.S')
    SOURCE=$(echo $RAW_ARTICLE | jq -r '.source.S')
    TITLE=$(echo $RAW_ARTICLE | jq -r '.title.S')
    
    echo "Processing: $TITLE"
    echo "Content ID: $CONTENT_ID"
    echo "Source: $SOURCE"
    
    # Invoke AI content generator
    echo "Invoking AI content generator..."
    RESPONSE=$(aws lambda invoke \
        --function-name $AI_CONTENT_GENERATOR_FUNCTION_NAME \
        --payload "{\"contentId\":\"$CONTENT_ID\",\"source\":\"$SOURCE\"}" \
        --region $REGION \
        response.json 2>&1)
    
    # Check if successful
    if [ $? -eq 0 ]; then
        echo "✅ Successfully processed: $TITLE"
        PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
    else
        echo "❌ Error processing: $TITLE"
        echo "Response: $RESPONSE"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
    
    # Clean up
    rm -f response.json
    
    # Show progress
    REMAINING=$(get_raw_count)
    echo "Raw articles remaining: $REMAINING"
    echo "Processed: $PROCESSED_COUNT, Failed: $FAILED_COUNT"
    echo "--------------------------------------------------"
    
    # Small delay to avoid overwhelming the system
    sleep 2
done

echo ""
echo "✅ Processing completed!"
echo "Total processed: $PROCESSED_COUNT"
echo "Total failed: $FAILED_COUNT"
echo "Final raw article count: $(get_raw_count)"
