// API service for fetching articles from Lambda backend
// import { cache, CacheKeys } from './cache';

export interface Article {
  id: string;
  title: string;
  slug: string;
  perex: string;
  category: string;
  publishedAt: string;
  originalDate: string;
  author: string;
  readingTime: string;
  imageUrl?: string;
  metaTitle: string;
  metaDescription: string;
  type: string;
  tags?: string[];
}

export interface ArticleDetail extends Article {
  content: { title: string; content: string }[]; // Sections from AI generator
  sections?: { title: string; content: string }[]; // Alias for content
  faq: { question: string; answer: string }[];
  images?: {
    og?: string;
    hero?: string;
    card?: string;
    thumb?: string;
  };
  keywords?: string[];
  source?: string;
  sourceUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jqg44jstd1.execute-api.eu-central-1.amazonaws.com/dev';

export class ArticlesAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getLatestArticles(limit: number = 10): Promise<Article[]> {
    try {
      const response = await this.makeRequest(`/articles/latest?limit=${limit}`);
      return response.articles || [];
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  }

  static async getAllArticles(limit: number = 20, lastKey?: string): Promise<{
    articles: Article[];
    lastKey?: string;
    count: number;
  }> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (lastKey) {
        params.append('lastKey', lastKey);
      }
      
      const response = await this.makeRequest(`/articles?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching all articles:', error);
      return { articles: [], count: 0 };
    }
  }

  static async getArticleById(id: string): Promise<ArticleDetail | null> {
    try {
      const response = await this.makeRequest(`/articles/${id}`);
      return response.article || null;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  static async getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
    try {
      const response = await this.makeRequest(`/articles/slug/${slug}`);
      return response;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return null;
    }
  }

  static async getArticlesByCategory(category: string, limit: number = 20, lastKey?: string): Promise<{
    articles: Article[];
    lastKey?: string;
    count: number;
  }> {
    try {
      // TODO: Re-enable cache when ioredis is installed
      // Check cache first
      // const cacheKey = CacheKeys.articlesByCategory(category);
      // const cached = await cache.getCachedArticlesByCategory(category);
      // if (cached) {
      //   console.log('Cache hit for category:', category);
      //   return { articles: cached, count: cached.length };
      // }

      const params = new URLSearchParams({ limit: limit.toString() });
      if (lastKey) {
        params.append('lastKey', lastKey);
      }
      
      const response = await this.makeRequest(`/articles/category/${category}?${params.toString()}`);
      
      // TODO: Re-enable cache when ioredis is installed
      // Cache the result
      // if (response.articles) {
      //   await cache.cacheArticlesByCategory(category, response.articles);
      // }
      
      return response;
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      // Fallback to getAllArticles with client-side filtering
      const allArticles = await this.getAllArticles(100);
      const filteredArticles = allArticles.articles.filter(article => article.category === category);
      return { articles: filteredArticles, count: filteredArticles.length };
    }
  }
}

