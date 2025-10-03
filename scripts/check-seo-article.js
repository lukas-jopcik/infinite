#!/usr/bin/env node

/**
 * Script to check generated SEO article in DynamoDB
 */

const AWS = require('aws-sdk');

// Configure AWS
const credentials = new AWS.SharedIniFileCredentials({profile: 'infinite-nasa-apod-dev'});
AWS.config.update({ 
    region: 'eu-central-1',
    credentials: credentials
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function checkSeoArticle(date = '2025-10-01') {
    console.log('🔍 Checking SEO Article in DynamoDB...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        const params = {
            TableName: 'infinite-nasa-apod-dev-content',
            Key: {
                date: date
            }
        };
        
        console.log(`📅 Checking date: ${date}`);
        console.log('');
        
        const result = await dynamodb.get(params).promise();
        
        if (result.Item) {
            const item = result.Item;
            console.log('✅ Item found in DynamoDB!');
            console.log('');
            
            // Basic info
            console.log('📊 Basic Information:');
            console.log(`  • Date: ${item.date}`);
            console.log(`  • Original Title: ${item.originalTitle}`);
            console.log(`  • Slovak Title: ${item.slovakTitle}`);
            console.log(`  • Headline: ${item.headline}`);
            console.log(`  • Article Length: ${item.articleLengthWords} words`);
            console.log(`  • SEO Keywords: ${item.seoKeywords ? item.seoKeywords.join(', ') : 'None'}`);
            console.log('');
            
            // Check if SEO article was generated
            if (item.seoArticle) {
                console.log('🎯 SEO Article Generated Successfully!');
                console.log('');
                
                const seo = item.seoArticle;
                console.log('📝 SEO Article Details:');
                console.log(`  • Meta Title: ${seo.metaTitle || 'Not generated'}`);
                console.log(`  • Meta Description: ${seo.metaDescription || 'Not generated'}`);
                console.log(`  • Intro Length: ${seo.intro ? seo.intro.length : 0} characters`);
                console.log(`  • Article Length: ${seo.article ? seo.article.length : 0} characters`);
                console.log(`  • FAQ Length: ${seo.faq ? seo.faq.length : 0} characters`);
                console.log(`  • Conclusion Length: ${seo.conclusion ? seo.conclusion.length : 0} characters`);
                console.log(`  • Internal Links: ${seo.internalLinks ? seo.internalLinks.length : 0} items`);
                console.log(`  • External References: ${seo.externalRefs ? seo.externalRefs.length : 0} items`);
                console.log('');
                
                // Show preview of content
                if (seo.metaTitle) {
                    console.log('📋 Meta Title:');
                    console.log(`  "${seo.metaTitle}"`);
                    console.log('');
                }
                
                if (seo.metaDescription) {
                    console.log('📋 Meta Description:');
                    console.log(`  "${seo.metaDescription}"`);
                    console.log('');
                }
                
                if (seo.intro) {
                    console.log('📋 Introduction Preview:');
                    console.log(`  ${seo.intro.substring(0, 200)}...`);
                    console.log('');
                }
                
                if (seo.internalLinks && seo.internalLinks.length > 0) {
                    console.log('🔗 Internal Links:');
                    seo.internalLinks.forEach((link, index) => {
                        console.log(`  ${index + 1}. ${link}`);
                    });
                    console.log('');
                }
                
                if (seo.externalRefs && seo.externalRefs.length > 0) {
                    console.log('🌐 External References:');
                    seo.externalRefs.forEach((ref, index) => {
                        console.log(`  ${index + 1}. ${ref}`);
                    });
                    console.log('');
                }
                
                // Calculate total word count
                const totalContent = [
                    seo.intro,
                    seo.article,
                    seo.faq,
                    seo.conclusion
                ].filter(Boolean).join(' ');
                
                const wordCount = totalContent.split(/\s+/).filter(Boolean).length;
                console.log(`📊 Total SEO Article Word Count: ${wordCount} words`);
                
            } else {
                console.log('❌ No SEO article data found');
                console.log('   This means the SEO article generation was not triggered or failed');
            }
            
        } else {
            console.log('❌ No item found for the specified date');
            console.log('   Make sure the content was processed successfully');
        }
        
    } catch (error) {
        console.error('❌ Error checking DynamoDB:');
        console.error(error.message);
    }
}

// Get date from command line argument or use default
const date = process.argv[2] || '2025-10-01';

checkSeoArticle(date)
    .then(() => {
        console.log('');
        console.log('🏁 Check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Check failed:', error);
        process.exit(1);
    });
