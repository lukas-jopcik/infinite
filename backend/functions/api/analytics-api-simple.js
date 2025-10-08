// Simple Analytics API without heavy dependencies
// This version uses minimal AWS SDK imports

exports.handler = async (event) => {
    console.log('Analytics API Lambda invoked:', JSON.stringify(event, null, 2));
    
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
    
    const { httpMethod, path, body, queryStringParameters } = event;
    
    try {
        switch (httpMethod) {
            case 'POST':
                if (path === '/analytics/view') {
                    return await trackView(body, corsHeaders);
                } else if (path === '/analytics/engagement') {
                    return await trackEngagement(body, corsHeaders);
                }
                break;
                
            case 'GET':
                if (path === '/analytics/stats') {
                    return await getAnalyticsStats(queryStringParameters, corsHeaders);
                }
                break;
                
            default:
                return createResponse(405, { error: 'Method not allowed' }, corsHeaders);
        }
        
        return createResponse(404, { error: 'Endpoint not found' }, corsHeaders);
        
    } catch (error) {
        console.error('Analytics API Error:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message 
        }, corsHeaders);
    }
};

// Track article view
async function trackView(body, corsHeaders) {
    try {
        const data = JSON.parse(body);
        const { articleId, userId, userAgent, referrer, timestamp } = data;
        
        // Validate required fields
        if (!articleId) {
            return createResponse(400, { error: 'articleId is required' }, corsHeaders);
        }
        
        const viewId = `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const viewTimestamp = timestamp || new Date().toISOString();
        
        // For now, just log the view (in production, this would store in DynamoDB)
        console.log('View tracked:', {
            viewId,
            articleId,
            userId: userId || 'anonymous',
            userAgent: userAgent || 'unknown',
            referrer: referrer || 'direct',
            timestamp: viewTimestamp
        });
        
        return createResponse(200, {
            success: true,
            viewId,
            message: 'View tracked successfully'
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error tracking view:', error);
        return createResponse(500, { error: 'Failed to track view' }, corsHeaders);
    }
}

// Track user engagement
async function trackEngagement(body, corsHeaders) {
    try {
        const data = JSON.parse(body);
        const { articleId, userId, engagementType, value, metadata } = data;
        
        // Validate required fields
        if (!articleId || !engagementType) {
            return createResponse(400, { error: 'articleId and engagementType are required' }, corsHeaders);
        }
        
        const engagementId = `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        // For now, just log the engagement (in production, this would store in DynamoDB)
        console.log('Engagement tracked:', {
            engagementId,
            articleId,
            userId: userId || 'anonymous',
            engagementType,
            value: value || 0,
            metadata: metadata || {},
            timestamp
        });
        
        return createResponse(200, {
            success: true,
            engagementId,
            message: 'Engagement tracked successfully'
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error tracking engagement:', error);
        return createResponse(500, { error: 'Failed to track engagement' }, corsHeaders);
    }
}

// Get analytics statistics
async function getAnalyticsStats(queryParams, corsHeaders) {
    try {
        const { 
            startDate, 
            endDate, 
            articleId, 
            engagementType,
            limit = 100 
        } = queryParams || {};
        
        // For now, return mock analytics data
        // In production, this would query DynamoDB
        const mockAnalytics = {
            totalViews: 1250,
            totalEngagements: 340,
            viewsByDate: {
                '2025-01-07': 45,
                '2025-01-06': 52,
                '2025-01-05': 38
            },
            viewsByHour: {
                '9': 12,
                '10': 18,
                '11': 15,
                '14': 22,
                '15': 19
            },
            engagementTypes: {
                'scroll': 120,
                'click': 85,
                'share': 45,
                'time_spent': 90
            },
            topArticles: {
                'article-1': 45,
                'article-2': 38,
                'article-3': 32
            },
            userEngagement: {
                'user-1': 12,
                'user-2': 8,
                'user-3': 15
            }
        };
        
        return createResponse(200, {
            success: true,
            data: mockAnalytics,
            totalItems: 100,
            query: {
                startDate,
                endDate,
                articleId,
                engagementType,
                limit
            }
        }, corsHeaders);
        
    } catch (error) {
        console.error('Error getting analytics stats:', error);
        return createResponse(500, { error: 'Failed to get analytics stats' }, corsHeaders);
    }
}

// Helper function to create HTTP response
function createResponse(statusCode, body, corsHeaders) {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(body)
    };
}
