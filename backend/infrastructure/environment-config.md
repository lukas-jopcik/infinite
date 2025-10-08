# Environment Configuration for Infinite v1.0

## Updated Environment Variables

Add these to your `.env.local` file:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=eu-central-1

# DynamoDB Tables
DYNAMODB_RAW_CONTENT_TABLE=InfiniteRawContent-dev
DYNAMODB_ARTICLES_TABLE=InfiniteArticles-dev
DYNAMODB_USERS_TABLE=InfiniteUsers-dev
DYNAMODB_ANALYTICS_TABLE=InfiniteAnalytics-dev

# S3 Buckets
S3_IMAGES_BUCKET=infinite-images-dev-349660737637
S3_ASSETS_BUCKET=infinite-assets-dev-349660737637

# Secrets Manager ARNs (update with your actual ARNs)
OPENAI_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:349660737637:secret:infinite/openai-api-key-ABC123
NASA_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:349660737637:secret:infinite/nasa-api-key-DEF456
GA_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:349660737637:secret:infinite/google-analytics-id-GHI789
ADSENSE_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:349660737637:secret:infinite/google-adsense-id-JKL012

# Public environment variables (safe to expose)
NEXT_PUBLIC_APP_NAME=Infinite
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_S3_IMAGES_BUCKET=infinite-images-dev-349660737637
NEXT_PUBLIC_S3_ASSETS_BUCKET=infinite-assets-dev-349660737637
```

## S3 Bucket URLs

### Images Bucket
- **Bucket Name**: `infinite-images-dev-349660737637`
- **Region**: `eu-central-1`
- **URL Format**: `https://infinite-images-dev-349660737637.s3.eu-central-1.amazonaws.com/images/[folder]/[filename]`

### Assets Bucket
- **Bucket Name**: `infinite-assets-dev-349660737637`
- **Region**: `eu-central-1`
- **URL Format**: `https://infinite-assets-dev-349660737637.s3.eu-central-1.amazonaws.com/assets/[folder]/[filename]`

## Folder Structure

### Images Bucket
```
infinite-images-dev-349660737637/
├── images/
│   ├── og/          # OpenGraph images (1200x630)
│   ├── hero/        # Hero images (800x600)
│   ├── card/        # Card images (400x300)
│   └── thumb/       # Thumbnail images (200x150)
```

### Assets Bucket
```
infinite-assets-dev-349660737637/
├── assets/
│   ├── css/         # CSS files
│   ├── js/          # JavaScript files
│   └── fonts/       # Font files
```

## Cost Estimates

### S3 Storage
- **Standard Storage**: $0.023 per GB per month
- **Standard-IA**: $0.0125 per GB per month (after 30 days)
- **Glacier**: $0.004 per GB per month (after 90 days)

### S3 Requests
- **PUT/POST**: $0.0004 per 1,000 requests
- **GET**: $0.0004 per 1,000 requests

### Estimated Monthly Cost
- **Development**: $1-5/month
- **Production**: $10-50/month (depending on traffic)

## Security Features

### Encryption
- **At Rest**: AES-256 encryption enabled
- **In Transit**: HTTPS/TLS for all requests

### Access Control
- **Public Read**: Images and assets are publicly readable
- **CORS**: Configured for cross-origin requests
- **Versioning**: Enabled for backup and recovery

### Lifecycle Policies
- **30 days**: Move to Standard-IA
- **90 days**: Move to Glacier
- **90 days**: Delete old versions

## Next Steps

1. **Update your `.env.local`** with the bucket names above
2. **Test image upload** functionality
3. **Implement image processing** pipeline
4. **Set up CloudFront** (optional for better performance)
5. **Configure monitoring** and alerts
