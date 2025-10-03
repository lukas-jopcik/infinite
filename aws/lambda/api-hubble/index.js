/**
 * Infinite Hubble API Lambda Function
 * 
 * This function provides API endpoints for Hubble data stored in DynamoDB
 * 
 * @author Developer Agent
 * @version 1.0
 * @date 2024-12-19
 */

const AWS = require('aws-sdk');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'infinite-nasa-apod-content';
const REGION = process.env.REGION || 'eu-central-1';

function response(statusCode, body, extraHeaders = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
            ...extraHeaders
        },
        body: JSON.stringify(body)
    };
}

function marshalHubbleItem(item) {
    return {
        guid: item.guid,
        title: item.headline || item.originalTitle,
        link: item.link,
        pubDate: item.pubDate,
        description: item.originalDescription,
        excerpt: item.originalExcerpt,
        category: item.category || [],
        image_main: item.imageUrl,
        image_variants: item.imageVariants || [],
        credit_raw: item.creditRaw,
        copyright_raw: item.copyrightRaw,
        credit_fallback: item.creditFallback,
        keywords: item.keywords || [],
        // SEO fields (generated)
        headline: item.headline,
        headlineEN: item.headlineEN,
        slovakArticle: item.slovakArticle,
        seoKeywords: item.seoKeywords,
        contentQuality: item.contentQuality,
        seoArticle: item.seoArticle
    };
}

async function getHubbleItems(limit = 12, guid = null) {
    console.log(`🔭 Fetching Hubble items - limit: ${limit}, guid: ${guid}`);
    
    const params = {
        TableName: DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
            ':pk': 'HUBBLE'
        },
        ScanIndexForward: false, // Sort by sort key descending (newest first)
        Limit: limit
    };
    
    // If specific GUID requested, add filter
    if (guid) {
        params.FilterExpression = 'guid = :guid';
        params.ExpressionAttributeValues[':guid'] = guid;
    }
    
    try {
        const result = await dynamodb.query(params).promise();
        const items = result.Items || [];
        
        console.log(`✅ Found ${items.length} Hubble items`);
        return items.map(marshalHubbleItem);
    } catch (error) {
        console.error('❌ Error fetching Hubble items:', error);
        throw error;
    }
}

exports.handler = async (event, context) => {
    console.log('🔭 Hubble API handler started');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return response(200, { message: 'CORS preflight' });
        }
        
        // Only allow GET requests
        if (event.httpMethod !== 'GET') {
            return response(405, { error: 'Method not allowed' });
        }
        
        // Parse query parameters
        const queryParams = event.queryStringParameters || {};
        const limit = Math.min(parseInt(queryParams.limit) || 12, 100); // Max 100 items
        const guid = queryParams.guid;
        
        // Fetch Hubble items
        const items = await getHubbleItems(limit, guid);
        
        // Prepare response
        const responseData = {
            items,
            count: items.length,
            lastUpdated: new Date().toISOString()
        };
        
        console.log(`✅ Hubble API - Returning ${items.length} items`);
        return response(200, responseData);
        
    } catch (error) {
        console.error('❌ Hubble API error:', error);
        
        return response(500, {
            error: 'Internal server error',
            message: error.message
        });
    }
};
