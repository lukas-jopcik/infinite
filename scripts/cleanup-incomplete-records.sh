#!/bin/bash

# Cleanup Incomplete Records - Delete and reprocess the 8 incomplete items

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
TABLE="infinite-nasa-apod-dev-content"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
DELAY_SECONDS=65

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Cleanup Incomplete Records (8 items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# The 8 incomplete items (only have date field, no content)
INCOMPLETE_ITEMS=(
    "2025-08-27"
    "2025-08-25"
    "2025-08-21"
    "2025-08-18"
    "2025-08-15"
    "2025-08-13"
    "2025-08-07"
    "2024-12-19"
)

TOTAL=${#INCOMPLETE_ITEMS[@]}
echo "📊 Processing $TOTAL incomplete items"
echo "⏱️  Estimated time: ~$(($TOTAL * 65 / 60)) minutes"
echo ""

echo "🔍 Step 1: Verifying incomplete records..."
echo ""

for DATE in "${INCOMPLETE_ITEMS[@]}"; do
    echo "📅 Checking $DATE:"
    
    # Check what fields exist
    FIELDS=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item' \
      --output json 2>/dev/null | jq -r 'keys[]' 2>/dev/null || echo "")
    
    if [ -z "$FIELDS" ]; then
        echo "  ❌ Item not found in DynamoDB"
    else
        FIELD_COUNT=$(echo "$FIELDS" | wc -l | xargs)
        echo "  📊 Fields: $FIELD_COUNT ($(echo "$FIELDS" | tr '\n' ',' | sed 's/,$//'))"
        
        if [ "$FIELD_COUNT" -eq 1 ] && echo "$FIELDS" | grep -q "date"; then
            echo "  ✅ Confirmed incomplete (date only)"
        else
            echo "  ⚠️  Has content, skipping deletion"
        fi
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 2: Deleting incomplete records..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DELETED=0
SKIPPED=0

for DATE in "${INCOMPLETE_ITEMS[@]}"; do
    echo "🗑️  Deleting $DATE..."
    
    # Check if item exists and is incomplete
    FIELDS=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item' \
      --output json 2>/dev/null | jq -r 'keys[]' 2>/dev/null || echo "")
    
    if [ -z "$FIELDS" ]; then
        echo "  ⏭️  Item not found, skipping"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    FIELD_COUNT=$(echo "$FIELDS" | wc -l | xargs)
    
    if [ "$FIELD_COUNT" -eq 1 ] && echo "$FIELDS" | grep -q "date"; then
        # Delete the incomplete record
        aws dynamodb delete-item \
          --table-name "$TABLE" \
          --key "{\"date\":{\"S\":\"$DATE\"}}" \
          --profile "$PROFILE" \
          --region "$REGION" \
          --output text > /dev/null 2>&1
        
        echo "  ✅ Deleted incomplete record"
        DELETED=$((DELETED + 1))
    else
        echo "  ⏭️  Has content, skipping deletion"
        SKIPPED=$((SKIPPED + 1))
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Step 3: Reprocessing from scratch..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROCESSED=0
SUCCESS=0
FAILED=0

for DATE in "${INCOMPLETE_ITEMS[@]}"; do
    PROCESSED=$((PROCESSED + 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "[$PROCESSED/$TOTAL] Reprocessing: $DATE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if item already has content (wasn't deleted)
    EXISTING=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --projection-expression "title" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item.title.S' \
      --output text 2>/dev/null || echo "")
    
    if [ "$EXISTING" != "" ] && [ "$EXISTING" != "None" ]; then
        echo "  ⏭️  Skipped (has content): $EXISTING"
        continue
    fi
    
    # Invoke Lambda to fetch fresh NASA data and process
    echo "  🚀 Fetching fresh NASA data and processing..."
    RESULT=$(aws lambda invoke \
      --function-name "$FETCHER_FUNCTION" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --payload "{\"mode\":\"byDate\",\"date\":\"$DATE\"}" \
      /tmp/cleanup-$DATE.json 2>&1)
    
    STATUS_CODE=$(echo "$RESULT" | grep -o '"StatusCode": [0-9]*' | grep -o '[0-9]*')
    
    if [ "$STATUS_CODE" = "200" ]; then
        echo "  ✅ Lambda invoked successfully"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ❌ Lambda invocation failed (HTTP $STATUS_CODE)"
        FAILED=$((FAILED + 1))
        cat /tmp/cleanup-$DATE.json
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

for DATE in "${INCOMPLETE_ITEMS[@]}"; do
    echo "📅 $DATE"
    
    # Check if item exists and has content
    ITEM=$(aws dynamodb get-item \
      --table-name "$TABLE" \
      --key "{\"date\":{\"S\":\"$DATE\"}}" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Item' \
      --output json 2>/dev/null)
    
    if [ "$ITEM" = "null" ] || [ -z "$ITEM" ]; then
        echo "  ❌ Item not found"
        FAILED=$((FAILED + 1))
    else
        # Check for headline
        HEADLINE=$(echo "$ITEM" | jq -r '.headline.S // empty' 2>/dev/null)
        TITLE=$(echo "$ITEM" | jq -r '.title.S // empty' 2>/dev/null)
        
        if [ -n "$HEADLINE" ]; then
            EN_HEADLINE=$(echo "$ITEM" | jq -r '.headlineEN.S // empty' 2>/dev/null)
            echo "  🇸🇰 $HEADLINE"
            echo "  🇬🇧 $EN_HEADLINE"
            echo "  ✅ Success"
        elif [ -n "$TITLE" ]; then
            echo "  📝 Has content but no headline yet"
            echo "  ⏳ Processing may still be in progress"
        else
            echo "  ❌ No content found"
            FAILED=$((FAILED + 1))
        fi
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

TOTAL_ITEMS=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count' \
  --output text 2>/dev/null)

HEADLINED_ITEMS=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --filter-expression "attribute_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count' \
  --output text 2>/dev/null)

# Cleanup
rm -f /tmp/cleanup-*.json

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Results:"
echo "  Deleted:     $DELETED incomplete records"
echo "  Skipped:     $SKIPPED (had content)"
echo "  Reprocessed: $SUCCESS items"
echo "  Failed:      $FAILED items"
echo ""
echo "📈 Database Status:"
echo "  Total items:     $TOTAL_ITEMS"
echo "  With headlines:  $HEADLINED_ITEMS"
echo "  Remaining:       $REMAINING"
echo ""

if [ "$REMAINING" -eq 0 ]; then
    echo "🎉 All items now have headlines!"
    echo "✅ Database cleanup complete!"
else
    echo "⚠️  $REMAINING items still need processing."
    echo "   Run the script again or check CloudWatch logs."
fi
