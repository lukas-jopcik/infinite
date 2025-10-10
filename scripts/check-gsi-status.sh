#!/bin/bash

# GSI Status Check Script for Infinite Articles
# This script checks the status of all GSI indexes in DynamoDB

set -e

# Configuration
REGION=${AWS_REGION:-"eu-central-1"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}
TABLE_NAME="InfiniteArticles-${ENVIRONMENT}"

echo "🔍 Checking GSI status for table: $TABLE_NAME"
echo "📍 Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if table exists
echo "📋 Checking if table exists..."
if ! aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
    echo "❌ Table $TABLE_NAME does not exist in region $REGION"
    exit 1
fi

echo "✅ Table $TABLE_NAME exists"
echo ""

# Get table information
echo "📊 Table Information:"
aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.{TableName:TableName,TableStatus:TableStatus,ItemCount:ItemCount,TableSizeBytes:TableSizeBytes}' --output table
echo ""

# Check GSI indexes
echo "🔍 Checking GSI Indexes:"
echo ""

# Get all GSI indexes
GSI_INDEXES=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.GlobalSecondaryIndexes[].IndexName' --output text)

if [ -z "$GSI_INDEXES" ]; then
    echo "⚠️  No GSI indexes found in table $TABLE_NAME"
    exit 0
fi

# Check each GSI index
for index in $GSI_INDEXES; do
    echo "📋 Index: $index"
    
    # Get index status
    INDEX_STATUS=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query "Table.GlobalSecondaryIndexes[?IndexName=='$index'].IndexStatus" --output text)
    
    # Get index size
    INDEX_SIZE=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query "Table.GlobalSecondaryIndexes[?IndexName=='$index'].IndexSizeBytes" --output text)
    
    # Get item count
    ITEM_COUNT=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query "Table.GlobalSecondaryIndexes[?IndexName=='$index'].ItemCount" --output text)
    
    # Get key schema
    KEY_SCHEMA=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query "Table.GlobalSecondaryIndexes[?IndexName=='$index'].KeySchema" --output json)
    
    # Status indicator
    case $INDEX_STATUS in
        "ACTIVE")
            echo "  ✅ Status: $INDEX_STATUS"
            ;;
        "CREATING")
            echo "  🟡 Status: $INDEX_STATUS (Creating...)"
            ;;
        "UPDATING")
            echo "  🟡 Status: $INDEX_STATUS (Updating...)"
            ;;
        "DELETING")
            echo "  🔴 Status: $INDEX_STATUS (Deleting...)"
            ;;
        *)
            echo "  ❓ Status: $INDEX_STATUS"
            ;;
    esac
    
    echo "  📊 Size: $INDEX_SIZE bytes"
    echo "  📈 Items: $ITEM_COUNT"
    echo "  🔑 Key Schema: $KEY_SCHEMA"
    echo ""
done

# Check for expected indexes
echo "🎯 Expected GSI Indexes:"
EXPECTED_INDEXES=("type-originalDate-index" "slug-index" "category-originalDate-index")

for expected in "${EXPECTED_INDEXES[@]}"; do
    if echo "$GSI_INDEXES" | grep -q "$expected"; then
        echo "  ✅ $expected - Found"
    else
        echo "  ❌ $expected - Missing"
    fi
done

echo ""

# Summary
echo "📋 Summary:"
ACTIVE_COUNT=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.GlobalSecondaryIndexes[?IndexStatus==`ACTIVE`] | length(@)' --output text)
TOTAL_COUNT=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.GlobalSecondaryIndexes | length(@)' --output text)

echo "  Total GSI Indexes: $TOTAL_COUNT"
echo "  Active GSI Indexes: $ACTIVE_COUNT"

if [ "$ACTIVE_COUNT" -eq "$TOTAL_COUNT" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
    echo "  ✅ All GSI indexes are active"
    exit 0
else
    echo "  ⚠️  Some GSI indexes are not active"
    exit 1
fi
