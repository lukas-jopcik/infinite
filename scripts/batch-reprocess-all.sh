#!/bin/bash

# Batch Reprocess All - Process all items that don't have headlines
# Optimized for speed with parallel processing

set -e

PROFILE="infinite-nasa-apod-dev"
REGION="eu-central-1"
TABLE="infinite-nasa-apod-dev-content"
FETCHER_FUNCTION="infinite-nasa-apod-dev-nasa-fetcher"
BATCH_SIZE=3  # Process 3 items in parallel
BATCH_DELAY=70  # Wait 70 seconds between batches

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Batch Headline Reprocessing (All Items)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fetch all dates that don't have headlines
echo "📊 Fetching items without headlines..."
DATES=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --projection-expression "#d" \
  --expression-attribute-names '{"#d":"date"}' \
  --filter-expression "attribute_not_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'Items[*].date.S' \
  --output text | tr '\t' '\n' | grep -v "^None$" | sort -r)

TOTAL=$(echo "$DATES" | wc -l | xargs)

if [ "$TOTAL" = "0" ]; then
    echo "✅ No items need reprocessing (all have headlines)"
    exit 0
fi

echo "✅ Found $TOTAL items to reprocess"
BATCHES=$(( ($TOTAL + $BATCH_SIZE - 1) / $BATCH_SIZE ))
EST_MINUTES=$(( $BATCHES * $BATCH_DELAY / 60 ))
echo "⏱️  Processing in $BATCHES batches of $BATCH_SIZE items"
echo "⏱️  Estimated time: ~$EST_MINUTES minutes"
echo ""

read -p "Continue? (y/n): " -n 1 -r
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
BATCH_NUM=0

# Convert dates to array
DATE_ARRAY=($DATES)

for (( i=0; i<$TOTAL; i+=$BATCH_SIZE )); do
    BATCH_NUM=$((BATCH_NUM + 1))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Batch $BATCH_NUM/$BATCHES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Process batch items in parallel
    PIDS=()
    for (( j=0; j<$BATCH_SIZE && (i+j)<$TOTAL; j++ )); do
        DATE="${DATE_ARRAY[$i+$j]}"
        PROCESSED=$((PROCESSED + 1))
        
        echo "  [$PROCESSED/$TOTAL] Processing: $DATE"
        
        # Invoke Lambda in background
        (
            aws lambda invoke \
              --function-name "$FETCHER_FUNCTION" \
              --profile "$PROFILE" \
              --region "$REGION" \
              --payload "{\"mode\":\"byDate\",\"date\":\"$DATE\"}" \
              /tmp/batch-$DATE.json \
              --cli-read-timeout 10 \
              --cli-connect-timeout 10 \
              > /dev/null 2>&1
        ) &
        PIDS+=($!)
    done
    
    # Wait for all parallel invocations to complete
    echo "  ⏳ Invoking $BATCH_SIZE Lambdas in parallel..."
    for PID in "${PIDS[@]}"; do
        wait $PID && SUCCESS=$((SUCCESS + 1)) || FAILED=$((FAILED + 1))
    done
    
    # Wait for AI processing
    if [ $BATCH_NUM -lt $BATCHES ]; then
        echo "  ⏳ Waiting ${BATCH_DELAY}s for AI processing..."
        sleep $BATCH_DELAY
    fi
    echo ""
done

echo "⏳ Waiting 70s for final batch to complete..."
sleep 70
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count items with headlines
HEADLINED=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --filter-expression "attribute_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count' \
  --output text 2>/dev/null)

REMAINING=$(aws dynamodb scan \
  --table-name "$TABLE" \
  --filter-expression "attribute_not_exists(headline)" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --select COUNT \
  --query 'Count' \
  --output text 2>/dev/null)

echo "✅ Items with headlines: $HEADLINED"
echo "⏳ Items remaining: $REMAINING"
echo ""

# Cleanup
rm -f /tmp/batch-*.json

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Batch Reprocessing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  Processed: $PROCESSED"
echo "  Invoked:   $SUCCESS"
echo "  Failed:    $FAILED"
echo ""

if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  $REMAINING items still need processing. Run again or check CloudWatch logs."
else
    echo "🎉 All items now have headlines!"
fi

