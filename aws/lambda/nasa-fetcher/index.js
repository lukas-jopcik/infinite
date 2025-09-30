const AWS = require('aws-sdk');
const https = require('https');
const { URL } = require('url');
const { parseStringPromise } = require('xml2js');

const lambda = new AWS.Lambda();

const NASA_APOD_URL = process.env.NASA_APOD_URL || 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = process.env.NASA_API_KEY;
const RSS_FEED_URL = process.env.RSS_FEED_URL || 'https://apod.com/feed.rss';
const PROCESSOR_FUNCTION = process.env.PROCESSOR_FUNCTION;

function httpGetWithHeaders(targetUrl, acceptType = 'application/json', maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const options = {
      hostname: u.hostname,
      path: u.pathname + (u.search || ''),
      method: 'GET',
      headers: {
        'User-Agent': 'InfiniteAPODBot/1.0 (+https://infinite.example) Node.js',
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

async function fetchJson(url) {
  const { data } = await httpGetWithHeaders(url, 'application/json, text/json;q=0.9, */*;q=0.8');
  return JSON.parse(data);
}

async function fetchText(url) {
  const { data } = await httpGetWithHeaders(url, 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1');
  return data;
}

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImgSrc(html) {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"'>\s]+)["']/i);
  return match ? match[1] : undefined;
}

function toIsoDateFromRss(pubDate) {
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

exports.handler = async (event) => {
  console.log('Starting NASA fetcher...', JSON.stringify(event));
  const mode = (event && event.mode) ? event.mode : 'daily';

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
        InvocationType: 'Event',
        Payload: JSON.stringify(payload)
      }).promise();

      return { statusCode: 200, body: JSON.stringify({ mode, date: apod.date }) };
    }

    if (mode === 'byDate' || mode === 'reprocess') {
      if (!NASA_API_KEY) throw new Error('Missing NASA_API_KEY');
      const date = event && event.date ? String(event.date) : undefined;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or missing date. Use YYYY-MM-DD.' }) };
      }
      const url = `${NASA_APOD_URL}?api_key=${NASA_API_KEY}&date=${encodeURIComponent(date)}&thumbs=true`;
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
      await lambda.invoke({ FunctionName: PROCESSOR_FUNCTION, InvocationType: 'Event', Payload: JSON.stringify(payload) }).promise();
      return { statusCode: 200, body: JSON.stringify({ mode: 'byDate', date: apod.date }) };
    }

    if (mode === 'rss') {
      let rssRaw;
      try {
        rssRaw = await fetchText(RSS_FEED_URL);
      } catch (e) {
        console.warn('Primary RSS failed, falling back to apod.nasa.gov/apod.rss', e.message);
        rssRaw = await fetchText('https://apod.nasa.gov/apod.rss');
      }
      const parsed = await parseStringPromise(rssRaw, { explicitArray: false });
      const items = parsed?.rss?.channel?.item || [];
      const list = Array.isArray(items) ? items : [items];

      const max = (event && Number(event.limit)) ? Math.max(1, Number(event.limit)) : list.length;
      const selected = list.slice(0, max);

      for (const item of selected) {
        const dateStr = toIsoDateFromRss(item.pubDate) || undefined;
        const html = (item['content:encoded'] || item.content || '');
        const enclosureUrl = item.enclosure && item.enclosure.$ && item.enclosure.$.url ? item.enclosure.$.url : undefined;
        const imgFromHtml = extractFirstImgSrc(html);
        const imageUrl = enclosureUrl || imgFromHtml || item.link;
        const explanation = stripHtml(html) || stripHtml(item.description) || '';

        const payload = {
          date: dateStr,
          nasaData: {
            title: (item.title && String(item.title)) || '',
            explanation,
            url: imageUrl,
            media_type: 'image'
          }
        };
        await lambda.invoke({ FunctionName: PROCESSOR_FUNCTION, InvocationType: 'Event', Payload: JSON.stringify(payload) }).promise();
      }
      return { statusCode: 200, body: JSON.stringify({ mode, count: selected.length }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid mode' }) };
  } catch (e) {
    console.error('Fetcher error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
