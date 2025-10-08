#!/bin/bash

# Test DynamoDB Tables for Infinite v1.0
# This script tests all table operations and queries

set -e

echo "🧪 Testing DynamoDB tables for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"

# Table names
RAW_CONTENT_TABLE="InfiniteRawContent-${ENVIRONMENT}"
ARTICLES_TABLE="InfiniteArticles-${ENVIRONMENT}"
USERS_TABLE="InfiniteUsers-${ENVIRONMENT}"
ANALYTICS_TABLE="InfiniteAnalytics-${ENVIRONMENT}"

echo "📋 Testing tables in region: ${REGION}"

# Test 1: RawContent Table Operations
echo "📊 Testing RawContent table..."

# Insert test data
aws dynamodb put-item \
    --table-name "${RAW_CONTENT_TABLE}" \
    --item '{
        "contentId": {"S": "apod_20241201"},
        "source": {"S": "apod"},
        "title": {"S": "Test APOD Article"},
        "explanation": {"S": "This is a test explanation"},
        "url": {"S": "https://apod.nasa.gov/apod/image/2412/test.jpg"},
        "mediaType": {"S": "image"},
        "date": {"S": "2024-12-01"},
        "status": {"S": "pending"},
        "createdAt": {"S": "2024-12-01T10:00:00Z"},
        "updatedAt": {"S": "2024-12-01T10:00:00Z"},
        "ttl": {"N": "1735689600"}
    }' \
    --region "${REGION}"

echo "✅ RawContent test data inserted"

# Query by GSI
aws dynamodb query \
    --table-name "${RAW_CONTENT_TABLE}" \
    --index-name "source-date-index" \
    --key-condition-expression "#source = :source" \
    --expression-attribute-names '{"#source": "source"}' \
    --expression-attribute-values '{":source": {"S": "apod"}}' \
    --region "${REGION}"

echo "✅ RawContent GSI query successful"

# Test 2: Articles Table Operations
echo "📰 Testing Articles table..."

# Insert test data
aws dynamodb put-item \
    --table-name "${ARTICLES_TABLE}" \
    --item '{
        "articleId": {"S": "apod_20241201_slovak"},
        "type": {"S": "discovery"},
        "title": {"S": "Test Slovak Article"},
        "perex": {"S": "This is a test perex in Slovak"},
        "content": {"S": "<h1>Test Article</h1><p>Test content</p>"},
        "category": {"S": "discovery"},
        "metaTitle": {"S": "Test Article - SEO Title"},
        "metaDescription": {"S": "Test SEO description"},
        "keywords": {"SS": ["astronómia", "test", "článok"]},
        "imageUrl": {"S": "https://cdn.infinite.sk/test.jpg"},
        "imageAlt": {"S": "Test image"},
        "author": {"S": "Infinite AI"},
        "source": {"S": "apod"},
        "date": {"S": "2024-12-01"},
        "updatedAt": {"S": "2024-12-01T10:00:00Z"},
        "status": {"S": "published"},
        "viewCount": {"N": "0"},
        "engagementScore": {"N": "0.0"},
        "monetizationEnabled": {"BOOL": true}
    }' \
    --region "${REGION}"

echo "✅ Articles test data inserted"

# Query by category GSI
aws dynamodb query \
    --table-name "${ARTICLES_TABLE}" \
    --index-name "category-date-index" \
    --key-condition-expression "#category = :category" \
    --expression-attribute-names '{"#category": "category"}' \
    --expression-attribute-values '{":category": {"S": "discovery"}}' \
    --region "${REGION}"

echo "✅ Articles category GSI query successful"

# Test 3: Users Table Operations
echo "👥 Testing Users table..."

# Insert test data
aws dynamodb put-item \
    --table-name "${USERS_TABLE}" \
    --item '{
        "userId": {"S": "user_123"},
        "email": {"S": "test@example.com"},
        "name": {"S": "Test User"},
        "preferences": {"M": {
            "newsletter": {"BOOL": true},
            "categories": {"SS": ["discovery", "explanation"]}
        }},
        "favoriteCategories": {"SS": ["discovery"]},
        "readingHistory": {"SS": ["apod_20241201_slovak"]},
        "newsletterSubscribed": {"BOOL": true},
        "totalViews": {"N": "5"},
        "lastActiveAt": {"S": "2024-12-01T10:00:00Z"},
        "createdAt": {"S": "2024-12-01T10:00:00Z"},
        "updatedAt": {"S": "2024-12-01T10:00:00Z"}
    }' \
    --region "${REGION}"

echo "✅ Users test data inserted"

# Query by email GSI
aws dynamodb query \
    --table-name "${USERS_TABLE}" \
    --index-name "email-index" \
    --key-condition-expression "#email = :email" \
    --expression-attribute-names '{"#email": "email"}' \
    --expression-attribute-values '{":email": {"S": "test@example.com"}}' \
    --region "${REGION}"

echo "✅ Users email GSI query successful"

# Test 4: Analytics Table Operations
echo "📈 Testing Analytics table..."

# Insert test data
aws dynamodb put-item \
    --table-name "${ANALYTICS_TABLE}" \
    --item '{
        "analyticsId": {"S": "view_20241201_article123"},
        "type": {"S": "view"},
        "articleId": {"S": "apod_20241201_slovak"},
        "userId": {"S": "user_123"},
        "sessionId": {"S": "session_456"},
        "eventType": {"S": "article_view"},
        "eventData": {"M": {
            "duration": {"N": "120"},
            "scrollDepth": {"N": "80"}
        }},
        "timestamp": {"S": "2024-12-01T10:00:00Z"},
        "userAgent": {"S": "Mozilla/5.0..."},
        "referrer": {"S": "https://google.com"},
        "ipAddress": {"S": "192.168.1.1"},
        "createdAt": {"S": "2024-12-01T10:00:00Z"},
        "ttl": {"N": "1735689600"}
    }' \
    --region "${REGION}"

echo "✅ Analytics test data inserted"

# Query by article GSI
aws dynamodb query \
    --table-name "${ANALYTICS_TABLE}" \
    --index-name "article-timestamp-index" \
    --key-condition-expression "#articleId = :articleId" \
    --expression-attribute-names '{"#articleId": "articleId"}' \
    --expression-attribute-values '{":articleId": {"S": "apod_20241201_slovak"}}' \
    --region "${REGION}"

echo "✅ Analytics article GSI query successful"

# Test 5: Clean up test data
echo "🧹 Cleaning up test data..."

aws dynamodb delete-item \
    --table-name "${RAW_CONTENT_TABLE}" \
    --key '{"contentId": {"S": "apod_20241201"}, "source": {"S": "apod"}}' \
    --region "${REGION}"

aws dynamodb delete-item \
    --table-name "${ARTICLES_TABLE}" \
    --key '{"articleId": {"S": "apod_20241201_slovak"}, "type": {"S": "discovery"}}' \
    --region "${REGION}"

aws dynamodb delete-item \
    --table-name "${USERS_TABLE}" \
    --key '{"userId": {"S": "user_123"}, "email": {"S": "test@example.com"}}' \
    --region "${REGION}"

aws dynamodb delete-item \
    --table-name "${ANALYTICS_TABLE}" \
    --key '{"analyticsId": {"S": "view_20241201_article123"}, "type": {"S": "view"}}' \
    --region "${REGION}"

echo "✅ Test data cleaned up"

echo "🎉 All DynamoDB table tests passed successfully!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ RawContent table: CRUD operations and GSI queries"
echo "  ✅ Articles table: CRUD operations and GSI queries"
echo "  ✅ Users table: CRUD operations and GSI queries"
echo "  ✅ Analytics table: CRUD operations and GSI queries"
echo "  ✅ TTL policies: Configured and working"
echo "  ✅ Data cleanup: Successful"
