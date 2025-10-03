/**
 * Script to display full SEO article content from DynamoDB
 */

const AWS = require('aws-sdk');

// Configure AWS
const credentials = new AWS.SharedIniFileCredentials({profile: 'infinite-nasa-apod-dev'});
AWS.config.update({ 
    region: 'eu-central-1',
    credentials: credentials
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function showSeoArticle(date = '2025-09-28') {
    console.log('📖 Displaying Full SEO Article Content...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    try {
        const params = {
            TableName: 'infinite-nasa-apod-dev-content',
            Key: {
                date: date
            }
        };
        
        const result = await dynamodb.get(params).promise();
        
        if (!result.Item) {
            console.log('❌ No item found for date:', date);
            return;
        }
        
        const item = result.Item;
        const seo = item.seoArticle;
        
        if (!seo) {
            console.log('❌ No SEO article data found for this date');
            return;
        }
        
        console.log('📅 DATE:', date);
        console.log('🌟 ORIGINAL TITLE:', item.originalTitle);
        console.log('🇸🇰 SLOVAK TITLE:', item.slovakTitle);
        console.log('💫 HEADLINE:', item.headline);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 META TITLE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.metaTitle);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 META DESCRIPTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.metaDescription);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 INTRODUCTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.intro);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📄 MAIN ARTICLE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.article);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❓ FAQ SECTION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.faq);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 CONCLUSION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(seo.conclusion);
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔗 INTERNAL LINKS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (Array.isArray(seo.internalLinks)) {
            seo.internalLinks.forEach((link, i) => {
                console.log(`${i + 1}. ${link}`);
            });
        } else {
            console.log(seo.internalLinks);
        }
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🌐 EXTERNAL REFERENCES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        if (Array.isArray(seo.externalRefs)) {
            seo.externalRefs.forEach((ref, i) => {
                console.log(`${i + 1}. ${ref}`);
            });
        } else {
            console.log(seo.externalRefs);
        }
        console.log('');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 STATISTICS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const totalWords = (seo.intro + seo.article + seo.faq + seo.conclusion).split(/\s+/).length;
        console.log('Total Word Count:', totalWords);
        console.log('Meta Title Length:', seo.metaTitle.length, 'characters');
        console.log('Meta Description Length:', seo.metaDescription.length, 'characters');
        console.log('Internal Links:', Array.isArray(seo.internalLinks) ? seo.internalLinks.length : 'N/A');
        console.log('External References:', Array.isArray(seo.externalRefs) ? seo.externalRefs.length : 'N/A');
        console.log('');
        
        console.log('✅ Display completed!');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

const date = process.argv[2] || '2025-09-28';
showSeoArticle(date);
