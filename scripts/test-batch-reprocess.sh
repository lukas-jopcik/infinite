#!/bin/bash

# Test Batch Reprocess - Process just 3 items to verify it works

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
TABLE="infinite-nasa-apod-dev-content"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
DELAY_SECONDS=65  # 65 seconds to allow AI processing to complete

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Test Batch Headline Reprocessing (3 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get 3 most recent dates that don't have headlines
DATES=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --projection-expression "#d" \
  --expression-attribute-names '{"#d":"date"}' \
  --filter-expression "attribute_not_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --max-items 3 \
  --query 'Items[*].date.S' \
  --output text | tr '\t' '\n' | sort -r)

TOTAL=$(echo "$DATES" | wc -l | xargs)

if [ "$TOTAL" = "0" ]; then
    echo "✅ No items need reprocessing (all have headlines)"
    echo ""
    echo "To force reprocess specific dates, use:"
    echo "  aws lambda invoke --function-name $FETCHER_FUNCTION \\"
    echo "    --payload '{\"mode\":\"byDate\",\"date\":\"YYYY-MM-DD\"}' \\"
    echo "    --profile $PROFILE --region $REGION /tmp/output.json"
    exit 0
fi

echo "📊 Found $TOTAL items to test:"
echo "$DATES"
echo ""
echo "⏱️  Estimated time: $(($TOTAL * 65 / 60)) minutes"
echo ""

PROCESSED=0
SUCCESS=0
FAILED=0

for DATE in $DATES; do
    PROCESSED=$((PROCESSED + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$PROCESSED/$TOTAL] Processing: $DATE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Invoke nasa-fetcher
    echo "🚀 Invoking Lambda..."
    RESULT=$(aws lambda invoke \
      --function-name "$FETCHER_FUNCTION" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --payload "{\"mode\":\"byDate\",\"date\":\"$DATE\"}" \
      /tmp/test-batch-$DATE.json 2>&1)
    
    STATUS_CODE=$(echo "$RESULT" | grep -o '"StatusCode": [0-9]*' | grep -o '[0-9]*')
    
    if [ "$STATUS_CODE" = "200" ]; then
        echo "  ✅ Lambda invoked successfully"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Lambda invocation failed (HTTP $STATUS_CODE)"
        FAILED=$((FAILED + 1))
        cat /tmp/test-batch-$DATE.json
        continue
    fi
    
    # Wait for processing
    if [ $PROCESSED -lt $TOTAL ]; then
        echo "  ⏳ Waiting ${DELAY_SECONDS}s for AI processing..."
        sleep $DELAY_SECONDS
        echo ""
    fi
done

echo ""
echo "⏳ Waiting for final item to complete..."
sleep 65
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for DATE in $DATES; do
    HEADLINE=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --projection-expression "headline,headlineEN" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item.{SK:headline.S,EN:headlineEN.S}' \
      --output json 2>/dev/null)
    
    echo "📅 $DATE"
    if echo "$HEADLINE" | grep -q "null"; then
        echo "  ❌ No headline generated"
        FAILED=$((FAILED + 1))
    else
        SK=$(echo "$HEADLINE" | grep -o '"SK": "[^"]*"' | cut -d'"' -f4)
        EN=$(echo "$HEADLINE" | grep -o '"EN": "[^"]*"' | cut -d'"' -f4)
        echo "  🇸🇰 $SK"
        echo "  🇬🇧 $EN"
        echo "  ✅ Success"
    fi
    echo ""
done

# Cleanup
rm -f /tmp/test-batch-*.json

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  Invoked:  $SUCCESS"
echo "  Failed:   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All test items processed successfully!"
    echo ""
    echo "To process all remaining items, run:"
    echo "  ./scripts/batch-reprocess-headlines.sh"
else
    echo "⚠️  Some items failed. Check CloudWatch logs:"
    echo "  aws logs filter-log-events \\"
    echo "    --log-group-name /aws/lambda/$FETCHER_FUNCTION \\"
    echo "    --profile $PROFILE --region $REGION"
    exit 1
fi

