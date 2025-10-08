# Infinite Platform - API Reference

## 🌐 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://infinite.sk/api`

## 📚 Article Endpoints

### GET /api/articles
Fetch all articles with optional filtering.

**Query Parameters:**
- `limit` (number, optional): Number of articles to return (default: 20)
- `category` (string, optional): Filter by category

**Example Request:**
```bash
curl "http://localhost:3000/api/articles?limit=10&category=objav-dna"
```

**Response:**
```json
{
  "articles": [
    {
      "id": "f1e93bc2-0076-46a5-becc-697181c27c07",
      "title": "NGC 4565 – Ihlová galaxia na hrane vesmíru",
      "slug": "ngc-4565-ihlova-galaxia-na-hrane-vesmiru",
      "perex": "Galaxia NGC 4565, tiež známa ako Ihlová galaxia...",
      "category": "objav-dna",
      "publishedAt": "2025-09-04",
      "originalDate": "2025-09-04",
      "author": "Infinite AI",
      "readingTime": "7 minút",
      "imageUrl": "https://infinite-images-dev-349660737637.s3.eu-central-1.amazonaws.com/images/hero/...",
      "metaTitle": "Galaxia NGC 4565 – Objav dňa 4. septembra 2025",
      "metaDescription": "Zoznámte sa s fascinujúcou galaxiou NGC 4565...",
      "type": "discovery"
    }
  ],
  "total": 1,
  "hasMore": true
}
```

### GET /api/articles/latest
Fetch the latest articles.

**Query Parameters:**
- `limit` (number, optional): Number of articles to return (default: 10)

**Example Request:**
```bash
curl "http://localhost:3000/api/articles/latest?limit=5"
```

**Response:**
```json
{
  "articles": [
    {
      "id": "f1e93bc2-0076-46a5-becc-697181c27c07",
      "title": "NGC 4565 – Ihlová galaxia na hrane vesmíru",
      "slug": "ngc-4565-ihlova-galaxia-na-hrane-vesmiru",
      "perex": "Galaxia NGC 4565, tiež známa ako Ihlová galaxia...",
      "category": "objav-dna",
      "publishedAt": "2025-09-04",
      "originalDate": "2025-09-04",
      "author": "Infinite AI",
      "readingTime": "7 minút",
      "imageUrl": "https://infinite-images-dev-349660737637.s3.eu-central-1.amazonaws.com/images/hero/...",
      "metaTitle": "Galaxia NGC 4565 – Objav dňa 4. septembra 2025",
      "metaDescription": "Zoznámte sa s fascinujúcou galaxiou NGC 4565...",
      "type": "discovery"
    }
  ],
  "total": 1
}
```

### GET /api/articles/[id]
Fetch a specific article by ID with full content.

**Path Parameters:**
- `id` (string, required): Article ID

**Example Request:**
```bash
curl "http://localhost:3000/api/articles/f1e93bc2-0076-46a5-becc-697181c27c07"
```

**Response:**
```json
{
  "id": "f1e93bc2-0076-46a5-becc-697181c27c07",
  "title": "NGC 4565 – Ihlová galaxia na hrane vesmíru",
  "slug": "ngc-4565-ihlova-galaxia-na-hrane-vesmiru",
  "perex": "Galaxia NGC 4565, tiež známa ako Ihlová galaxia...",
  "category": "objav-dna",
  "publishedAt": "2025-09-04",
  "originalDate": "2025-09-04",
  "author": "Infinite AI",
  "readingTime": "7 minút",
  "imageUrl": "https://infinite-images-dev-349660737637.s3.eu-central-1.amazonaws.com/images/hero/...",
  "content": [
    {
      "title": "Úvod do galaxie NGC 4565",
      "content": "Galaxia NGC 4565 je jedným z najpozoruhodnejších objektov..."
    },
    {
      "title": "Vedecký význam",
      "content": "Táto galaxia je dôležitá pre astronómov..."
    }
  ],
  "faq": [
    {
      "question": "Ako ďaleko je galaxia NGC 4565?",
      "answer": "Galaxia NGC 4565 sa nachádza približne 40 miliónov svetelných rokov od Zeme."
    }
  ],
  "source": "NASA/ESA Hubble Space Telescope",
  "tags": ["galaxia", "astronómia", "hubble"],
  "metaTitle": "Galaxia NGC 4565 – Objav dňa 4. septembra 2025",
  "metaDescription": "Zoznámte sa s fascinujúcou galaxiou NGC 4565...",
  "type": "discovery"
}
```

## 📊 Data Models

### Article
```typescript
interface Article {
  id: string
  title: string
  slug: string
  perex: string
  category: string
  publishedAt: string
  originalDate: string
  author: string
  readingTime: string
  imageUrl: string
  metaTitle: string
  metaDescription: string
  type: "discovery" | "article"
}
```

### ArticleDetail
```typescript
interface ArticleDetail extends Article {
  content: ContentSection[]
  faq: FAQ[]
  source?: string
  tags: string[]
}

interface ContentSection {
  title: string
  content: string
}

interface FAQ {
  question: string
  answer: string
}
```

## 🚨 Error Responses

### 404 Not Found
```json
{
  "error": "Article not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch articles"
}
```

## 🔧 Frontend Integration

### Using the API in React Components
```typescript
// Fetch all articles
const response = await fetch('/api/articles?limit=10')
const data = await response.json()
const articles = data.articles

// Fetch latest articles
const response = await fetch('/api/articles/latest?limit=5')
const data = await response.json()
const latestArticles = data.articles

// Fetch specific article
const response = await fetch(`/api/articles/${articleId}`)
const article = await response.json()
```

### Using the API Client
```typescript
import { ArticlesAPI } from '@/lib/api'

// Get all articles
const response = await ArticlesAPI.getAllArticles(20)
const articles = response.articles

// Get latest articles
const latestArticles = await ArticlesAPI.getLatestArticles(10)

// Get specific article
const article = await ArticlesAPI.getArticleById(articleId)
```

## 📈 Performance Considerations

### Caching
- **Static Generation**: Articles are statically generated at build time
- **ISR**: Incremental Static Regeneration for dynamic content
- **CDN**: CloudFront caching for global performance

### Rate Limiting
- **API Gateway**: 1000 requests per minute per IP
- **Lambda**: 1000 concurrent executions
- **DynamoDB**: Auto-scaling based on demand

## 🔐 Authentication

### Public Endpoints
- All article endpoints are publicly accessible
- No authentication required for reading content

### Admin Endpoints (Future)
- Content management endpoints will require JWT authentication
- Admin dashboard access will be protected

## 📝 Examples

### Fetch Articles for Homepage
```typescript
export default async function HomePage() {
  const latestArticles = await ArticlesAPI.getLatestArticles(10)
  const allArticles = await ArticlesAPI.getAllArticles(20)
  
  return (
    <div>
      {latestArticles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
```

### Fetch Article for Detail Page
```typescript
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const response = await ArticlesAPI.getAllArticles(100)
  const basicArticle = response.articles.find(a => a.slug === params.slug)
  
  if (!basicArticle) {
    notFound()
  }
  
  const article = await ArticlesAPI.getArticleById(basicArticle.id)
  
  return (
    <div>
      <h1>{article.title}</h1>
      {article.content.map(section => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.content}</p>
        </section>
      ))}
    </div>
  )
}
```

---

**Note**: All API endpoints return JSON responses and use standard HTTP status codes.
