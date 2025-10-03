/**
 * Monitor SEO Article Generation Progress
 * Alternative to 'watch' command for macOS
 */

const AWS = require('aws-sdk');

// Configure AWS
const credentials = new AWS.SharedIniFileCredentials({profile: 'infinite-nasa-apod-dev'});
AWS.config.update({ 
    region: 'eu-central-1',
    credentials: credentials
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function checkProgress() {
    try {
        const result = await dynamodb.scan({
            TableName: 'infinite-nasa-apod-dev-content',
            FilterExpression: 'attribute_exists(seoArticle)',
            Select: 'COUNT'
        }).promise();
        
        const withSeo = result.Count;
        const total = 56;
        const withoutSeo = total - withSeo;
        const progress = ((withSeo / total) * 100).toFixed(1);
        
        const timestamp = new Date().toLocaleTimeString('sk-SK');
        
        console.log(`[${timestamp}] Progress: ${withSeo}/${total} (${progress}%) - ${withoutSeo} remaining`);
        
        if (withSeo === total) {
            console.log('\n🎉 BULK GENERATION COMPLETE! All 56 articles have SEO content!');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('Error checking progress:', error.message);
    }
}

async function monitor() {
    console.log('📊 Monitoring SEO Article Generation Progress...');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    // Initial check
    await checkProgress();
    
    // Check every 30 seconds
    setInterval(checkProgress, 30000);
}

monitor();
