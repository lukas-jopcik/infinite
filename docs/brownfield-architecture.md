# Infinite NASA APOD - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Infinite NASA APOD codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements and provides a comprehensive view of the actual implemented system.

### Document Scope

Comprehensive documentation of entire system including:
- Production AWS infrastructure with GSI optimizations
- Dual frontend applications (infinite/ and infinite-v2/)
- Complex backend Lambda architecture
- AI content generation pipeline
- Recent GSI implementation and monitoring

### Change Log

| Date   | Version | Description                 | Author    |
| ------ | ------- | --------------------------- | --------- |
| 2025-10-09 | 1.0     | Initial brownfield analysis | Winston (Architect) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Frontend Entry**: `infinite-v2/app/page.tsx` (current production frontend)
- **Legacy Frontend**: `infinite/app/page.tsx` (previous version)
- **Backend API**: `backend/functions/api/articles-api.js` (main Lambda handler)
- **AI Content Generation**: `backend/functions/scheduled/ai-content-generator.js`
- **NASA Data Fetching**: `backend/functions/scheduled/apod-fetcher.js`
- **Infrastructure Setup**: `backend/infrastructure/dynamodb-setup.sh`
- **GSI Migration**: `backend/infrastructure/add-remaining-gsis.sh`
- **API Integration**: `infinite-v2/lib/api.ts`
- **Configuration**: `ARCHITECTURE_ACTUAL.md` (production architecture)
- **Status**: `PROJECT_STATUS.md` (current system status)

### Key Infrastructure Components

- **DynamoDB Tables**: `InfiniteArticles-dev`, `InfiniteRawContent-dev`, `infinite-nasa-apod-dev-content`
- **Lambda Functions**: 5+ deployed functions with GSI optimizations
- **API Gateway**: `l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com`
- **CloudFront**: `d2ydyf9w4v170.cloudfront.net`
- **S3 Buckets**: Multiple buckets for images and content

## High Level Architecture

### Technical Summary

**System Type**: Full-Stack Serverless Web Application with AI Content Enhancement
**Architecture Pattern**: Event-driven serverless with dual frontend applications
**Deployment**: AWS-native with Next.js frontends and Lambda backend
**Content Pipeline**: NASA API → AI Processing → DynamoDB → Frontend Display

### Actual Tech Stack (from package.json analysis)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| **Frontend Framework** | Next.js | 15.5.4 | App Router, ISR, TypeScript |
| **Language** | TypeScript | ^5 | Strict typing throughout |
| **Styling** | Tailwind CSS | ^4.1.9 | Modern utility-first CSS |
| **UI Components** | Radix UI | Various | Complete component library |
| **State Management** | React Hooks | ^19 | Modern React patterns |
| **Backend Runtime** | Node.js | 18.x | AWS Lambda runtime |
| **Database** | DynamoDB | Latest | NoSQL with GSI optimizations |
| **Storage** | S3 + CloudFront | Latest | Image caching and CDN |
| **AI Service** | OpenAI GPT-4o-mini | Latest | Slovak content generation |
| **Infrastructure** | AWS Serverless | Latest | Lambda, API Gateway, EventBridge |
| **Deployment** | AWS CLI | Latest | Manual deployment scripts |

### Repository Structure Reality Check

- **Type**: Monorepo with multiple applications
- **Package Manager**: npm (multiple package.json files)
- **Notable**: Dual frontend applications, complex backend structure, extensive AWS infrastructure

## Source Tree and Module Organization

### Project Structure (Actual)

```text
infinite-v2/
├── app/                    # Next.js 15 App Router (CURRENT PRODUCTION)
│   ├── api/               # API routes (minimal)
│   ├── objav-dna/[date]/  # Article detail pages
│   ├── page.tsx           # Homepage with article listings
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components (29 files)
│   ├── article-hero.tsx   # Hero component
│   ├── article-card.tsx   # Article card
│   ├── ui/               # Radix UI components
│   └── [26 other components]
├── lib/                   # Utilities and services
│   ├── api.ts            # API integration
│   ├── seo.ts            # SEO utilities
│   └── [9 other utility files]
├── package.json          # Dependencies and scripts
└── next.config.ts        # Next.js configuration

infinite/                  # LEGACY FRONTEND (still present)
├── app/                  # Next.js 14 App Router
├── components/           # Legacy components
├── lib/                  # Legacy utilities
└── package.json          # Legacy dependencies

backend/                   # AWS BACKEND INFRASTRUCTURE
├── functions/
│   ├── api/              # API Lambda functions
│   │   ├── articles-api.js        # Main API handler
│   │   └── [4 other API files]
│   ├── scheduled/        # Scheduled Lambda functions
│   │   ├── ai-content-generator.js    # AI content generation
│   │   ├── apod-fetcher.js           # NASA data fetching
│   │   ├── apod-rss-fetcher.js       # RSS feed processing
│   │   ├── esa-fetcher.js            # ESA content fetching
│   │   └── [3 other scheduled functions]
│   ├── content-generation/  # Content processing functions
│   ├── image-processing/    # Image handling functions
│   └── shared/              # Shared utilities
├── infrastructure/        # Infrastructure as code
│   ├── dynamodb-setup.sh           # Database setup
│   ├── add-remaining-gsis.sh       # GSI migration
│   ├── deploy-gsi-optimized-lambdas.sh  # Deployment
│   └── [34 other infrastructure files]
└── deployment_packages/   # Lambda deployment packages

aws/                       # AWS CONFIGURATION
├── lambda/               # Lambda function packages
├── config/               # Environment configurations
├── policies/             # IAM policies
└── infrastructure/       # Infrastructure configurations

docs/                      # DOCUMENTATION
├── architecture/         # Architecture documentation
├── stories/              # User stories (32 files)
├── prd.md               # Product requirements
├── technical-specifications.md
└── [20+ other docs]

agents/                    # AI AGENT CONFIGURATIONS
├── architect.txt        # Architect agent
├── dev.txt              # Developer agent
├── pm.txt               # Product manager agent
└── [7 other agent files]

scripts/                   # UTILITY SCRIPTS
├── fetch-apod.sh        # Manual APOD fetching
├── setup-aws.sh         # AWS setup
└── [4 other scripts]
```

### Key Modules and Their Purpose

- **Frontend Applications**: `infinite-v2/` (current), `infinite/` (legacy)
- **API Layer**: `backend/functions/api/articles-api.js` - Main API handler with GSI queries
- **AI Content Generation**: `backend/functions/scheduled/ai-content-generator.js` - OpenAI integration
- **Data Fetching**: `backend/functions/scheduled/apod-fetcher.js` - NASA API integration
- **Infrastructure**: `backend/infrastructure/` - AWS setup and deployment scripts
- **API Integration**: `infinite-v2/lib/api.ts` - Frontend-backend communication
- **Documentation**: `docs/` - Comprehensive project documentation

## Data Models and APIs

### Data Models

Instead of duplicating, reference actual model files:

- **Articles Model**: See `backend/functions/api/articles-api.js` for DynamoDB schema
- **Raw Content Model**: See `backend/functions/scheduled/ai-content-generator.js`
- **NASA APOD Model**: See `ARCHITECTURE_ACTUAL.md` for complete schema
- **Related Types**: TypeScript definitions in `infinite-v2/lib/api.ts`

### API Specifications

- **Main API**: `https://jqg44jstd1.execute-api.eu-central-1.amazonaws.com/dev`
- **Endpoints**: 
  - `GET /articles` - List all articles (GSI optimized)
  - `GET /articles/latest` - Get latest articles (GSI optimized)
  - `GET /articles/slug/{slug}` - Get article by slug
  - `GET /articles/category/{category}` - Get articles by category
- **NASA APOD API**: `https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod`
- **Endpoints**:
  - `GET /api/latest` - Get latest APOD content
  - `POST /api/reprocess` - Reprocess content

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Dual Frontend Applications**: Both `infinite/` and `infinite-v2/` exist - unclear which is primary
2. **GSI Implementation**: Recent GSI optimizations may have introduced inconsistencies
3. **Manual Deployment**: No automated CI/CD pipeline - manual Lambda deployments
4. **Mixed Infrastructure**: Some functions use different deployment patterns
5. **Documentation Fragmentation**: Multiple architecture documents with potential conflicts

### Workarounds and Gotchas

- **GSI Fallback Logic**: All GSI queries include fallback to ScanCommand for reliability
- **Missing pk Field**: DynamoDB items without `pk='LATEST'` don't appear in GSI queries
- **NASA API Timing**: Scheduled fetches at 04:05 and 06:00 UTC to handle NASA publishing delays
- **Content Quality Validation**: AI-generated content includes quality scoring and validation
- **Image Caching**: S3 image caching with CloudFront CDN for performance
- **Environment Variables**: Multiple environment configurations across different deployment scripts

### Recent GSI Optimizations (January 2025)

- **Articles Table GSIs**: `slug-index`, `category-originalDate-index`, `status-originalDate-index`, `type-originalDate-index`
- **RawContent Table GSIs**: `source-date-index`, `status-index`, `guid-index`
- **Migration Scripts**: `add-remaining-gsis.sh` for adding missing indexes
- **Monitoring**: GSI usage monitoring scripts created
- **Performance**: Significant performance improvements from scan-to-query optimization

## Integration Points and External Dependencies

### External Services

| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| NASA APOD API | Daily astronomy content | REST API | `backend/functions/scheduled/apod-fetcher.js` |
| NASA RSS Feed | Historical content | RSS parsing | `backend/functions/scheduled/apod-rss-fetcher.js` |
| ESA Hubble | Additional content | RSS parsing | `backend/functions/scheduled/esa-fetcher.js` |
| OpenAI GPT-4o-mini | Slovak content generation | REST API | `backend/functions/scheduled/ai-content-generator.js` |
| AWS DynamoDB | Content storage | AWS SDK | Multiple Lambda functions |
| AWS S3 | Image caching | AWS SDK | `backend/functions/scheduled/ai-content-generator.js` |
| AWS CloudFront | CDN | AWS SDK | Image delivery optimization |

### Internal Integration Points

- **Frontend-Backend Communication**: `infinite-v2/lib/api.ts` → API Gateway → Lambda functions
- **Content Pipeline**: NASA API → AI Processing → DynamoDB → Frontend Display
- **Image Pipeline**: NASA Images → S3 Caching → CloudFront CDN → Frontend Display
- **Scheduled Tasks**: EventBridge → Lambda Functions → Content Generation

## Development and Deployment

### Local Development Setup

1. **Frontend Development**:
   ```bash
   cd infinite-v2
   npm install
   npm run dev
   ```

2. **Backend Development**:
   ```bash
   cd backend/functions/api
   npm install
   # Test locally with AWS CLI configured
   ```

3. **AWS CLI Configuration**:
   ```bash
   # Configure AWS CLI with proper credentials
   aws configure --profile infinite-nasa-apod-dev
   ```

### Build and Deployment Process

- **Frontend Build**: `npm run build` in `infinite-v2/`
- **Lambda Deployment**: Manual zip and upload via AWS CLI
- **Infrastructure**: Shell scripts in `backend/infrastructure/`
- **Environments**: Development (dev) and Production (prod) configurations

### Deployment Scripts

- **GSI Migration**: `backend/infrastructure/add-remaining-gsis.sh`
- **Lambda Deployment**: `deploy-gsi-optimized-lambdas.sh`
- **APOD Fetching**: `scripts/fetch-apod.sh`
- **AWS Setup**: `scripts/setup-aws.sh`

## Testing Reality

### Current Test Coverage

- **Frontend Tests**: Playwright tests in `infinite/tests/` (legacy)
- **Backend Tests**: No automated tests for Lambda functions
- **Integration Tests**: Manual testing via API endpoints
- **End-to-End Tests**: Manual testing of content pipeline

### Running Tests

```bash
# Frontend tests (legacy)
cd infinite
npm run test:e2e

# Backend testing (manual)
# Test API endpoints via curl or Postman
# Monitor CloudWatch logs for Lambda functions
```

## Monitoring and Observability

### CloudWatch Integration

- **Lambda Logs**: All functions log to CloudWatch
- **Metrics**: Lambda duration, DynamoDB capacity, S3 requests
- **Alarms**: Manual monitoring via AWS console
- **GSI Monitoring**: Custom scripts for GSI usage tracking

### Performance Monitoring

- **Frontend**: Next.js built-in performance monitoring
- **Backend**: CloudWatch metrics for Lambda and DynamoDB
- **Content Pipeline**: Manual monitoring of AI content generation
- **Cost Monitoring**: AWS billing alerts and cost optimization

## Security and Compliance

### Current Security Measures

- **API Security**: CORS headers, API Gateway rate limiting
- **AWS Security**: IAM roles, least privilege access
- **Data Protection**: No sensitive user data collection
- **Content Security**: AI-generated content validation

### Security Considerations

- **OpenAI API Keys**: Stored in AWS Secrets Manager
- **NASA API Keys**: Environment variables in Lambda
- **DynamoDB Access**: IAM role-based access control
- **S3 Security**: Bucket policies and CloudFront security

## Recent Changes and Optimizations

### GSI Implementation (January 2025)

- **Performance Optimization**: Replaced expensive DynamoDB scans with efficient GSI queries
- **Cost Reduction**: Significant reduction in DynamoDB consumed capacity
- **Monitoring**: Created comprehensive monitoring scripts for GSI usage
- **Migration**: Careful migration of existing data to support GSI patterns

### Infrastructure Improvements

- **Lambda Optimization**: Updated Lambda functions to use GSI queries
- **Error Handling**: Improved fallback mechanisms for GSI failures
- **Documentation**: Updated architecture documentation to reflect GSI usage
- **Deployment**: Streamlined deployment process for GSI-optimized functions

## Future Considerations

### Planned Enhancements

- **Automated Testing**: Implement comprehensive test suite for Lambda functions
- **CI/CD Pipeline**: Automated deployment pipeline
- **Multi-language Support**: Extend beyond Slovak content
- **Performance Optimization**: Further optimize GSI usage and caching
- **Monitoring Dashboard**: Real-time monitoring of system performance

### Technical Debt Resolution

- **Frontend Consolidation**: Determine primary frontend application
- **Documentation Unification**: Consolidate multiple architecture documents
- **Infrastructure as Code**: Move to CloudFormation or CDK
- **Automated Deployment**: Implement proper CI/CD pipeline

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Frontend development
cd infinite-v2 && npm run dev

# Backend deployment
cd backend/functions/api && zip -r articles-api.zip . && aws lambda update-function-code --function-name infinite-articles-api-dev --zip-file fileb://articles-api.zip

# GSI migration
./backend/infrastructure/add-remaining-gsis.sh

# APOD fetching
./scripts/fetch-apod.sh

# Monitoring
./monitor-gsi-usage.sh
```

### Debugging and Troubleshooting

- **Logs**: Check CloudWatch logs for Lambda functions
- **GSI Issues**: Use `test-gsi-queries.js` to verify GSI functionality
- **Content Issues**: Check `PROJECT_STATUS.md` for known issues
- **Performance**: Use monitoring scripts to track GSI usage and performance

### Key Configuration Files

- **AWS CLI**: `~/.aws/config` and `~/.aws/credentials`
- **Environment**: `scripts/aws-config.env`
- **Infrastructure**: `backend/infrastructure/dynamodb-setup.sh`
- **Frontend**: `infinite-v2/next.config.ts`

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2025  
**Status:** Production System with Recent GSI Optimizations  
**Next Review:** After next major enhancement or infrastructure change
