const AWS = require('aws-sdk');
const https = require('https');
const { parseStringPromise } = require('xml2js');

const lambda = new AWS.Lambda();

const NASA_APOD_URL = process.env.NASA_APOD_URL || 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = process.env.NASA_API_KEY;
const RSS_FEED_URL = process.env.RSS_FEED_URL || 'https://apod.com/feed.rss';
const PROCESSOR_FUNCTION = process.env.PROCESSOR_FUNCTION;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else { reject(new Error(`HTTP ${res.statusCode}: ${data}`)); }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else { reject(new Error(`HTTP ${res.statusCode}`)); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  console.log('Starting NASA fetcher...', JSON.stringify(event));
  const mode = event?.mode || 'daily'; // 'daily' or 'rss'

  try {
    if (!PROCESSOR_FUNCTION) throw new Error('Missing PROCESSOR_FUNCTION');

    if (mode === 'daily') {
      if (!NASA_API_KEY) throw new Error('Missing NASA_API_KEY');
      const url = `${NASA_APOD_URL}?api_key=${NASA_API_KEY}&thumbs=true`;
      const apod = await fetchJson(url);

      const payload = {
        date: apod.date,
        nasaData: {
          title: apod.title,
          explanation: apod.explanation,
          url: apod.url || apod.hdurl || apod.thumbnail_url,
          hdurl: apod.hdurl,
          media_type: apod.media_type,
          copyright: apod.copyright
        }
      };

      await lambda.invoke({
        FunctionName: PROCESSOR_FUNCTION,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload)
      }).promise();

      return { statusCode: 200, body: JSON.stringify({ mode, date: apod.date }) };
    }

    if (mode === 'rss') {
      const rss = await fetchText(RSS_FEED_URL);
      const parsed = await parseStringPromise(rss, { explicitArray: false });
      const items = parsed.rss?.channel?.item || [];
      const list = Array.isArray(items) ? items : [items];

      const tasks = list.slice(0, 5).map(async (item) => {
        const dateStr = new Date(item.pubDate).toISOString().slice(0, 10);
        const imageUrl = (item.enclosure && item.enclosure.$ && item.enclosure.$.url) || item.link;
        const payload = {
          date: dateStr,
          nasaData: {
            title: item.title,
            explanation: item.description,
            url: imageUrl,
            media_type: 'image'
          }
        };
        await lambda.invoke({ FunctionName: PROCESSOR_FUNCTION, InvocationType: 'Event', Payload: JSON.stringify(payload) }).promise();
      });
      await Promise.all(tasks);
      return { statusCode: 200, body: JSON.stringify({ mode, count: tasks.length }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid mode' }) };
  } catch (e) {
    console.error('Fetcher error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
