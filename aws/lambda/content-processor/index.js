/**
 * Infinite NASA APOD Content Processor Lambda Function
 * 
 * This function processes NASA APOD data and generates Slovak content
 * using AI services. It stores the enhanced content in DynamoDB and
 * caches images in S3.
 * 
 * @author Developer Agent
 * @version 1.0
 * @date 2024-12-19
 */

const AWS = require('aws-sdk');
const https = require('https');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Environment variables
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'infinite-nasa-apod-content';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'infinite-nasa-apod-images';
const REGION = process.env.REGION || 'eu-central-1';
const OPENAI_SECRET_NAME = process.env.OPENAI_SECRET_NAME || process.env.OPENAI_SECRET_ID;
const OPENAI_ORG = process.env.OPENAI_ORG || process.env.OPENAI_ORGANIZATION;
const OPENAI_PROJECT = process.env.OPENAI_PROJECT || process.env.OPENAI_PROJECT_ID;

// Secrets Manager client for fetching OpenAI API key when stored as a secret
const secretsManager = new AWS.SecretsManager({ region: REGION });
let CACHED_OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN || null;

async function getOpenAIKey() {
    // Prefer cached env or previously fetched key
    if (CACHED_OPENAI_KEY && typeof CACHED_OPENAI_KEY === 'string') {
        try { console.log('Secrets: using cached OPENAI key (length:', CACHED_OPENAI_KEY.length, ')'); } catch (_) {}
        return CACHED_OPENAI_KEY;
    }
    // If no secret configured, return null and let caller error
    if (!OPENAI_SECRET_NAME) return null;
    try {
        console.log('Secrets: fetching from Secrets Manager:', OPENAI_SECRET_NAME);
        const res = await secretsManager.getSecretValue({ SecretId: OPENAI_SECRET_NAME }).promise();
        let val = '';
        if (res.SecretString) {
            // Secret may be either a raw string token or a JSON containing OPENAI_API_KEY
            try {
                const parsed = JSON.parse(res.SecretString);
                val = parsed.OPENAI_API_KEY || parsed.openai_api_key || parsed.token || '';
                if (!val && typeof parsed === 'string') val = parsed;
            } catch (_) {
                val = res.SecretString;
            }
        } else if (res.SecretBinary) {
            val = Buffer.from(res.SecretBinary, 'base64').toString('utf8');
        }
        CACHED_OPENAI_KEY = (val || '').trim() || null;
        try { console.log('Secrets: fetched OPENAI key (length:', CACHED_OPENAI_KEY ? CACHED_OPENAI_KEY.length : 0, ')'); } catch (_) {}
        return CACHED_OPENAI_KEY;
    } catch (e) {
        console.warn('SecretsManager getSecretValue failed:', e && e.message ? e.message : e);
        return null;
    }
}

async function callOpenAI(prompt) {
    const apiKey = await getOpenAIKey();
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');
    const payload = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Si slovenský popularizátor vedy. Píš jasne, vecne, zaujímavo a odborne správne v slovenčine.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 900
    });
    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: (function() {
            const h = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            if (OPENAI_ORG) h['OpenAI-Organization'] = OPENAI_ORG;
            if (OPENAI_PROJECT) h['OpenAI-Project'] = OPENAI_PROJECT;
            return h;
        })()
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (d) => (data += d));
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content ? json.choices[0].message.content : '';
                        resolve(content);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`OpenAI HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function generateSlovakTitle(englishTitle, englishExplanation) {
	const apiKey = await getOpenAIKey();
	if (!apiKey) throw new Error('OPENAI_API_KEY not set');
	const titlePrompt = [
		'Prelož a lokalizuj nasledujúci nadpis do slovenčiny.',
		'Buď stručný, zrozumiteľný, prirodzený. Nevracaj nič iné ako samotný nadpis bez úvodzoviek.',
		'',
		`Nadpis (EN): ${englishTitle}`,
		englishExplanation ? `Kontext: ${englishExplanation}` : ''
	].filter(Boolean).join('\n');
	const payload = JSON.stringify({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Si štylista a prekladateľ nadpisov do slovenčiny. Vráť iba finálny nadpis.' },
			{ role: 'user', content: titlePrompt }
		],
		temperature: 0.4,
		max_tokens: 60
	});
	const options = {
		hostname: 'api.openai.com',
		path: '/v1/chat/completions',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		}
	};
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let data = '';
			res.on('data', (d) => (data += d));
			res.on('end', () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					try {
						const json = JSON.parse(data);
						const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content ? json.choices[0].message.content.trim() : '';
						resolve(content.replace(/^"|"$/g, ''));
					} catch (e) {
						reject(e);
					}
				} else {
					reject(new Error(`OpenAI HTTP ${res.statusCode}: ${data}`));
				}
			});
		});
		req.on('error', reject);
		req.write(payload);
		req.end();
	});
}

async function generateSeoKeywords(slovakTitle, slovakArticle) {
	const apiKey = await getOpenAIKey();
	if (!apiKey) throw new Error('OPENAI_API_KEY not set');
	const prompt = [
		'Z textu nižšie vyber 8 až 12 najdôležitejších slovenských SEO kľúčových slov alebo krátkych fráz.',
		'Vráť výstup ako JSON pole reťazcov, bez ďalšieho textu. Nepoužívaj úvodný ani záverečný komentár.',
		'',
		slovakTitle ? `Nadpis: ${slovakTitle}` : '',
		'Článok:',
		slovakArticle || ''
	].filter(Boolean).join('\n');
	const payload = JSON.stringify({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'Si SEO špecialista pre slovenčinu. Vráť iba platné JSON pole reťazcov.' },
			{ role: 'user', content: prompt }
		],
		temperature: 0.3,
		max_tokens: 200
	});
	const options = {
		hostname: 'api.openai.com',
		path: '/v1/chat/completions',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		}
	};
	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			let data = '';
			res.on('data', (d) => (data += d));
			res.on('end', () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					try {
						const json = JSON.parse(data);
						let content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content ? json.choices[0].message.content.trim() : '';
						// Strip markdown code fences if present
						const fenceMatch = content.match(/```[a-zA-Z]*\s*([\s\S]*?)```/m);
						if (fenceMatch && fenceMatch[1]) {
							content = fenceMatch[1].trim();
						}
						// If content contains a JSON array substring, try to extract it
						if (content.indexOf('[') !== -1 && content.lastIndexOf(']') !== -1) {
							const start = content.indexOf('[');
							const end = content.lastIndexOf(']') + 1;
							content = content.slice(start, end);
						}
						let keywords;
						try {
							keywords = JSON.parse(content);
						} catch (_) {
							// Fallback: split by comma
							keywords = content
								.replace(/\n/g, ',')
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean);
						}
						if (!Array.isArray(keywords)) keywords = [];
						// Normalize, deduplicate, limit 12
						const seen = new Set();
						const cleaned = [];
						for (const k of keywords) {
							if (typeof k !== 'string') continue;
							const v = k
								.replace(/^\"|\"$/g, '')
								.replace(/`/g, '')
								.replace(/^\[|\]$/g, '')
								.trim();
							if (!v) continue;
							const lower = v.toLowerCase();
							if (seen.has(lower)) continue;
							seen.add(lower);
							cleaned.push(v);
							if (cleaned.length >= 12) break;
						}
						resolve(cleaned);
					} catch (e) {
						reject(e);
					}
				} else {
					reject(new Error(`OpenAI HTTP ${res.statusCode}: ${data}`));
				}
			});
		});
		req.on('error', reject);
		req.write(payload);
		req.end();
	});
}

async function ensureCompleteArticle(slovakArticle, slovakTitle) {
	try {
		const text = (slovakArticle || '').trim();
		if (!text) return slovakArticle;
		const endsComplete = /[\.!?…]$/.test(text);
		const wordCount = text.split(/\s+/).filter(Boolean).length;
		if (endsComplete && wordCount >= 300) return text;

		// Use last ~600 chars as context to continue and conclude
		const contextTail = text.slice(Math.max(0, text.length - 600));
		const prompt = [
			'Pokračuj a DOKONČI nasledujúci článok v slovenčine stručným záverom (1–2 odseky).',
			'Neprepisuj úvod ani predchádzajúce časti, žiadne nadpisy, žiadne poznámky o AI.',
			'',
			`Nadpis: ${slovakTitle || ''}`,
			'Posledná časť článku:',
			contextTail
		].join('\n');
		const continuation = await callOpenAI(prompt);
		const add = (continuation || '').trim();
		if (!add) return text;
		return `${text}\n\n${add}`.trim();
	} catch (_) {
		return slovakArticle;
	}
}

/**
 * Main Lambda handler function
 * 
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} Response object
 */
exports.handler = async (event, context) => {
    console.log('🚀 Starting APOD content processing...');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the event
        const { date, nasaData } = event;
        
        if (!date || !nasaData) {
            throw new Error('Missing required parameters: date and nasaData');
        }
        
        // Process the NASA APOD data
        const processedContent = await processAPODContent(date, nasaData);

        // Cache image in S3 if it's an image; enrich content with cached info
        if (nasaData.media_type === 'image') {
            try {
                const cacheInfo = await cacheImageInS3(nasaData.url, date);
                if (cacheInfo) {
                    processedContent.cachedImage = cacheInfo;
                }
            } catch (e) {
                console.warn('Image cache step failed:', e && e.message ? e.message : e);
            }
        }

        // Store in DynamoDB (after enriching cached image info)
        await storeContentInDynamoDB(processedContent);
        
        console.log('✅ Content processing completed successfully');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Content processed successfully',
                date: date,
                contentId: processedContent.date,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('❌ Error processing content:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Content processing failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

/**
 * Process NASA APOD content and generate Slovak version
 * 
 * @param {string} date - APOD date in YYYY-MM-DD format
 * @param {Object} nasaData - NASA APOD data
 * @returns {Object} Processed content object
 */
async function processAPODContent(date, nasaData) {
    console.log(`📝 Processing content for date: ${date}`);
    
	let slovakTitle = `Slovenský názov: ${nasaData.title}`;
    let slovakArticle;
	let seoKeywords = ['astronómia', 'vesmír', 'NASA', 'APOD', 'slovensko'];

    // Try AI generation first; fallback to basic expansion if not available
    try {
        const aiPrompt = [
            'Napíš pútavý, odborný a čitateľný článok v slovenčine (~700–900 slov) o téme APOD nižšie.',
            'Zachovaj vedeckú presnosť, vysvetli súvislosti a pridaj kontext pre laické publikum.',
            'Na záver nepridávaj žiadne poznámky o tom, že si AI.',
            '',
            `Nadpis (EN): ${nasaData.title}`,
            `Opis (EN): ${nasaData.explanation}`
        ].join('\n');
        const aiText = await callOpenAI(aiPrompt);
        slovakArticle = (aiText || '').trim();
		if (!slovakArticle) throw new Error('Empty AI response');
		// Try to generate a proper Slovak title too (non-fatal if it fails)
		try {
			slovakTitle = await generateSlovakTitle(nasaData.title, nasaData.explanation);
			if (!slovakTitle) throw new Error('Empty Slovak title');
		} catch (e) {
			console.warn('Slovak title generation failed, using fallback:', e && e.message ? e.message : e);
			slovakTitle = `Slovenský názov: ${nasaData.title}`;
		}
		// Try to generate Slovak SEO keywords (non-fatal)
		try {
			const aiKeywords = await generateSeoKeywords(slovakTitle, slovakArticle);
			if (aiKeywords && aiKeywords.length >= 6) {
				seoKeywords = aiKeywords;
			}
		} catch (e) {
			console.warn('SEO keyword generation failed, using fallback:', e && e.message ? e.message : e);
		}

		// Ensure the article ends with a complete conclusion
		slovakArticle = await ensureCompleteArticle(slovakArticle, slovakTitle);
    } catch (err) {
        console.warn('AI generation failed or not configured, using fallback:', err && err.message ? err.message : err);
        slovakArticle = `Toto je rozšírený článok o ${nasaData.title}. Pôvodný popis: ${nasaData.explanation}`;
    }
    
    // Basic quality checks
    const issues = [];
    const lengthChars = (slovakArticle || '').length;
    const lengthWords = (slovakArticle || '').split(/\s+/).filter(Boolean).length;
    if (lengthWords < 300) issues.push('short_article');
    if (lengthWords > 1200) issues.push('too_long');
    // Remove any leftover disclaimers
    const disclaimerRegex = /(ako\s+AI|som\s+AI|ako\s+umelá\s+inteligencia)/i;
    if (disclaimerRegex.test(slovakArticle || '')) {
        issues.push('ai_disclaimer_present');
        slovakArticle = (slovakArticle || '').replace(disclaimerRegex, '').trim();
    }
    // Heuristic: article should contain some Slovak diacritics
    const hasDiacritics = /[áäčďéíľĺňóôŕřšťúýžÁÄČĎÉÍĽĹŇÓÔŔŘŠŤÚÝŽ]/.test(slovakArticle || '');
    if (!hasDiacritics) issues.push('likely_not_slovak');
    // Score
    let quality = 100;
    for (const i of issues) {
        if (i === 'short_article') quality -= 20;
        else if (i === 'too_long') quality -= 10;
        else if (i === 'ai_disclaimer_present') quality -= 10;
        else if (i === 'likely_not_slovak') quality -= 25;
    }
    if (quality < 0) quality = 0;

    const processedContent = {
        pk: 'LATEST',
        date: date,
        originalTitle: nasaData.title,
        originalExplanation: nasaData.explanation,
        imageUrl: nasaData.url,
        hdImageUrl: nasaData.hdurl || nasaData.url,
        mediaType: nasaData.media_type,
        copyright: nasaData.copyright || 'NASA',
        slovakTitle: slovakTitle,
        slovakArticle: slovakArticle,
        seoKeywords: seoKeywords,
        contentQuality: quality,
        qualityIssues: issues,
        articleLengthChars: lengthChars,
        articleLengthWords: lengthWords,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    console.log('✅ Content processing completed');
    return processedContent;
}

/**
 * Store processed content in DynamoDB
 * 
 * @param {Object} content - Processed content object
 */
async function storeContentInDynamoDB(content) {
    console.log(`💾 Storing content in DynamoDB: ${content.date}`);
    
    const params = {
        TableName: DYNAMODB_TABLE_NAME,
        Item: content
    };
    
    try {
        await dynamodb.put(params).promise();
        console.log('✅ Content stored in DynamoDB successfully');
    } catch (error) {
        console.error('❌ Error storing content in DynamoDB:', error);
        throw error;
    }
}

/**
 * Cache image in S3 bucket
 * 
 * @param {string} imageUrl - URL of the image to cache
 * @param {string} date - APOD date for naming
 */
async function cacheImageInS3(imageUrl, date) {
    console.log(`🖼️ Caching image in S3: ${imageUrl}`);

    try {
        // Download image from NASA with limited retries and capture content-type
        const { data: imageData, contentType } = await downloadImageWithMeta(imageUrl);

        // Determine extension
        const ext = guessExtension(contentType, imageUrl);
        const key = `images/${date}${ext}`;

        // If already exists, skip upload and return info
        try {
            await s3.headObject({ Bucket: S3_BUCKET_NAME, Key: key }).promise();
            console.log(`ℹ️ Image already cached: ${key}`);
            return buildCacheInfo(S3_BUCKET_NAME, key, contentType || 'application/octet-stream', imageUrl);
        } catch (_) {
            // Not found -> proceed to upload
        }

        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: imageData,
            ContentType: contentType || 'application/octet-stream',
            CacheControl: 'public, max-age=86400, s-maxage=86400, immutable',
            Metadata: {
                'original-url': imageUrl,
                'apod-date': date,
                'cached-at': new Date().toISOString()
            }
        };

        await s3.upload(uploadParams).promise();
        console.log(`✅ Image cached in S3: ${key}`);
        return buildCacheInfo(S3_BUCKET_NAME, key, contentType || 'application/octet-stream', imageUrl);

    } catch (error) {
        console.error('❌ Error caching image in S3:', error);
        // Don't throw error - image caching is not critical
        return undefined;
    }
}

/**
 * Download image from URL
 * 
 * @param {string} url - Image URL
 * @returns {Promise<Buffer>} Image data
 */
function downloadImageWithMeta(url) {
    const maxAttempts = 3;
    const attempt = (n) => new Promise((resolve, reject) => {
        const req = https.get(url, (response) => {
            if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Follow one redirect per attempt
                response.resume();
                return resolve(attempt(n));
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download image: ${response.statusCode}`));
            }
            const contentType = response.headers['content-type'];
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve({ data: Buffer.concat(chunks), contentType }));
            response.on('error', reject);
        });
        req.on('error', reject);
    }).catch((err) => {
        if (n < maxAttempts) {
            const backoff = 200 * n;
            return new Promise((r) => setTimeout(r, backoff)).then(() => attempt(n + 1));
        }
        throw err;
    });
    return attempt(1);
}

function guessExtension(contentType, url) {
    if (contentType) {
        if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
        if (contentType.includes('png')) return '.png';
        if (contentType.includes('gif')) return '.gif';
        if (contentType.includes('webp')) return '.webp';
        if (contentType.includes('tiff')) return '.tif';
    }
    // Fallback from URL path
    try {
        const lower = String(url).toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return '.jpg';
        if (lower.endsWith('.png')) return '.png';
        if (lower.endsWith('.gif')) return '.gif';
        if (lower.endsWith('.webp')) return '.webp';
        if (lower.endsWith('.tif') || lower.endsWith('.tiff')) return '.tif';
    } catch (_) {}
    return '.jpg';
}

function buildCacheInfo(bucket, key, contentType, originalUrl) {
    return {
        bucket,
        key,
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
        contentType,
        originalUrl
    };
}

/**
 * Test function for local development
 */
async function testFunction() {
    const testEvent = {
        date: '2024-12-19',
        nasaData: {
            title: 'Test APOD Image',
            explanation: 'This is a test explanation',
            url: 'https://apod.nasa.gov/apod/image/2412/test.jpg',
            media_type: 'image',
            copyright: 'NASA'
        }
    };
    
    const result = await exports.handler(testEvent, {});
    console.log('Test result:', result);
}

// Export for testing
module.exports = {
    handler: exports.handler,
    processAPODContent,
    storeContentInDynamoDB,
    cacheImageInS3,
    testFunction
};
