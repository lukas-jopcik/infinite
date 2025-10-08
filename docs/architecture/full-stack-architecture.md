# Infinite v1.0 - Full-Stack Architecture Document

## Executive Summary

This document provides a comprehensive technical architecture for Infinite v1.0, a Slovak astronomy content platform built on AWS with automated content generation, SEO optimization, and monetization capabilities. The architecture supports 100+ initial articles, daily APOD content, weekly ESA Hubble content, and scalable growth to 10,000+ articles.

## System Overview

### Core Components
- **Frontend**: Next.js 15.5.4 with Tailwind CSS 4.1.9
- **Backend**: AWS Lambda with API Gateway
- **Database**: DynamoDB for content and analytics
- **Storage**: S3 for images and assets
- **CDN**: CloudFront for global content delivery
- **AI**: OpenAI GPT-4o for content generation
- **Analytics**: Google Analytics 4 + Google AdSense
- **Infrastructure**: AWS Amplify for hosting and CI/CD

### Architecture Principles
- **Serverless-First**: All backend services use AWS Lambda
- **Event-Driven**: Content generation triggered by scheduled events
- **Scalable**: Auto-scaling based on demand
- **Cost-Optimized**: Pay-per-use pricing model
- **Secure**: IAM roles and least-privilege access
- **Observable**: Comprehensive monitoring and logging

## Frontend Architecture

### Technology Stack
```typescript
// Core Framework
Next.js 15.5.4 (App Router)
React 18.3.1
TypeScript 5.6.x

// Styling & UI
Tailwind CSS 4.1.9
Radix UI 1.0.0
Lucide React 0.468.0

// State Management
Zustand 5.0.2

// Performance
Sharp 0.33.5 (Image optimization)
Next.js Image Optimization
```

### Component Architecture

#### Layout Components
```typescript
// Root Layout
app/layout.tsx
├── Navigation (components/navigation.tsx)
├── Footer (components/footer.tsx)
├── Analytics (components/analytics.tsx)
└── SEO (components/seo.tsx)

// Page Layouts
app/page.tsx (Homepage)
app/objav-dna/[slug]/page.tsx (Discovery articles)
app/kategoria/[slug]/page.tsx (Category pages)
app/clanok/[slug]/page.tsx (Regular articles)
```

#### Reusable Components
```typescript
// Content Components
ArticleHero - Featured article display
ArticleCard - Article preview cards
ArticleBody - Full article content
DiscoveryCarousel - Rotating content

// Navigation Components
Navigation - Main site navigation
Breadcrumbs - Page hierarchy
CategoryBadge - Category labels

// Interactive Components
NewsletterSignup - Email subscription
SearchInterface - Content search
ScrollToTop - Navigation helper
```

### Routing Strategy
```typescript
// Static Routes
/ - Homepage
/o-projekte - About page
/tyzdenny-vyber - Weekly selection

// Dynamic Routes
/objav-dna/[slug] - Discovery articles
/kategoria/[slug] - Category pages
/clanok/[slug] - Regular articles
/hladat - Search results
```

### SEO Implementation
```typescript
// Metadata Generation
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.imageUrl],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.imageUrl],
    },
  };
}

// Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.perex,
  "image": article.imageUrl,
  "author": {
    "@type": "Organization",
    "name": "Infinite"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Infinite",
    "logo": {
      "@type": "ImageObject",
      "url": "https://infinite.sk/logo.png"
    }
  },
  "datePublished": article.date,
  "dateModified": article.updatedAt
};
```

## Backend Architecture

### AWS Lambda Functions

#### Content Generation Pipeline
```typescript
// 1. Content Fetcher
export const fetchAPODContent = async (event: ScheduledEvent) => {
  const apodData = await fetchAPOD();
  await storeRawContent(apodData, 'apod');
  await triggerContentGeneration(apodData.id);
};

// 2. Content Generator
export const generateArticle = async (event: ContentGenerationEvent) => {
  const rawContent = await getRawContent(event.contentId);
  const article = await generateSlovakArticle(rawContent);
  const seoData = await generateSEO(article);
  
  await storeArticle({
    ...article,
    ...seoData,
    status: 'published'
  });
  
  await processImages(article.images);
};

// 3. Image Processor
export const processImages = async (event: ImageProcessingEvent) => {
  const images = await downloadImages(event.imageUrls);
  const processedImages = await optimizeImages(images);
  await uploadToS3(processedImages);
  await updateArticleImages(event.articleId, processedImages);
};
```

#### API Endpoints
```typescript
// Content API
GET /api/articles - List articles with pagination
GET /api/articles/{id} - Get specific article
GET /api/categories - List all categories
GET /api/search - Search articles

// Analytics API
POST /api/analytics/view - Track article views
POST /api/analytics/engagement - Track user engagement
GET /api/analytics/stats - Get analytics data

// Admin API
POST /api/admin/regenerate - Regenerate article
POST /api/admin/bulk-update - Bulk update articles
GET /api/admin/health - System health check
```

### Database Schema (DynamoDB)

#### RawContent Table
```typescript
interface RawContent {
  // Primary Key
  contentId: string; // PK: "apod_20241201" | "esa_20241201"
  source: string; // SK: "apod" | "esa_hubble"
  
  // Content Data
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  mediaType: 'image' | 'video';
  date: string; // ISO date
  
  // Processing Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  errorMessage?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  ttl?: number; // Auto-delete after 30 days
}

// GSI: source-date-index
// PK: source, SK: date
```

#### Articles Table
```typescript
interface Article {
  // Primary Key
  articleId: string; // PK: "apod_20241201_slovak"
  type: string; // SK: "discovery" | "article" | "weekly"
  
  // Content
  title: string;
  perex: string;
  content: string; // HTML content
  category: string;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  structuredData: object;
  
  // Media
  imageUrl: string;
  imageAlt: string;
  images: ImageData[];
  
  // Metadata
  author: string;
  source: string;
  date: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  
  // Analytics
  viewCount: number;
  engagementScore: number;
  
  // Affiliate
  affiliateLinks: AffiliateLink[];
  monetizationEnabled: boolean;
}

// GSI: category-date-index
// PK: category, SK: date

// GSI: status-date-index  
// PK: status, SK: date

// GSI: type-date-index
// PK: type, SK: date
```

#### Users Table
```typescript
interface User {
  // Primary Key
  userId: string; // PK: "user_123"
  email: string; // SK: "email"
  
  // Profile
  name: string;
  preferences: UserPreferences;
  
  // Engagement
  favoriteCategories: string[];
  readingHistory: string[];
  newsletterSubscribed: boolean;
  
  // Analytics
  totalViews: number;
  lastActiveAt: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// GSI: email-index
// PK: email
```

#### Analytics Table
```typescript
interface Analytics {
  // Primary Key
  analyticsId: string; // PK: "view_20241201_article123"
  type: string; // SK: "view" | "engagement" | "conversion"
  
  // Event Data
  articleId?: string;
  userId?: string;
  sessionId: string;
  
  // Metrics
  eventType: string;
  eventData: object;
  timestamp: string;
  
  // Context
  userAgent: string;
  referrer?: string;
  ipAddress: string;
  
  // Metadata
  createdAt: string;
  ttl: number; // Auto-delete after 2 years
}

// GSI: article-timestamp-index
// PK: articleId, SK: timestamp

// GSI: user-timestamp-index
// PK: userId, SK: timestamp
```

### Content Generation Pipeline

#### 1. Data Ingestion
```typescript
// APOD Fetcher
const fetchAPOD = async () => {
  const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=YOUR_KEY');
  const data = await response.json();
  
  return {
    contentId: `apod_${data.date}`,
    source: 'apod',
    title: data.title,
    explanation: data.explanation,
    url: data.url,
    hdurl: data.hdurl,
    mediaType: data.media_type,
    date: data.date
  };
};

// ESA Hubble Fetcher
const fetchESAHubble = async () => {
  const response = await fetch('https://feeds.feedburner.com/esahubble/images/potw/');
  const feed = await parseRSS(response);
  
  return feed.items.map(item => ({
    contentId: `esa_${item.guid}`,
    source: 'esa_hubble',
    title: item.title,
    explanation: item.description,
    url: item.link,
    mediaType: 'image',
    date: item.pubDate
  }));
};
```

#### 2. AI Content Generation
```typescript
// Enhanced Slovak Article Generator
const generateSlovakArticle = async (rawContent: RawContent) => {
  const prompt = `
    ROLE: Expert Slovak astronomy journalist and SEO specialist
    TASK: Create engaging Slovak article from ${rawContent.source} data
    
    INPUT DATA:
    Title: ${rawContent.title}
    Explanation: ${rawContent.explanation}
    Date: ${rawContent.date}
    
    REQUIREMENTS:
    - Language: Slovak with proper diacritics
    - Style: Engaging, educational, accessible
    - Structure: H1, perex, 5 H2 sections, FAQ
    - Length: 800-1200 words
    - SEO: Optimized for Slovak astronomy keywords
    
    OUTPUT FORMAT:
    {
      "title": "Slovak title",
      "perex": "Engaging introduction",
      "content": "HTML content with H2 sections",
      "faq": [
        {"question": "Q", "answer": "A"}
      ],
      "keywords": ["keyword1", "keyword2"],
      "imageAlt": "Descriptive alt text"
    }
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  return JSON.parse(response.choices[0].message.content);
};

// SEO Generator
const generateSEO = async (article: Article) => {
  const prompt = `
    ROLE: Expert Slovak SEO specialist
    TASK: Generate SEO metadata for astronomy article
    
    ARTICLE:
    Title: ${article.title}
    Content: ${article.content}
    Keywords: ${article.keywords.join(', ')}
    
    REQUIREMENTS:
    - Meta title: 50-60 characters
    - Meta description: 150-160 characters
    - Slovak language optimization
    - Astronomy keyword integration
    - Click-worthy and descriptive
    
    OUTPUT FORMAT:
    {
      "metaTitle": "SEO optimized title",
      "metaDescription": "Compelling description",
      "structuredData": {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "title",
        "description": "description",
        "image": "imageUrl",
        "author": {"@type": "Organization", "name": "Infinite"},
        "publisher": {"@type": "Organization", "name": "Infinite"},
        "datePublished": "date",
        "dateModified": "date"
      }
    }
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 500
  });
  
  return JSON.parse(response.choices[0].message.content);
};
```

#### 3. Image Processing
```typescript
// Image Optimization Pipeline
const processImages = async (imageUrls: string[]) => {
  const processedImages = await Promise.all(
    imageUrls.map(async (url) => {
      // Download original image
      const imageBuffer = await downloadImage(url);
      
      // Generate multiple sizes
      const sizes = [
        { width: 1200, height: 630, suffix: '_og' }, // OpenGraph
        { width: 800, height: 600, suffix: '_hero' }, // Hero
        { width: 400, height: 300, suffix: '_card' }, // Card
        { width: 200, height: 150, suffix: '_thumb' } // Thumbnail
      ];
      
      const variants = await Promise.all(
        sizes.map(async (size) => {
          const processed = await sharp(imageBuffer)
            .resize(size.width, size.height, { fit: 'cover' })
            .webp({ quality: 85 })
            .toBuffer();
          
          const key = `images/${size.suffix}/${generateImageId()}.webp`;
          await s3.upload({ Bucket: 'infinite-images', Key: key, Body: processed }).promise();
          
          return {
            size: size.suffix,
            url: `https://cdn.infinite.sk/${key}`,
            width: size.width,
            height: size.height
          };
        })
      );
      
      return {
        original: url,
        variants: variants,
        alt: generateAltText(url)
      };
    })
  );
  
  return processedImages;
};
```

## Infrastructure Architecture

### AWS Services Integration

#### Amplify Hosting
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run build
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

#### Lambda Functions
```typescript
// Serverless Framework Configuration
export const contentGenerator = {
  handler: 'src/functions/contentGenerator.handler',
  timeout: 300,
  memorySize: 1024,
  environment: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE,
    S3_BUCKET: process.env.S3_BUCKET
  },
  events: [
    {
      schedule: {
        rate: 'rate(1 day)',
        input: { source: 'apod' }
      }
    },
    {
      schedule: {
        rate: 'rate(7 days)',
        input: { source: 'esa_hubble' }
      }
    }
  ]
};
```

#### API Gateway
```typescript
// API Gateway Configuration
export const api = {
  handler: 'src/api/handler.handler',
  events: [
    {
      http: {
        path: '/articles',
        method: 'get',
        cors: true
      }
    },
    {
      http: {
        path: '/articles/{id}',
        method: 'get',
        cors: true
      }
    },
    {
      http: {
        path: '/analytics',
        method: 'post',
        cors: true
      }
    }
  ]
};
```

### Security Architecture

#### IAM Roles and Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:region:account:table/Infinite*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::infinite-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

#### Environment Variables
```typescript
// Production Environment
const config = {
  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_ANALYTICS_ID: process.env.GA4_MEASUREMENT_ID,
  GOOGLE_ADSENSE_ID: process.env.ADSENSE_CLIENT_ID,
  
  // AWS Resources
  DYNAMODB_TABLE: 'InfiniteArticles',
  S3_BUCKET: 'infinite-images',
  CLOUDFRONT_DOMAIN: 'cdn.infinite.sk',
  
  // External APIs
  NASA_API_KEY: process.env.NASA_API_KEY,
  ESA_HUBBLE_FEED: 'https://feeds.feedburner.com/esahubble/images/potw/',
  
  // Feature Flags
  ENABLE_ADS: process.env.NODE_ENV === 'production',
  ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  ENABLE_AFFILIATE: process.env.NODE_ENV === 'production'
};
```

## Performance Optimization

### Frontend Performance
```typescript
// Image Optimization
import Image from 'next/image';

const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    width={800}
    height={600}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    {...props}
  />
);

// Code Splitting
const LazyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});

// Caching Strategy
const cacheConfig = {
  'default': {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400'
  },
  'articles': {
    'Cache-Control': 'public, max-age=1800, s-maxage=3600'
  },
  'images': {
    'Cache-Control': 'public, max-age=31536000, immutable'
  }
};
```

### Backend Performance
```typescript
// DynamoDB Optimization
const queryArticles = async (category: string, limit: number = 20) => {
  const params = {
    TableName: 'InfiniteArticles',
    IndexName: 'category-date-index',
    KeyConditionExpression: 'category = :category',
    ExpressionAttributeValues: {
      ':category': category
    },
    ScanIndexForward: false, // Latest first
    Limit: limit,
    ProjectionExpression: 'articleId, title, perex, imageUrl, date, category'
  };
  
  return await dynamodb.query(params).promise();
};

// Lambda Optimization
export const handler = async (event: APIGatewayEvent) => {
  // Connection pooling
  const db = new DynamoDB.DocumentClient({
    maxRetries: 3,
    retryDelayOptions: {
      customBackoff: (retryCount: number) => Math.pow(2, retryCount) * 100
    }
  });
  
  // Response caching
  const cacheKey = `api:${event.path}:${JSON.stringify(event.queryStringParameters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: cached
    };
  }
  
  // Process request
  const result = await processRequest(event);
  
  // Cache response
  await redis.setex(cacheKey, 300, JSON.stringify(result));
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  };
};
```

## Monitoring and Observability

### CloudWatch Integration
```typescript
// Custom Metrics
const publishMetrics = async (metricName: string, value: number, unit: string = 'Count') => {
  await cloudwatch.putMetricData({
    Namespace: 'Infinite/Content',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }
    ]
  }).promise();
};

// Usage Examples
await publishMetrics('ArticlesGenerated', 1);
await publishMetrics('ContentGenerationTime', duration, 'Seconds');
await publishMetrics('ImageProcessingTime', duration, 'Seconds');
await publishMetrics('APIResponseTime', duration, 'Milliseconds');
```

### Error Handling
```typescript
// Centralized Error Handler
export class InfiniteError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: any
  ) {
    super(message);
    this.name = 'InfiniteError';
  }
}

// Error Handler Middleware
export const errorHandler = (error: Error) => {
  if (error instanceof InfiniteError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: error.code,
        message: error.message,
        context: error.context
      })
    };
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    })
  };
};
```

## Deployment Strategy

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Infinite v1.0

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: .next/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1
      
      - name: Deploy to Amplify
        run: |
          aws amplify start-deployment \
            --app-id ${{ secrets.AMPLIFY_APP_ID }} \
            --branch-name main
```

### Environment Management
```typescript
// Environment Configuration
const environments = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    dynamodbTable: 'InfiniteArticles-Dev',
    s3Bucket: 'infinite-images-dev',
    enableLogging: true
  },
  staging: {
    apiUrl: 'https://staging-api.infinite.sk',
    dynamodbTable: 'InfiniteArticles-Staging',
    s3Bucket: 'infinite-images-staging',
    enableLogging: true
  },
  production: {
    apiUrl: 'https://api.infinite.sk',
    dynamodbTable: 'InfiniteArticles-Prod',
    s3Bucket: 'infinite-images-prod',
    enableLogging: false
  }
};
```

## Cost Optimization

### AWS Cost Management
```typescript
// DynamoDB Cost Optimization
const costOptimizedQuery = {
  TableName: 'InfiniteArticles',
  IndexName: 'category-date-index',
  KeyConditionExpression: 'category = :category',
  ExpressionAttributeValues: { ':category': category },
  ProjectionExpression: 'articleId, title, perex, imageUrl, date', // Only needed fields
  Limit: 20, // Pagination
  ScanIndexForward: false
};

// S3 Cost Optimization
const s3Config = {
  Bucket: 'infinite-images',
  LifecycleConfiguration: {
    Rules: [
      {
        Id: 'DeleteOldVersions',
        Status: 'Enabled',
        NoncurrentVersionExpiration: {
          NoncurrentDays: 30
        }
      },
      {
        Id: 'TransitionToIA',
        Status: 'Enabled',
        Transitions: [
          {
            Days: 30,
            StorageClass: 'STANDARD_IA'
          },
          {
            Days: 90,
            StorageClass: 'GLACIER'
          }
        ]
      }
    ]
  }
};
```

## Security Considerations

### Data Protection
```typescript
// Encryption at Rest
const dynamodbConfig = {
  TableName: 'InfiniteArticles',
  AttributeDefinitions: [
    { AttributeName: 'articleId', AttributeType: 'S' },
    { AttributeName: 'type', AttributeType: 'S' }
  ],
  KeySchema: [
    { AttributeName: 'articleId', KeyType: 'HASH' },
    { AttributeName: 'type', KeyType: 'RANGE' }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  SSESpecification: {
    Enabled: true,
    SSEType: 'KMS'
  }
};

// API Security
const apiSecurity = {
  cors: {
    origin: ['https://infinite.sk', 'https://www.infinite.sk'],
    credentials: true
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com"]
      }
    }
  }
};
```

## Testing Strategy

### Frontend Testing
```typescript
// Component Testing
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';

describe('ArticleCard', () => {
  it('renders article information correctly', () => {
    const mockArticle = {
      articleId: 'test-article',
      title: 'Test Article',
      perex: 'Test description',
      imageUrl: '/test-image.jpg',
      date: '2024-12-01',
      category: 'discovery'
    };
    
    render(<ArticleCard article={mockArticle} />);
    
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});

// E2E Testing
import { test, expect } from '@playwright/test';

test('user can navigate to article page', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="article-card"]');
  await expect(page).toHaveURL(/\/objav-dna\/.+/);
  await expect(page.locator('h1')).toBeVisible();
});
```

### Backend Testing
```typescript
// Lambda Function Testing
import { handler } from '../src/functions/contentGenerator';

describe('Content Generator', () => {
  it('generates article from APOD data', async () => {
    const event = {
      source: 'apod',
      contentId: 'apod_20241201'
    };
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('articleId');
  });
});

// Integration Testing
describe('API Integration', () => {
  it('returns articles for category', async () => {
    const response = await request(app)
      .get('/api/articles?category=discovery')
      .expect(200);
    
    expect(response.body.articles).toBeInstanceOf(Array);
    expect(response.body.articles.length).toBeGreaterThan(0);
  });
});
```

## Conclusion

This comprehensive full-stack architecture provides a robust foundation for Infinite v1.0, supporting:

- **Scalable Content Generation**: Automated pipeline for 100+ articles with daily/weekly updates
- **High Performance**: Optimized frontend and backend for fast loading and response times
- **SEO Excellence**: Comprehensive Slovak language optimization and structured data
- **Monetization Ready**: Google AdSense and affiliate marketing integration
- **Cost Effective**: Serverless architecture with pay-per-use pricing
- **Secure & Compliant**: GDPR compliance and data protection measures
- **Observable**: Comprehensive monitoring and analytics

The architecture is designed to scale from 100 initial articles to 10,000+ articles while maintaining performance and cost efficiency. The modular design allows for easy feature additions and improvements as the platform grows.

---

**Next Steps:**
1. Set up AWS infrastructure using AWS MCP
2. Implement content generation pipeline
3. Deploy frontend to Amplify
4. Configure monitoring and analytics
5. Launch with initial 100 articles
6. Begin daily content generation

**Estimated Timeline:** 4-6 weeks for full implementation
**Estimated Monthly Cost:** $200-500 (scales with usage)
