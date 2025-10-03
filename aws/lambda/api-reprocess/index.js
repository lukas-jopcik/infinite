/**
 * Infinite NASA APOD - API: POST /api/reprocess
 * Reprocesses APOD content for a specific date by triggering the content processor
 */

const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB();

const PROCESSOR_FUNCTION = process.env.PROCESSOR_FUNCTION;
const TABLE_NAME = process.env.TABLE_NAME;
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

exports.handler = async (event) => {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return response(400, { error: 'Invalid JSON in request body' });
    }

    const { date, generateSeoArticle, seoArticleConfig } = requestBody;

    if (!date) {
      return response(400, { error: 'Missing required parameter: date' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return response(400, { error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Check if date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return response(400, { error: 'Cannot reprocess future dates' });
    }

    // Check if content exists in DynamoDB
    const existingItem = await dynamodb.getItem({
      TableName: TABLE_NAME,
      Key: { date: { S: date } }
    }).promise();

    if (!existingItem.Item) {
      return response(404, { error: `No APOD content found for date: ${date}` });
    }

    // Fetch fresh NASA data for the date
    const nasaUrl = `${NASA_APOD_URL}?api_key=${NASA_API_KEY}&date=${date}&thumbs=true`;
    const nasaData = await fetchJson(nasaUrl);

    // Prepare payload for content processor
    const payload = {
      date: date,
      nasaData: {
        title: nasaData.title,
        explanation: nasaData.explanation,
        url: nasaData.url || nasaData.hdurl || nasaData.thumbnail_url,
        hdurl: nasaData.hdurl,
        media_type: nasaData.media_type,
        copyright: nasaData.copyright
      },
      options: {
        generateSeoArticle: generateSeoArticle || false,
        seoArticleConfig: seoArticleConfig || {}
      }
    };

    // Invoke content processor asynchronously
    const invokeResult = await lambda.invoke({
      FunctionName: PROCESSOR_FUNCTION,
      InvocationType: 'Event', // Async invocation
      Payload: JSON.stringify(payload)
    }).promise();

    console.log('Content processor invoked:', invokeResult);

    return response(202, {
      message: 'Reprocessing started',
      date: date,
      status: 'processing',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reprocess API error:', error);
    return response(500, { 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};

function response(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...(extraHeaders || {})
    },
    body: JSON.stringify(body)
  };
}

// Helper function to make HTTP requests
async function fetchJson(url) {
  const https = require('https');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Infinite-NASA-APOD/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${jsonData.error || 'Request failed'}`));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}
