const AWS = require('aws-sdk');
const Parser = require('rss-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const parser = new Parser();

// Configuration
const REGION = process.env.REGION || 'eu-central-1';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const RAW_CONTENT_TABLE = process.env.DYNAMODB_RAW_CONTENT_TABLE || 'InfiniteRawContent-dev';

// APOD RSS feed URL
const APOD_RSS_URL = 'https://apod.com/feed.rss';

/**
 * Main Lambda handler for APOD RSS data fetching
 */
exports.handler = async (event) => {
    console.log('APOD RSS Fetcher Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Fetch and parse APOD RSS feed
        console.log(`Fetching APOD RSS feed from: ${APOD_RSS_URL}`);
        const feed = await parser.parseURL(APOD_RSS_URL);
        console.log("APOD RSS feed fetched successfully");
        console.log(`Feed title: ${feed.title}`);
        console.log(`Feed description: ${feed.description}`);
        console.log(`Parsed ${feed.items.length} items from APOD RSS feed`);
        
        if (feed.items.length > 0) {
            console.log(`First item title: ${feed.items[0].title}`);
            console.log(`First item link: ${feed.items[0].link}`);
        } else {
            console.log("No items found in feed");
        }
        
        const feedItems = feed.items;
        
        let processedCount = 0;
        let duplicateCount = 0;
        const results = [];
        
        // Process each feed item
        for (const item of feedItems) {
            try {
                const title = item.title;
                const url = item.link;
                const imageUrl = item.enclosure && item.enclosure.url ? item.enclosure.url : null;
                const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                const guid = item.guid;

                if (!title || !url || !date) {
                    console.warn(`Skipping item due to missing data: ${JSON.stringify(item)}`);
                    continue;
                }

                // Fetch full content from APOD page
                console.log(`Fetching full content from: ${url}`);
                const fullContent = await fetchFullAPODContent(url);
                
                const processedData = {
                    title,
                    explanation: fullContent.explanation,
                    url,
                    imageUrl: fullContent.imageUrl || imageUrl,
                    date,
                    guid
                };
                
                // Check for duplicates
                const contentExists = await checkIfContentExists(processedData.guid, processedData.title, processedData.date);
                if (contentExists) {
                    console.log(`APOD content for ${processedData.title} (${processedData.date}) already exists. Skipping.`);
                    duplicateCount++;
                    continue;
                }

                // Store raw content in DynamoDB
                const contentId = await storeRawContent(processedData);
                console.log(`APOD data stored successfully with contentId: ${contentId}`);
                processedCount++;
                results.push({ contentId, title: processedData.title, date: processedData.date, source: "apod-rss" });
                
            } catch (itemError) {
                console.error('Error processing APOD item:', itemError);
                // Continue processing other items
            }
        }
        
        console.log(`APOD data processing completed: ${processedCount} new items, ${duplicateCount} duplicates`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "APOD RSS data fetched and processed successfully",
                processedCount,
                duplicateCount,
                totalItems: feedItems.length,
                results,
                source: "apod-rss"
            }),
        };
        
    } catch (error) {
        console.error('Error in APOD RSS fetcher:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'APOD RSS fetching failed',
                message: error.message,
                stack: error.stack
            })
        };
    }
};

/**
 * Fetch full content from APOD page
 */
async function fetchFullAPODContent(url) {
    try {
        console.log(`Fetching full content from APOD page: ${url}`);
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Infinite-Bot/1.0)'
            }
        });
        
        const html = response.data;
        
        // Extract the explanation text
        const explanationMatch = html.match(/<b>\s*Explanation:\s*<\/b>\s*(.*?)(?=<p>|<b>|$)/s);
        let explanation = 'No explanation available.';
        
        if (explanationMatch && explanationMatch[1]) {
            explanation = explanationMatch[1]
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
        }
        
        // Extract the main image URL
        const imageMatch = html.match(/<a href="([^"]*\.(jpg|jpeg|png|gif|webp))"/i);
        let imageUrl = null;
        
        if (imageMatch && imageMatch[1]) {
            imageUrl = imageMatch[1];
            // Convert relative URLs to absolute
            if (imageUrl.startsWith('/')) {
                imageUrl = 'https://apod.nasa.gov' + imageUrl;
            } else if (!imageUrl.startsWith('http')) {
                // Handle relative paths that don't start with /
                imageUrl = 'https://apod.nasa.gov/apod/' + imageUrl;
            }
        }
        
        console.log(`Extracted explanation length: ${explanation.length} characters`);
        console.log(`Extracted image URL: ${imageUrl}`);
        
        return {
            explanation,
            imageUrl
        };
        
    } catch (error) {
        console.error(`Error fetching full content from ${url}:`, error.message);
        return {
            explanation: 'Error fetching full content from APOD page.',
            imageUrl: null
        };
    }
}

/**
 * Store raw content in DynamoDB
 */
async function storeRawContent(content) {
    const contentId = `apod-rss-${content.date}-${uuidv4()}`;
    const params = {
        TableName: RAW_CONTENT_TABLE,
        Item: {
            contentId: contentId,
            source: 'apod-rss',
            date: content.date,
            title: content.title,
            explanation: content.explanation,
            url: content.url,
            imageUrl: content.imageUrl,
            guid: content.guid,
            status: 'raw',
            createdAt: new Date().toISOString()
        }
    };
    await dynamodb.put(params).promise();
    return contentId;
}

/**
 * Check if content already exists - optimized with GSI
 */
async function checkIfContentExists(guid, title, date) {
    // Check by GUID first using guid-index GSI
    if (guid) {
        try {
            const params = {
                TableName: RAW_CONTENT_TABLE,
                IndexName: 'guid-index',
                KeyConditionExpression: 'guid = :guid_val',
                ExpressionAttributeValues: {
                    ':guid_val': guid
                }
            };
            const { Items } = await dynamodb.query(params).promise();
            if (Items && Items.length > 0) return true;
        } catch (gsiError) {
            console.log('GUID GSI not ready, falling back to scan:', gsiError.message);
            // Fallback to scan if GSI is not ready
            const scanParams = {
                TableName: RAW_CONTENT_TABLE,
                FilterExpression: 'guid = :guid_val',
                ExpressionAttributeValues: {
                    ':guid_val': guid
                }
            };
            const { Items } = await dynamodb.scan(scanParams).promise();
            if (Items && Items.length > 0) return true;
        }
    }

    // Fallback to title and date if GUID not found or not provided
    if (title && date) {
        const params = {
            TableName: RAW_CONTENT_TABLE,
            IndexName: 'source-date-index',
            KeyConditionExpression: '#source = :source_val AND #date = :date_val',
            FilterExpression: 'title = :title_val',
            ExpressionAttributeNames: {
                '#source': 'source',
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':source_val': 'apod-rss',
                ':date_val': date,
                ':title_val': title
            }
        };
        const { Items } = await dynamodb.query(params).promise();
        return Items && Items.length > 0;
    }
    return false;
}

// Export functions for testing
module.exports = {
    handler: exports.handler,
    storeRawContent,
    checkIfContentExists
};
