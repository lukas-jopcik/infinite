const AWS = require('aws-sdk');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configuration
const REGION = process.env.REGION || 'eu-central-1';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const ARTICLES_TABLE = process.env.DYNAMODB_ARTICLES_TABLE || 'InfiniteArticles-dev';

/**
 * Main Lambda handler for Articles API
 */
exports.handler = async (event) => {
    console.log('Articles API Lambda invoked:', JSON.stringify(event, null, 2));
    
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
        const path = event.path || '';
        const httpMethod = event.httpMethod || 'GET';
        
        // Route handling
        if (path === '/articles' && httpMethod === 'GET') {
            return await getAllArticles(headers, event.queryStringParameters);
        } else if (path === '/articles/latest' && httpMethod === 'GET') {
            return await getLatestArticles(headers, event.queryStringParameters);
        } else if (path.startsWith('/articles/slug/') && httpMethod === 'GET') {
            const slug = path.split('/')[3];
            return await getArticleBySlug(slug, headers);
        } else if (path.startsWith('/articles/') && httpMethod === 'GET') {
            const articleId = path.split('/')[2];
            return await getArticleById(articleId, headers);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Not found' })
            };
        }
        
    } catch (error) {
        console.error('Error in Articles API:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

/**
 * Get all articles with pagination
 */
async function getAllArticles(headers, queryParams) {
    const limit = parseInt(queryParams?.limit) || 20;
    const lastKey = queryParams?.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;
    
    const params = {
        TableName: ARTICLES_TABLE,
        Limit: limit,
        ScanIndexForward: false, // Sort by publishedAt descending
        ...(lastKey && { ExclusiveStartKey: lastKey })
    };
    
    const result = await dynamodb.scan(params).promise();
    
    // Transform the data for frontend
    const articles = result.Items.map(item => ({
        id: item.articleId,
        title: item.title,
        slug: item.slug,
        perex: item.perex,
        category: item.category || 'discovery',
        publishedAt: item.originalDate || item.publishedAt, // Use originalDate if available, fallback to publishedAt
        originalDate: item.originalDate,
        author: item.author,
        readingTime: item.estimatedReadingTime,
        imageUrl: item.imageUrl || item.images?.heroImage?.url || item.images?.cardImage?.url || item.images?.ogImage?.url,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        type: item.type,
        source: item.source,
        sourceUrl: item.sourceUrl
    }))
    // Sort by originalDate descending (latest first)
    .sort((a, b) => {
        const dateA = new Date(a.originalDate || a.publishedAt);
        const dateB = new Date(b.originalDate || b.publishedAt);
        return dateB - dateA;
    });
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            articles,
            lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
            count: articles.length,
            total: result.Count
        })
    };
}

/**
 * Get article by ID
 */
async function getArticleById(articleId, headers) {
    const params = {
        TableName: ARTICLES_TABLE,
        Key: {
            articleId: articleId,
            type: 'discovery' // Assuming all articles are discovery type for now
        }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Article not found' })
        };
    }
    
    // Transform the data for frontend
    const article = {
        id: result.Item.articleId,
        title: result.Item.title,
        slug: result.Item.slug,
        perex: result.Item.perex,
        content: result.Item.content, // This contains the sections array
        sections: result.Item.content, // Alias for clarity
        faq: result.Item.faq,
        category: result.Item.category || 'discovery',
        publishedAt: result.Item.originalDate || result.Item.publishedAt, // Use originalDate if available, fallback to publishedAt
        originalDate: result.Item.originalDate,
        author: result.Item.author,
        readingTime: result.Item.estimatedReadingTime,
        images: result.Item.images,
        imageUrl: result.Item.imageUrl || result.Item.images?.heroImage?.url || result.Item.images?.cardImage?.url || result.Item.images?.ogImage?.url,
        metaTitle: result.Item.metaTitle,
        metaDescription: result.Item.metaDescription,
        keywords: result.Item.keywords,
        type: result.Item.type,
        source: result.Item.source,
        sourceUrl: result.Item.sourceUrl
    };
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ article })
    };
}

/**
 * Get latest articles
 */
async function getLatestArticles(headers, queryParams) {
    const limit = parseInt(queryParams?.limit) || 10;
    
    const params = {
        TableName: ARTICLES_TABLE,
        Limit: limit,
        ScanIndexForward: false // Sort by publishedAt descending
    };
    
    const result = await dynamodb.scan(params).promise();
    
    // Transform the data for frontend
    const articles = result.Items.map(item => ({
        id: item.articleId,
        title: item.title,
        slug: item.slug,
        perex: item.perex,
        category: item.category || 'discovery',
        publishedAt: item.originalDate || item.publishedAt, // Use originalDate if available, fallback to publishedAt
        originalDate: item.originalDate,
        author: item.author,
        readingTime: item.estimatedReadingTime,
        imageUrl: item.imageUrl || item.images?.heroImage?.url || item.images?.cardImage?.url || item.images?.ogImage?.url,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        type: item.type
    }))
    // Sort by originalDate descending (latest first)
    .sort((a, b) => {
        const dateA = new Date(a.originalDate || a.publishedAt);
        const dateB = new Date(b.originalDate || b.publishedAt);
        return dateB - dateA;
    });
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            articles,
            count: articles.length
        })
    };
}

/**
 * Get article by slug - optimized for direct lookup using GSI
 */
async function getArticleBySlug(slug, headers) {
    console.log('Getting article by slug:', slug);
    
    try {
        // Try GSI first, fallback to scan if GSI is not ready
        let result;
        try {
            // Use GSI (Global Secondary Index) for fast query instead of scan
            const params = {
                TableName: ARTICLES_TABLE,
                IndexName: 'slug-index',
                KeyConditionExpression: 'slug = :slug',
                ExpressionAttributeValues: {
                    ':slug': slug
                },
                Limit: 1 // We only need one result
            };
            
            result = await dynamodb.query(params).promise();
        } catch (gsiError) {
            console.log('GSI not ready, falling back to scan:', gsiError.message);
            // Fallback to scan if GSI is not ready
            const scanParams = {
                TableName: ARTICLES_TABLE,
                FilterExpression: 'slug = :slug',
                ExpressionAttributeValues: {
                    ':slug': slug
                },
                Limit: 1 // We only need one result
            };
            
            result = await dynamodb.scan(scanParams).promise();
        }
        
        if (!result.Items || result.Items.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Article not found' })
            };
        }
        
        const item = result.Items[0];
        
        // Transform the data to match frontend expectations
        const article = {
            id: item.articleId,
            title: item.title,
            slug: item.slug,
            perex: item.perex,
            content: item.content,
            sections: item.content,
            faq: item.faq,
            category: item.category || 'discovery',
            publishedAt: item.originalDate || item.publishedAt,
            originalDate: item.originalDate,
            author: item.author,
            readingTime: item.estimatedReadingTime,
            images: item.images,
            imageUrl: item.imageUrl || item.images?.heroImage?.url || item.images?.cardImage?.url || item.images?.ogImage?.url,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            keywords: item.keywords,
            type: item.type,
            source: item.source,
            sourceUrl: item.sourceUrl
        };
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(article)
        };
        
    } catch (error) {
        console.error('Error getting article by slug:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}

// Export functions for testing
module.exports = {
    handler: exports.handler,
    getAllArticles,
    getArticleById,
    getLatestArticles,
    getArticleBySlug
};
