// Admin API for content management
// This API provides endpoints for managing articles and content

exports.handler = async (event) => {
    console.log('Admin API Lambda invoked:', JSON.stringify(event, null, 2));
    
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };
    
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    const { httpMethod, path, pathParameters, body, queryStringParameters } = event;
    
    try {
        // Basic admin authentication check (in production, use proper JWT/API keys)
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.includes('Bearer admin-token')) {
            return createResponse(401, { error: 'Unauthorized - Admin access required' }, corsHeaders);
        }
        
        // Route requests based on HTTP method and path
        if (httpMethod === 'GET' && path === '/admin/articles') {
            return await getArticles(queryStringParameters, corsHeaders);
        } else if (httpMethod === 'POST' && path === '/admin/articles') {
            return await createArticle(body, corsHeaders);
        } else if (httpMethod === 'PUT' && pathParameters?.id) {
            return await updateArticle(pathParameters.id, body, corsHeaders);
        } else if (httpMethod === 'DELETE' && pathParameters?.id) {
            return await deleteArticle(pathParameters.id, corsHeaders);
        } else if (httpMethod === 'GET' && pathParameters?.id) {
            return await getArticle(pathParameters.id, corsHeaders);
        }
        
        return createResponse(404, { error: 'Endpoint not found' }, corsHeaders);
        
    } catch (error) {
        console.error('Admin API Error:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message 
        }, corsHeaders);
    }
};

// Get all articles with optional filtering
async function getArticles(queryParams, corsHeaders) {
    try {
        const { 
            limit = 50, 
            offset = 0, 
            status = 'all',
            category = 'all',
            search = '' 
        } = queryParams || {};
        
        // For now, return mock data (in production, query DynamoDB)
        const mockArticles = [
            {
                id: 'article-1',
                title: 'Krabia hmlovina – fascinujúce okno do konca života hviezdy',
                slug: 'krabia-hmlovina-fascinujuce-okno-do-konca-zivota-hviezdy',
                status: 'published',
                category: 'objav-dna',
                publishedAt: '2025-01-07T10:00:00Z',
                viewCount: 1250,
                author: 'AI Content Generator'
            },
            {
                id: 'article-2',
                title: 'Kometa Lemmon – fascinujúci návštevník našej oblohy',
                slug: 'kometa-lemmon-fascinujuci-navstevnik-nasej-oblohy',
                status: 'published',
                category: 'objav-dna',
                publishedAt: '2025-01-06T10:00:00Z',
                viewCount: 980,
                author: 'AI Content Generator'
            },
            {
                id: 'article-3',
                title: 'Planéty slnečnej sústavy – fascinujúce rotácie a sklony',
                slug: 'planety-slnecnej-sustavy-fascinujuce-rotacie-a-sklony',
                status: 'draft',
                category: 'vysvetlenia',
                publishedAt: null,
                viewCount: 0,
                author: 'AI Content Generator'
            }
        ];
        
        // Apply filters
        let filteredArticles = mockArticles;
        
        if (status !== 'all') {
            filteredArticles = filteredArticles.filter(article => article.status === status);
        }
        
        if (category !== 'all') {
            filteredArticles = filteredArticles.filter(article => article.category === category);
        }
        
        if (search) {
            filteredArticles = filteredArticles.filter(article => 
                article.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
        
        return createResponse(200, {
            success: true,
            data: paginatedArticles,
            pagination: {
                total: filteredArticles.length,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: endIndex < filteredArticles.length
            }
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error getting articles:', error);
        return createResponse(500, { error: 'Failed to get articles' }, corsHeaders);
    }
}

// Create a new article
async function createArticle(body, corsHeaders) {
    try {
        const data = JSON.parse(body);
        
        // Validate required fields
        const requiredFields = ['title', 'content', 'category'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return createResponse(400, { 
                    error: `Missing required field: ${field}` 
                }, corsHeaders);
            }
        }
        
        // Generate article ID and slug
        const articleId = `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const slug = generateSlug(data.title);
        
        // Create article object
        const article = {
            id: articleId,
            title: data.title,
            slug: slug,
            content: data.content,
            perex: data.perex || data.content.substring(0, 200) + '...',
            category: data.category,
            status: data.status || 'draft',
            author: data.author || 'Admin',
            publishedAt: data.status === 'published' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: 0,
            metaTitle: data.metaTitle || data.title,
            metaDescription: data.metaDescription || data.perex,
            tags: data.tags || [],
            featured: data.featured || false
        };
        
        // For now, just log the article (in production, save to DynamoDB)
        console.log('Article created:', article);
        
        return createResponse(201, {
            success: true,
            data: article,
            message: 'Article created successfully'
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error creating article:', error);
        return createResponse(500, { error: 'Failed to create article' }, corsHeaders);
    }
}

// Update an existing article
async function updateArticle(articleId, body, corsHeaders) {
    try {
        const data = JSON.parse(body);
        
        // For now, return mock updated article (in production, update DynamoDB)
        const updatedArticle = {
            id: articleId,
            title: data.title || 'Updated Article Title',
            slug: data.slug || generateSlug(data.title || 'Updated Article Title'),
            content: data.content || 'Updated article content...',
            perex: data.perex || 'Updated article perex...',
            category: data.category || 'objav-dna',
            status: data.status || 'published',
            author: data.author || 'Admin',
            publishedAt: data.status === 'published' ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
            viewCount: 1250,
            metaTitle: data.metaTitle || data.title,
            metaDescription: data.metaDescription || data.perex,
            tags: data.tags || ['updated'],
            featured: data.featured || false
        };
        
        console.log('Article updated:', updatedArticle);
        
        return createResponse(200, {
            success: true,
            data: updatedArticle,
            message: 'Article updated successfully'
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error updating article:', error);
        return createResponse(500, { error: 'Failed to update article' }, corsHeaders);
    }
}

// Delete an article
async function deleteArticle(articleId, corsHeaders) {
    try {
        // For now, just log the deletion (in production, delete from DynamoDB)
        console.log('Article deleted:', articleId);
        
        return createResponse(200, {
            success: true,
            message: `Article ${articleId} deleted successfully`
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error deleting article:', error);
        return createResponse(500, { error: 'Failed to delete article' }, corsHeaders);
    }
}

// Get a specific article
async function getArticle(articleId, corsHeaders) {
    try {
        // For now, return mock article (in production, query DynamoDB)
        const article = {
            id: articleId,
            title: 'Sample Article Title',
            slug: 'sample-article-title',
            content: 'This is the full article content...',
            perex: 'This is the article perex...',
            category: 'objav-dna',
            status: 'published',
            author: 'Admin',
            publishedAt: '2025-01-07T10:00:00Z',
            createdAt: '2025-01-07T09:00:00Z',
            updatedAt: '2025-01-07T10:00:00Z',
            viewCount: 1250,
            metaTitle: 'Sample Article Title',
            metaDescription: 'This is the article perex...',
            tags: ['sample', 'article'],
            featured: true
        };
        
        return createResponse(200, {
            success: true,
            data: article
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error getting article:', error);
        return createResponse(500, { error: 'Failed to get article' }, corsHeaders);
    }
}

// Helper function to generate URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

// Helper function to create HTTP response
function createResponse(statusCode, body, corsHeaders) {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(body)
    };
}
