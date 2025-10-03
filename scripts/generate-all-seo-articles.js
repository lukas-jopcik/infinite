/**
 * Bulk SEO Article Generation Script
 * Generates SEO articles for all existing APOD items in DynamoDB
 */

const AWS = require('aws-sdk');
const https = require('https');

// Configure AWS
const credentials = new AWS.SharedIniFileCredentials({profile: 'infinite-nasa-apod-dev'});
AWS.config.update({ 
    region: 'eu-central-1',
    credentials: credentials
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

// Configuration
const API_ENDPOINT = 'https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod/api/reprocess';
const TABLE_NAME = 'infinite-nasa-apod-dev-content';
const BATCH_SIZE = 5; // Process 5 items at a time to avoid overwhelming OpenAI
const DELAY_BETWEEN_BATCHES = 120000; // 2 minutes between batches (OpenAI rate limits)

// Topic templates for different astronomical subjects
const topicTemplates = {
    galaxy: 'Galaxie a hviezdne sústavy: Sprievodca vesmírnymi zázrakmi',
    nebula: 'Hmlovina: Miesto narodenia hviezd',
    planet: 'Planéty: Kompletný sprievodca našou slnečnou sústavou',
    star: 'Hviezdy: Život a smrť nebeských telies',
    comet: 'Kométy: Ľadoví pútnici slnečnej sústavy',
    asteroid: 'Asteroidy: Skalné telesá vesmíru',
    moon: 'Mesiace: Satelity planetárneho sveta',
    eclipse: 'Zatmenia: Nebeské tance Slnka a Mesiaca',
    aurora: 'Polárna žiara: Svetelné show na oblohe',
    default: 'Objavte vesmír: Kompletný sprievodca astronómiou'
};

async function getAllDates() {
    console.log('📊 Fetching all dates from DynamoDB...');
    
    const params = {
        TableName: TABLE_NAME,
        ProjectionExpression: '#d, headline, seoArticle',
        ExpressionAttributeNames: {
            '#d': 'date'
        }
    };
    
    const items = [];
    let lastKey = null;
    
    do {
        if (lastKey) {
            params.ExclusiveStartKey = lastKey;
        }
        
        const result = await dynamodb.scan(params).promise();
        items.push(...result.Items);
        lastKey = result.LastEvaluatedKey;
        
        console.log(`  Found ${items.length} items so far...`);
    } while (lastKey);
    
    console.log(`✅ Total items found: ${items.length}`);
    return items;
}

function generateTopicFromTitle(title = '') {
    const lower = title.toLowerCase();
    if (lower.includes('galaxy') || lower.includes('galaxie')) return topicTemplates.galaxy;
    if (lower.includes('nebula') || lower.includes('hmlovina')) return topicTemplates.nebula;
    if (lower.includes('planet') || lower.includes('planéta')) return topicTemplates.planet;
    if (lower.includes('star') || lower.includes('hviezd')) return topicTemplates.star;
    if (lower.includes('comet') || lower.includes('kométa')) return topicTemplates.comet;
    if (lower.includes('asteroid')) return topicTemplates.asteroid;
    if (lower.includes('moon') || lower.includes('mesiac')) return topicTemplates.moon;
    if (lower.includes('eclipse') || lower.includes('zatmenie')) return topicTemplates.eclipse;
    if (lower.includes('aurora') || lower.includes('polárna')) return topicTemplates.aurora;
    return topicTemplates.default;
}

async function generateSeoArticle(date, headline) {
    console.log(`  🎯 Generating SEO article for ${date}...`);
    
    const topic = generateTopicFromTitle(headline);
    const keywords = `astronómia, vesmír, NASA, APOD, slovensko, ${headline}`;
    
    const payload = {
        date,
        generateSeoArticle: true,
        seoArticleConfig: {
            topic,
            keywords,
            targetAudience: 'záujemcovia o vesmír, študenti astronómie, amatérski astronómovia'
        }
    };
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log(`    ✅ ${date}: ${result.message || 'Processing started'}`);
        return true;
    } catch (error) {
        console.error(`    ❌ ${date}: ${error.message}`);
        return false;
    }
}

async function processBatch(items, startIdx) {
    console.log(`\n📦 Processing batch ${Math.floor(startIdx / BATCH_SIZE) + 1}...`);
    console.log(`   Items ${startIdx + 1} to ${Math.min(startIdx + BATCH_SIZE, items.length)} of ${items.length}`);
    
    const batch = items.slice(startIdx, startIdx + BATCH_SIZE);
    const results = [];
    
    for (const item of batch) {
        const success = await generateSeoArticle(item.date, item.headline || '');
        results.push({ date: item.date, success });
        // Small delay between individual requests (15 seconds)
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
    
    return results;
}

async function main() {
    console.log('🚀 Starting bulk SEO article generation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // Get all items
        const allItems = await getAllDates();
        
        // Filter items that don't have SEO articles yet
        const itemsWithoutSeo = allItems.filter(item => !item.seoArticle);
        const itemsWithSeo = allItems.filter(item => item.seoArticle);
        
        console.log(`\n📊 Statistics:`);
        console.log(`   Total items: ${allItems.length}`);
        console.log(`   With SEO article: ${itemsWithSeo.length}`);
        console.log(`   Without SEO article: ${itemsWithoutSeo.length}`);
        
        if (itemsWithoutSeo.length === 0) {
            console.log('\n✅ All items already have SEO articles!');
            return;
        }
        
        console.log(`\n🎯 Will generate SEO articles for ${itemsWithoutSeo.length} items`);
        console.log(`   Batch size: ${BATCH_SIZE}`);
        console.log(`   Delay between batches: ${DELAY_BETWEEN_BATCHES / 1000}s`);
        console.log(`   Estimated time: ${Math.ceil((itemsWithoutSeo.length / BATCH_SIZE) * (DELAY_BETWEEN_BATCHES / 60000))} minutes\n`);
        
        // Process in batches
        const allResults = [];
        for (let i = 0; i < itemsWithoutSeo.length; i += BATCH_SIZE) {
            const batchResults = await processBatch(itemsWithoutSeo, i);
            allResults.push(...batchResults);
            
            // Wait before next batch (except for last batch)
            if (i + BATCH_SIZE < itemsWithoutSeo.length) {
                console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...\n`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        
        // Summary
        const successful = allResults.filter(r => r.success).length;
        const failed = allResults.filter(r => !r.success).length;
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Final Summary:');
        console.log(`   Successful: ${successful}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Total processed: ${allResults.length}`);
        console.log('\n✅ Bulk generation complete!');
        
        if (failed > 0) {
            console.log('\n❌ Failed items:');
            allResults.filter(r => !r.success).forEach(r => {
                console.log(`   - ${r.date}`);
            });
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Check if we need Node v18+ for fetch
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ for native fetch support');
    process.exit(1);
}

main();
