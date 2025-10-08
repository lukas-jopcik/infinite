# Infinite Platform - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x LTS
- AWS CLI configured
- Git repository access

### Setup
```bash
# Clone and navigate
cd infinite-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Architecture

### Frontend (Next.js App Router)
```
app/
├── page.tsx                 # Homepage
├── layout.tsx              # Root layout with providers
├── api/                    # API routes
│   └── articles/          # Article API endpoints
├── objav-dna/[slug]/      # Discovery articles
├── clanok/[slug]/         # General articles
├── kategoria/[slug]/      # Category pages
├── admin/analytics/       # Analytics dashboard
└── hladat/               # Search page
```

### Backend (AWS Serverless)
```
AWS Services:
├── Lambda Functions        # Content processing, API handlers
├── DynamoDB Tables        # Articles, raw content, analytics
├── S3 Buckets            # Image storage, static assets
├── API Gateway           # REST API endpoints
├── EventBridge           # Scheduled triggers
└── CloudFront            # CDN for global delivery
```

## 🔧 Key Components

### 1. Article System
- **Data Flow**: Raw content → AI processing → Article storage → Frontend display
- **Routes**: `/objav-dna/[slug]` (discoveries), `/clanok/[slug]` (general)
- **API**: `/api/articles`, `/api/articles/latest`, `/api/articles/[id]`

### 2. Content Pipeline
- **APOD Fetcher**: Daily NASA content
- **ESA Fetcher**: Weekly Hubble content
- **AI Generator**: OpenAI GPT-4o for Slovak content
- **Image Processor**: Sharp for WebP conversion

### 3. Analytics & Monetization
- **Google Analytics 4**: User tracking
- **Google AdSense**: Ad placements
- **Article Tracking**: Reading progress, engagement
- **Social Sharing**: Facebook, Twitter, LinkedIn

## 🛠 Development Workflow

### Adding New Features
1. **Create component** in `components/`
2. **Add page** in `app/` directory
3. **Update API** if needed in `app/api/`
4. **Test locally** with `npm run dev`
5. **Commit and push** to `infinite-v2` branch

### Content Management
1. **Raw content** automatically fetched via Lambda
2. **AI processing** converts to Slovak articles
3. **Images** processed and stored in S3
4. **Articles** displayed on frontend

### Database Operations
```bash
# Check DynamoDB tables
aws dynamodb list-tables

# View articles
aws dynamodb scan --table-name InfiniteArticles-dev

# View raw content
aws dynamodb scan --table-name InfiniteRawContent-dev
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes
- **Colors**: Use theme colors (`text-foreground`, `bg-card`, etc.)
- **Spacing**: Consistent spacing scale (`p-4`, `m-8`, `gap-6`)
- **Typography**: Semantic text sizes (`text-xl`, `text-2xl`)
- **Layout**: Flexbox and Grid for responsive design

### Component Structure
```tsx
// Standard component pattern
export function ComponentName({ prop1, prop2 }: Props) {
  return (
    <div className="container-classes">
      {/* Component content */}
    </div>
  )
}
```

## 🔍 Debugging

### Common Issues
1. **API Errors**: Check Lambda logs in AWS Console
2. **Image Issues**: Verify S3 bucket permissions
3. **Build Errors**: Clear `.next` cache and rebuild
4. **Type Errors**: Check TypeScript definitions

### Debug Commands
```bash
# Clear cache and rebuild
rm -rf .next && npm run build

# Check API endpoints
curl http://localhost:3000/api/articles

# View build analysis
npm run analyze

# Performance audit
npm run lighthouse
```

## 📊 Performance Optimization

### Image Optimization
- **Format**: WebP with fallbacks
- **Sizing**: Responsive images with `sizes` attribute
- **Loading**: Lazy loading for below-fold images
- **CDN**: CloudFront for global delivery

### Code Splitting
- **Dynamic imports**: For heavy components
- **Route-based**: Automatic with App Router
- **Bundle analysis**: Regular monitoring with `npm run analyze`

### SEO Best Practices
- **Meta tags**: Dynamic generation per page
- **Structured data**: JSON-LD for articles
- **Sitemaps**: Auto-generated
- **Core Web Vitals**: Optimized for 90+ scores

## 🚀 Deployment

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm start           # Production server
```

### AWS Deployment
- **Frontend**: AWS Amplify (automatic from Git)
- **Backend**: AWS Lambda (via AWS CLI or console)
- **Database**: DynamoDB (via AWS CLI)
- **Storage**: S3 (via AWS CLI)

### Environment Setup
```bash
# AWS CLI configuration
aws configure

# Environment variables
cp .env.example .env.local
# Edit .env.local with your keys
```

## 📈 Monitoring

### Analytics
- **Google Analytics 4**: User behavior
- **Core Web Vitals**: Performance metrics
- **Error Tracking**: Console errors and API failures

### Logs
- **Lambda Logs**: CloudWatch for backend issues
- **Frontend Logs**: Browser console for client issues
- **Build Logs**: Vercel/Amplify for deployment issues

## 🔐 Security

### API Security
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Implemented in API Gateway
- **Authentication**: JWT tokens for admin access

### Data Protection
- **Secrets**: Stored in AWS Secrets Manager
- **Environment Variables**: Never commit sensitive data
- **HTTPS**: Enforced for all communications

## 📚 Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **AWS Lambda**: https://docs.aws.amazon.com/lambda/
- **DynamoDB**: https://docs.aws.amazon.com/dynamodb/

### Tools
- **AWS Console**: https://console.aws.amazon.com/
- **Google Analytics**: https://analytics.google.com/
- **AdSense**: https://www.google.com/adsense/
- **OpenAI**: https://platform.openai.com/

---

**Remember**: Always test locally before deploying, and keep the documentation updated!
