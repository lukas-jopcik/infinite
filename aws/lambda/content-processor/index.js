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
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'd2ydyf9w4v170.cloudfront.net';
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

/**
 * Validate headline against quality requirements
 * @param {string} headline - Headline to validate
 * @param {string} language - 'en' or 'sk'
 * @returns {object} - {valid: boolean, reason?: string, issues: string[]}
 */
function validateHeadline(headline, language = 'sk') {
	const issues = [];
	
	// Banned superlatives - comprehensive list with case-insensitive matching
	const bannedWords = {
		en: /\b(amazing|stunning|unbelievable|incredible|breathtaking|spectacular|phenomenal|extraordinary|astonishing|astounding|remarkable|fabulous|magnificent|marvelous|sensational|mind-blowing|jaw-dropping)\b/gi,
		// Slovak - match root + any ending (no \b as it doesn't work with accented chars)
		sk: /([úÚ]žasn|[oO]hromuj|[nN]euveriteľn|[nN]eskutočn|[fF]antastick|[vV]eľkolep|[sS]enzačn|[pP]ôsobiv|[dD]ych\s*berc|[oO]húruj|[oO]bdivuhodn|[vV]ýnimoč|[mM]imoriadn)\w*/g
	};
	
	// Check for banned words
	const bannedPattern = bannedWords[language] || bannedWords.sk;
	const matches = headline.match(bannedPattern);
	if (matches && matches.length > 0) {
		issues.push(`Contains banned superlatives: ${matches.join(', ')}`);
	}
	
	// Word count validation (5-9 words for flexibility)
	const words = headline.trim().split(/\s+/).filter(Boolean);
	const wordCount = words.length;
	if (wordCount < 5) {
		issues.push(`Too short: ${wordCount} words (minimum 5)`);
	} else if (wordCount > 9) {
		issues.push(`Too long: ${wordCount} words (maximum 9)`);
	}
	
	// Check for repetitive words (same word used twice)
	const wordLower = words.map(w => w.toLowerCase().replace(/[?!.,]/g, ''));
	const duplicates = wordLower.filter((word, idx) => wordLower.indexOf(word) !== idx && word.length > 3);
	if (duplicates.length > 0) {
		issues.push(`Repetitive words: ${duplicates.join(', ')}`);
	}
	
	// Check minimum length
	if (headline.trim().length < 10) {
		issues.push('Headline too short (less than 10 characters)');
	}
	
	return {
		valid: issues.length === 0,
		issues: issues,
		wordCount: wordCount
	};
}

/**
 * Generate curiosity-driven headline for APOD article
 * @param {string} slovakTitle - Slovak title
 * @param {string} slovakArticle - Slovak article content
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<object>} - {slovak: string, english: string, attempts: number}
 */
async function generateCuriosityHeadline(slovakTitle, slovakArticle, maxRetries = 3) {
	const apiKey = await getOpenAIKey();
	if (!apiKey) throw new Error('OPENAI_API_KEY not set');
	
	// Truncate article for prompt (first 800 chars to save tokens)
	const articleExcerpt = slovakArticle ? slovakArticle.substring(0, 800) : '';
	
	const prompt = `Your task is to create a headline for an article describing a NASA photo.
First, carefully read the provided article text and identify its main idea or unique feature. Then generate 1 original headline.

Headline requirements:
- Length: 5–9 words (ideal: 6-7 words)
- Language: simple and clear, understandable even for readers without astronomy knowledge
- Style: engaging and naturally click-worthy, but not tabloid-like
- Tone: curiosity-driven - spark questions and interest
- Uniqueness: highlight the most interesting angle

Do NOT use these words (STRICTLY FORBIDDEN):
- English: amazing, stunning, unbelievable, incredible, breathtaking, spectacular, phenomenal, extraordinary, astonishing, astounding, remarkable, fabulous, magnificent, marvelous, sensational, mind-blowing, jaw-dropping
- Slovak: úžasný, ohromujúci, neuveriteľný, neskutočný, fantastický, veľkolepý, senzačný, pôsobivý, dych berúci, ohúrujúci, obdivuhodný, výnimočný, mimoriadny

Do NOT use:
- Repetitive words within the same headline
- Overly technical or complex terms

Goal: the headline should spark curiosity, encourage clicking, and directly relate to the article and photo.

Output format (IMPORTANT - exactly 2 lines):
Line 1: English headline
Line 2: Slovak translation

Article text:
${articleExcerpt}

Generate the headline now:`;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const payload = JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ 
						role: 'system', 
						content: 'You are a headline writer specializing in science communication. Create concise, curiosity-driven headlines that make readers want to learn more. Never use superlatives.' 
					},
					{ role: 'user', content: prompt }
				],
				temperature: 0.7,
				max_tokens: 100
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
			
			const result = await new Promise((resolve, reject) => {
				const req = https.request(options, (res) => {
					let data = '';
					res.on('data', (d) => (data += d));
					res.on('end', () => {
						if (res.statusCode >= 200 && res.statusCode < 300) {
							try {
								const json = JSON.parse(data);
								const content = json.choices?.[0]?.message?.content || '';
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
			
			// Parse result (expecting 2 lines: English, Slovak)
			const lines = result.trim().split('\n').filter(l => l.trim());
			if (lines.length < 2) {
				console.warn(`Attempt ${attempt}: Invalid format (expected 2 lines, got ${lines.length})`);
				if (attempt < maxRetries) continue;
				// Fallback to title
				return {
					slovak: slovakTitle,
					english: slovakTitle,
					attempts: attempt,
					fallback: true
				};
			}
			
			const english = lines[0].trim().replace(/^["']|["']$/g, '');
			const slovak = lines[1].trim().replace(/^["']|["']$/g, '');
			
			// Validate both headlines
			const validationEN = validateHeadline(english, 'en');
			const validationSK = validateHeadline(slovak, 'sk');
			
			if (validationEN.valid && validationSK.valid) {
				console.log(`✅ Headline generated successfully (attempt ${attempt})`);
				console.log(`   EN: ${english}`);
				console.log(`   SK: ${slovak}`);
				return {
					slovak: slovak,
					english: english,
					attempts: attempt,
					validation: { en: validationEN, sk: validationSK }
				};
			} else {
				// Log validation issues
				console.warn(`Attempt ${attempt}: Validation failed`);
				if (!validationEN.valid) {
					console.warn(`   EN issues: ${validationEN.issues.join(', ')}`);
				}
				if (!validationSK.valid) {
					console.warn(`   SK issues: ${validationSK.issues.join(', ')}`);
				}
				
				// If last attempt, return best effort or fallback
				if (attempt === maxRetries) {
					// Use the one with fewer issues
					if (validationSK.issues.length <= validationEN.issues.length) {
						console.warn('Using Slovak headline despite validation issues');
						return {
							slovak: slovak,
							english: english,
							attempts: attempt,
							validation: { en: validationEN, sk: validationSK },
							hasIssues: true
						};
					} else {
						console.warn('Falling back to original title');
						return {
							slovak: slovakTitle,
							english: slovakTitle,
							attempts: attempt,
							fallback: true
						};
					}
				}
				// Retry
				console.log(`   Retrying... (${attempt}/${maxRetries})`);
			}
		} catch (err) {
			console.error(`Attempt ${attempt} error:`, err.message);
			if (attempt === maxRetries) {
				console.warn('All attempts failed, using fallback');
				return {
					slovak: slovakTitle,
					english: slovakTitle,
					attempts: attempt,
					fallback: true,
					error: err.message
				};
			}
		}
	}
	
	// Fallback (should not reach here)
	return {
		slovak: slovakTitle,
		english: slovakTitle,
		attempts: maxRetries,
		fallback: true
	};
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

/**
 * Generate comprehensive SEO article using the new template
 * @param {string} topic - Main topic
 * @param {string} keywords - Main keywords
 * @param {string} targetAudience - Target audience
 * @param {string} nasaTitle - Original NASA title
 * @param {string} nasaExplanation - Original NASA explanation
 * @returns {Promise<object>} - {metaTitle, metaDescription, article, faq, internalLinks, externalRefs}
 */
async function generateSeoArticle(topic, keywords, targetAudience, nasaTitle, nasaExplanation) {
	const apiKey = await getOpenAIKey();
	if (!apiKey) throw new Error('OPENAI_API_KEY not set');
	
	const prompt = `Si expert SEO copywriter špecializujúci sa na astronómiu a vesmírnu vedu. Tvoja úloha je napísať komplexný, dlhý článok optimalizovaný pre Google vyhľadávanie a Google Discover.

**Téma:** ${topic}
**Hlavné kľúčové slová:** ${keywords}
**Jazyk:** Slovenčina (prirodzený, ľudský, konverzačný tón, nie robotický)
**Cieľová skupina:** ${targetAudience}

**Požiadavky na obsah:**
- Minimálna dĺžka: 2000 slov (môže byť dlhší ak je potrebný na pokrytie témy)
- Jasná hierarchia: H1 (nadpis), H2 (hlavné sekcie), H3 (podsekcie)
- Pútavý úvod, ktorý zaujme čitateľa a vysvetlí, čo sa naučí
- Komplexný záver s kľúčovými poznatkami a praktickými radami
- Prirodzená integrácia kľúčových slov bez spamovania (1-2% hustota kľúčových slov)
- FAQ sekcia s aspoň 6 bežnými otázkami a detailnými odpoveďami
- Krátke odseky (max 2-3 vety)
- Zoznamy s odrážkami a číslovanými zoznamami pre ľahké skenovanie
- Tučné formátovanie pre dôležité frázy a kľúčové termíny

**Štandardy kvality obsahu:**
- Presnosť: Všetky astronomické fakty musia byť vedecky presné
- Zapojenie: Používaj príbehy, analógie a relatívne príklady
- Praktická hodnota: Zahrň praktické tipy a návody krok za krokom
- Vizuálny príťažlivosť: Navrhni, kde by obrázky, diagramy alebo grafy zvýšili pochopenie

**Kontext z NASA APOD:**
Nadpis (EN): ${nasaTitle}
Opis (EN): ${nasaExplanation}

**Výstupný formát (presne v tomto poradí):**

## Meta Title
[Max 60 znakov, obsahuje primárne kľúčové slovo]

## Meta Description
[Max 160 znakov, pútavý a opisný]

## Úvod
[Pútavý úvod, ktorý zaujme čitateľa]

## Hlavný článok
[Kompletný článok so všetkými sekciami, H2 a H3 nadpismi]

## FAQ
[6+ otázok a odpovedí]

## Záver
[Kľúčové poznatky a praktické rady]

## Vnútorné odkazy
[Zoznam súvisiacich článkov na prepojenie]

## Externé referencie
[Autoritatívne zdroje pre citácie]

Napíš článok teraz:`;

	const payload = JSON.stringify({
		model: 'gpt-4o',
		messages: [
			{ role: 'system', content: 'Si expert SEO copywriter pre astronómiu v slovenčine. Všetky astronomické fakty musia byť vedecky presné.' },
			{ role: 'user', content: prompt }
		],
		temperature: 0.7,
		max_tokens: 4000
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
						
						// Parse the structured response
						const result = parseSeoArticleResponse(content);
						resolve(result);
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

/**
 * Parse the structured SEO article response
 * @param {string} content - Raw response content
 * @returns {object} - Parsed article structure
 */
function parseSeoArticleResponse(content) {
	const sections = {
		metaTitle: '',
		metaDescription: '',
		intro: '',
		article: '',
		faq: '',
		conclusion: '',
		internalLinks: [],
		externalRefs: []
	};

	// Split content by section headers
	const lines = content.split('\n');
	let currentSection = '';
	let currentContent = [];

	for (const line of lines) {
		const trimmedLine = line.trim();
		
		if (trimmedLine.startsWith('## Meta Title')) {
			currentSection = 'metaTitle';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Meta Description')) {
			currentSection = 'metaDescription';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Úvod')) {
			currentSection = 'intro';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Hlavný článok')) {
			currentSection = 'article';
			currentContent = [];
		} else if (trimmedLine.startsWith('## FAQ')) {
			currentSection = 'faq';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Záver')) {
			currentSection = 'conclusion';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Vnútorné odkazy')) {
			currentSection = 'internalLinks';
			currentContent = [];
		} else if (trimmedLine.startsWith('## Externé referencie')) {
			currentSection = 'externalRefs';
			currentContent = [];
		} else if (trimmedLine && !trimmedLine.startsWith('##')) {
			currentContent.push(line);
		}

		// Store content when section changes
		if (currentSection && currentContent.length > 0) {
			const contentStr = currentContent.join('\n').trim();
			
			switch (currentSection) {
				case 'metaTitle':
					sections.metaTitle = contentStr;
					break;
				case 'metaDescription':
					sections.metaDescription = contentStr;
					break;
				case 'intro':
					sections.intro = contentStr;
					break;
				case 'article':
					sections.article = contentStr;
					break;
				case 'faq':
					sections.faq = contentStr;
					break;
				case 'conclusion':
					sections.conclusion = contentStr;
					break;
				case 'internalLinks':
					sections.internalLinks = contentStr.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/^[-*]\s*/, ''));
					break;
				case 'externalRefs':
					sections.externalRefs = contentStr.split('\n').filter(line => line.trim()).map(line => line.trim().replace(/^[-*]\s*/, ''));
					break;
			}
		}
	}

	return sections;
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
        const options = event.options || {};
        const processedContent = await processAPODContent(date, nasaData, options);

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
async function processAPODContent(date, nasaData, options = {}) {
    console.log(`📝 Processing content for date: ${date}`);
    
    // Check if we should generate comprehensive SEO article
    const generateSeoArticle = options.generateSeoArticle || false;
    const seoArticleConfig = options.seoArticleConfig || {};
    
	let slovakTitle = `Slovenský názov: ${nasaData.title}`;
    let slovakArticle;
	let seoKeywords = ['astronómia', 'vesmír', 'NASA', 'APOD', 'slovensko'];
    
    // SEO article data
    let seoArticleData = null;

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

		// Generate comprehensive SEO article if requested
		if (generateSeoArticle && seoArticleConfig.topic && seoArticleConfig.keywords && seoArticleConfig.targetAudience) {
			try {
				console.log('🎯 Generating comprehensive SEO article...');
				seoArticleData = await generateSeoArticle(
					seoArticleConfig.topic,
					seoArticleConfig.keywords,
					seoArticleConfig.targetAudience,
					nasaData.title,
					nasaData.explanation
				);
				console.log('✅ SEO article generated successfully');
			} catch (e) {
				console.warn('SEO article generation failed:', e && e.message ? e.message : e);
			}
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

    // Generate curiosity-driven headline
    let headline = slovakTitle;
    let headlineEN = nasaData.title;
    try {
        console.log('🎯 Generating curiosity-driven headline...');
        const headlineResult = await generateCuriosityHeadline(slovakTitle, slovakArticle, 3);
        headline = headlineResult.slovak;
        headlineEN = headlineResult.english;
        
        if (headlineResult.fallback) {
            console.warn('⚠️  Using fallback headline (generation failed)');
        } else if (headlineResult.hasIssues) {
            console.warn(`⚠️  Headline has validation issues but was used (attempts: ${headlineResult.attempts})`);
        } else {
            console.log(`✅ Headline generated successfully (attempts: ${headlineResult.attempts})`);
        }
    } catch (err) {
        console.warn('Headline generation error, using fallback:', err.message);
    }

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
        headline: headline,           // New single curiosity-driven headline
        headlineEN: headlineEN,       // English version for reference
        seoKeywords: seoKeywords,
        contentQuality: quality,
        qualityIssues: issues,
        articleLengthChars: lengthChars,
        articleLengthWords: lengthWords,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        // SEO article data (if generated)
        seoArticle: seoArticleData
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

        // TEMPORARY FIX: Force overwrite existing images to fix image mismatches
        // TODO: Revert this change after fixing the Veil Nebula image issue
        try {
            await s3.headObject({ Bucket: S3_BUCKET_NAME, Key: key }).promise();
            console.log(`🔄 Image already exists, but forcing overwrite: ${key}`);
            // Continue to upload instead of skipping
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
        url: `https://${CLOUDFRONT_DOMAIN}/${key}`,
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
