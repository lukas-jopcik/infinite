# Infinite NASA APOD - Documentation Index

**Last Updated:** October 2, 2025

This document provides a comprehensive index of all project documentation, organized by category.

---

## 📚 Quick Start

For new developers or operators, start with these documents in order:

1. **PROJECT_STATUS.md** - Current system status and overview
2. **infinite/README.md** - Frontend application guide
3. **ARCHITECTURE_ACTUAL.md** - Actual implemented architecture
4. **DATA_FETCH_TROUBLESHOOTING.md** - Common issues and solutions

---

## 📋 Core Documentation

### System Overview
- **PROJECT_STATUS.md** - Current production status, metrics, and infrastructure
- **ARCHITECTURE_ACTUAL.md** - Actual implemented architecture with diagrams
- **docs/project-summary.md** - Original project summary and completion status
- **docs/architecture.md** - Original planned architecture (may differ from actual)

### Frontend Application
- **infinite/README.md** - Next.js application documentation
- **infinite/components.json** - UI component configuration
- **infinite/tailwind.config.ts** - Styling configuration
- **infinite/next.config.mjs** - Next.js configuration
- **infinite/tsconfig.json** - TypeScript configuration

### Backend Services
- **aws/lambda/nasa-fetcher/** - Daily NASA APOD fetch service
- **aws/lambda/content-processor/** - AI content generation service
- **aws/lambda/api-latest/** - Content retrieval API
- **aws/lambda/api-reprocess/** - Manual content reprocessing API

---

## 🛠️ Setup & Configuration

### AWS Infrastructure
- **docs/aws-setup.md** - Complete AWS infrastructure setup guide
- **docs/aws-cli-manual-setup.md** - AWS CLI configuration
- **docs/aws-cli-configuration.md** - AWS CLI detailed configuration
- **docs/infrastructure-setup-summary.md** - Infrastructure summary
- **docs/region-selection.md** - AWS region selection rationale

### IAM & Permissions
- **docs/aws-iam-policies-summary.md** - IAM policies overview
- **docs/aws-user-permissions-complete-list.md** - Complete permissions list
- **docs/complete-aws-policies-list.md** - All AWS policies
- **docs/dynamodb-permissions-setup-summary.md** - DynamoDB permissions

### Environment Configuration
- **aws/config/environments/development.yaml** - Development environment config
- **aws/config/environments/production.yaml** - Production environment config
- **aws/config/policies/** - IAM policy templates

---

## 🔧 Operations & Maintenance

### Troubleshooting
- **DATA_FETCH_TROUBLESHOOTING.md** - Data fetch issues and solutions
  - Missing `pk` field problem
  - NASA API 404 errors
  - Cache staleness
  - Monitoring commands

### Scripts & Tools
- **scripts/fetch-apod.sh** - Manual APOD fetch script
  - Usage: `./scripts/fetch-apod.sh [YYYY-MM-DD]`
  - Auto-verifies and fixes data
- **scripts/setup-aws.sh** - AWS infrastructure setup
- **aws/lambda/*/package.json** - Lambda deployment scripts

### Deployment
- **amplify.yml** - AWS Amplify build configuration
- **infinite/package.json** - Frontend build scripts
- Lambda deployment commands in PROJECT_STATUS.md

---

## 📖 User Stories & Requirements

### Product Requirements
- **docs/prd.md** - Product Requirements Document
- **docs/brief.md** - Project brief

### Epic 1: Foundation & AWS Integration (5 stories)
- **docs/stories/1.1.aws-project-setup.md** - AWS project setup
- **docs/stories/1.2.aws-cli-setup.md** - AWS CLI configuration
- **docs/stories/1.3.aws-infrastructure-setup.md** - Infrastructure setup
- **docs/stories/1.4.nasa-api-integration.md** - NASA API integration
- **docs/stories/1.5.ai-service-integration.md** - AI service integration

### Epic 2: AI Content Generation (4 stories)
- **docs/stories/2.1.ai-content-generation-service.md** - Content generation
- **docs/stories/2.2.seo-keyword-generation.md** - SEO keywords
- **docs/stories/2.3.content-quality-validation.md** - Quality validation
- **docs/stories/2.4.content-processing-pipeline.md** - Processing pipeline

### Epic 3: Content Storage & Caching (4 stories)
- **docs/stories/3.1.dynamodb-content-storage.md** - DynamoDB storage
- **docs/stories/3.2.s3-image-caching.md** - S3 image caching
- **docs/stories/3.3.content-caching-strategy.md** - Caching strategy
- **docs/stories/3.4.data-backup-recovery.md** - Backup and recovery

### Epic 4: Enhanced Content Display (4 stories)
- **docs/stories/4.1.content-display-components.md** - Display components
- **docs/stories/4.2.progressive-content-loading.md** - Progressive loading
- **docs/stories/4.3.content-navigation-enhancement.md** - Navigation
- **docs/stories/4.4.seo-integration.md** - SEO integration

### Epic 5: SEO Optimization & Performance (4 stories)
- **docs/stories/5.1.meta-tags-seo-integration.md** - Meta tags
- **docs/stories/5.2.structured-data-implementation.md** - Structured data
- **docs/stories/5.3.performance-optimization.md** - Performance
- **docs/stories/5.4.analytics-monitoring.md** - Analytics

---

## 🎓 Feature-Specific Documentation

### AI Content Generation
- **infinite/AI_SETUP_GUIDE.md** - AI setup guide (if exists)
- **infinite/HEADLINE_SYSTEM.md** - Headline generation system
- **infinite/SLOVAK_HEADLINES_ANALYTICS.md** - Slovak headline analytics

### A/B Testing
- **infinite/AB_TESTING_GUIDE.md** - A/B testing implementation (if exists)
- **AWS_AI_HEADLINES_IMPLEMENTATION.md** - AI headlines implementation
- **infinite/AI_HEADLINES_INTEGRATION.md** - Headlines integration

### Performance
- **infinite/PERFORMANCE_OPTIMIZATIONS.md** - Performance optimization guide

---

## 📊 Testing Documentation

### End-to-End Tests
- **infinite/tests/home.spec.ts** - Homepage E2E tests
- **infinite/tests/detail.spec.ts** - Detail page E2E tests
- **infinite/playwright.config.ts** - Playwright configuration
- **infinite/playwright-report/index.html** - Test reports

### AWS Infrastructure Tests
- **tests/aws/test-aws-setup.sh** - AWS setup verification

---

## 🔍 Code Reference

### Frontend Code Structure
```
infinite/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── apod/[date]/page.tsx # Detail pages
│   ├── rss.xml/route.ts     # RSS feed
│   └── sitemap.ts           # Sitemap
├── components/              # React components
│   ├── ApodHero.tsx
│   ├── ApodCard.tsx
│   ├── ArticleContent.tsx
│   └── backgrounds/
├── lib/                     # Utility libraries
│   ├── content-api.ts       # AWS API integration
│   ├── nasa.ts              # NASA API helpers
│   ├── seo.ts               # SEO utilities
│   └── analytics.ts         # Analytics tracking
└── public/                  # Static assets
```

### Backend Code Structure
```
aws/
├── lambda/                  # Lambda functions
│   ├── nasa-fetcher/
│   │   └── index.js         # Daily APOD fetch
│   ├── content-processor/
│   │   └── index.js         # AI content generation
│   ├── api-latest/
│   │   └── index.js         # Content API
│   └── api-reprocess/
│       └── index.js         # Reprocessing API
├── config/                  # Configuration
│   ├── environments/        # Environment configs
│   └── policies/            # IAM policies
└── infrastructure/          # Infrastructure templates
```

---

## 📝 Configuration Files

### Frontend Configuration
- **infinite/next.config.mjs** - Next.js configuration
- **infinite/tailwind.config.ts** - Tailwind CSS config
- **infinite/tsconfig.json** - TypeScript config
- **infinite/postcss.config.mjs** - PostCSS config
- **infinite/playwright.config.ts** - Playwright config
- **infinite/components.json** - UI components config

### AWS Configuration
- **amplify.yml** - AWS Amplify build config
- **aws/config/environments/development.yaml** - Dev environment
- **aws/config/environments/production.yaml** - Prod environment

### Package Management
- **infinite/package.json** - Frontend dependencies
- **package.json** - Root workspace dependencies
- **aws/lambda/*/package.json** - Lambda function dependencies

---

## 🔐 Security & Compliance

### IAM Policies
- **aws/config/policies/dynamodb-policy.json**
- **aws/config/policies/lambda-execution-policy.json**
- **aws/config/policies/lambda-trust-policy.json**
- **aws/infrastructure/lambda-execution-policy.json**
- **aws/infrastructure/lambda-trust-policy.json**

### Access Control
- **aws/infrastructure/dynamodb-policy.json**
- **docs/aws-iam-policies-summary.md**

---

## 📈 Analytics & Monitoring

### CloudWatch
- Log groups documented in PROJECT_STATUS.md
- Monitoring commands in DATA_FETCH_TROUBLESHOOTING.md

### Performance
- **infinite/PERFORMANCE_OPTIMIZATIONS.md**
- Core Web Vitals tracking in frontend

---

## 🚀 Deployment Guides

### Quick Deployment
1. **Frontend:** Git push → AWS Amplify auto-deploys
2. **Backend:** Use deployment commands in PROJECT_STATUS.md
3. **Manual fetch:** `./scripts/fetch-apod.sh`

### Full Infrastructure
1. Follow **docs/aws-setup.md**
2. Configure IAM as per **docs/aws-iam-policies-summary.md**
3. Deploy Lambda functions
4. Set up EventBridge rules
5. Configure Amplify

---

## 🆘 Getting Help

### Common Issues
1. **Data not appearing:** See DATA_FETCH_TROUBLESHOOTING.md
2. **AWS setup issues:** See docs/aws-setup.md
3. **Frontend errors:** See infinite/README.md
4. **Lambda errors:** Check CloudWatch logs (commands in PROJECT_STATUS.md)

### Key Contacts
- **Project Owner:** jopcik
- **AWS Account:** 349660737637
- **Region:** eu-central-1 (Frankfurt)

---

## 📅 Documentation Maintenance

### Update Schedule
- **PROJECT_STATUS.md:** Monthly or after major changes
- **ARCHITECTURE_ACTUAL.md:** After architecture changes
- **DATA_FETCH_TROUBLESHOOTING.md:** When new issues discovered
- **README files:** After feature additions

### Version Control
All documentation is tracked in Git. Check commit history for changes:
```bash
git log --follow -- DOCUMENTATION_FILE.md
```

---

## 🔗 External References

### APIs & Services
- **NASA APOD API:** https://api.nasa.gov/planetary/apod
- **OpenAI API:** https://platform.openai.com/docs
- **AWS Documentation:** https://docs.aws.amazon.com/

### Frontend Technologies
- **Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/

### Backend Technologies
- **AWS Lambda:** https://docs.aws.amazon.com/lambda/
- **DynamoDB:** https://docs.aws.amazon.com/dynamodb/
- **S3:** https://docs.aws.amazon.com/s3/

---

## 📊 Documentation Statistics

**Total Documents:** 40+  
**User Stories:** 21 (across 5 epics)  
**Setup Guides:** 8  
**Troubleshooting Guides:** 1 comprehensive  
**Code Documentation:** Inline + JSDoc  
**Configuration Files:** 15+

---

**Last Updated:** October 2, 2025  
**Maintained By:** Project Team  
**Status:** ✅ Up to date


