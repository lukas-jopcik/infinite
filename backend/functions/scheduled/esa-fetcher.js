const AWS = require('aws-sdk');
const Parser = require('rss-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const parser = new Parser();

// Configuration
const REGION = process.env.REGION || 'eu-central-1';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const RAW_CONTENT_TABLE = process.env.DYNAMODB_RAW_CONTENT_TABLE || 'InfiniteRawContent-dev';

// ESA Hubble RSS feed URL
const ESA_HUBBLE_RSS_URL = 'https://feeds.feedburner.com/esahubble/images/potw/';

/**
 * Main Lambda handler for ESA Hubble data fetching
 */
exports.handler = async (event) => {
    console.log('ESA Fetcher Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Fetch and parse ESA Hubble RSS feed
        console.log(`Fetching ESA Hubble RSS feed from: ${ESA_HUBBLE_RSS_URL}`);
        const feed = await parser.parseURL(ESA_HUBBLE_RSS_URL);
        console.log("ESA RSS feed fetched successfully");
        console.log(`Feed title: ${feed.title}`);
        console.log(`Feed description: ${feed.description}`);
        console.log(`Parsed ${feed.items.length} items from ESA RSS feed`);
        
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
                const perex = item.contentSnippet ? item.contentSnippet.replace(/<[^>]*>?/gm, '') : 'No description available.'; // Remove HTML tags
                const url = item.link;
                const imageUrl = item.enclosure && item.enclosure.url ? item.enclosure.url : null;
                const date = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                const guid = item.guid;

                if (!title || !url || !imageUrl || !date) {
                    console.warn(`Skipping item due to missing data: ${JSON.stringify(item)}`);
                    continue;
                }

                const processedData = {
                    title,
                    perex,
                    url,
                    imageUrl,
                    date,
                    guid
                };
                
                // Check for duplicates
                const contentExists = await checkIfContentExists(processedData.guid, processedData.title, processedData.date);
                if (contentExists) {
                    console.log(`ESA content for ${processedData.title} (${processedData.date}) already exists. Skipping.`);
                    duplicateCount++;
                    continue;
                }

                // Store raw content in DynamoDB
                const contentId = await storeRawContent(processedData);
                console.log(`ESA data stored successfully with contentId: ${contentId}`);
                processedCount++;
                results.push({ contentId, title: processedData.title, date: processedData.date, source: "esa-hubble" });
                
            } catch (itemError) {
                console.error('Error processing ESA item:', itemError);
                // Continue processing other items
            }
        }
        
        console.log(`ESA data processing completed: ${processedCount} new items, ${duplicateCount} duplicates`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "ESA Hubble data fetched and processed successfully",
                processedCount,
                duplicateCount,
                totalItems: feedItems.length,
                results,
                source: "esa-hubble"
            }),
        };
        
    } catch (error) {
        console.error('Error in ESA fetcher:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'ESA fetching failed',
                message: error.message,
                stack: error.stack
            })
        };
    }
};

/**
 * Store raw content in DynamoDB
 */
async function storeRawContent(content) {
    const contentId = `esa-${content.date}-${uuidv4()}`;
    const params = {
        TableName: RAW_CONTENT_TABLE,
        Item: {
            contentId: contentId,
            source: 'esa-hubble',
            date: content.date,
            title: content.title,
            perex: content.perex,
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
 * Check if content already exists
 */
async function checkIfContentExists(guid, title, date) {
    // Check by GUID first
    if (guid) {
        const params = {
            TableName: RAW_CONTENT_TABLE,
            FilterExpression: 'guid = :guid_val',
            ExpressionAttributeValues: {
                ':guid_val': guid
            }
        };
        const { Items } = await dynamodb.scan(params).promise();
        if (Items && Items.length > 0) return true;
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
                ':source_val': 'esa-hubble',
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