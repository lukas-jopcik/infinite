#!/bin/bash

# Fix Remaining Items - Process the 11 items that still need headlines

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
TABLE="infinite-nasa-apod-dev-content"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
DELAY_SECONDS=65

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fix Remaining Items (11 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# The 11 items that still need headlines
REMAINING_ITEMS=(
    "2025-08-30"  # Already processed above
    "2025-08-29"
    "2025-08-28"
    "2025-08-27"
    "2025-08-25"
    "2025-08-21"
    "2025-08-18"
    "2025-08-15"
    "2025-08-13"
    "2025-08-07"
    "2024-12-19"
)

TOTAL=${#REMAINING_ITEMS[@]}
echo "📊 Processing $TOTAL remaining items"
echo "⏱️  Estimated time: ~$(($TOTAL * 65 / 60)) minutes"
echo ""

PROCESSED=0
SUCCESS=0
FAILED=0

for DATE in "${REMAINING_ITEMS[@]}"; do
    PROCESSED=$((PROCESSED + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$PROCESSED/$TOTAL] Processing: $DATE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if already has headline
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
        continue
    fi
    
    # Invoke Lambda
    echo "  🚀 Invoking Lambda..."
    RESULT=$(aws lambda invoke \
      --function-name "$FETCHER_FUNCTION" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --payload "{\"mode\":\"byDate\",\"date\":\"$DATE\"}" \
      /tmp/fix-$DATE.json 2>&1)
    
    STATUS_CODE=$(echo "$RESULT" | grep -o '"StatusCode": [0-9]*' | grep -o '[0-9]*')
    
    if [ "$STATUS_CODE" = "200" ]; then
        echo "  ✅ Lambda invoked successfully"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Lambda invocation failed (HTTP $STATUS_CODE)"
        FAILED=$((FAILED + 1))
        cat /tmp/fix-$DATE.json
        continue
    fi
    
    # Wait for processing
    if [ $PROCESSED -lt $TOTAL ]; then
        echo "  ⏳ Waiting ${DELAY_SECONDS}s for AI processing..."
        sleep $DELAY_SECONDS
    fi
    echo ""
done

echo "⏳ Waiting for final item to complete..."
sleep 65
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for DATE in "${REMAINING_ITEMS[@]}"; do
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

# Final count
REMAINING=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --filter-expression "attribute_not_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count' \
  --output text 2>/dev/null)

# Cleanup
rm -f /tmp/fix-*.json

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  Processed: $PROCESSED"
echo "  Success:   $SUCCESS"
echo "  Failed:    $FAILED"
echo "  Remaining: $REMAINING"
echo ""

if [ "$REMAINING" -eq 0 ]; then
    echo "🎉 All items now have headlines!"
else
    echo "⚠️  $REMAINING items still need processing."
fi
