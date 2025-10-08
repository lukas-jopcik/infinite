#!/bin/bash

# Clean up duplicate articles in the database
# This script removes duplicate articles with the same originalDate, keeping the better version

set -e

echo "🧹 Starting duplicate article cleanup..."

# Configuration
DYNAMODB_ARTICLES_TABLE="InfiniteArticles-dev"
REGION="eu-central-1"

# Function to delete an article
delete_article() {
    local article_id="$1"
    local article_type="$2"
    
    echo "Deleting article: $article_id"
    aws dynamodb delete-item \
        --table-name $DYNAMODB_ARTICLES_TABLE \
        --region $REGION \
        --key "{\"articleId\":{\"S\":\"$article_id\"},\"type\":{\"S\":\"$article_type\"}}"
}

# Function to get all articles grouped by originalDate
get_duplicates() {
    aws dynamodb scan \
        --table-name $DYNAMODB_ARTICLES_TABLE \
        --region $REGION \
        --query 'Items[].{articleId:articleId.S,title:title.S,originalDate:originalDate.S,createdAt:createdAt.S,type:type.S}' \
        --output json | jq -r '
        group_by(.originalDate) | 
        map(select(length > 1)) | 
        .[] | 
        .[] | 
        "\(.articleId)|\(.title)|\(.originalDate)|\(.createdAt)|\(.type)"
    '
}

echo "📋 Finding duplicate articles..."
duplicates=$(get_duplicates)

if [ -z "$duplicates" ]; then
    echo "✅ No duplicates found!"
    exit 0
fi

echo "Found duplicates. Processing..."

# Process duplicates by originalDate
echo "$duplicates" | while IFS='|' read -r article_id title original_date created_at type; do
    echo "Processing date: $original_date"
    
    # Get all articles for this date
    articles_for_date=$(aws dynamodb scan \
        --table-name $DYNAMODB_ARTICLES_TABLE \
        --region $REGION \
        --filter-expression "originalDate = :date" \
        --expression-attribute-values "{\":date\":{\"S\":\"$original_date\"}}" \
        --query 'Items[].{articleId:articleId.S,title:title.S,createdAt:createdAt.S,type:type.S}' \
        --output json)
    
    # Count articles for this date
    count=$(echo "$articles_for_date" | jq length)
    
    if [ "$count" -gt 1 ]; then
        echo "Found $count articles for date $original_date"
        
        # Keep the article with the longest/most descriptive title
        # Delete the others
        echo "$articles_for_date" | jq -r '.[] | "\(.articleId)|\(.title)|\(.createdAt)|\(.type)"' | while IFS='|' read -r id t c type; do
            title_length=${#t}
            echo "Article: $id - Title length: $title_length - '$t'"
        done
        
        # Sort by title length (descending) and keep the first one
        keep_article=$(echo "$articles_for_date" | jq -r 'sort_by(-(.title | length)) | .[0] | .articleId')
        echo "Keeping article: $keep_article"
        
        # Delete all others
        echo "$articles_for_date" | jq -r '.[] | select(.articleId != "'$keep_article'") | "\(.articleId)|\(.type)"' | while IFS='|' read -r id type; do
            delete_article "$id" "$type"
        done
        
        echo "✅ Cleaned up duplicates for date: $original_date"
    fi
done

echo "🎉 Duplicate cleanup completed!"

# Show final count
final_count=$(aws dynamodb scan --table-name $DYNAMODB_ARTICLES_TABLE --region $REGION --query 'Count' --output text)
echo "Final article count: $final_count"
