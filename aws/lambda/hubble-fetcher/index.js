const AWS = require('aws-sdk');
const https = require('https');
const { URL } = require('url');
const { parseStringPromise } = require('xml2js');

const lambda = new AWS.Lambda();

const HUBBLE_RSS_URL = process.env.HUBBLE_RSS_URL || 'https://feeds.feedburner.com/esahubble/images/potw/';
const PROCESSOR_FUNCTION = process.env.PROCESSOR_FUNCTION;

function httpGetWithHeaders(targetUrl, acceptType = 'application/json', maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const options = {
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      method: 'GET',
      headers: {
        'User-Agent': 'InfiniteHubbleBot/1.0 (+https://infinite.example) Node.js',
        'Accept': acceptType,
        'Host': u.hostname,
        'Connection': 'close'
      }
    };
    const req = https.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        res.resume();
        return resolve(httpGetWithHeaders(nextUrl, acceptType, maxRedirects - 1));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseRssDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing RSS date:', dateString, error);
    return new Date().toISOString();
  }
}

function extractExcerpt(html, maxLength = 240) {
  // Remove HTML tags and get plain text
  const text = html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last complete word within the limit
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) { // If we can find a good break point
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

function extractImageFromDescription(description) {
  // Look for img src in the description
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : null;
}

function parseImageUrl(url) {
  // Clean up malformed URLs from RSS
  if (url.includes('https://www.esahubble.orghttps://')) {
    return url.replace('https://www.esahubble.orghttps://', 'https://');
  }
  return url;
}

function mapRssItemToHubbleItem(item) {
  const title = item.title?.[0] || '';
  const link = item.link?.[0] || '';
  const pubDate = parseRssDate(item.pubDate?.[0] || new Date().toISOString());
  const description = item.description?.[0] || '';
  const guid = item.guid?.[0] || '';
  const category = item.category || [];

  // Extract excerpt from description
  const excerpt = extractExcerpt(description);

  // Process media content (images)
  let image_main;
  let image_variants = [];

  if (item['media:content'] && item['media:content'].length > 0) {
    // Sort by resolution (width * height) to get the largest
    const sortedMedia = item['media:content']
      .map(media => ({
        url: parseImageUrl(media.$.url),
        type: media.$.type,
        width: media.$.width ? parseInt(media.$.width) : undefined,
        height: media.$.height ? parseInt(media.$.height) : undefined,
      }))
      .sort((a, b) => {
        const aRes = (a.width || 0) * (a.height || 0);
        const bRes = (b.width || 0) * (b.height || 0);
        return bRes - aRes;
      });

    image_main = sortedMedia[0]?.url;
    image_variants = sortedMedia.slice(1);
  } else if (item.enclosure && item.enclosure.length > 0) {
    // Fallback to enclosure
    const enclosure = item.enclosure[0];
    if (enclosure.$.type?.startsWith('image/')) {
      image_main = parseImageUrl(enclosure.$.url);
    }
  } else {
    // Fallback: try to extract image from description
    const imgFromDesc = extractImageFromDescription(description);
    if (imgFromDesc) {
      image_main = parseImageUrl(imgFromDesc);
    }
  }

  // Process credits and copyright
  const credit_raw = item['media:credit']?.[0];
  const copyright_raw = item['media:copyright']?.[0];
  const keywords = item['media:keywords']?.[0]?.split(',').map(k => k.trim()).filter(Boolean);

  return {
    guid,
    title,
    link,
    pubDate,
    description,
    excerpt,
    category,
    image_main,
    image_variants,
    credit_raw,
    copyright_raw,
    keywords,
  };
}

async function fetchHubbleRss() {
  try {
    console.log('🔭 Fetching Hubble RSS from:', HUBBLE_RSS_URL);
    const { data } = await httpGetWithHeaders(HUBBLE_RSS_URL, 'application/rss+xml, application/xml, text/xml');
    
    const result = await parseStringPromise(data);
    const items = result?.rss?.channel?.[0]?.item || [];
    
    console.log(`📡 Hubble RSS - Found ${items.length} items`);
    
    const hubbleItems = items.map(mapRssItemToHubbleItem);
    
    // Sort by publication date (newest first)
    hubbleItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return hubbleItems;
  } catch (error) {
    console.error('Error fetching Hubble RSS:', error);
    throw error;
  }
}

async function processHubbleItems(items) {
  if (!PROCESSOR_FUNCTION) {
    console.log('⚠️ No processor function configured, skipping processing');
    return items;
  }

  console.log(`🔄 Processing ${items.length} Hubble items...`);
  
  const processedItems = [];
  
  for (const item of items) {
    try {
      const params = {
        FunctionName: PROCESSOR_FUNCTION,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          type: 'hubble',
          data: item
        })
      };
      
      const result = await lambda.invoke(params).promise();
      const processed = JSON.parse(result.Payload);
      
      if (processed.success) {
        processedItems.push(processed.data);
        console.log(`✅ Processed Hubble item: ${item.title}`);
      } else {
        console.error(`❌ Failed to process Hubble item: ${item.title}`, processed.error);
        // Still include the original item
        processedItems.push(item);
      }
    } catch (error) {
      console.error(`❌ Error processing Hubble item: ${item.title}`, error);
      // Still include the original item
      processedItems.push(item);
    }
  }
  
  return processedItems;
}

exports.handler = async (event) => {
  console.log('🚀 Hubble Fetcher started');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Fetch Hubble RSS data
    const hubbleItems = await fetchHubbleRss();
    
    if (hubbleItems.length === 0) {
      console.log('⚠️ No Hubble items found');
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No Hubble items found',
          count: 0
        })
      };
    }
    
    // Process items (generate SEO content, etc.)
    const processedItems = await processHubbleItems(hubbleItems);
    
    console.log(`✅ Hubble Fetcher completed - ${processedItems.length} items processed`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Successfully processed ${processedItems.length} Hubble items`,
        count: processedItems.length,
        items: processedItems.slice(0, 5) // Return first 5 for logging
      })
    };
    
  } catch (error) {
    console.error('❌ Hubble Fetcher error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};
