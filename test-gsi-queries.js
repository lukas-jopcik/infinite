#!/usr/bin/env node

/**
 * Test GSI Queries for Infinite v2
 * This script tests all the GSI queries to ensure they work correctly
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize AWS services
const client = new DynamoDBClient({ region: 'eu-central-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

// Configuration
const ARTICLES_TABLE = 'InfiniteArticles-dev';
const RAW_CONTENT_TABLE = 'InfiniteRawContent-dev';

async function testGSIQueries() {
    console.log('🧪 Testing GSI Queries for Infinite v2...\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Articles - slug-index GSI
    try {
        console.log('1️⃣ Testing slug-index GSI...');
        const params = {
            TableName: ARTICLES_TABLE,
            IndexName: 'slug-index',
            KeyConditionExpression: 'slug = :slug',
            ExpressionAttributeValues: {
                ':slug': 'test-slug'
            },
            Limit: 1
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log('   ✅ slug-index GSI query successful');
        results.passed++;
        results.tests.push({ name: 'slug-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ slug-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'slug-index', status: 'FAIL', error: error.message });
    }

    // Test 2: Articles - category-originalDate-index GSI
    try {
        console.log('2️⃣ Testing category-originalDate-index GSI...');
        const params = {
            TableName: ARTICLES_TABLE,
            IndexName: 'category-originalDate-index',
            KeyConditionExpression: 'category = :category',
            ExpressionAttributeValues: {
                ':category': 'objav-dna'
            },
            ScanIndexForward: false,
            Limit: 5
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log(`   ✅ category-originalDate-index GSI query successful (${result.Items?.length || 0} items)`);
        results.passed++;
        results.tests.push({ name: 'category-originalDate-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ category-originalDate-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'category-originalDate-index', status: 'FAIL', error: error.message });
    }

    // Test 3: Articles - type-originalDate-index GSI
    try {
        console.log('3️⃣ Testing type-originalDate-index GSI...');
        const params = {
            TableName: ARTICLES_TABLE,
            IndexName: 'type-originalDate-index',
            KeyConditionExpression: '#type = :type',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':type': 'discovery'
            },
            ScanIndexForward: false,
            Limit: 5
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log(`   ✅ type-originalDate-index GSI query successful (${result.Items?.length || 0} items)`);
        results.passed++;
        results.tests.push({ name: 'type-originalDate-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ type-originalDate-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'type-originalDate-index', status: 'FAIL', error: error.message });
    }

    // Test 4: Articles - status-originalDate-index GSI
    try {
        console.log('4️⃣ Testing status-originalDate-index GSI...');
        const params = {
            TableName: ARTICLES_TABLE,
            IndexName: 'status-originalDate-index',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'published'
            },
            ScanIndexForward: false,
            Limit: 5
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log(`   ✅ status-originalDate-index GSI query successful (${result.Items?.length || 0} items)`);
        results.passed++;
        results.tests.push({ name: 'status-originalDate-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ status-originalDate-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'status-originalDate-index', status: 'FAIL', error: error.message });
    }

    // Test 5: RawContent - source-date-index GSI
    try {
        console.log('5️⃣ Testing source-date-index GSI...');
        const params = {
            TableName: RAW_CONTENT_TABLE,
            IndexName: 'source-date-index',
            KeyConditionExpression: '#source = :source',
            ExpressionAttributeNames: {
                '#source': 'source'
            },
            ExpressionAttributeValues: {
                ':source': 'apod'
            },
            ScanIndexForward: false,
            Limit: 5
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log(`   ✅ source-date-index GSI query successful (${result.Items?.length || 0} items)`);
        results.passed++;
        results.tests.push({ name: 'source-date-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ source-date-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'source-date-index', status: 'FAIL', error: error.message });
    }

    // Test 6: RawContent - status-index GSI
    try {
        console.log('6️⃣ Testing status-index GSI...');
        const params = {
            TableName: RAW_CONTENT_TABLE,
            IndexName: 'status-index',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'raw'
            },
            Limit: 5
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log(`   ✅ status-index GSI query successful (${result.Items?.length || 0} items)`);
        results.passed++;
        results.tests.push({ name: 'status-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ status-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'status-index', status: 'FAIL', error: error.message });
    }

    // Test 7: RawContent - guid-index GSI
    try {
        console.log('7️⃣ Testing guid-index GSI...');
        const params = {
            TableName: RAW_CONTENT_TABLE,
            IndexName: 'guid-index',
            KeyConditionExpression: 'guid = :guid',
            ExpressionAttributeValues: {
                ':guid': 'test-guid'
            },
            Limit: 1
        };
        
        const result = await dynamodb.send(new QueryCommand(params));
        console.log('   ✅ guid-index GSI query successful');
        results.passed++;
        results.tests.push({ name: 'guid-index', status: 'PASS' });
    } catch (error) {
        console.log('   ❌ guid-index GSI query failed:', error.message);
        results.failed++;
        results.tests.push({ name: 'guid-index', status: 'FAIL', error: error.message });
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    console.log('\n📋 Detailed Results:');
    results.tests.forEach(test => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${status} ${test.name}: ${test.status}`);
        if (test.error) {
            console.log(`      Error: ${test.error}`);
        }
    });

    if (results.failed === 0) {
        console.log('\n🎉 All GSI tests passed! The implementation is ready for deployment.');
        return true;
    } else {
        console.log('\n⚠️  Some GSI tests failed. Please check the errors above.');
        return false;
    }
}

// Run the tests
testGSIQueries()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
