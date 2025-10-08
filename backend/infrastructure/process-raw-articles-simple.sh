#!/bin/bash

# Simple Raw Articles Processor
# This script processes raw articles one by one with proper tracking

set -e

echo "🚀 Starting simple raw articles processing..."

# Get all raw articles
echo "📋 Fetching raw articles..."
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

# Process articles one by one
PROCESSED=0
ERRORS=0

# Convert to array and process each item
echo $RAW_ARTICLES | jq -c '.[]' | while read -r article; do
    CONTENT_ID=$(echo $article | jq -r '.contentId')
    SOURCE=$(echo $article | jq -r '.source')
    TITLE=$(echo $article | jq -r '.title')
    
    echo ""
    echo "Processing article $((PROCESSED + 1))/$TOTAL_COUNT: $TITLE"
    echo "Content ID: $CONTENT_ID"
    
    # Invoke AI content generator
    echo "Invoking AI content generator..."
    RESPONSE=$(aws lambda invoke \
        --function-name infinite-ai-content-generator-dev \
        --payload "{\"contentId\":\"$CONTENT_ID\",\"source\":\"$SOURCE\"}" \
        --region eu-central-1 \
        response.json 2>&1)
    
    # Check if successful
    if [ $? -eq 0 ]; then
        echo "✅ Successfully processed: $TITLE"
        PROCESSED=$((PROCESSED + 1))
    else
        echo "❌ Error processing: $TITLE"
        echo "Response: $RESPONSE"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Clean up
    rm -f response.json
    
    # Wait a bit between requests
    echo "Waiting 3 seconds before next article..."
    sleep 3
    
    # Check if we should continue
    REMAINING=$(aws dynamodb scan \
        --table-name InfiniteRawContent-dev \
        --region eu-central-1 \
        --filter-expression "attribute_exists(contentId) AND #status = :status" \
        --expression-attribute-names '{"#status":"status"}' \
        --expression-attribute-values '{":status":{"S":"raw"}}' \
        --select COUNT \
        --output text \
        --query 'Count')
    
    echo "Raw articles remaining: $REMAINING"
    
    if [ "$REMAINING" -eq 0 ]; then
        echo "🎉 All articles processed!"
        break
    fi
done

echo ""
echo "📊 Processing completed!"
echo "Total articles found: $TOTAL_COUNT"
echo "Successfully processed: $PROCESSED"
echo "Errors: $ERRORS"

# Final status check
FINAL_RAW=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"raw"}}' \
    --select COUNT \
    --output text \
    --query 'Count')

FINAL_PROCESSED=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"processed"}}' \
    --select COUNT \
    --output text \
    --query 'Count')

echo "Final status:"
echo "Raw articles remaining: $FINAL_RAW"
echo "Processed articles: $FINAL_PROCESSED"
