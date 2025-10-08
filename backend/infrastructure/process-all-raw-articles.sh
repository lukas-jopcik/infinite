#!/bin/bash

# Process All Raw Articles
# This script processes all raw articles one by one using the updated AI content generator

set -e

echo "🚀 Processing all raw articles with updated AI content generator..."

# Get all raw articles
echo "📋 Fetching all raw articles..."
RAW_ARTICLES=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"raw"}}' \
    --query 'Items[].{contentId:contentId.S,source:source.S,title:title.S}' \
    --output json)

TOTAL_COUNT=$(echo $RAW_ARTICLES | jq length)
echo "Found $TOTAL_COUNT raw articles to process"

if [ "$TOTAL_COUNT" -eq 0 ]; then
    echo "No raw articles found to process"
    exit 0
fi

# Process each article
PROCESSED_COUNT=0
ERROR_COUNT=0

echo $RAW_ARTICLES | jq -r '.[] | "\(.contentId) \(.source) \(.title)"' | while read contentId source title; do
    echo ""
    echo "Processing: $title"
    echo "Content ID: $contentId"
    echo "Source: $source"
    
    # Invoke AI content generator
    RESPONSE=$(aws lambda invoke \
        --function-name infinite-ai-content-generator-dev \
        --payload "{\"contentId\":\"$contentId\",\"source\":\"$source\"}" \
        --region eu-central-1 \
        response.json 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully processed: $title"
        PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
    else
        echo "❌ Error processing: $title"
        echo "Response: $RESPONSE"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    
    # Clean up response file
    rm -f response.json
    
    # Add a small delay to avoid overwhelming the system
    sleep 2
done

echo ""
echo "🎉 Batch processing completed!"
echo "Total articles: $TOTAL_COUNT"
echo "Successfully processed: $PROCESSED_COUNT"
echo "Errors: $ERROR_COUNT"

# Check final status
echo ""
echo "📊 Final status check..."
FINAL_RAW_COUNT=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"raw"}}' \
    --select COUNT \
    --output text \
    --query 'Count')

FINAL_PROCESSED_COUNT=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"processed"}}' \
    --select COUNT \
    --output text \
    --query 'Count')

echo "Raw articles remaining: $FINAL_RAW_COUNT"
echo "Processed articles: $FINAL_PROCESSED_COUNT"
