#!/bin/bash
# NASA APOD Manual Fetch Script
# Usage: ./scripts/fetch-apod.sh [date]
# Example: ./scripts/fetch-apod.sh 2025-10-01
# If no date is provided, fetches the latest available APOD

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
TABLE_NAME="infinite-nasa-apod-dev-content"

echo "🚀 NASA APOD Fetch Script"
echo "=========================="

if [ -z "$1" ]; then
    echo "📡 Fetching latest APOD..."
    PAYLOAD='{"mode":"daily"}'
    MODE="daily"
else
    DATE=$1
    echo "📅 Fetching APOD for date: $DATE"
    # Validate date format
    if ! [[ $DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "❌ Error: Invalid date format. Use YYYY-MM-DD"
        exit 1
    fi
    PAYLOAD="{\"mode\":\"byDate\",\"date\":\"$DATE\"}"
    MODE="byDate"
fi

# Invoke Lambda function
echo "⚡ Invoking Lambda function: $FETCHER_FUNCTION"
aws lambda invoke \
    --function-name "$FETCHER_FUNCTION" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --payload "$PAYLOAD" \
    /tmp/fetch-response.json > /dev/null 2>&1

# Check response
if [ $? -eq 0 ]; then
    echo "✅ Lambda invoked successfully"
    cat /tmp/fetch-response.json | python3 -m json.tool 2>/dev/null || cat /tmp/fetch-response.json
    echo ""
    
    # Extract date from response
    FETCHED_DATE=$(cat /tmp/fetch-response.json | grep -o '"date":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$FETCHED_DATE" ]; then
        echo "📊 Verifying data in DynamoDB..."
        sleep 3  # Give DynamoDB time to process
        
        # Check if record exists and has pk field
        aws dynamodb get-item \
            --profile "$PROFILE" \
            --region "$REGION" \
            --table-name "$TABLE_NAME" \
            --key "{\"date\":{\"S\":\"$FETCHED_DATE\"}}" \
            --query 'Item.{date:date.S,pk:pk.S,title:slovakTitle.S,quality:contentQuality.N}' \
            2>&1
        
        # Check pk field
        PK=$(aws dynamodb get-item \
            --profile "$PROFILE" \
            --region "$REGION" \
            --table-name "$TABLE_NAME" \
            --key "{\"date\":{\"S\":\"$FETCHED_DATE\"}}" \
            --query 'Item.pk.S' \
            --output text 2>&1)
        
        if [ "$PK" != "LATEST" ] && [ "$PK" != "None" ]; then
            echo "⚠️  Warning: pk field is not set to LATEST. Fixing..."
            aws dynamodb update-item \
                --profile "$PROFILE" \
                --region "$REGION" \
                --table-name "$TABLE_NAME" \
                --key "{\"date\":{\"S\":\"$FETCHED_DATE\"}}" \
                --update-expression "SET pk = :pk" \
                --expression-attribute-values '{":pk":{"S":"LATEST"}}' \
                > /dev/null 2>&1
            echo "✅ pk field set to LATEST"
        elif [ "$PK" == "None" ]; then
            echo "⚠️  Warning: pk field is missing. Setting..."
            aws dynamodb update-item \
                --profile "$PROFILE" \
                --region "$REGION" \
                --table-name "$TABLE_NAME" \
                --key "{\"date\":{\"S\":\"$FETCHED_DATE\"}}" \
                --update-expression "SET pk = :pk" \
                --expression-attribute-values '{":pk":{"S":"LATEST"}}' \
                > /dev/null 2>&1
            echo "✅ pk field set to LATEST"
        else
            echo "✅ Data verified successfully!"
        fi
    fi
else
    echo "❌ Error: Lambda invocation failed"
    cat /tmp/fetch-response.json
    exit 1
fi

echo ""
echo "🌐 Data should appear on the website within 5 minutes (cache TTL)"
echo "💡 Tip: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"

