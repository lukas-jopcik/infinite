#!/usr/bin/env node

/**
 * Test script for SEO article generation using the reprocess API
 * This bypasses AWS credentials issues by using the API endpoint
 */

const https = require('https');

async function testSeoArticleReprocess() {
    console.log('🧪 Testing SEO Article Generation via Reprocess API...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test with a recent APOD date
    const testDate = '2025-10-01';
    
    // SEO article configuration
    const seoConfig = {
        topic: 'Ako pozorovať meteorické roje: Kompletný sprievodca pre začiatočníkov',
        keywords: 'meteorické roje pozorovanie, astronómia začiatočníci, pozorovanie meteorov, nočná obloha',
        targetAudience: 'začiatočníci v astronómii, rodiny s deťmi, záujemcovia o vesmír'
    };
    
    const requestBody = {
        date: testDate,
        generateSeoArticle: true,
        seoArticleConfig: seoConfig
    };
    
    const apiUrl = 'https://l9lm0zrzyl.execute-api.eu-central-1.amazonaws.com/prod/api/reprocess';
    
    try {
        console.log(`📅 Testing with date: ${testDate}`);
        console.log(`🎯 Topic: ${seoConfig.topic}`);
        console.log(`🔑 Keywords: ${seoConfig.keywords}`);
        console.log(`👥 Target Audience: ${seoConfig.targetAudience}`);
        console.log('');
        
        console.log('🚀 Calling reprocess API...');
        
        const result = await makeHttpRequest(apiUrl, 'POST', requestBody);
        
        if (result.statusCode === 202) {
            console.log('✅ SEO article generation request submitted successfully!');
            console.log('');
            console.log('📊 Response:');
            console.log(JSON.stringify(result.body, null, 2));
            console.log('');
            console.log('⏳ Processing is running in the background...');
            console.log('💡 Check the content in a few minutes using:');
            console.log(`   node scripts/check-seo-article.js ${testDate}`);
        } else {
            console.error('❌ SEO article generation request failed!');
            console.error('Response:', result);
        }
        
    } catch (error) {
        console.error('❌ Error during SEO article generation test:');
        console.error(error.message);
        console.error('');
        console.error('Full error:', error);
    }
}

// Helper function to make HTTP requests
function makeHttpRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Infinite-SEO-Test/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsedData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseData
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Run the test
testSeoArticleReprocess()
    .then(() => {
        console.log('');
        console.log('🏁 Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
