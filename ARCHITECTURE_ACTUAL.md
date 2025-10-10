# Infinite NASA APOD - Actual Implemented Architecture

**Last Updated:** October 2, 2025  
**Status:** Production Implementation

This document describes the **actual implemented architecture** as deployed in production, which may differ from the original planned architecture in `docs/architecture.md`.

---

## 🎯 Architecture Overview

### System Type
**Full-Stack Serverless Web Application** with AI content enhancement

### Key Components
1. **Frontend:** Next.js 14 (App Router) on AWS Amplify
2. **Backend:** AWS Lambda functions (Node.js 18.x)
3. **Database:** DynamoDB with Global Secondary Index
4. **Storage:** S3 with CloudFront CDN
5. **AI:** OpenAI GPT-4o-mini for Slovak content generation
6. **Orchestration:** EventBridge for scheduled tasks

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS AMPLIFY (Frontend Host)                       │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Next.js 14 Application                         │    │
│  │  • ISR with 5-minute revalidation                          │    │
│  │  • Static page generation                                   │    │
│  │  • Client-side React components                            │    │
│  └────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (REST API)                          │
│            l9lm0zrzyl.execute-api.eu-central-1                      │
│                                                                       │
│  Routes:                                                             │
│  • GET  /api/latest  → api-latest Lambda                           │
│  • POST /api/reprocess → api-reprocess Lambda                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌──────────────────────────────┐  ┌───────────────────────────────────┐
│   api-latest Lambda          │  │   api-reprocess Lambda            │
│   • Query DynamoDB via GSI   │  │   • Fetch fresh NASA data         │
│   • Return cached results    │  │   • Invoke content-processor      │
│   • ETag support             │  │   • Overwrite existing content    │
└──────────────────────────────┘  └───────────────────────────────────┘
                │                                │
                └────────────────┬───────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DynamoDB Table                                │
│            infinite-nasa-apod-dev-content                           │
│                                                                       │
│  Primary Key: date (YYYY-MM-DD)                                     │
│  GSI: gsi_latest (pk='LATEST', sort by date DESC)                  │
│                                                                       │
│  Schema:                                                             │
│  {                                                                   │
│    date, pk, originalTitle, originalExplanation,                    │
│    slovakTitle, slovakArticle, seoKeywords,                         │
│    imageUrl, hdImageUrl, cachedImage,                               │
│    contentQuality, qualityIssues, aiHeadlines                       │
│  }                                                                   │
│                                                                       │
│  Current: 56 items, ~295 KB                                         │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      DAILY AUTOMATION FLOW                           │
│                                                                       │
│  EventBridge (Cron)                                                  │
│  • cron(5 4 * * ? *) → 04:05 UTC                                   │
│  • cron(0 6 * * ? *) → 06:00 UTC                                   │
│                  │                                                    │
│                  ▼                                                    │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │           nasa-fetcher Lambda                              │     │
│  │                                                             │     │
│  │  1. Fetch from NASA APOD API                              │     │
│  │     https://api.nasa.gov/planetary/apod                   │     │
│  │                                                             │     │
│  │  2. Extract data:                                          │     │
│  │     • date, title, explanation                             │     │
│  │     • url, hdurl, media_type                               │     │
│  │     • copyright                                            │     │
│  │                                                             │     │
│  │  3. Invoke content-processor asynchronously                │     │
│  └────────────────────┬──────────────────────────────────────┘     │
│                       │                                              │
│                       ▼                                              │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │         content-processor Lambda (1024 MB)                 │     │
│  │                                                             │     │
│  │  1. Call OpenAI GPT-4o-mini                               │     │
│  │     ├─ Generate Slovak article (700-900 words)            │     │
│  │     ├─ Translate title to Slovak                          │     │
│  │     ├─ Extract SEO keywords (8-12)                        │     │
│  │     └─ Generate AI headlines (A/B testing)                │     │
│  │                                                             │     │
│  │  2. Content Quality Validation                             │     │
│  │     ├─ Check article length (300+ words)                  │     │
│  │     ├─ Verify Slovak diacritics                           │     │
│  │     ├─ Remove AI disclaimers                              │     │
│  │     ├─ Ensure complete conclusion                         │     │
│  │     └─ Calculate quality score (0-100)                    │     │
│  │                                                             │     │
│  │  3. Cache Image in S3                                      │     │
│  │     ├─ Download from NASA                                  │     │
│  │     ├─ Check if already cached (headObject)               │     │
│  │     ├─ Upload to S3 with metadata                         │     │
│  │     └─ Generate CloudFront URL                            │     │
│  │                                                             │     │
│  │  4. Store in DynamoDB                                      │     │
│  │     └─ Save with pk='LATEST' for GSI                      │     │
│  └───────────────────────────────────────────────────────────┘     │
│                       │                                              │
│              ┌────────┴────────┐                                     │
│              ▼                 ▼                                     │
│  ┌──────────────────┐  ┌─────────────────────────────┐            │
│  │   DynamoDB       │  │   S3 Bucket                 │            │
│  │   (content)      │  │   + CloudFront CDN          │            │
│  └──────────────────┘  └─────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Patterns

### Pattern 1: Daily Content Generation (Automated)

```
┌──────────────┐
│ EventBridge  │ Schedule: 04:05 UTC & 06:00 UTC daily
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ nasa-fetcher     │ Mode: daily
│ Lambda           │ • Fetch latest from NASA API
└──────┬───────────┘  • Parse APOD data
       │              • Invoke content-processor async
       │
       ▼
┌──────────────────┐
│ NASA APOD API    │ Returns:
└──────┬───────────┘  {date, title, explanation, url, hdurl, media_type}
       │
       ▼
┌──────────────────┐
│ content-         │ Step 1: Generate Slovak content
│ processor        │ ├─ Call OpenAI API with prompt
│ Lambda           │ ├─ Generate 700-900 word article
└──────┬───────────┘ └─ Translate title
       │
       │              Step 2: Generate SEO keywords
       │              ├─ Extract 8-12 Slovak keywords
       │              └─ Generate AI headlines
       │
       │              Step 3: Quality validation
       │              ├─ Check length (300+ words)
       │              ├─ Verify Slovak text (diacritics)
       │              ├─ Remove AI disclaimers
       │              ├─ Ensure complete conclusion
       │              └─ Calculate quality score
       │
       │              Step 4: Image caching
       │              ├─ Download image from NASA
       │              ├─ Check S3 for existing (headObject)
       │              └─ Upload to S3 if not exists
       │
       ▼
┌──────────────────┐
│ S3 Bucket        │ Path: images/YYYY-MM-DD.jpg
│ + CloudFront     │ • Content-Type preserved
└──────────────────┘ • Metadata: original-url, apod-date, cached-at
       │
       ▼
┌──────────────────┐
│ DynamoDB         │ Item:
│ PutItem          │ {
└──────────────────┘   pk: 'LATEST',  ← Critical for GSI!
                       date: '2025-10-01',
                       slovakTitle: '...',
                       slovakArticle: '...',
                       seoKeywords: [...],
                       cachedImage: {url, bucket, key},
                       contentQuality: 100
                     }
```

### Pattern 2: User Page Request (Frontend)

```
┌──────────────┐
│ User Browser │ Request: https://infinite.sk/apod/2025-10-01
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ AWS Amplify      │ Serves Next.js SSR/ISR
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Next.js ISR      │ ISR revalidation: 300 seconds (5 min)
│ getByDateFromApi │ • Check if page exists in cache
└──────┬───────────┘ • If stale, fetch fresh data
       │              • If fresh, serve from cache
       │
       ▼
┌──────────────────┐
│ API Gateway      │ GET /api/latest?date=2025-10-01
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ api-latest       │ Query DynamoDB:
│ Lambda           │ • GetItem by date
└──────┬───────────┘ • Return item if exists
       │              • ETag support for cache validation
       │
       ▼
┌──────────────────┐
│ DynamoDB         │ GetItem(date='2025-10-01')
│ Table            │ Returns full item with Slovak content
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Next.js Page     │ Render:
│ Render           │ • Slovak title + article
└──────┬───────────┘ • CloudFront cached image
       │              • SEO keywords
       │              • OpenGraph tags
       ▼
┌──────────────────┐
│ User sees        │ • Full Slovak article
│ rendered page    │ • Optimized image from CDN
└──────────────────┘ • Fast load time (< 2s)
```

### Pattern 3: Manual Content Reprocessing

```
┌──────────────┐
│ Admin/Script │ POST /api/reprocess {date: "2025-10-01"}
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ API Gateway      │ POST /api/reprocess
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ api-reprocess    │ Step 1: Validate date
│ Lambda           │ Step 2: Check if item exists in DynamoDB
└──────┬───────────┘ Step 3: Fetch fresh NASA data
       │              Step 4: Invoke content-processor
       │
       ├─────────────┐
       │             ▼
       │      ┌──────────────────┐
       │      │ NASA APOD API    │ Fetch fresh data for date
       │      └──────┬───────────┘
       │             │
       │             ▼
       │      ┌──────────────────┐
       │      │ content-         │ Same process as daily automation
       │      │ processor        │ • Generate new Slovak content
       │      │ Lambda           │ • Regenerate keywords
       │      └──────┬───────────┘ • Recalculate quality
       │             │
       │             ▼
       │      ┌──────────────────┐
       │      │ DynamoDB         │ PutItem (overwrite existing)
       │      │ Update           │ • Same date key
       │      └──────────────────┘ • New generated content
       │                           • Updated timestamp
       ▼
┌──────────────────┐
│ Return 202       │ Response: {"status": "processing", "date": "..."}
│ Accepted         │
└──────────────────┘
```

---

## 📦 Component Specifications

### Lambda Functions

#### 1. nasa-fetcher
```javascript
// Location: aws/lambda/nasa-fetcher/index.js
// Trigger: EventBridge, Manual invocation

Environment Variables:
- NASA_API_KEY: API key for NASA APOD
- NASA_APOD_URL: https://api.nasa.gov/planetary/apod
- RSS_FEED_URL: https://apod.com/feed.rss
- PROCESSOR_FUNCTION: infinite-nasa-apod-dev-content-processor

Modes:
1. daily: Fetch latest available APOD
2. byDate: Fetch specific date (event.date)
3. rss: Backfill from RSS feed (event.limit)

Error Handling:
- Retry with exponential backoff
- Fallback to RSS if API fails
- Graceful degradation
```

#### 2. content-processor
```javascript
// Location: aws/lambda/content-processor/index.js
// Trigger: Invoked by nasa-fetcher, api-reprocess

Environment Variables:
- DYNAMODB_TABLE_NAME: infinite-nasa-apod-dev-content
- S3_BUCKET_NAME: infinite-nasa-apod-dev-images-349660737637
- CLOUDFRONT_DOMAIN: d2ydyf9w4v170.cloudfront.net
- REGION: eu-central-1
- OPENAI_SECRET_NAME: Secret name for OpenAI API key
- OPENAI_ORG: OpenAI organization ID
- OPENAI_PROJECT: OpenAI project ID

Processing Steps:
1. callOpenAI(prompt) → Generate Slovak article
2. generateSlovakTitle(title, explanation) → Translate title
3. generateSeoKeywords(title, article) → Extract keywords
4. ensureCompleteArticle(article) → Validate completeness
5. cacheImageInS3(url, date) → Download and cache image
6. storeContentInDynamoDB(content) → Save to database

Quality Checks:
- Article length: 300-1200 words (optimal: 700-900)
- Slovak diacritics presence check
- AI disclaimer removal
- Conclusion completeness
- Quality score: 0-100 (deductions for issues)
```

#### 3. api-latest
```javascript
// Location: aws/lambda/api-latest/index.js
// Trigger: API Gateway GET /api/latest

Environment Variables:
- TABLE_NAME: infinite-nasa-apod-dev-content
- INDEX_NAME: gsi_latest
- DEFAULT_LIMIT: 5

Query Patterns:
1. List latest: GET /api/latest?limit=N
   → Query GSI (pk='LATEST') sorted by date DESC
2. Get by date: GET /api/latest?date=YYYY-MM-DD
   → GetItem by date

Response Format:
{
  items: [
    {
      date, titleSk, slovakArticle, imageUrl, hdImageUrl,
      cachedImage: {url, bucket, key},
      seoKeywords, contentQuality
    }
  ],
  count: N
}

Caching:
- ETag generation based on dates
- Cache-Control: public, max-age=300
- If-None-Match support (304 response)
```

#### 4. esa-hubble-potw-fetcher
```javascript
// Location: backend/functions/scheduled/esa-hubble-potw-fetcher.js
// Trigger: EventBridge (Tuesday 8:00 AM CET), Manual invocation

Environment Variables:
- ENVIRONMENT: dev/prod
- AWS_REGION: us-east-1
- RAW_CONTENT_TABLE: InfiniteRawContent-${ENVIRONMENT}

RSS Feed:
- URL: https://feeds.feedburner.com/esahubble/images/potw/
- Frequency: Weekly (Mondays at 6:00 AM UTC+2)
- Content: ESA Hubble Picture of the Week

Processing Steps:
1. Parse RSS feed with rss-parser
2. Extract: title, description, pubDate, link, image URL from content:encoded
3. Check for duplicates using guid-index GSI
4. Store with source: "esa-hubble-potw", category: "tyzdenny-vyber"
5. Backfill: fetch all available entries on first run
6. Subsequent runs: fetch only new entries

Data Storage:
- Raw content: InfiniteRawContent-dev table
- Status: "pending" for AI processing
- Deduplication: GUID-based with title/date fallback
- Image extraction: HTML parsing from content:encoded

Schedule:
- EventBridge rule: cron(0 6 ? * TUE *)
- Timezone: 6:00 AM UTC = 8:00 AM CET (winter) / 7:00 AM CEST (summer)
```

#### 5. ai-content-generator
```javascript
// Location: backend/functions/scheduled/ai-content-generator.js
// Trigger: EventBridge (hourly), Manual invocation

Environment Variables:
- ENVIRONMENT: dev/prod
- OPENAI_SECRET_ARN: ARN for OpenAI API key
- ARTICLES_TABLE: InfiniteArticles-${ENVIRONMENT}
- RAW_CONTENT_TABLE: InfiniteRawContent-${ENVIRONMENT}

Content Processing:
- Processes raw content with status: "pending"
- Uses conditional prompts based on category:
  * tyzdenny-vyber: Editorial/curated tone, 4 sections, 1500+ chars
  * objav-dna: Technical tone, 5 sections, 2000+ chars
- Generates Slovak articles with OpenAI GPT-4o-mini
- Creates article records with proper category/type mapping

Category Mapping:
- tyzdenny-vyber → type: "weekly-pick"
- objav-dna → type: "discovery"
- Other categories → type: "discovery"

Output:
- Stores processed articles in InfiniteArticles-dev table
- Updates raw content status to "processed"
- Generates multiple image sizes (hero, card, og)
```

### DynamoDB Schema

#### NASA APOD Content Table
```javascript
// Table: infinite-nasa-apod-dev-content
// Billing: PAY_PER_REQUEST
// Region: eu-central-1

Primary Key:
  date (String) - YYYY-MM-DD

Global Secondary Index: gsi_latest
  Partition Key: pk (String) - Always 'LATEST'
  Sort Key: date (String) - For descending date order
```

#### Articles Table (InfiniteArticles-dev)
```javascript
// Table: InfiniteArticles-dev
// Billing: PROVISIONED
// Region: eu-central-1

Primary Key:
  articleId (String) - HASH
  type (String) - RANGE

Global Secondary Indexes:
  - slug-index: slug (HASH) - For article lookup by slug
  - category-originalDate-index: category (HASH), originalDate (RANGE) - For category queries
  - status-originalDate-index: status (HASH), originalDate (RANGE) - For status filtering
  - type-originalDate-index: type (HASH), originalDate (RANGE) - For type-based queries
```

#### RawContent Table (InfiniteRawContent-dev)
```javascript
// Table: InfiniteRawContent-dev
// Billing: PROVISIONED
// Region: eu-central-1

Primary Key:
  contentId (String) - HASH
  source (String) - RANGE

Global Secondary Indexes:
  - source-date-index: source (HASH), date (RANGE) - For duplicate checking
  - status-index: status (HASH) - For processing status queries
  - guid-index: guid (HASH) - For GUID-based duplicate detection

Item Structure:
{
  // Keys (required)
  date: '2025-10-01',           // Partition key
  pk: 'LATEST',                 // GSI partition key (CRITICAL!)
  
  // Original NASA data
  originalTitle: 'Astronomy Picture of the Day',
  originalExplanation: '...',   // NASA's English text
  imageUrl: 'https://...',      // Original URL
  hdImageUrl: 'https://...',    // HD version
  mediaType: 'image',           // or 'video'
  copyright: 'Brian Meyers',
  
  // AI-generated Slovak content
  slovakTitle: 'Astronomická fotografia dňa',
  slovakArticle: '...',         // 700-900 words in Slovak
  seoKeywords: [                // 8-12 keywords
    'astronómia', 'vesmír', 'NASA', ...
  ],
  
  // Quality metrics
  contentQuality: 100,          // Score 0-100
  qualityIssues: [],            // List of detected issues
  articleLengthChars: 5234,
  articleLengthWords: 784,
  
  // Cached image (S3)
  cachedImage: {
    bucket: 'infinite-nasa-apod-dev-images-349660737637',
    key: 'images/2025-10-01.jpg',
    url: 'https://d2ydyf9w4v170.cloudfront.net/images/2025-10-01.jpg',
    contentType: 'image/jpeg',
    originalUrl: 'https://...'
  },
  
  // A/B testing headlines
  aiHeadlines: {
    primary: '...',
    secondary: '...',
    short: '...'
  },
  
  // Timestamps
  generatedAt: '2025-10-02T06:00:48.648Z',
  lastUpdated: '2025-10-02T06:02:38.637Z'
}

Access Patterns:
1. Get by date: GetItem(date='YYYY-MM-DD')
2. List latest: Query(gsi_latest, pk='LATEST', ScanIndexForward=false, Limit=N)
3. Update content: PutItem(date='YYYY-MM-DD', pk='LATEST', ...)
```

### S3 & CloudFront

```javascript
// S3 Bucket: infinite-nasa-apod-dev-images-349660737637
// Region: eu-central-1

Structure:
  /images/
    2025-10-01.jpg
    2025-09-30.jpg
    ...

Image Caching Process:
1. Check if exists: s3.headObject({Bucket, Key})
2. If not exists:
   - Download from NASA
   - Determine Content-Type
   - Upload to S3 with metadata:
     * original-url: NASA source URL
     * apod-date: YYYY-MM-DD
     * cached-at: ISO timestamp
3. Return CloudFront URL

CloudFront Distribution:
  ID: E1QZ28JOPP56T0
  Domain: d2ydyf9w4v170.cloudfront.net
  Origin: S3 bucket
  Cache: Immutable (Cache-Control: max-age=86400, immutable)
```

---

## 🔐 Security & Permissions

### IAM Roles

```yaml
# Lambda Execution Role: infinite-nasa-apod-dev-lambda-role

Permissions:
  - logs:CreateLogGroup
  - logs:CreateLogStream
  - logs:PutLogEvents
  - dynamodb:PutItem
  - dynamodb:GetItem
  - dynamodb:Query
  - dynamodb:Scan
  - s3:PutObject
  - s3:GetObject
  - s3:HeadObject
  - lambda:InvokeFunction
  - secretsmanager:GetSecretValue (for OpenAI key)

Trust Relationship:
  - Service: lambda.amazonaws.com
```

### API Keys & Secrets

```
NASA_API_KEY: Environment variable (Lambda)
OPENAI_API_KEY: AWS Secrets Manager or Environment variable
  - Cached after first retrieval
  - Length validation
  - Supports JSON or plain text secret format
```

---

## 📊 Performance Characteristics

### Response Times
- **API Gateway → api-latest:** < 100ms (cached)
- **DynamoDB Query:** < 50ms
- **Next.js ISR page:** < 500ms (cached), < 2s (regeneration)
- **Content generation:** 25-35 seconds (OpenAI + validation + S3)

### Caching Layers
1. **CloudFront CDN:** Images (immutable, 24h)
2. **API Gateway:** 5 minutes (Cache-Control header)
3. **Next.js ISR:** 5 minutes (revalidate)
4. **Browser:** Follows Cache-Control headers

### Scalability
- **Lambda:** Automatic scaling, 1000 concurrent executions
- **DynamoDB:** On-demand capacity, automatic scaling
- **S3:** Unlimited storage
- **CloudFront:** Global distribution, automatic scaling

---

## 🚨 Known Issues & Workarounds

### Issue 1: Missing `pk` Field
**Problem:** Items stored without `pk='LATEST'` don't appear in GSI query  
**Root Cause:** Content processor might fail to set pk field  
**Detection:** Item exists in GetItem but not in Query(gsi_latest)  
**Solution:** Manual update or use `fetch-apod.sh` script

```bash
aws dynamodb update-item \
  --table-name infinite-nasa-apod-dev-content \
  --key '{"date":{"S":"YYYY-MM-DD"}}' \
  --update-expression "SET pk = :pk" \
  --expression-attribute-values '{":pk":{"S":"LATEST"}}'
```

### Issue 2: OpenAI Rate Limiting
**Problem:** Content generation fails during high-load periods  
**Root Cause:** OpenAI API rate limits  
**Detection:** HTTP 429 errors in CloudWatch logs  
**Solution:** Retry with exponential backoff (not yet implemented)

### Issue 3: NASA API Delays
**Problem:** New APOD not available when scheduled fetch runs  
**Root Cause:** NASA publishes around 05:05 UTC, fetches run at 04:05 & 06:00  
**Detection:** 04:05 fetch returns previous day's APOD  
**Solution:** 06:00 UTC backup fetch usually succeeds

---

## 📈 Monitoring & Observability

### CloudWatch Metrics

```bash
# Lambda Invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=infinite-nasa-apod-dev-content-processor \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-02T00:00:00Z \
  --period 3600 \
  --statistics Sum

# DynamoDB Consumed Capacity
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=infinite-nasa-apod-dev-content
```

### Key Metrics to Monitor
- Lambda invocation count & duration
- Lambda error rate & throttles
- DynamoDB read/write capacity
- S3 storage & request count
- CloudFront cache hit ratio
- API Gateway request count & latency

---

## 🔄 Disaster Recovery

### Backup Strategy
- **DynamoDB:** Point-in-time recovery enabled (last 35 days)
- **S3:** Versioning enabled, lifecycle policies
- **Lambda:** Code stored in version control (Git)
- **Configuration:** Infrastructure as code (manual deployment)

### Recovery Procedures
1. **DynamoDB restore:** Point-in-time recovery to new table
2. **S3 restore:** Object versioning, lifecycle restore
3. **Lambda redeploy:** From Git + manual deployment
4. **Full system:** Restore from backups + redeploy code

---

## 🎯 Future Improvements

### Planned Enhancements
- [ ] Automated `pk` field verification post-processing
- [ ] OpenAI rate limit handling with retries
- [ ] Multiple language support (Czech, English)
- [ ] CloudFormation/Terraform for infrastructure
- [ ] Automated testing for Lambda functions
- [ ] Cost optimization review
- [ ] Performance dashboard
- [ ] A/B testing implementation for AI headlines

---

**Document Version:** 1.0  
**Last Verified:** October 2, 2025  
**Next Review:** Monthly or after significant changes


