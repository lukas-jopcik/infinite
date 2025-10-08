const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Try to import Sharp, but handle gracefully if it fails
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.warn('Sharp not available, image processing will be limited:', error.message);
    sharp = null;
}

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbRaw = new AWS.DynamoDB();
const s3 = new AWS.S3();

// Configuration
const REGION = process.env.REGION || 'eu-central-1';
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const RAW_CONTENT_TABLE = process.env.DYNAMODB_RAW_CONTENT_TABLE || 'InfiniteRawContent-dev';
const ARTICLES_TABLE = process.env.DYNAMODB_ARTICLES_TABLE || 'InfiniteArticles-dev';
const S3_IMAGES_BUCKET = process.env.S3_IMAGES_BUCKET || 'infinite-images-dev-349660737637';
const OPENAI_SECRET_ARN = process.env.OPENAI_SECRET_ARN;

// OpenAI configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o';

/**
 * Main Lambda handler for AI content generation
 */
exports.handler = async (event) => {
    console.log('AI Content Generator Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Get OpenAI API key from Secrets Manager
        const openaiApiKey = await getOpenAIApiKey();
        
        // Check if specific content ID is provided in event
        let rawContentItems = [];
        if (event.contentId && event.source) {
            // Process specific content ID
            const specificItem = await getSpecificRawContent(event.contentId, event.source);
            if (specificItem) {
                rawContentItems = [specificItem];
            }
        } else {
            // Get raw content items that need processing
            rawContentItems = await getRawContentForProcessing();
        }
        
        if (!rawContentItems || rawContentItems.length === 0) {
            console.log('No raw content items found for processing');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'No raw content items found for processing',
                    processedCount: 0
                })
            };
        }
        
        let processedCount = 0;
        let errorCount = 0;
        const results = [];
        
        // Process each raw content item
        for (const rawItem of rawContentItems) {
            try {
                console.log(`Processing raw content: ${rawItem.contentId}`);
                
                // Generate Slovak article using OpenAI
                const generatedArticle = await generateSlovakArticle(rawItem, openaiApiKey);
                
                // Validate generated content
                const validationResult = validateGeneratedContent(generatedArticle);
                if (!validationResult.isValid) {
                    console.error(`Content validation failed for ${rawItem.contentId}:`, validationResult.errors);
                    errorCount++;
                    continue;
                }
                
                // Process and optimize images
                const processedImages = await processImages(rawItem, generatedArticle);
                
                // Create article record
                const articleRecord = createArticleRecord(rawItem, generatedArticle, processedImages);
                
                // Store article in DynamoDB
                await storeArticle(articleRecord);
                
                // Update raw content status
                await updateRawContentStatus(rawItem.contentId, rawItem.source, 'processed');
                
                processedCount++;
                results.push({
                    contentId: rawItem.contentId,
                    articleId: articleRecord.articleId,
                    title: articleRecord.title,
                    slug: articleRecord.slug
                });
                
                console.log(`Successfully processed: ${rawItem.contentId} -> ${articleRecord.articleId}`);
                
            } catch (itemError) {
                console.error(`Error processing raw content ${rawItem.contentId}:`, itemError);
                errorCount++;
                
                // Update raw content status to failed
                try {
                    await updateRawContentStatus(rawItem.contentId, rawItem.source, 'failed');
                } catch (updateError) {
                    console.error('Failed to update raw content status:', updateError);
                }
            }
        }
        
        console.log(`AI content generation completed: ${processedCount} processed, ${errorCount} errors`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'AI content generation completed successfully',
                processedCount: processedCount,
                errorCount: errorCount,
                totalItems: rawContentItems.length,
                results: results
            })
        };
        
    } catch (error) {
        console.error('Error in AI Content Generator:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'AI content generation failed',
                message: error.message,
                stack: error.stack
            })
        };
    }
};

/**
 * Get OpenAI API key from Secrets Manager
 */
async function getOpenAIApiKey() {
    try {
        const secretsManager = new AWS.SecretsManager();
        const secretData = await secretsManager.getSecretValue({ SecretId: OPENAI_SECRET_ARN }).promise();
        
        if (secretData.SecretString) {
            const secret = JSON.parse(secretData.SecretString);
            return secret.OPENAI_API_KEY;
        }
        
        throw new Error('OpenAI API key not found in secret');
    } catch (error) {
        console.error('Error retrieving OpenAI API key:', error);
        throw new Error('Failed to retrieve OpenAI API key');
    }
}

/**
 * Get specific raw content item by contentId and source
 */
async function getSpecificRawContent(contentId, source) {
    try {
        const params = {
            TableName: RAW_CONTENT_TABLE,
            Key: {
                contentId: contentId,
                source: source
            }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) {
            console.log(`No item found for contentId: ${contentId}, source: ${source}`);
            return null;
        }
        
        // Check if the item is already processed
        if (result.Item.status === 'processed') {
            console.log(`Item ${contentId} is already processed, skipping`);
            return null;
        }
        
        // Only return items with status 'raw'
        if (result.Item.status === 'raw') {
            console.log(`Found raw item for processing: ${contentId}`);
            return result.Item;
        }
        
        console.log(`Item ${contentId} has status '${result.Item.status}', skipping`);
        return null;
        
    } catch (error) {
        console.error('Error getting specific raw content:', error);
        throw new Error('Failed to get specific raw content');
    }
}

/**
 * Get raw content items that need processing
 */
async function getRawContentForProcessing() {
    try {
        console.log('Getting raw content for processing...');
        
        // Try with raw DynamoDB client first
        const rawParams = {
            TableName: RAW_CONTENT_TABLE,
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': { S: 'raw' }
            },
            Limit: 10 // Process up to 10 items at a time
        };
        
        console.log('Raw DynamoDB scan params:', JSON.stringify(rawParams, null, 2));
        
        const rawResult = await dynamodbRaw.scan(rawParams).promise();
        
        console.log(`Raw DynamoDB found ${rawResult.Items ? rawResult.Items.length : 0} items`);
        
        if (rawResult.Items && rawResult.Items.length > 0) {
            // Convert raw DynamoDB items to DocumentClient format
            const convertedItems = rawResult.Items.map(item => {
                const converted = {};
                for (const [key, value] of Object.entries(item)) {
                    if (value.S) converted[key] = value.S;
                    else if (value.N) converted[key] = value.N;
                    else if (value.BOOL !== undefined) converted[key] = value.BOOL;
                    else if (value.SS) converted[key] = value.SS;
                    else if (value.NS) converted[key] = value.NS;
                    else if (value.L) converted[key] = value.L;
                    else if (value.M) converted[key] = value.M;
                }
                return converted;
            });
            
            console.log('Converted items:', convertedItems.map(item => ({ contentId: item.contentId, source: item.source, status: item.status })));
            return convertedItems;
        }
        
        // Fallback to DocumentClient
        const params = {
            TableName: RAW_CONTENT_TABLE,
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'raw'
            },
            Limit: 10 // Process up to 10 items at a time
        };
        
        console.log('DocumentClient scan params:', JSON.stringify(params, null, 2));
        
        const result = await dynamodb.scan(params).promise();
        
        console.log(`DocumentClient found ${result.Items ? result.Items.length : 0} raw content items`);
        console.log('Raw content items:', result.Items ? result.Items.map(item => ({ contentId: item.contentId, source: item.source, status: item.status })) : []);
        
        return result.Items || [];
        
    } catch (error) {
        console.error('Error getting raw content for processing:', error);
        throw new Error('Failed to get raw content for processing');
    }
}

/**
 * Generate Slovak article using OpenAI
 */
async function generateSlovakArticle(rawItem, openaiApiKey) {
    try {
        // Prepare the enhanced prompt based on objav-dna-slovenstina.md
        const prompt = createEnhancedPrompt(rawItem);
        
        const requestBody = {
            model: OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "Si expertný astronóm a skvelý slovenský spisovateľ. Tvoja úloha je vytvoriť zaujímavý, vedecky presný a ľahko zrozumiteľný článok o astronómii v slovenčine."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 6000,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        };
        
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from OpenAI API');
        }
        
        const generatedContent = data.choices[0].message.content;
        
        // Parse the generated content
        return parseGeneratedContent(generatedContent, rawItem);
        
    } catch (error) {
        console.error('Error generating Slovak article:', error);
        throw new Error(`Failed to generate Slovak article: ${error.message}`);
    }
}

/**
 * Create enhanced prompt for OpenAI based on objav-dna-slovenstina.md
 */
function createEnhancedPrompt(rawItem) {
    const basePrompt = `
🚨 KRITICKÉ UPOZORNENIE: TENTO ČLÁNOK MUSÍ MAŤ MINIMÁLNE 2000 ZNAKOV CELKOVO! 🚨
🚨 AK ČLÁNOK NEBUDE DOSTATOČNE DLHÝ, BUDE ZAMIETNUTÝ! 🚨

**POVINNÉ POŽIADAVKY NA DĹŽKU:**
- Perex: MINIMÁLNE 200 znakov
- Každá z 5 sekcií: MINIMÁLNE 400 znakov (celkovo 2000 znakov len sekcie)
- FAQ odpovede: MINIMÁLNE 150 znakov na odpoveď
- CELKOVÝ obsah: MINIMÁLNE 2000 znakov (perex + sekcie + FAQ)

Vytvor zaujímavý slovenský článok o astronómii na základe týchto údajov:

**Základné informácie:**
- Názov: ${rawItem.title || 'Astronomický objav'}
- Zdroj: ${rawItem.source || 'NASA/ESA'}
- Dátum: ${rawItem.date || new Date().toISOString().split('T')[0]}
- Popis: ${rawItem.explanation || rawItem.description || 'Astronomický objav'}

**Požiadavky na článok:**
1. **Meta title** (max 60 znakov): Zaujímavý, SEO-optimalizovaný názov VÝLUČNE V SLOVENČINE - žiadne anglické slová!
   - Formát: "[Zaujímavý jav/objekt] – Objav dňa [deň. mesiac slovne, rok]"
   - Príklad: "Krabia hmlovina – Objav dňa 7. októbra 2025" (NIKDY nepoužívaj "Rakovina"!)
2. **Meta description** (max 160 znakov): Krátky popis článku VÝLUČNE V SLOVENČINE
3. **H1 názov**: Hlavný názov článku VÝLUČNE V SLOVENČINE - žiadne anglické slová!
   - Formát: "[Názov objektu] – [zaujímavý opis]"
   - Príklad: "Krabia hmlovina – fascinujúce okno do konca života hviezdy" (NIKDY nepoužívaj "Rakovina"!)
4. **Perex** (MINIMÁLNE 200 znakov): Úvodný text, ktorý zaujme čitateľa
5. **5 H2 sekcií** s podrobným obsahom (každá sekcia MINIMÁLNE 400 znakov):
   - **Čo vidíme na snímke** (MINIMÁLNE 400 znakov)
   - **Prečo je tento objav dôležitý** (MINIMÁLNE 400 znakov)
   - **Ako záber vznikol** (MINIMÁLNE 400 znakov)
   - **Zaujímavosti o objekte** (MINIMÁLNE 400 znakov)
   - **Vedecký význam a budúcnosť** (MINIMÁLNE 400 znakov)
6. **FAQ sekcia** s 3-5 otázkami a odpoveďami (každá odpoveď MINIMÁLNE 150 znakov)

**Štýl a jazyk:**
- Používaj správnu slovenčinu s diakritikou
- Píš pre širokú verejnosť (nie pre odborníkov)
- Vysvetľuj zložité pojmy jednoducho
- Používaj aktívny rod
- Vedecky presné, ale zrozumiteľné
- Rozširuj myšlienky a pridávaj kontext
- **KRITICKÉ: Všetky názvy, nadpisy a titulky MUSÍ byť VÝLUČNE V SLOVENČINE - žiadne anglické slová!**
- **KRITICKÉ: Nepoužívaj anglické slová ako "image", "credit", "amazing", "incredible" atď.**
- **KRITICKÉ: Prekladaj všetky anglické termíny do slovenčiny (napr. "hmlovina" namiesto "nebula")**
- **KRITICKÉ: NIKDY nepoužívaj názvy chorôb pre astronomické objekty! (napr. "Krabia hmlovina" namiesto "Rakovina hmlovina")**

🚨 FINÁLNE UPOZORNENIE: PÍŠ VEĽMI DLHÝ A PODROBNÝ ČLÁNOK! 🚨
🚨 CELKOVÝ obsah MUSÍ mať aspoň 2000 znakov, inak bude článok zamietnutý! 🚨

**Formát výstupu:**
Vráť obsah v JSON formáte:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "h1Title": "...",
  "perex": "...",
  "sections": [
    {"title": "...", "content": "..."},
    {"title": "...", "content": "..."},
    {"title": "...", "content": "..."},
    {"title": "...", "content": "..."},
    {"title": "...", "content": "..."}
  ],
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "keywords": ["kľúčové", "slová", "pre", "SEO"],
  "estimatedReadingTime": "X minút"
}

**PAMATUJ SI:** Celkový obsah MUSÍ mať aspoň 2000 znakov, inak bude článok zamietnutý!
`;

    return basePrompt;
}

/**
 * Parse generated content from OpenAI response
 */
function parseGeneratedContent(generatedContent, rawItem) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in generated content');
        }
        
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        const requiredFields = ['metaTitle', 'metaDescription', 'h1Title', 'perex', 'sections', 'faq'];
        for (const field of requiredFields) {
            if (!parsedContent[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Add metadata
        parsedContent.rawContentId = rawItem.contentId;
        parsedContent.source = rawItem.source;
        parsedContent.originalDate = rawItem.date;
        parsedContent.generatedAt = new Date().toISOString();
        
        return parsedContent;
        
    } catch (error) {
        console.error('Error parsing generated content:', error);
        throw new Error(`Failed to parse generated content: ${error.message}`);
    }
}

/**
 * Validate generated content
 */
function validateGeneratedContent(generatedContent) {
    const errors = [];
    
    // Check required fields
    if (!generatedContent.metaTitle || generatedContent.metaTitle.length > 60) {
        errors.push('Meta title is missing or too long (max 60 characters)');
    }
    
    if (!generatedContent.metaDescription || generatedContent.metaDescription.length > 160) {
        errors.push('Meta description is missing or too long (max 160 characters)');
    }
    
    if (!generatedContent.h1Title) {
        errors.push('H1 title is missing');
    }
    
    if (!generatedContent.perex || generatedContent.perex.length < 50) {
        errors.push('Perex is missing or too short (min 50 characters)');
    }
    
    if (!generatedContent.sections || generatedContent.sections.length !== 5) {
        errors.push('Must have exactly 5 sections');
    }
    
    if (!generatedContent.faq || generatedContent.faq.length < 3) {
        errors.push('Must have at least 3 FAQ items');
    }
    
    // Check content quality
    const totalContentLength = generatedContent.perex.length + 
        generatedContent.sections.reduce((sum, section) => sum + section.content.length, 0);
    
    if (totalContentLength < 2000) {
        errors.push('Total content length is too short (min 2000 characters)');
    }
    
    // Check individual section lengths
    if (generatedContent.sections) {
        generatedContent.sections.forEach((section, index) => {
            if (section.content.length < 300) {
                errors.push(`Section ${index + 1} is too short (min 300 characters, got ${section.content.length})`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Process and optimize images
 */
async function processImages(rawItem, generatedContent) {
    try {
        const processedImages = {};
        
        // Get the main image URL
        const imageUrl = rawItem.imageUrl || rawItem.media_url;
        if (!imageUrl) {
            console.log('No image URL found for processing');
            return processedImages;
        }
        
        console.log(`Processing image: ${imageUrl}`);
        
        // Download the image
        const imageBuffer = await downloadImage(imageUrl);
        if (!imageBuffer) {
            console.error('Failed to download image');
            return processedImages;
        }
        
        // Generate alt text
        const altText = generateAltText(rawItem, generatedContent);
        
        // Process different image sizes
        const imageSizes = {
            og: { width: 1200, height: 630, folder: 'og' },
            hero: { width: 1200, height: 675, folder: 'hero' },
            card: { width: 400, height: 225, folder: 'card' },
            thumb: { width: 200, height: 112, folder: 'thumb' }
        };
        
        for (const [sizeName, config] of Object.entries(imageSizes)) {
            try {
                const processedImage = await processImageSize(
                    imageBuffer, 
                    config.width, 
                    config.height, 
                    `${rawItem.contentId}-${sizeName}`
                );
                
                if (processedImage) {
                    const extension = sharp ? 'webp' : 'jpg';
                    const s3Key = `images/${config.folder}/${rawItem.contentId}-${sizeName}.${extension}`;
                    const s3Url = await uploadToS3(processedImage, s3Key);
                    
                    processedImages[`${sizeName}Image`] = {
                        url: s3Url,
                        s3Key: s3Key,
                        alt: altText,
                        width: config.width,
                        height: config.height
                    };
                    
                    console.log(`Processed ${sizeName} image: ${s3Url}`);
                }
            } catch (sizeError) {
                console.error(`Error processing ${sizeName} image:`, sizeError);
            }
        }
        
        return processedImages;
        
    } catch (error) {
        console.error('Error processing images:', error);
        return {};
    }
}

/**
 * Download image from URL
 */
async function downloadImage(url) {
    try {
        console.log(`Downloading image from: ${url}`);
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Infinite-Astronomy-Bot/1.0'
            }
        });
        
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error downloading image:', error.message);
        return null;
    }
}

/**
 * Process image to specific size and format
 */
async function processImageSize(imageBuffer, width, height, filename) {
    try {
        if (!sharp) {
            console.warn('Sharp not available, returning original image buffer');
            return imageBuffer;
        }
        
        const processedBuffer = await sharp(imageBuffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({
                quality: 85,
                effort: 6
            })
            .toBuffer();
            
        return processedBuffer;
    } catch (error) {
        console.error(`Error processing image size ${width}x${height}:`, error);
        return imageBuffer; // Return original buffer as fallback
    }
}

/**
 * Upload processed image to S3
 */
async function uploadToS3(imageBuffer, s3Key) {
    try {
        // Determine content type based on file extension
        const contentType = s3Key.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
        
        const uploadParams = {
            Bucket: S3_IMAGES_BUCKET,
            Key: s3Key,
            Body: imageBuffer,
            ContentType: contentType,
            CacheControl: 'max-age=31536000', // 1 year cache
            Metadata: {
                'processed-by': 'infinite-ai-content-generator',
                'processed-at': new Date().toISOString()
            }
        };
        
        await s3.upload(uploadParams).promise();
        
        return `https://${S3_IMAGES_BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        return null;
    }
}

/**
 * Generate alt text for images
 */
function generateAltText(rawItem, generatedContent) {
    const title = generatedContent.h1Title || rawItem.title || 'Astronomický objekt';
    const source = rawItem.source === 'apod' ? 'APOD / NASA' : 'ESA / Hubble';
    
    return `${title} - ${source}`;
}

/**
 * Create article record for DynamoDB
 */
function createArticleRecord(rawItem, generatedContent, processedImages) {
    const articleId = uuidv4();
    const slug = generateSlug(generatedContent.h1Title);
    
    // Set the main image URL for frontend compatibility
    const imageUrl = processedImages.heroImage?.url || processedImages.cardImage?.url || processedImages.ogImage?.url || null;
    
    return {
        articleId: articleId,
        slug: slug,
        title: generatedContent.h1Title,
        metaTitle: generatedContent.metaTitle,
        metaDescription: generatedContent.metaDescription,
        perex: generatedContent.perex,
        content: generatedContent.sections,
        faq: generatedContent.faq,
        keywords: generatedContent.keywords || [],
        estimatedReadingTime: generatedContent.estimatedReadingTime || '5 minút',
        category: 'objav-dna',
        type: 'discovery',
        status: 'published',
        source: rawItem.source,
        originalDate: rawItem.date,
        publishedAt: new Date().toISOString(),
        author: 'Infinite AI',
        imageUrl: imageUrl, // Add imageUrl for frontend compatibility
        images: processedImages,
        rawContentId: rawItem.contentId,
        environment: ENVIRONMENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[áäčďéíĺľňóôŕšťúýž]/g, (char) => {
            const map = {
                'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'í': 'i',
                'ĺ': 'l', 'ľ': 'l', 'ň': 'n', 'ó': 'o', 'ô': 'o', 'ŕ': 'r',
                'š': 's', 'ť': 't', 'ú': 'u', 'ý': 'y', 'ž': 'z'
            };
            return map[char] || char;
        })
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

/**
 * Store article in DynamoDB
 */
async function storeArticle(articleRecord) {
    try {
        const params = {
            TableName: ARTICLES_TABLE,
            Item: articleRecord
        };
        
        await dynamodb.put(params).promise();
        console.log('Article stored successfully:', articleRecord.articleId);
        
    } catch (error) {
        console.error('Error storing article:', error);
        throw new Error('Failed to store article');
    }
}

/**
 * Update raw content status
 */
async function updateRawContentStatus(contentId, source, status) {
    try {
        const params = {
            TableName: RAW_CONTENT_TABLE,
            Key: {
                contentId: contentId,
                source: source
            },
            UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':updatedAt': new Date().toISOString()
            }
        };
        
        await dynamodb.update(params).promise();
        console.log(`Raw content status updated: ${contentId} -> ${status}`);
        
    } catch (error) {
        console.error('Error updating raw content status:', error);
        throw new Error('Failed to update raw content status');
    }
}

// Export functions for testing
module.exports = {
    handler: exports.handler,
    getOpenAIApiKey,
    getRawContentForProcessing,
    generateSlovakArticle,
    validateGeneratedContent,
    createArticleRecord,
    storeArticle
};
