const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    console.log('Testing S3 access...');
    
    try {
        const params = {
            Bucket: 'infinite-nasa-apod-dev-images-349660737637',
            Key: 'test-lambda-upload.txt',
            Body: 'Test content from Lambda',
            ContentType: 'text/plain'
        };
        
        const result = await s3.upload(params).promise();
        console.log('✅ S3 upload successful:', result.Location);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'S3 upload successful',
                location: result.Location
            })
        };
        
    } catch (error) {
        console.error('❌ S3 upload failed:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'S3 upload failed',
                message: error.message
            })
        };
    }
};
