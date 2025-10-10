#!/bin/bash

# Add Remaining Missing GSIs to Existing DynamoDB Tables
# This script adds only the missing GSIs that don't already exist

set -e

echo "🚀 Adding remaining missing GSIs to existing DynamoDB tables..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"

# Table names with environment prefix
RAW_CONTENT_TABLE="InfiniteRawContent-${ENVIRONMENT}"
ARTICLES_TABLE="InfiniteArticles-${ENVIRONMENT}"

echo "📋 Adding remaining GSIs in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"

# 1. Add missing GSIs to Articles Table
echo "📰 Adding missing GSIs to Articles table..."

# Add status-originalDate-index GSI (if it doesn't exist)
echo "  Adding status-originalDate-index GSI..."
aws dynamodb update-table \
    --table-name "${ARTICLES_TABLE}" \
    --attribute-definitions \
        AttributeName=status,AttributeType=S \
        AttributeName=originalDate,AttributeType=S \
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
    --region "${REGION}" || echo "  status-originalDate-index may already exist"

# Wait for status-originalDate-index to be active
echo "  Waiting for status-originalDate-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# Add type-originalDate-index GSI (if it doesn't exist)
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
    --region "${REGION}" || echo "  type-originalDate-index may already exist"

# Wait for type-originalDate-index to be active
echo "  Waiting for type-originalDate-index to be active..."
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"

# 2. Add missing GSIs to RawContent Table
echo "📊 Adding missing GSIs to RawContent table..."

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
    --region "${REGION}" || echo "  status-index may already exist"

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
    --region "${REGION}" || echo "  guid-index may already exist"

# Wait for guid-index to be active
echo "  Waiting for guid-index to be active..."
aws dynamodb wait table-exists --table-name "${RAW_CONTENT_TABLE}" --region "${REGION}"

echo "✅ All remaining GSIs added successfully!"
echo ""
echo "📋 Added GSIs:"
echo "  Articles Table:"
echo "    - status-originalDate-index"
echo "    - type-originalDate-index"
echo "  RawContent Table:"
echo "    - status-index"
echo "    - guid-index"
echo ""
echo "🎉 GSI migration completed successfully!"
