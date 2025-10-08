#!/bin/bash

# Process One Raw Article
# This script processes one raw article at a time

set -e

echo "🚀 Processing one raw article..."

# Get one raw article
echo "📋 Fetching one raw article..."
RAW_ARTICLE=$(aws dynamodb scan \
    --table-name InfiniteRawContent-dev \
    --region eu-central-1 \
    --filter-expression "attribute_exists(contentId) AND #status = :status" \
    --expression-attribute-names '{"#status":"status"}' \
    --expression-attribute-values '{":status":{"S":"raw"}}' \
    --max-items 1 \
    --query 'Items[0]' \
    --output json)

if [ "$RAW_ARTICLE" = "null" ] || [ -z "$RAW_ARTICLE" ]; then
    echo "No raw articles found to process"
    exit 0
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
    --function-name infinite-ai-content-generator-dev \
    --payload "{\"contentId\":\"$CONTENT_ID\",\"source\":\"$SOURCE\"}" \
    --region eu-central-1 \
    response.json 2>&1)

# Check if successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully processed: $TITLE"
    echo "Response: $(cat response.json)"
else
    echo "❌ Error processing: $TITLE"
    echo "Response: $RESPONSE"
fi

# Clean up
rm -f response.json

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
