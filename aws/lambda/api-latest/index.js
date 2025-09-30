/**
 * Infinite NASA APOD - API: GET /api/latest
 * Returns latest APOD items with Slovak articles from DynamoDB via GSI.
 */

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB();

const TABLE_NAME = process.env.TABLE_NAME;
const INDEX_NAME = process.env.INDEX_NAME || 'gsi_latest';
const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_LIMIT || '5', 10);

exports.handler = async (event) => {
  try {
    const params = event && event.queryStringParameters ? event.queryStringParameters : {};
    const limitParam = parseInt(params.limit || DEFAULT_LIMIT, 10);
    const limit = isNaN(limitParam) ? DEFAULT_LIMIT : Math.max(1, Math.min(100, limitParam));
    const dateFilter = params.date && typeof params.date === 'string' ? params.date : undefined;

    let items = [];
    if (dateFilter) {
      // Fetch a single item by date directly from the base table
      const gr = await dynamodb.getItem({
        TableName: TABLE_NAME,
        Key: { date: { S: dateFilter } }
      }).promise();
      items = gr && gr.Item ? [marshalItem(gr.Item)] : [];
    } else {
      const q = {
        TableName: TABLE_NAME,
        IndexName: INDEX_NAME,
        KeyConditionExpression: '#pk = :p',
        ExpressionAttributeNames: { '#pk': 'pk' },
        ExpressionAttributeValues: { ':p': { S: 'LATEST' } },
        // Latest first by sort key `date`
        ScanIndexForward: false,
        Limit: limit
      };
      const res = await dynamodb.query(q).promise();
      items = (res.Items || []).map((it) => marshalItem(it));
    }

    // Compute ETag and handle conditional requests
    const etag = etagForItems(items) || undefined;
    const hdrs = (event && event.headers) ? event.headers : {};
    const ifNoneMatch = hdrs['if-none-match'] || hdrs['If-None-Match'];
    if (etag && ifNoneMatch && ifNoneMatch === etag) {
      return response(304, '', {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'ETag': etag
      });
    }

    // Basic caching: allow clients/CDNs to cache for 5 minutes
    return response(200, { items, count: items.length }, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'ETag': etag
    });
  } catch (err) {
    console.error('API error', err);
    return response(500, { error: 'Internal Server Error' });
  }
};

function response(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...(extraHeaders || {})
    },
    body: JSON.stringify(body)
  };
}

function etagForItems(items) {
  try {
    const dates = (items || []).map((i) => i.date).filter(Boolean).sort().join(',');
    let hash = 0;
    for (let i = 0; i < dates.length; i++) {
      hash = ((hash << 5) - hash) + dates.charCodeAt(i);
      hash |= 0;
    }
    return `W/"${Math.abs(hash)}-${items.length}"`;
  } catch (_) {
    return undefined;
  }
}

function marshalItem(it) {
  // it is AttributeValue map from low-level DynamoDB client
  return {
    date: it.date?.S,
    titleSk: it.slovakTitle?.S,
    imageUrl: it.imageUrl?.S,
    hdImageUrl: it.hdImageUrl?.S,
    cachedImage: it.cachedImage?.M ? {
      bucket: it.cachedImage.M.bucket?.S,
      key: it.cachedImage.M.key?.S,
      url: it.cachedImage.M.url?.S,
      contentType: it.cachedImage.M.contentType?.S,
      originalUrl: it.cachedImage.M.originalUrl?.S
    } : undefined,
    mediaType: it.mediaType?.S,
    seoKeywords: Array.isArray(it.seoKeywords?.L) ? it.seoKeywords.L.map((x) => x.S).filter(Boolean) : [],
    slovakArticle: it.slovakArticle?.S,
    contentQuality: it.contentQuality?.N ? Number(it.contentQuality.N) : undefined
  };
}


