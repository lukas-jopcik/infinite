#!/bin/bash

# Setup script for ESA Hubble Picture of the Week Lambda function
# This script creates the Lambda function and EventBridge rule for weekly scheduling

set -e

# Configuration
ENVIRONMENT=${1:-dev}
FUNCTION_NAME="infinite-esa-hubble-potw-fetcher-${ENVIRONMENT}"
RULE_NAME="infinite-esa-hubble-weekly-schedule-${ENVIRONMENT}"
ROLE_NAME="infinite-lambda-execution-role-${ENVIRONMENT}"

echo "🚀 Setting up ESA Hubble POTW Lambda function for environment: ${ENVIRONMENT}"
echo "Function name: ${FUNCTION_NAME}"
echo "Rule name: ${RULE_NAME}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
echo "AWS Account ID: ${AWS_ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"

# Create IAM role for Lambda if it doesn't exist
echo "📋 Creating IAM role for Lambda function..."
ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ROLE_NAME}"

if ! aws iam get-role --role-name "${ROLE_NAME}" > /dev/null 2>&1; then
    echo "Creating IAM role: ${ROLE_NAME}"
    
    # Create trust policy
    cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create the role
    aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Execution role for Infinite Lambda functions"
    
    # Attach basic execution policy
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
    
    # Attach DynamoDB policy
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    
    echo "✅ IAM role created successfully"
    rm trust-policy.json
else
    echo "✅ IAM role already exists"
fi

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

# Create Lambda function
echo "📦 Creating Lambda function..."
if ! aws lambda get-function --function-name "${FUNCTION_NAME}" > /dev/null 2>&1; then
    # Create a placeholder deployment package
    mkdir -p temp-lambda-package
    echo 'exports.handler = async (event) => { return { statusCode: 200, body: "Placeholder" }; };' > temp-lambda-package/index.js
    
    # Create zip file
    cd temp-lambda-package
    zip -r ../lambda-package.zip .
    cd ..
    
    # Create Lambda function
    aws lambda create-function \
        --function-name "${FUNCTION_NAME}" \
        --runtime "nodejs18.x" \
        --role "${ROLE_ARN}" \
        --handler "esa-hubble-potw-fetcher.handler" \
        --zip-file "fileb://lambda-package.zip" \
        --timeout 300 \
        --memory-size 512 \
        --environment Variables="{ENVIRONMENT=${ENVIRONMENT}}" \
        --description "Fetches ESA Hubble Picture of the Week RSS feed"
    
    echo "✅ Lambda function created successfully"
    
    # Cleanup
    rm -rf temp-lambda-package lambda-package.zip
else
    echo "✅ Lambda function already exists"
fi

# Create EventBridge rule for weekly scheduling
echo "⏰ Creating EventBridge rule for weekly scheduling..."
if ! aws events describe-rule --name "${RULE_NAME}" > /dev/null 2>&1; then
    # Create EventBridge rule (Tuesday 8:00 AM CET = 6:00 AM UTC in winter, 7:00 AM UTC in summer)
    # Using 6:00 AM UTC to cover both CET and CEST
    aws events put-rule \
        --name "${RULE_NAME}" \
        --schedule-expression "cron(0 6 ? * TUE *)" \
        --description "Weekly trigger for ESA Hubble POTW fetcher (Tuesday 8:00 AM CET)" \
        --state "ENABLED"
    
    # Add Lambda function as target
    aws events put-targets \
        --rule "${RULE_NAME}" \
        --targets "Id"="1","Arn"="arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:${FUNCTION_NAME}"
    
    # Grant EventBridge permission to invoke Lambda
    aws lambda add-permission \
        --function-name "${FUNCTION_NAME}" \
        --statement-id "allow-eventbridge-${ENVIRONMENT}" \
        --action "lambda:InvokeFunction" \
        --principal "events.amazonaws.com" \
        --source-arn "arn:aws:events:${AWS_REGION}:${AWS_ACCOUNT_ID}:rule/${RULE_NAME}"
    
    echo "✅ EventBridge rule created successfully"
else
    echo "✅ EventBridge rule already exists"
fi

echo ""
echo "🎉 ESA Hubble POTW Lambda setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Lambda function: ${FUNCTION_NAME}"
echo "  - EventBridge rule: ${RULE_NAME}"
echo "  - Schedule: Every Tuesday at 8:00 AM CET (6:00 AM UTC)"
echo "  - IAM role: ${ROLE_NAME}"
echo ""
echo "📝 Next steps:"
echo "  1. Deploy the actual Lambda function code using deploy-esa-hubble-lambda.sh"
echo "  2. Test the function manually"
echo "  3. Monitor the first scheduled execution"
echo ""
echo "⚠️  Note: The schedule uses UTC time. CET/CEST timezone shifts require manual adjustment."
echo "   Current schedule: cron(0 6 ? * TUE *) = 6:00 AM UTC = 8:00 AM CET (winter) / 7:00 AM CEST (summer)"
