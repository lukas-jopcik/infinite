# Source Tree Structure - Infinite v1.0

## Project Root Structure

```
infinite-v2/
├── .bmad-core/                    # BMAD agent system
│   ├── agents/                    # Agent definitions
│   │   ├── dev.md                # Developer agent
│   │   ├── pm.md                 # Product manager agent
│   │   └── architect.txt         # Architect agent
│   ├── core-config.yaml          # Core configuration
│   └── tasks/                    # Task definitions
├── .ai/                          # AI development logs
│   └── debug-log.md             # Developer debug log
├── .github/                      # GitHub configuration
│   └── workflows/               # CI/CD workflows
│       └── deploy.yml           # Deployment pipeline
├── docs/                         # Project documentation
│   ├── architecture/            # Technical architecture
│   │   ├── coding-standards.md  # Development standards
│   │   ├── tech-stack.md        # Technology stack
│   │   ├── source-tree.md       # This file
│   │   └── full-stack-architecture.md
│   ├── project-management/      # Project management docs
│   │   └── epics-and-stories.md # User stories and epics
│   ├── stories/                 # Development stories
│   │   ├── epic-1-aws-infrastructure/
│   │   ├── epic-2-content-generation/
│   │   └── epic-3-frontend/
│   ├── prd/                     # Product requirements
│   └── qa/                      # Quality assurance
├── infinite-v2/                  # Main application
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components
│   ├── lib/                     # Utility functions
│   ├── public/                  # Static assets
│   ├── styles/                  # Global styles
│   └── types/                   # TypeScript definitions
├── backend/                     # Backend services
│   ├── functions/               # AWS Lambda functions
│   ├── api/                     # API Gateway handlers
│   ├── lib/                     # Shared utilities
│   └── tests/                   # Backend tests
├── infrastructure/              # Infrastructure as code
│   ├── serverless/              # Serverless Framework
│   ├── terraform/               # Terraform configurations
│   └── scripts/                 # Deployment scripts
└── tests/                       # End-to-end tests
    ├── e2e/                     # Playwright tests
    ├── integration/             # Integration tests
    └── fixtures/                # Test data
```

## Frontend Structure (infinite-v2/)

```
infinite-v2/
├── app/                         # Next.js App Router
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── loading.tsx             # Loading component
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   ├── objav-dna/              # Discovery articles
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic article page
│   ├── kategoria/              # Category pages
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic category page
│   ├── clanok/                 # Regular articles
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic article page
│   ├── hladat/                 # Search pages
│   │   ├── page.tsx            # Search results
│   │   └── loading.tsx         # Search loading
│   ├── o-projekte/             # About page
│   │   └── page.tsx
│   ├── tyzdenny-vyber/         # Weekly selection
│   │   └── page.tsx
│   └── api/                    # API routes
│       ├── articles/
│       │   ├── route.ts        # Articles API
│       │   └── [id]/
│       │       └── route.ts    # Article detail API
│       ├── categories/
│       │   └── route.ts        # Categories API
│       ├── search/
│       │   └── route.ts        # Search API
│       └── analytics/
│           └── route.ts        # Analytics API
├── components/                  # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   ├── card.tsx            # Card component
│   │   ├── badge.tsx           # Badge component
│   │   ├── skeleton.tsx        # Loading skeleton
│   │   └── index.ts            # Component exports
│   ├── layout/                 # Layout components
│   │   ├── navigation.tsx      # Site navigation
│   │   ├── footer.tsx          # Site footer
│   │   ├── breadcrumbs.tsx     # Breadcrumb navigation
│   │   └── scroll-to-top.tsx   # Scroll to top button
│   ├── content/                # Content components
│   │   ├── article-hero.tsx    # Article hero section
│   │   ├── article-card.tsx    # Article preview card
│   │   ├── article-body.tsx    # Article content
│   │   ├── category-badge.tsx  # Category label
│   │   └── discovery-carousel.tsx # Content carousel
│   ├── forms/                  # Form components
│   │   ├── newsletter-signup.tsx # Newsletter form
│   │   ├── search-form.tsx     # Search form
│   │   └── contact-form.tsx    # Contact form
│   ├── seo/                    # SEO components
│   │   ├── seo.tsx             # SEO metadata
│   │   ├── structured-data.tsx # JSON-LD data
│   │   └── analytics.tsx       # Analytics tracking
│   └── index.ts                # Component exports
├── lib/                        # Utility functions
│   ├── api.ts                  # API client functions
│   ├── utils.ts                # General utilities
│   ├── constants.ts            # Application constants
│   ├── types.ts                # TypeScript types
│   ├── validation.ts           # Input validation
│   ├── formatting.ts           # Data formatting
│   ├── seo.ts                  # SEO utilities
│   └── mock-data.ts            # Mock data for development
├── hooks/                      # Custom React hooks
│   ├── useApi.ts               # API data fetching
│   ├── useLocalStorage.ts      # Local storage
│   ├── useDebounce.ts          # Debounced values
│   ├── useIntersection.ts      # Intersection observer
│   └── useAnalytics.ts         # Analytics tracking
├── styles/                     # Styling
│   ├── globals.css             # Global styles
│   ├── components.css          # Component styles
│   └── utilities.css           # Utility classes
├── types/                      # TypeScript definitions
│   ├── article.ts              # Article types
│   ├── api.ts                  # API types
│   ├── seo.ts                  # SEO types
│   └── index.ts                # Type exports
├── public/                     # Static assets
│   ├── images/                 # Image assets
│   │   ├── logos/              # Logo files
│   │   ├── icons/              # Icon files
│   │   └── placeholders/       # Placeholder images
│   ├── favicon.ico             # Site favicon
│   ├── robots.txt              # Search engine directives
│   ├── sitemap.xml             # Site map
│   └── manifest.json           # PWA manifest
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── package-lock.json           # Dependency lock file
└── README.md                   # Project documentation
```

## Backend Structure (backend/)

```
backend/
├── functions/                   # AWS Lambda functions
│   ├── content-generation/     # Content generation pipeline
│   │   ├── fetch-apod.ts       # APOD data fetcher
│   │   ├── fetch-esa-hubble.ts # ESA Hubble fetcher
│   │   ├── generate-article.ts # AI article generator
│   │   ├── generate-seo.ts     # SEO metadata generator
│   │   ├── process-images.ts   # Image processing
│   │   └── validate-content.ts # Content validation
│   ├── api/                    # API Gateway handlers
│   │   ├── articles.ts         # Articles API handler
│   │   ├── categories.ts       # Categories API handler
│   │   ├── search.ts           # Search API handler
│   │   ├── analytics.ts        # Analytics API handler
│   │   └── admin.ts            # Admin API handler
│   ├── scheduled/              # Scheduled functions
│   │   ├── daily-apod.ts       # Daily APOD processing
│   │   ├── weekly-esa.ts       # Weekly ESA processing
│   │   └── content-cleanup.ts  # Content maintenance
│   └── shared/                 # Shared Lambda utilities
│       ├── database.ts         # DynamoDB client
│       ├── s3-client.ts        # S3 client
│       ├── openai-client.ts    # OpenAI client
│       └── error-handler.ts    # Error handling
├── lib/                        # Shared utilities
│   ├── database/               # Database utilities
│   │   ├── dynamodb.ts         # DynamoDB operations
│   │   ├── queries.ts          # Query builders
│   │   └── migrations.ts       # Database migrations
│   ├── storage/                # Storage utilities
│   │   ├── s3.ts               # S3 operations
│   │   ├── cloudfront.ts       # CloudFront operations
│   │   └── image-processing.ts # Image utilities
│   ├── ai/                     # AI utilities
│   │   ├── openai.ts           # OpenAI integration
│   │   ├── prompts.ts          # AI prompts
│   │   └── validation.ts       # AI response validation
│   ├── external/               # External API utilities
│   │   ├── nasa-api.ts         # NASA API client
│   │   ├── esa-feed.ts         # ESA RSS feed parser
│   │   └── rss-parser.ts       # RSS parsing utilities
│   ├── utils/                  # General utilities
│   │   ├── logger.ts           # Logging utilities
│   │   ├── metrics.ts          # CloudWatch metrics
│   │   ├── validation.ts       # Input validation
│   │   └── formatting.ts       # Data formatting
│   └── types/                  # TypeScript types
│       ├── api.ts              # API types
│       ├── database.ts         # Database types
│       ├── content.ts          # Content types
│       └── external.ts         # External API types
├── tests/                      # Backend tests
│   ├── unit/                   # Unit tests
│   │   ├── functions/          # Function tests
│   │   ├── lib/                # Library tests
│   │   └── utils/              # Utility tests
│   ├── integration/            # Integration tests
│   │   ├── api/                # API tests
│   │   ├── database/           # Database tests
│   │   └── external/           # External API tests
│   └── fixtures/               # Test data
│       ├── articles.json       # Sample articles
│       ├── apod-data.json      # Sample APOD data
│       └── esa-data.json       # Sample ESA data
├── serverless.yml              # Serverless Framework config
├── package.json                # Backend dependencies
├── tsconfig.json               # TypeScript configuration
└── jest.config.js              # Jest configuration
```

## Infrastructure Structure (infrastructure/)

```
infrastructure/
├── serverless/                  # Serverless Framework
│   ├── serverless.yml          # Main configuration
│   ├── functions/              # Function configurations
│   │   ├── content-generation.yml
│   │   ├── api.yml
│   │   └── scheduled.yml
│   ├── resources/              # AWS resources
│   │   ├── dynamodb.yml        # DynamoDB tables
│   │   ├── s3.yml              # S3 buckets
│   │   ├── cloudfront.yml      # CloudFront distribution
│   │   └── iam.yml             # IAM roles and policies
│   └── plugins/                # Serverless plugins
│       ├── serverless-offline.yml
│       └── serverless-typescript.yml
├── terraform/                   # Terraform configurations
│   ├── main.tf                 # Main configuration
│   ├── variables.tf            # Variable definitions
│   ├── outputs.tf              # Output definitions
│   ├── modules/                # Terraform modules
│   │   ├── dynamodb/           # DynamoDB module
│   │   ├── s3/                 # S3 module
│   │   ├── cloudfront/         # CloudFront module
│   │   └── lambda/             # Lambda module
│   └── environments/           # Environment-specific configs
│       ├── dev.tfvars          # Development variables
│       ├── staging.tfvars      # Staging variables
│       └── prod.tfvars         # Production variables
├── scripts/                     # Deployment scripts
│   ├── deploy.sh               # Main deployment script
│   ├── setup-aws.sh            # AWS setup script
│   ├── migrate-db.sh           # Database migration script
│   └── backup.sh               # Backup script
└── monitoring/                  # Monitoring configurations
    ├── cloudwatch/             # CloudWatch dashboards
    ├── alerts/                 # Alert configurations
    └── logs/                   # Log group configurations
```

## Testing Structure (tests/)

```
tests/
├── e2e/                        # End-to-end tests
│   ├── pages/                  # Page tests
│   │   ├── homepage.spec.ts    # Homepage tests
│   │   ├── article.spec.ts     # Article page tests
│   │   ├── category.spec.ts    # Category page tests
│   │   └── search.spec.ts      # Search page tests
│   ├── user-flows/             # User journey tests
│   │   ├── article-reading.spec.ts
│   │   ├── newsletter-signup.spec.ts
│   │   └── search-flow.spec.ts
│   ├── fixtures/               # Test data
│   │   ├── articles.json       # Sample articles
│   │   └── users.json          # Sample users
│   ├── utils/                  # Test utilities
│   │   ├── helpers.ts          # Test helpers
│   │   └── mocks.ts            # Mock data
│   └── playwright.config.ts    # Playwright configuration
├── integration/                # Integration tests
│   ├── api/                    # API integration tests
│   │   ├── articles.test.ts    # Articles API tests
│   │   ├── categories.test.ts  # Categories API tests
│   │   └── search.test.ts      # Search API tests
│   ├── database/               # Database integration tests
│   │   ├── dynamodb.test.ts    # DynamoDB tests
│   │   └── migrations.test.ts  # Migration tests
│   └── external/               # External API tests
│       ├── nasa-api.test.ts    # NASA API tests
│       └── esa-feed.test.ts    # ESA feed tests
├── fixtures/                   # Test data
│   ├── articles/               # Article test data
│   ├── images/                 # Test images
│   └── responses/              # API response mocks
└── config/                     # Test configurations
    ├── jest.config.js          # Jest configuration
    ├── playwright.config.ts    # Playwright configuration
    └── test-setup.ts           # Test setup
```

## Documentation Structure (docs/)

```
docs/
├── architecture/               # Technical architecture
│   ├── coding-standards.md     # Development standards
│   ├── tech-stack.md           # Technology stack
│   ├── source-tree.md          # This file
│   ├── full-stack-architecture.md
│   ├── database-schema.md      # Database design
│   ├── api-specification.md    # API documentation
│   └── deployment-guide.md     # Deployment instructions
├── project-management/         # Project management
│   ├── epics-and-stories.md    # User stories
│   ├── sprint-planning.md      # Sprint planning
│   ├── risk-assessment.md      # Risk analysis
│   └── timeline.md             # Project timeline
├── stories/                    # Development stories
│   ├── epic-1-aws-infrastructure/
│   │   ├── story-1-1-aws-setup.md
│   │   ├── story-1-2-dynamodb.md
│   │   ├── story-1-3-s3-cloudfront.md
│   │   └── story-1-4-lambda.md
│   ├── epic-2-content-generation/
│   │   ├── story-2-1-apod-fetcher.md
│   │   ├── story-2-2-esa-fetcher.md
│   │   ├── story-2-3-ai-generator.md
│   │   ├── story-2-4-seo-generator.md
│   │   ├── story-2-5-image-processing.md
│   │   └── story-2-6-content-validator.md
│   └── epic-3-frontend/
│       ├── story-3-1-homepage.md
│       ├── story-3-2-article-page.md
│       ├── story-3-3-category-pages.md
│       ├── story-3-4-search.md
│       └── story-3-5-newsletter.md
├── prd/                        # Product requirements
│   ├── prd.md                  # Main PRD
│   ├── user-personas.md        # User personas
│   ├── user-journeys.md        # User journeys
│   └── acceptance-criteria.md  # Acceptance criteria
├── qa/                         # Quality assurance
│   ├── test-plan.md            # Test plan
│   ├── test-cases.md           # Test cases
│   ├── bug-reports.md          # Bug tracking
│   └── quality-metrics.md      # Quality metrics
└── api/                        # API documentation
    ├── endpoints.md            # API endpoints
    ├── authentication.md       # Auth documentation
    ├── rate-limiting.md        # Rate limiting
    └── error-codes.md          # Error handling
```

## Configuration Files

### Root Level
```
infinite-v2/
├── .gitignore                  # Git ignore rules
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .env.local                 # Local environment variables
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── jest.config.js             # Jest configuration
├── playwright.config.ts       # Playwright configuration
└── README.md                  # Project documentation
```

### Backend Level
```
backend/
├── .gitignore                 # Backend git ignore
├── .env.example               # Backend environment template
├── package.json               # Backend dependencies
├── tsconfig.json              # Backend TypeScript config
├── serverless.yml             # Serverless Framework config
├── jest.config.js             # Backend Jest config
└── README.md                  # Backend documentation
```

## File Naming Conventions

### Components
- **PascalCase**: `ArticleCard.tsx`, `Navigation.tsx`
- **kebab-case**: `article-card.css`, `navigation.module.css`

### Utilities and Hooks
- **camelCase**: `useApi.ts`, `formatDate.ts`
- **kebab-case**: `api-client.ts`, `date-utils.ts`

### Pages and Routes
- **kebab-case**: `article-page.tsx`, `category-list.tsx`
- **Dynamic routes**: `[slug].tsx`, `[id].tsx`

### Configuration Files
- **kebab-case**: `next.config.ts`, `tailwind.config.ts`
- **dotfiles**: `.eslintrc.json`, `.prettierrc`

### Test Files
- **kebab-case**: `article-card.test.tsx`, `api-client.test.ts`
- **Spec files**: `homepage.spec.ts`, `user-flow.spec.ts`

## Import/Export Conventions

### Absolute Imports
```typescript
// Use @/ prefix for absolute imports
import { Button } from '@/components/ui/button';
import { Article } from '@/lib/types';
import { useApi } from '@/hooks/useApi';
```

### Relative Imports
```typescript
// Use relative imports for local files
import { ArticleCard } from './ArticleCard';
import { ArticleList } from '../ArticleList';
import { utils } from '../../lib/utils';
```

### Barrel Exports
```typescript
// components/index.ts
export { Button } from './ui/button';
export { Input } from './ui/input';
export { Card } from './ui/card';

// lib/index.ts
export { formatDate } from './formatting';
export { validateInput } from './validation';
export { apiClient } from './api';
```

## Environment-Specific Files

### Development
```
.env.local                    # Local development
.env.development              # Development environment
.env.test                     # Test environment
```

### Production
```
.env.production               # Production environment
.env.staging                  # Staging environment
```

### Configuration
```
next.config.js                # Next.js configuration
tailwind.config.js            # Tailwind configuration
jest.config.js                # Jest configuration
playwright.config.ts          # Playwright configuration
```

This source tree structure provides a clear, organized foundation for the Infinite v1.0 project, ensuring maintainability, scalability, and developer productivity.
