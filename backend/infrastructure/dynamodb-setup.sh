#!/bin/bash

# DynamoDB Tables Setup for Infinite v1.0
# This script creates all required DynamoDB tables with proper schemas and GSIs

set -e

echo "🚀 Setting up DynamoDB tables for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"  # Change to "prod" for production

# Table names with environment prefix
RAW_CONTENT_TABLE="InfiniteRawContent-${ENVIRONMENT}"
ARTICLES_TABLE="InfiniteArticles-${ENVIRONMENT}"
USERS_TABLE="InfiniteUsers-${ENVIRONMENT}"
ANALYTICS_TABLE="InfiniteAnalytics-${ENVIRONMENT}"

echo "📋 Creating tables in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"

# 1. Create RawContent Table
echo "📊 Creating RawContent table..."
aws dynamodb create-table \
    --table-name "${RAW_CONTENT_TABLE}" \
    --attribute-definitions \
        AttributeName=contentId,AttributeType=S \
        AttributeName=source,AttributeType=S \
        AttributeName=date,AttributeType=S \
    --key-schema \
        AttributeName=contentId,KeyType=HASH \
        AttributeName=source,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=source-date-index,KeySchema='[{AttributeName=source,KeyType=HASH},{AttributeName=date,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "${REGION}" \
    --tags Key=Project,Value=Infinite Key=Environment,Value="${ENVIRONMENT}" Key=Table,Value=RawContent

# 2. Create Articles Table
echo "📰 Creating Articles table..."
aws dynamodb create-table \
    --table-name "${ARTICLES_TABLE}" \
    --attribute-definitions \
        AttributeName=articleId,AttributeType=S \
        AttributeName=type,AttributeType=S \
        AttributeName=category,AttributeType=S \
        AttributeName=date,AttributeType=S \
        AttributeName=status,AttributeType=S \
    --key-schema \
        AttributeName=articleId,KeyType=HASH \
        AttributeName=type,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=category-date-index,KeySchema='[{AttributeName=category,KeyType=HASH},{AttributeName=date,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
        IndexName=status-date-index,KeySchema='[{AttributeName=status,KeyType=HASH},{AttributeName=date,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
        IndexName=type-date-index,KeySchema='[{AttributeName=type,KeyType=HASH},{AttributeName=date,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "${REGION}" \
    --tags Key=Project,Value=Infinite Key=Environment,Value="${ENVIRONMENT}" Key=Table,Value=Articles

# 3. Create Users Table
echo "👥 Creating Users table..."
aws dynamodb create-table \
    --table-name "${USERS_TABLE}" \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=email,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=email-index,KeySchema='[{AttributeName=email,KeyType=HASH}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "${REGION}" \
    --tags Key=Project,Value=Infinite Key=Environment,Value="${ENVIRONMENT}" Key=Table,Value=Users

# 4. Create Analytics Table
echo "📈 Creating Analytics table..."
aws dynamodb create-table \
    --table-name "${ANALYTICS_TABLE}" \
    --attribute-definitions \
        AttributeName=analyticsId,AttributeType=S \
        AttributeName=type,AttributeType=S \
        AttributeName=articleId,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=analyticsId,KeyType=HASH \
        AttributeName=type,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=article-timestamp-index,KeySchema='[{AttributeName=articleId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
        IndexName=user-timestamp-index,KeySchema='[{AttributeName=userId,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}]',Projection='{ProjectionType=ALL}',ProvisionedThroughput='{ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    --billing-mode PROVISIONED \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "${REGION}" \
    --tags Key=Project,Value=Infinite Key=Environment,Value="${ENVIRONMENT}" Key=Table,Value=Analytics

echo "⏳ Waiting for tables to be created..."

# Wait for all tables to be active
aws dynamodb wait table-exists --table-name "${RAW_CONTENT_TABLE}" --region "${REGION}"
aws dynamodb wait table-exists --table-name "${ARTICLES_TABLE}" --region "${REGION}"
aws dynamodb wait table-exists --table-name "${USERS_TABLE}" --region "${REGION}"
aws dynamodb wait table-exists --table-name "${ANALYTICS_TABLE}" --region "${REGION}"

echo "✅ All tables created successfully!"

# 5. Configure TTL for Analytics table
echo "⏰ Configuring TTL for Analytics table..."
aws dynamodb update-time-to-live \
    --table-name "${ANALYTICS_TABLE}" \
    --time-to-live-specification Enabled=true,AttributeName=ttl \
    --region "${REGION}"

# 6. Configure TTL for RawContent table (30 days retention)
echo "⏰ Configuring TTL for RawContent table..."
aws dynamodb update-time-to-live \
    --table-name "${RAW_CONTENT_TABLE}" \
    --time-to-live-specification Enabled=true,AttributeName=ttl \
    --region "${REGION}"

echo "📋 Table Summary:"
echo "  - RawContent: ${RAW_CONTENT_TABLE}"
echo "  - Articles: ${ARTICLES_TABLE}"
echo "  - Users: ${USERS_TABLE}"
echo "  - Analytics: ${ANALYTICS_TABLE}"

echo "🎉 DynamoDB setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Update your environment variables with table names"
echo "  2. Test table operations"
echo "  3. Configure monitoring and alerts"
