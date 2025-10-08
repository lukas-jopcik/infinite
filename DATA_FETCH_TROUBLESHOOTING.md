# NASA APOD Data Fetch Troubleshooting Guide

## Issue Encountered: October 1-2, 2025

### Problem Summary
- **October 1st, 2025**: Data was fetched but not appearing on website
- **October 2nd, 2025**: NASA hasn't published data yet (API returns 404)

### Root Cause
The October 1st record was stored in DynamoDB but was missing the `pk` field set to `LATEST`. The website API queries data using a Global Secondary Index (GSI) that filters by `pk = 'LATEST'`, so records without this field are invisible to the API.

### Solution Applied
Manually set the `pk` field for October 1st:
```bash
aws dynamodb update-item \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --table-name infinite-nasa-apod-dev-content \
  --key '{"date":{"S":"2025-10-01"}}' \
  --update-expression "SET pk = :pk" \
  --expression-attribute-values '{":pk":{"S":"LATEST"}}'
```

## Automatic Fetch Schedule

You have TWO EventBridge rules configured:
- **`infinite-nasa-apod-daily-fetch`**: Runs at 06:00 UTC (08:00 CEST) daily
- **`infinite-nasa-apod-dev-daily`**: Runs at 04:05 UTC (06:05 CEST) daily

NASA typically publishes APOD around 12:05 AM EST (05:05 UTC), so your 04:05 UTC schedule should catch it automatically.

## Manual Fetch Commands

### Using the Helper Script (Recommended)
```bash
# Fetch latest available APOD
./scripts/fetch-apod.sh

# Fetch specific date
./scripts/fetch-apod.sh 2025-10-01
```

The script automatically:
- Invokes the Lambda function
- Verifies data in DynamoDB
- Checks and fixes the `pk` field if needed
- Shows verification results

### Using AWS CLI Directly

#### Fetch Latest APOD
```bash
aws lambda invoke \
  --function-name infinite-nasa-apod-dev-nasa-fetcher \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --payload '{"mode":"daily"}' \
  response.json
```

#### Fetch Specific Date
```bash
aws lambda invoke \
  --function-name infinite-nasa-apod-dev-nasa-fetcher \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --payload '{"mode":"byDate","date":"2025-10-01"}' \
  response.json
```

## Verify Data in DynamoDB

### Check if record exists
```bash
aws dynamodb get-item \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --table-name infinite-nasa-apod-dev-content \
  --key '{"date":{"S":"2025-10-01"}}' \
  --query 'Item.{date:date.S,pk:pk.S,title:slovakTitle.S,quality:contentQuality.N}'
```

### Check latest items via API
```bash
curl -s "https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod/api/latest?limit=3" | python3 -m json.tool
```

### Scan all recent records
```bash
aws dynamodb scan \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --table-name infinite-nasa-apod-dev-content \
  --max-items 10 \
  --query 'Items[*].{pk:pk.S,date:date.S,title:slovakTitle.S}' \
  --output table
```

## Cache Behavior

### Frontend Cache
- Next.js uses ISR (Incremental Static Regeneration) with 5-minute revalidation
- Pages will automatically regenerate after 5 minutes when visited
- Use hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### API Cache
- API responses cached for 5 minutes (`max-age=300`)
- CloudFront may also cache responses
- Use ETags for efficient cache validation

### Clear Website Cache
If data still doesn't appear after 5-10 minutes:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Hard refresh the page

## Monitoring

### Check Lambda Execution Logs
```bash
# List recent log streams
aws logs describe-log-streams \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --log-group-name /aws/lambda/infinite-nasa-apod-dev-nasa-fetcher \
  --order-by LastEventTime \
  --descending \
  --max-items 5

# Get logs from specific stream
aws logs get-log-events \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --log-group-name /aws/lambda/infinite-nasa-apod-dev-nasa-fetcher \
  --log-stream-name "STREAM_NAME" \
  --limit 50
```

### Check EventBridge Rules
```bash
aws events list-rules \
  --profile infinite-nasa-apod-dev \
  --region eu-central-1 \
  --query 'Rules[?contains(Name, `nasa`) || contains(Name, `fetch`)].{Name:Name,Schedule:ScheduleExpression,State:State}' \
  --output table
```

## Troubleshooting Checklist

- [ ] Check if NASA API has published data for the date
- [ ] Verify Lambda function executed successfully
- [ ] Check DynamoDB record exists
- [ ] Verify `pk` field is set to `LATEST`
- [ ] Wait 5-10 minutes for cache to expire
- [ ] Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] Check CloudWatch logs for errors
- [ ] Verify API endpoint returns the data

## Known Issues

### Missing `pk` Field
**Symptom**: Data exists in DynamoDB but doesn't appear on website
**Cause**: Record missing `pk = 'LATEST'` field
**Solution**: Use the helper script or manually update the record

### NASA API 404 Error
**Symptom**: API returns "No data available for date"
**Cause**: NASA hasn't published APOD for that date yet
**Solution**: Wait for NASA to publish (usually around 05:05 UTC)

### Stale Cache
**Symptom**: Old data still visible on website
**Cause**: Browser or CDN cache
**Solution**: Hard refresh browser, wait 5-10 minutes

## Future Prevention

The deployed Lambda function should automatically set `pk = 'LATEST'`, but if you notice this issue again:

1. Check the deployed Lambda code matches the repository
2. Verify environment variables are set correctly
3. Consider adding a post-processing step to verify `pk` field
4. Set up CloudWatch alarms for failed executions

## Support

If issues persist:
1. Check Lambda function logs in CloudWatch
2. Verify DynamoDB table schema and indexes
3. Check IAM permissions for Lambda execution role
4. Review recent code changes that may have affected the content processor

