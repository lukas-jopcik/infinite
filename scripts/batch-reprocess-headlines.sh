#!/bin/bash

# Batch Reprocess Headlines
# This script reprocesses all APOD content to generate new curiosity-driven headlines
# with validation for all historical items in DynamoDB.

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
TABLE="infinite-nasa-apod-dev-content"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
DELAY_SECONDS=60  # Wait 60 seconds between batches to avoid rate limits

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Batch Headline Reprocessing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fetch all dates from DynamoDB
echo "📊 Fetching all dates from DynamoDB..."
DATES=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --projection-expression "#d" \
  --expression-attribute-names '{"#d":"date"}' \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'Items[*].date.S' \
  --output text | tr '\t' '\n' | sort -r)

TOTAL=$(echo "$DATES" | wc -l | xargs)
echo "✅ Found $TOTAL dates to reprocess"
echo ""

# Ask for confirmation
read -p "⚠️  This will reprocess $TOTAL items (approx $(($TOTAL * 60 / 60)) minutes). Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting batch reprocessing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROCESSED=0
SUCCESS=0
FAILED=0
SKIPPED=0

for DATE in $DATES; do
    PROCESSED=$((PROCESSED + 1))
    
    echo "[$PROCESSED/$TOTAL] Processing: $DATE"
    
    # Check if headline already exists
    EXISTING=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --projection-expression "headline" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item.headline.S' \
      --output text 2>/dev/null || echo "")
    
    if [ "$EXISTING" != "" ] && [ "$EXISTING" != "None" ]; then
        echo "  ⏭️  Skipped (headline exists): $EXISTING"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    # Invoke nasa-fetcher in byDate mode (will trigger content-processor)
    RESULT=$(aws lambda invoke \
      --function-name "$FETCHER_FUNCTION" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --payload "{\"mode\":\"byDate\",\"date\":\"$DATE\"}" \
      /tmp/batch-response-$DATE.json 2>&1)
    
    STATUS_CODE=$(echo "$RESULT" | grep -o '"StatusCode": [0-9]*' | grep -o '[0-9]*')
    
    if [ "$STATUS_CODE" = "200" ]; then
        echo "  ✅ Success"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Failed (HTTP $STATUS_CODE)"
        FAILED=$((FAILED + 1))
        cat /tmp/batch-response-$DATE.json
    fi
    
    # Wait between requests to respect rate limits
    if [ $PROCESSED -lt $TOTAL ]; then
        echo "  ⏳ Waiting ${DELAY_SECONDS}s before next request..."
        sleep $DELAY_SECONDS
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Batch Reprocessing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  Total:    $TOTAL"
echo "  Success:  $SUCCESS"
echo "  Skipped:  $SKIPPED"
echo "  Failed:   $FAILED"
echo ""

# Cleanup
rm -f /tmp/batch-response-*.json

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some items failed. Check CloudWatch logs:"
    echo "   aws logs filter-log-events \\"
    echo "     --log-group-name /aws/lambda/$FETCHER_FUNCTION \\"
    echo "     --profile $PROFILE \\"
    echo "     --region $REGION"
    exit 1
fi

echo "🎉 All items processed successfully!"

