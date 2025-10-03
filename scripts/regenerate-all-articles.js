#!/usr/bin/env node

/**
 * Regenerate all articles with improved formatting
 * This will reprocess all articles to ensure consistent formatting
 */

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: 'eu-central-1',
  credentials: new AWS.SharedIniFileCredentials({ profile: 'infinite-nasa-apod-dev' })
});

const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB();

const TABLE_NAME = 'infinite-nasa-apod-dev-content';

async function getAllDates() {
  console.log('📊 Fetching all article dates...');
  
  const params = {
    TableName: TABLE_NAME,
    ProjectionExpression: '#date',
    ExpressionAttributeNames: {
      '#date': 'date'
    }
  };

  const result = await dynamodb.scan(params).promise();
  const dates = result.Items.map(item => item.date.S).sort();
  
  console.log(`✅ Found ${dates.length} articles`);
  return dates;
}

async function reprocessArticle(date) {
  const payload = {
    body: JSON.stringify({
      date: date,
      generateSeoArticle: true,
      seoArticleConfig: {
        topic: 'Astronomické pozorovanie a objavy',
        keywords: 'astronómia, vesmír, hviezdy, planéty, pozorovanie',
        targetAudience: 'astronómia nadšenci, študenti, všeobecná verejnosť'
      }
    })
  };

  try {
    const result = await lambda.invoke({
      FunctionName: 'infinite-nasa-apod-dev-api-reprocess',
      Payload: JSON.stringify(payload)
    }).promise();

    const response = JSON.parse(result.Payload);
    return response.statusCode === 202;
  } catch (error) {
    console.error(`❌ Error reprocessing ${date}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting bulk article regeneration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const dates = await getAllDates();
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    console.log(`\n📝 Processing ${i + 1}/${dates.length}: ${date}`);
    
    const success = await reprocessArticle(date);
    
    if (success) {
      successCount++;
      console.log(`✅ ${date} - Reprocessing started`);
    } else {
      errorCount++;
      console.log(`❌ ${date} - Failed to start reprocessing`);
    }
    
    // Rate limiting - wait 2 seconds between requests
    if (i < dates.length - 1) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Bulk regeneration completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Successfully started: ${successCount} articles`);
  console.log(`❌ Failed to start: ${errorCount} articles`);
  console.log(`📊 Total processed: ${dates.length} articles`);
  console.log('\n⏳ Note: Each article takes 2-3 minutes to complete processing');
  console.log('🔍 Use the monitor script to check progress');
}

main().catch(console.error);
