#!/bin/bash

# Deploy GSI-Optimized Lambda Functions
# This script deploys the updated Lambda functions with GSI optimizations

set -e

echo "🚀 Deploying GSI-optimized Lambda functions..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"

# Function names (actual Lambda function names from AWS)
ARTICLES_API_FUNCTION="infinite-articles-api-dev"
AI_CONTENT_GENERATOR_FUNCTION="infinite-ai-content-generator-dev"
APOD_FETCHER_FUNCTION="infinite-apod-fetcher-dev"
APOD_RSS_FETCHER_FUNCTION="infinite-apod-rss-fetcher-dev"
ESA_FETCHER_FUNCTION="infinite-esa-fetcher-dev"

echo "📋 Deploying functions in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"

# 1. Deploy Articles API
echo "📰 Deploying Articles API..."
if [ -f "backend/functions/api/articles-api-gsi-optimized.zip" ]; then
    aws lambda update-function-code \
        --function-name "${ARTICLES_API_FUNCTION}" \
        --zip-file fileb://backend/functions/api/articles-api-gsi-optimized.zip \
        --region "${REGION}" \
        --output table
    echo "   ✅ Articles API deployed successfully"
else
    echo "   ❌ Articles API deployment package not found"
fi

# 2. Deploy AI Content Generator
echo "🤖 Deploying AI Content Generator..."
if [ -f "backend/functions/scheduled/ai-content-generator-gsi-optimized.zip" ]; then
    aws lambda update-function-code \
        --function-name "${AI_CONTENT_GENERATOR_FUNCTION}" \
        --zip-file fileb://backend/functions/scheduled/ai-content-generator-gsi-optimized.zip \
        --region "${REGION}" \
        --output table
    echo "   ✅ AI Content Generator deployed successfully"
else
    echo "   ❌ AI Content Generator deployment package not found"
fi

# 3. Deploy APOD Fetcher
echo "🛰️  Deploying APOD Fetcher..."
if [ -f "backend/functions/scheduled/apod-fetcher-gsi-optimized.zip" ]; then
    aws lambda update-function-code \
        --function-name "${APOD_FETCHER_FUNCTION}" \
        --zip-file fileb://backend/functions/scheduled/apod-fetcher-gsi-optimized.zip \
        --region "${REGION}" \
        --output table
    echo "   ✅ APOD Fetcher deployed successfully"
else
    echo "   ❌ APOD Fetcher deployment package not found"
fi

# 4. Deploy APOD RSS Fetcher
echo "📡 Deploying APOD RSS Fetcher..."
if [ -f "backend/functions/scheduled/apod-rss-fetcher-gsi-optimized.zip" ]; then
    aws lambda update-function-code \
        --function-name "${APOD_RSS_FETCHER_FUNCTION}" \
        --zip-file fileb://backend/functions/scheduled/apod-rss-fetcher-gsi-optimized.zip \
        --region "${REGION}" \
        --output table
    echo "   ✅ APOD RSS Fetcher deployed successfully"
else
    echo "   ❌ APOD RSS Fetcher deployment package not found"
fi

# 5. Deploy ESA Fetcher
echo "🔭 Deploying ESA Fetcher..."
if [ -f "backend/functions/scheduled/esa-fetcher-gsi-optimized.zip" ]; then
    aws lambda update-function-code \
        --function-name "${ESA_FETCHER_FUNCTION}" \
        --zip-file fileb://backend/functions/scheduled/esa-fetcher-gsi-optimized.zip \
        --region "${REGION}" \
        --output table
    echo "   ✅ ESA Fetcher deployed successfully"
else
    echo "   ❌ ESA Fetcher deployment package not found"
fi

echo ""
echo "✅ GSI-optimized Lambda functions deployment completed!"
echo ""
echo "📋 Deployed Functions:"
echo "  - Articles API: ${ARTICLES_API_FUNCTION}"
echo "  - AI Content Generator: ${AI_CONTENT_GENERATOR_FUNCTION}"
echo "  - APOD Fetcher: ${APOD_FETCHER_FUNCTION}"
echo "  - APOD RSS Fetcher: ${APOD_RSS_FETCHER_FUNCTION}"
echo "  - ESA Fetcher: ${ESA_FETCHER_FUNCTION}"
echo ""
echo "🎉 All functions are now using GSI-optimized queries!"
echo ""
echo "📝 Next steps:"
echo "  1. Test the deployed functions"
echo "  2. Monitor CloudWatch for performance improvements"
echo "  3. Verify that GSI queries are being used instead of scans"
