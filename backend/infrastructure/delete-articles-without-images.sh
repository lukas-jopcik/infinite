#!/bin/bash

# Delete articles without proper image URLs
# This script deletes all articles that have imageUrl = None or no imageUrl

set -e

echo "🗑️  Deleting articles without proper image URLs..."

# Get all articles without proper image URLs
ARTICLES_TO_DELETE=$(aws dynamodb scan \
    --table-name InfiniteArticles-dev \
    --region eu-central-1 \
    --filter-expression "attribute_not_exists(imageUrl) OR imageUrl = :null" \
    --expression-attribute-values '{":null":{"S":"None"}}' \
    --query 'Items[].{articleId:articleId.S,type:type.S}' \
    --output json)

echo "Found $(echo $ARTICLES_TO_DELETE | jq length) articles to delete"

# Delete each article
echo $ARTICLES_TO_DELETE | jq -r '.[] | "\(.articleId) \(.type)"' | while read articleId type; do
    echo "Deleting article: $articleId"
    aws dynamodb delete-item \
        --table-name InfiniteArticles-dev \
        --region eu-central-1 \
        --key "{\"articleId\":{\"S\":\"$articleId\"},\"type\":{\"S\":\"$type\"}}"
done

echo "✅ Deletion completed!"

# Show remaining articles
echo "📊 Remaining articles:"
aws dynamodb scan \
    --table-name InfiniteArticles-dev \
    --region eu-central-1 \
    --query 'Items[].{articleId:articleId.S,title:title.S,imageUrl:imageUrl.S}' \
    --output table
