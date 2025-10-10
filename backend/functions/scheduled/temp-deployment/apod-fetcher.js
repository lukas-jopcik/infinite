const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION || 'eu-central-1' });
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);
const secretsManager = new SecretsManagerClient({ region: process.env.REGION || 'eu-central-1' });

// Configuration
const REGION = process.env.REGION || 'eu-central-1';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const RAW_CONTENT_TABLE = process.env.DYNAMODB_RAW_CONTENT_TABLE || 'InfiniteRawContent-dev';
const NASA_SECRET_ARN = process.env.NASA_SECRET_ARN || `arn:aws:secretsmanager:${REGION}:${process.env.ACCOUNT_ID}:secret:infinite/nasa-api-key`;

// NASA API configuration
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_APOD_RSS_URL = 'https://apod.nasa.gov/apod.rss';

/**
 * Main Lambda handler for APOD data fetching
 */
exports.handler = async (event) => {
    console.log('APOD Fetcher Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Get NASA API key from Secrets Manager
        const nasaApiKey = await getSecret(NASA_SECRET_ARN);
        
        // Fetch APOD data from NASA API
        const apodData = await fetchAPODData(nasaApiKey);
        
        // Validate and process the data
        const processedData = await processAPODData(apodData);
        
        // Check for duplicates
        const isDuplicate = await checkForDuplicate(processedData);
        
        if (isDuplicate) {
            console.log('APOD data already exists for date:', processedData.date);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'APOD data already exists',
                    date: processedData.date,
                    duplicate: true
                })
            };
        }
        
        // Store raw content in DynamoDB
        const storedData = await storeRawContent(processedData);
        
        console.log('APOD data fetched and stored successfully:', storedData.contentId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'APOD data fetched and stored successfully',
                contentId: storedData.contentId,
                date: storedData.date,
                title: storedData.title,
                source: 'apod'
            })
        };
        
    } catch (error) {
        console.error('Error in APOD fetcher:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'APOD fetching failed',
                message: error.message,
                stack: error.stack
            })
        };
    }
};

/**
 * Get secret from AWS Secrets Manager
 */
async function getSecret(secretArn) {
    try {
        const result = await secretsManager.send(new GetSecretValueCommand({ SecretId: secretArn }));
        return JSON.parse(result.SecretString).apiKey;
    } catch (error) {
        console.error('Error retrieving NASA API key:', error);
        throw new Error('Failed to retrieve NASA API key');
    }
}

/**
 * Fetch APOD data from NASA API
 */
async function fetchAPODData(apiKey) {
    return new Promise((resolve, reject) => {
        const url = `${NASA_APOD_URL}?api_key=${apiKey}&thumbs=true`;
        
        console.log('Fetching APOD data from:', url);
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const apodData = JSON.parse(data);
                    console.log('APOD data fetched successfully');
                    resolve(apodData);
                } catch (error) {
                    console.error('Error parsing APOD data:', error);
                    reject(new Error('Failed to parse APOD data'));
                }
            });
            
        }).on('error', (error) => {
            console.error('Error fetching APOD data:', error);
            reject(new Error('Failed to fetch APOD data'));
        });
    });
}

/**
 * Process and validate APOD data
 */
async function processAPODData(apodData) {
    // Validate required fields
    if (!apodData.date || !apodData.title || !apodData.explanation) {
        throw new Error('Invalid APOD data: missing required fields');
    }
    
    // Generate unique content ID
    const contentId = `apod-${apodData.date}-${uuidv4()}`;
    
    // Process the data
    const processedData = {
        contentId: contentId,
        source: 'apod',
        date: apodData.date,
        title: apodData.title,
        explanation: apodData.explanation,
        url: apodData.url || null,
        hdurl: apodData.hdurl || null,
        mediaType: apodData.media_type || 'image',
        serviceVersion: apodData.service_version || 'v1',
        copyright: apodData.copyright || null,
        thumbnailUrl: apodData.thumbnail_url || null,
        rawData: apodData,
        fetchedAt: new Date().toISOString(),
        status: 'raw',
        environment: ENVIRONMENT
    };
    
    // Validate image URL if present
    if (processedData.url && !isValidUrl(processedData.url)) {
        console.warn('Invalid image URL detected:', processedData.url);
        processedData.url = null;
    }
    
    if (processedData.hdurl && !isValidUrl(processedData.hdurl)) {
        console.warn('Invalid HD image URL detected:', processedData.hdurl);
        processedData.hdurl = null;
    }
    
    return processedData;
}

/**
 * Check if APOD data already exists for the given date - optimized with GSI
 */
async function checkForDuplicate(processedData) {
    try {
        // Use GSI for efficient duplicate checking by source and date
        const params = {
            TableName: RAW_CONTENT_TABLE,
            IndexName: 'source-date-index',
            KeyConditionExpression: '#source = :source AND #date = :date',
            ExpressionAttributeNames: {
                '#source': 'source',
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':source': processedData.source,
                ':date': processedData.date
            }
        };
        
        let result;
        try {
            result = await dynamodb.send(new QueryCommand(params));
        } catch (gsiError) {
            console.log('GSI not ready, falling back to scan:', gsiError.message);
            // Fallback to scan if GSI is not ready
            const scanParams = {
                TableName: RAW_CONTENT_TABLE,
                FilterExpression: '#source = :source AND #date = :date',
                ExpressionAttributeNames: {
                    '#source': 'source',
                    '#date': 'date'
                },
                ExpressionAttributeValues: {
                    ':source': processedData.source,
                    ':date': processedData.date
                }
            };
            
            result = await dynamodb.send(new ScanCommand(scanParams));
        }
        
        return result.Items && result.Items.length > 0;
        
    } catch (error) {
        console.error('Error checking for duplicate:', error);
        // If we can't check for duplicates, proceed with storage
        return false;
    }
}

/**
 * Store raw content in DynamoDB
 */
async function storeRawContent(processedData) {
    try {
        const params = {
            TableName: RAW_CONTENT_TABLE,
            Item: processedData
        };
        
        await dynamodb.send(new PutCommand(params));
        console.log('Raw content stored successfully:', processedData.contentId);
        
        return processedData;
        
    } catch (error) {
        console.error('Error storing raw content:', error);
        throw new Error('Failed to store raw content');
    }
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Get APOD data for a specific date (for testing)
 */
async function getAPODForDate(apiKey, date) {
    return new Promise((resolve, reject) => {
        const url = `${NASA_APOD_URL}?api_key=${apiKey}&date=${date}&thumbs=true`;
        
        console.log('Fetching APOD data for date:', date);
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const apodData = JSON.parse(data);
                    resolve(apodData);
                } catch (error) {
                    reject(new Error('Failed to parse APOD data'));
                }
            });
            
        }).on('error', (error) => {
            reject(new Error('Failed to fetch APOD data'));
        });
    });
}

// Export functions for testing
module.exports = {
    handler: exports.handler,
    fetchAPODData,
    processAPODData,
    checkForDuplicate,
    storeRawContent,
    getAPODForDate
};
