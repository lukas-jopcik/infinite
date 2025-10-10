#!/bin/bash

# Add Missing GSIs to Existing DynamoDB Tables
# This script adds GSIs to existing tables without recreating them

set -e

echo "🚀 Adding missing GSIs to existing DynamoDB tables..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"  # Change to "prod" for production

# Table names with environment prefix
RAW_CONTENT_TABLE="InfiniteRawContent-${ENVIRONMENT}"
ARTICLES_TABLE="InfiniteArticles-${ENVIRONMENT}"

echo "📋 Adding GSIs in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"

# 1. Add GSIs to Articles Table
echo "📰 Adding GSIs to Articles table..."

# Add slug-index GSI
echo "  Adding slug-index GSI..."
aws dynamodb update-table \
    --table-name "${ARTICLES_TABLE}" \
    --attribute-definitions \
        AttributeName=slug,AttributeType=S \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "slug-index",
                "KeySchema": [{"AttributeName": "slug", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for slug-index to be active
echo "  Waiting for slug-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# Add originalDate attribute and category-originalDate-index GSI
echo "  Adding originalDate attribute and category-originalDate-index GSI..."
aws dynamodb update-table \
    --table-name "${ARTICLES_TABLE}" \
    --attribute-definitions \
        AttributeName=originalDate,AttributeType=S \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "category-originalDate-index",
                "KeySchema": [
                    {"AttributeName": "category", "KeyType": "HASH"},
                    {"AttributeName": "originalDate", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for category-originalDate-index to be active
echo "  Waiting for category-originalDate-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# Add status-originalDate-index GSI
echo "  Adding status-originalDate-index GSI..."
aws dynamodb update-table \
    --table-name "${ARTICLES_TABLE}" \
    --attribute-definitions \
        AttributeName=status,AttributeType=S \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "status-originalDate-index",
                "KeySchema": [
                    {"AttributeName": "status", "KeyType": "HASH"},
                    {"AttributeName": "originalDate", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for status-originalDate-index to be active
echo "  Waiting for status-originalDate-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# Add type-originalDate-index GSI
echo "  Adding type-originalDate-index GSI..."
aws dynamodb update-table \
    --table-name "${ARTICLES_TABLE}" \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "type-originalDate-index",
                "KeySchema": [
                    {"AttributeName": "type", "KeyType": "HASH"},
                    {"AttributeName": "originalDate", "KeyType": "RANGE"}
                ],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for type-originalDate-index to be active
echo "  Waiting for type-originalDate-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# 2. Add GSIs to RawContent Table
echo "📊 Adding GSIs to RawContent table..."

# Add status-index GSI
echo "  Adding status-index GSI..."
aws dynamodb update-table \
    --table-name "${RAW_CONTENT_TABLE}" \
    --attribute-definitions \
        AttributeName=status,AttributeType=S \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "status-index",
                "KeySchema": [{"AttributeName": "status", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for status-index to be active
echo "  Waiting for status-index to be active..."
aws dynamodb wait table-exists --table-name "${RAW_CONTENT_TABLE}" --region "${REGION}"

# Add guid-index GSI
echo "  Adding guid-index GSI..."
aws dynamodb update-table \
    --table-name "${RAW_CONTENT_TABLE}" \
    --attribute-definitions \
        AttributeName=guid,AttributeType=S \
    --global-secondary-index-updates \
        '[{
            "Create": {
                "IndexName": "guid-index",
                "KeySchema": [{"AttributeName": "guid", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
                "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
            }
        }]' \
    --region "${REGION}"

# Wait for guid-index to be active
echo "  Waiting for guid-index to be active..."
aws dynamodb wait table-exists --table-name "${RAW_CONTENT_TABLE}" --region "${REGION}"

echo "✅ All GSIs added successfully!"
echo ""
echo "📋 Added GSIs:"
echo "  Articles Table:"
echo "    - slug-index"
echo "    - category-originalDate-index"
echo "    - status-originalDate-index"
echo "    - type-originalDate-index"
echo "  RawContent Table:"
echo "    - status-index"
echo "    - guid-index"
echo ""
echo "🎉 GSI migration completed successfully!"
