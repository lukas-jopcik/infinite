#!/usr/bin/env node

/**
 * Monitor the progress of article regeneration
 * Shows how many articles have been processed with new formatting
 */

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: 'eu-central-1',
  credentials: new AWS.SharedIniFileCredentials({ profile: 'infinite-nasa-apod-dev' })
});

const dynamodb = new AWS.DynamoDB();

const TABLE_NAME = 'infinite-nasa-apod-dev-content';

async function checkProgress() {
  try {
    // Get total count
    const totalResult = await dynamodb.scan({
      TableName: TABLE_NAME,
      Select: 'COUNT'
    }).promise();
    
    const total = totalResult.Count;
    
    // Get count with SEO content (regenerated articles)
    const seoResult = await dynamodb.scan({
      TableName: TABLE_NAME,
      FilterExpression: 'attribute_exists(seoArticle)',
      Select: 'COUNT'
    }).promise();
    
    const withSeo = seoResult.Count;
    const withoutSeo = total - withSeo;
    const percentage = total > 0 ? Math.round((withSeo / total) * 100) : 0;
    
    console.log(`📊 Regeneration Progress: ${withSeo}/${total} (${percentage}%)`);
    console.log(`✅ Articles with new formatting: ${withSeo}`);
    console.log(`⏳ Articles still processing: ${withoutSeo}`);
    
    if (withoutSeo === 0) {
      console.log('\n🎉 All articles have been regenerated with improved formatting!');
      console.log('🚀 Bullet points and formatting should now work on all articles');
    } else {
      console.log('\n⏳ Regeneration still in progress...');
      console.log('🔄 Each article takes 2-3 minutes to process');
    }
    
  } catch (error) {
    console.error('❌ Error checking progress:', error.message);
  }
}

async function main() {
  console.log('🔍 Checking regeneration progress...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await checkProgress();
  
  console.log('\n💡 Run this script again to check progress');
  console.log('🔄 Or use: watch -n 30 "node scripts/monitor-regeneration-progress.js"');
}

main().catch(console.error);
