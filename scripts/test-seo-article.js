#!/usr/bin/env node

/**
 * Test script for SEO article generation
 * Tests the new comprehensive SEO article generation feature
 */

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'eu-central-1' });
const lambda = new AWS.Lambda();

async function testSeoArticleGeneration() {
    console.log('🧪 Testing SEO Article Generation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test with a recent APOD date
    const testDate = '2025-10-01';
    
    // SEO article configuration
    const seoConfig = {
        topic: 'Ako pozorovať meteorické roje: Kompletný sprievodca pre začiatočníkov',
        keywords: 'meteorické roje pozorovanie, astronómia začiatočníci, pozorovanie meteorov, nočná obloha',
        targetAudience: 'začiatočníci v astronómii, rodiny s deťmi, záujemcovia o vesmír'
    };
    
    const payload = {
        date: testDate,
        nasaData: {
            title: 'Witch Broom Nebula',
            explanation: 'The Witch Broom Nebula, also known as NGC 6960, is part of the Veil Nebula complex. This beautiful filamentary structure is the result of a supernova explosion that occurred thousands of years ago. The nebula glows due to the interaction between the expanding shock wave and surrounding interstellar gas.',
            url: 'https://apod.nasa.gov/apod/image/2510/WitchBroom_Meyers_6043.jpg',
            hdurl: 'https://apod.nasa.gov/apod/image/2510/WitchBroom_Meyers_6043.jpg',
            media_type: 'image',
            copyright: 'NASA'
        },
        options: {
            generateSeoArticle: true,
            seoArticleConfig: seoConfig
        }
    };
    
    try {
        console.log(`📅 Testing with date: ${testDate}`);
        console.log(`🎯 Topic: ${seoConfig.topic}`);
        console.log(`🔑 Keywords: ${seoConfig.keywords}`);
        console.log(`👥 Target Audience: ${seoConfig.targetAudience}`);
        console.log('');
        
        console.log('🚀 Invoking content-processor Lambda...');
        
        const result = await lambda.invoke({
            FunctionName: 'infinite-nasa-apod-dev-content-processor',
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(payload)
        }).promise();
        
        const response = JSON.parse(result.Payload);
        
        if (response.statusCode === 200) {
            console.log('✅ SEO article generation test completed successfully!');
            console.log('');
            console.log('📊 Response:');
            console.log(JSON.stringify(response, null, 2));
            
            // Check if SEO article was generated
            if (response.body) {
                const body = JSON.parse(response.body);
                console.log('');
                console.log('🎯 Test Results:');
                console.log(`  • Date: ${body.date}`);
                console.log(`  • Content ID: ${body.contentId}`);
                console.log(`  • Timestamp: ${body.timestamp}`);
                console.log('');
                console.log('💡 Check DynamoDB for the generated SEO article data!');
            }
        } else {
            console.error('❌ SEO article generation test failed!');
            console.error('Response:', response);
        }
        
    } catch (error) {
        console.error('❌ Error during SEO article generation test:');
        console.error(error.message);
        console.error('');
        console.error('Full error:', error);
    }
}

// Run the test
testSeoArticleGeneration()
    .then(() => {
        console.log('');
        console.log('🏁 Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
