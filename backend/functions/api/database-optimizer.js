/**
 * Database optimization utilities
 * Provides connection pooling, batch operations, and query optimization
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchGetCommand, BatchWriteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class DatabaseOptimizer {
  constructor() {
    // Connection pooling configuration
    this.client = new DynamoDBClient({
      region: process.env.REGION || 'eu-central-1',
      maxAttempts: 3,
      retryMode: 'adaptive',
      // Connection pooling settings
      requestHandler: {
        connectionTimeout: 1000,
        socketTimeout: 3000,
      },
    });
    
    this.dynamodb = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
    });
    
    this.tableName = process.env.DYNAMODB_ARTICLES_TABLE || 'InfiniteArticles-dev';
  }

  /**
   * Batch get multiple articles by IDs
   */
  async batchGetArticles(articleIds) {
    const chunks = this.chunkArray(articleIds, 100); // DynamoDB batch limit
    const results = [];

    for (const chunk of chunks) {
      const params = {
        RequestItems: {
          [this.tableName]: {
            Keys: chunk.map(id => ({
              articleId: id,
              type: 'discovery'
            }))
          }
        }
      };

      try {
        const result = await this.dynamodb.send(new BatchGetCommand(params));
        if (result.Responses && result.Responses[this.tableName]) {
          results.push(...result.Responses[this.tableName]);
        }
      } catch (error) {
        console.error('Batch get error:', error);
        // Fallback to individual gets
        for (const id of chunk) {
          try {
            const article = await this.getArticleById(id);
            if (article) results.push(article);
          } catch (err) {
            console.error(`Failed to get article ${id}:`, err);
          }
        }
      }
    }

    return results;
  }

  /**
   * Batch write multiple articles
   */
  async batchWriteArticles(articles) {
    const chunks = this.chunkArray(articles, 25); // DynamoDB batch write limit
    const results = [];

    for (const chunk of chunks) {
      const params = {
        RequestItems: {
          [this.tableName]: chunk.map(article => ({
            PutRequest: {
              Item: article
            }
          }))
        }
      };

      try {
        const result = await this.dynamodb.send(new BatchWriteCommand(params));
        results.push(result);
      } catch (error) {
        console.error('Batch write error:', error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Optimized query with caching
   */
  async optimizedQuery(params, cacheKey = null) {
    // Check cache first if cache key provided
    if (cacheKey && global.cache) {
      const cached = await global.cache.get(cacheKey);
      if (cached) {
        console.log('Cache hit for:', cacheKey);
        return cached;
      }
    }

    // Execute query
    const result = await this.dynamodb.send(new QueryCommand(params));
    
    // Cache result if cache key provided
    if (cacheKey && global.cache && result.Items) {
      await global.cache.set(cacheKey, result, 300); // 5 minutes
    }

    return result;
  }

  /**
   * Parallel queries for multiple categories
   */
  async parallelCategoryQueries(categories, limit = 10) {
    const queries = categories.map(category => 
      this.optimizedQuery({
        TableName: this.tableName,
        IndexName: 'category-originalDate-index',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': category
        },
        ScanIndexForward: false,
        Limit: limit
      }, `category:${category}:${limit}`)
    );

    try {
      const results = await Promise.all(queries);
      return results.map((result, index) => ({
        category: categories[index],
        articles: result.Items || []
      }));
    } catch (error) {
      console.error('Parallel query error:', error);
      throw error;
    }
  }

  /**
   * Get article by ID with caching
   */
  async getArticleById(articleId) {
    const cacheKey = `article:${articleId}`;
    
    // Check cache first
    if (global.cache) {
      const cached = await global.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Query database
    const params = {
      TableName: this.tableName,
      Key: {
        articleId: articleId,
        type: 'discovery'
      }
    };

    try {
      const result = await this.dynamodb.send(new QueryCommand(params));
      const article = result.Items?.[0];
      
      // Cache result
      if (article && global.cache) {
        await global.cache.set(cacheKey, article, 600); // 10 minutes
      }
      
      return article;
    } catch (error) {
      console.error('Get article error:', error);
      return null;
    }
  }

  /**
   * Get articles by category with intelligent caching
   */
  async getArticlesByCategoryOptimized(category, limit = 20, lastKey = null) {
    const cacheKey = `category:${category}:${limit}:${lastKey || 'first'}`;
    
    // Check cache first
    if (global.cache) {
      const cached = await global.cache.get(cacheKey);
      if (cached) {
        console.log('Cache hit for category:', category);
        return cached;
      }
    }

    // Query database
    const params = {
      TableName: this.tableName,
      IndexName: 'category-originalDate-index',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category
      },
      ScanIndexForward: false,
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    try {
      const result = await this.dynamodb.send(new QueryCommand(params));
      
      // Cache result
      if (global.cache) {
        await global.cache.set(cacheKey, result, 300); // 5 minutes
      }
      
      return result;
    } catch (error) {
      console.error('Get articles by category error:', error);
      throw error;
    }
  }

  /**
   * Utility: Chunk array into smaller arrays
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const params = {
        TableName: this.tableName,
        Select: 'COUNT'
      };
      
      const result = await this.dynamodb.send(new ScanCommand(params));
      
      return {
        itemCount: result.Count,
        scannedCount: result.ScannedCount,
        lastEvaluatedKey: result.LastEvaluatedKey,
        consumedCapacity: result.ConsumedCapacity
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return null;
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmupCache() {
    console.log('Warming up cache...');
    
    try {
      // Cache latest articles from each category
      const categories = ['objav-dna', 'komunita', 'deti-a-vesmir'];
      await this.parallelCategoryQueries(categories, 10);
      
      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Cache warmup error:', error);
    }
  }
}

// Singleton instance
const dbOptimizer = new DatabaseOptimizer();

module.exports = {
  DatabaseOptimizer,
  dbOptimizer
};
