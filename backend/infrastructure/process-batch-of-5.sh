#!/bin/bash

# Process Batch of 5 Raw Articles
# This script processes 5 raw articles at a time for better control

set -e

echo "🚀 Processing batch of 5 raw articles..."

# Get 5 raw articles
echo "📋 Fetching 5 raw articles..."
RAW_ARTICLES=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"raw"}}' \
    --max-items 5 \
    --query 'Items[].{contentId:contentId.S,source:source.S,title:title.S}' \
    --output json)

COUNT=$(echo $RAW_ARTICLES | jq length)
echo "Found $COUNT raw articles to process"

if [ "$COUNT" -eq 0 ]; then
    echo "No raw articles found to process"
    exit 0
fi

# Process each article
PROCESSED=0
ERRORS=0

echo $RAW_ARTICLES | jq -c '.[]' | while read -r article; do
    CONTENT_ID=$(echo $article | jq -r '.contentId')
    SOURCE=$(echo $article | jq -r '.source')
    TITLE=$(echo $article | jq -r '.title')
    
    echo ""
    echo "Processing: $TITLE"
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
    
    # Wait between requests
    echo "Waiting 2 seconds..."
    sleep 2
done

echo ""
echo "📊 Batch completed!"
echo "Processed: $PROCESSED"
echo "Errors: $ERRORS"

# Check remaining count
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
