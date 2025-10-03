# Hubble AWS Deployment Guide

## Prehľad

Tento dokument popisuje, ako nasadiť a nakonfigurovať AWS integráciu pre Hubble sekciu.

## Architektúra

```
ESA Hubble RSS Feed
        ↓
   hubble-fetcher (Lambda)
        ↓
  content-processor (Lambda)
        ↓
    DynamoDB (Storage)
        ↓
    api-hubble (Lambda)
        ↓
   Frontend (Next.js)
```

## Komponenty

### 1. **hubble-fetcher** Lambda funkcia
- **Úloha**: Parsuje ESA Hubble RSS feed každý pondelok
- **Trigger**: EventBridge cron job (pondelok 6:00 UTC)
- **Výstup**: Volá content-processor pre každý nový Hubble item

### 2. **content-processor** Lambda funkcia (aktualizovaná)
- **Úloha**: Generuje slovenské články a SEO obsah pre Hubble dáta
- **Vstup**: Hubble RSS dáta
- **Výstup**: Ukladá spracované dáta do DynamoDB

### 3. **api-hubble** Lambda funkcia
- **Úloha**: Poskytuje API endpoint pre Hubble dáta
- **Vstup**: DynamoDB query
- **Výstup**: JSON s Hubble položkami

### 4. **DynamoDB** tabuľka
- **Úloha**: Ukladá spracované Hubble dáta
- **Schéma**: `pk: 'HUBBLE'`, `guid: unique_id`

## Nasadenie

### Krok 1: Nasadenie Lambda funkcií

```bash
# Spusti deployment script
./scripts/deploy-hubble.sh
```

Tento script:
- Nainštaluje dependencies
- Vytvorí deployment packages
- Nahraje funkcie do AWS Lambda
- Nakonfiguruje environment variables

### Krok 2: Nastavenie EventBridge cron job

```bash
# Spusti cron setup script
./scripts/setup-hubble-cron.sh
```

Tento script:
- Vytvorí EventBridge rule pre týždenný cron
- Pridá Lambda funkciu ako target
- Nastaví permissions

### Krok 3: Testovanie pipeline

```bash
# Spusti test script
./scripts/test-hubble-pipeline.sh
```

Tento script:
- Otestuje hubble-fetcher
- Otestuje api-hubble
- Skontroluje DynamoDB
- Otestuje content-processor

## Konfigurácia

### Environment Variables

#### hubble-fetcher
```bash
HUBBLE_RSS_URL=https://feeds.feedburner.com/esahubble/images/potw/
PROCESSOR_FUNCTION=infinite-content-processor
REGION=eu-central-1
```

#### api-hubble
```bash
DYNAMODB_TABLE_NAME=infinite-nasa-apod-content
REGION=eu-central-1
```

#### content-processor (existujúce)
```bash
DYNAMODB_TABLE_NAME=infinite-nasa-apod-content
S3_BUCKET_NAME=infinite-nasa-apod-images
OPENAI_API_KEY=your-openai-key
REGION=eu-central-1
```

### EventBridge Rule
```json
{
  "Name": "infinite-hubble-weekly-cron",
  "ScheduleExpression": "cron(0 6 ? * MON *)",
  "Description": "Weekly Hubble RSS fetch - every Monday at 6 AM UTC",
  "State": "ENABLED"
}
```

## DynamoDB Schéma

### Hubble Items
```json
{
  "pk": "HUBBLE",
  "guid": "unique-hubble-item-id",
  "originalTitle": "Original ESA Hubble title",
  "originalDescription": "HTML description",
  "originalExcerpt": "Plain text excerpt",
  "imageUrl": "https://cdn.esahubble.org/...",
  "imageVariants": [...],
  "link": "https://esahubble.org/...",
  "pubDate": "2024-12-19T00:00:00.000Z",
  "category": ["galaxy", "star"],
  "creditRaw": "ESA/Hubble & NASA",
  "copyrightRaw": "Copyright info",
  "creditFallback": "Scraped credit",
  "keywords": ["hubble", "astronomy"],
  "slovakTitle": "Slovenský názov",
  "slovakArticle": "Slovenský článok...",
  "headline": "Zaujímavý slovenský nadpis",
  "headlineEN": "Interesting English headline",
  "seoKeywords": ["hubble", "astronómia"],
  "contentQuality": 85,
  "qualityIssues": [],
  "articleLengthChars": 2500,
  "articleLengthWords": 400,
  "generatedAt": "2024-12-19T10:00:00.000Z",
  "lastUpdated": "2024-12-19T10:00:00.000Z",
  "cachedImage": {...}
}
```

## API Endpoints

### Frontend API (Next.js)
- `GET /api/hubble?limit=12` - Získa najnovšie Hubble položky
- `GET /api/hubble?guid=xxx&limit=1` - Získa konkrétnu Hubble položku

### AWS API (Lambda)
- `GET /hubble?limit=12` - Získa najnovšie Hubble položky z DynamoDB
- `GET /hubble?guid=xxx&limit=1` - Získa konkrétnu Hubble položku z DynamoDB

## Monitoring

### CloudWatch Logs
- **hubble-fetcher**: `/aws/lambda/infinite-hubble-fetcher`
- **api-hubble**: `/aws/lambda/infinite-hubble-api`
- **content-processor**: `/aws/lambda/infinite-content-processor`

### CloudWatch Metrics
- Lambda invocations
- Lambda errors
- Lambda duration
- DynamoDB read/write capacity

## Troubleshooting

### Časté problémy

1. **Hubble fetcher nefunguje**
   - Skontroluj EventBridge rule
   - Skontroluj Lambda permissions
   - Skontroluj CloudWatch logs

2. **Content processor nefunguje**
   - Skontroluj OpenAI API key
   - Skontroluj DynamoDB permissions
   - Skontroluj S3 permissions

3. **API nefunguje**
   - Skontroluj DynamoDB query
   - Skontroluj Lambda timeout
   - Skontroluj CORS headers

### Debug príkazy

```bash
# Skontroluj Lambda funkcie
aws lambda list-functions --query 'Functions[?contains(FunctionName, `hubble`)]'

# Skontroluj EventBridge rules
aws events list-rules --name-prefix infinite-hubble

# Skontroluj DynamoDB items
aws dynamodb query --table-name infinite-nasa-apod-content --key-condition-expression "pk = :pk" --expression-attribute-values '{":pk": {"S": "HUBBLE"}}'

# Skontroluj CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/infinite-hubble
```

## Údržba

### Týždenné kontroly
- Skontroluj EventBridge rule execution
- Skontroluj DynamoDB item count
- Skontroluj CloudWatch error metrics

### Mesačné kontroly
- Aktualizuj dependencies
- Skontroluj Lambda function performance
- Skontroluj DynamoDB costs

## Bezpečnosť

### IAM Permissions
- Lambda funkcie majú minimálne potrebné permissions
- DynamoDB access je obmedzený na potrebné operácie
- S3 access je obmedzený na image caching

### Environment Variables
- OpenAI API key je uložený v AWS Secrets Manager
- Iné citlivé dáta sú v environment variables
- Všetky API calls používajú HTTPS

## Náklady

### Odhadované mesačné náklady
- **Lambda**: ~$1-5 (podľa počtu invocations)
- **DynamoDB**: ~$1-3 (podľa počtu items)
- **S3**: ~$0.50-2 (podľa veľkosti obrázkov)
- **EventBridge**: ~$0.10 (1 rule)

**Celkom**: ~$2.60-10.10 mesačne
