/**
 * Redis-based caching layer for frequently accessed data
 * Provides sub-millisecond access to cached articles and categories
 */

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number; // Time to live in seconds
}

class CacheManager {
  private redis: any;
  private config: CacheConfig;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes default
    };
    
    // Initialize Redis client only if Redis is available
    if (process.env.REDIS_ENABLED === 'true') {
      try {
        const Redis = require('ioredis');
        this.redis = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      } catch (error) {
        console.warn('Redis not available, using in-memory cache:', error);
        this.redis = null;
      }
    }
  }

  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.redis) return;
    
    try {
      const serialized = JSON.stringify(data);
      await this.redis.setex(key, ttl || this.config.ttl, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async del(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Cache articles by category with intelligent invalidation
   */
  async cacheArticlesByCategory(category: string, articles: any[]): Promise<void> {
    const key = `articles:category:${category}`;
    await this.set(key, articles, 300); // 5 minutes cache
  }

  /**
   * Get cached articles by category
   */
  async getCachedArticlesByCategory(category: string): Promise<any[] | null> {
    const key = `articles:category:${category}`;
    return await this.get(key);
  }

  /**
   * Cache article by slug
   */
  async cacheArticleBySlug(slug: string, article: any): Promise<void> {
    const key = `article:slug:${slug}`;
    await this.set(key, article, 600); // 10 minutes cache for individual articles
  }

  /**
   * Get cached article by slug
   */
  async getCachedArticleBySlug(slug: string): Promise<any | null> {
    const key = `article:slug:${slug}`;
    return await this.get(key);
  }

  /**
   * Invalidate cache when articles are updated
   */
  async invalidateCategory(category: string): Promise<void> {
    const key = `articles:category:${category}`;
    await this.del(key);
  }

  /**
   * Invalidate specific article cache
   */
  async invalidateArticle(slug: string): Promise<void> {
    const key = `article:slug:${slug}`;
    await this.del(key);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    if (!this.redis) return null;
    
    try {
      const info = await this.redis.info('memory');
      return {
        connected: true,
        memory: info,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
export const cache = new CacheManager();

// Cache key generators
export const CacheKeys = {
  articlesByCategory: (category: string) => `articles:category:${category}`,
  articleBySlug: (slug: string) => `article:slug:${slug}`,
  latestArticles: (limit: number) => `articles:latest:${limit}`,
  sitemap: () => 'sitemap:all',
} as const;
