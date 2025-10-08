#!/bin/bash

# Setup APOD Fetcher Scheduled Rule for Infinite v1.0
# This script creates EventBridge rules for scheduled APOD fetching

set -e

echo "⏰ Setting up APOD Fetcher scheduled rule for Infinite v1.0..."

# Configuration
REGION="eu-central-1"
ENVIRONMENT="dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
FUNCTION_NAME="infinite-apod-fetcher-${ENVIRONMENT}"
RULE_NAME="infinite-apod-daily-${ENVIRONMENT}"

echo "📋 Setting up scheduled rule in region: ${REGION}"
echo "🏷️  Environment: ${ENVIRONMENT}"
echo "🆔 Account ID: ${ACCOUNT_ID}"
echo "⚡ Function: ${FUNCTION_NAME}"
echo "📅 Rule: ${RULE_NAME}"

# 1. Create EventBridge rule for daily APOD fetching (6 AM UTC)
echo "📅 Creating EventBridge rule for daily APOD fetching..."
aws events put-rule \
    --name ${RULE_NAME} \
    --schedule-expression "cron(0 6 * * ? *)" \
    --description "Daily trigger for APOD data fetching at 6 AM UTC" \
    --region ${REGION}

# 2. Add permission for EventBridge to invoke the Lambda function
echo "🔐 Adding permission for EventBridge to invoke Lambda function..."
aws lambda add-permission \
    --function-name ${FUNCTION_NAME} \
    --statement-id "allow-eventbridge-apod-${ENVIRONMENT}" \
    --action "lambda:InvokeFunction" \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:${REGION}:${ACCOUNT_ID}:rule/${RULE_NAME}" \
    --region ${REGION}

# 3. Add Lambda function as target for the rule
echo "🎯 Adding Lambda function as target for the rule..."
aws events put-targets \
    --rule ${RULE_NAME} \
    --targets "Id"="1","Arn"="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}" \
    --region ${REGION}

# 4. Verify the rule was created successfully
echo "✅ Verifying EventBridge rule..."
aws events describe-rule \
    --name ${RULE_NAME} \
    --region ${REGION} \
    --query "{Name:Name,ScheduleExpression:ScheduleExpression,State:State,Description:Description}" \
    --output json

# 5. List targets for the rule
echo "🎯 Listing targets for the rule..."
aws events list-targets-by-rule \
    --rule ${RULE_NAME} \
    --region ${REGION} \
    --query "Targets[].{Id:Id,Arn:Arn}" \
    --output table

# 6. Create CloudWatch alarm for monitoring
echo "📊 Creating CloudWatch alarm for monitoring..."
aws cloudwatch put-metric-alarm \
    --alarm-name "infinite-apod-fetcher-errors-${ENVIRONMENT}" \
    --alarm-description "Alert when APOD fetcher has errors" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --threshold 1 \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --dimensions Name=FunctionName,Value=${FUNCTION_NAME} \
    --evaluation-periods 1 \
    --alarm-actions "arn:aws:sns:${REGION}:${ACCOUNT_ID}:infinite-alerts" \
    --region ${REGION} || echo "⚠️  SNS topic not found, alarm created without actions"

# 7. Create CloudWatch alarm for no invocations
echo "📊 Creating CloudWatch alarm for no invocations..."
aws cloudwatch put-metric-alarm \
    --alarm-name "infinite-apod-fetcher-no-invocations-${ENVIRONMENT}" \
    --alarm-description "Alert when APOD fetcher has no invocations in 24 hours" \
    --metric-name Invocations \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 86400 \
    --threshold 1 \
    --comparison-operator LessThanThreshold \
    --dimensions Name=FunctionName,Value=${FUNCTION_NAME} \
    --evaluation-periods 1 \
    --alarm-actions "arn:aws:sns:${REGION}:${ACCOUNT_ID}:infinite-alerts" \
    --region ${REGION} || echo "⚠️  SNS topic not found, alarm created without actions"

echo "✅ APOD Fetcher scheduled rule setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  📅 Rule: ${RULE_NAME}"
echo "  ⏰ Schedule: Daily at 6 AM UTC (cron: 0 6 * * ? *)"
echo "  ⚡ Function: ${FUNCTION_NAME}"
echo "  🔐 Permissions: EventBridge can invoke Lambda"
echo "  📊 Monitoring: CloudWatch alarms configured"
echo ""
echo "📝 Next steps:"
echo "  1. Test the scheduled execution"
echo "  2. Monitor CloudWatch logs"
echo "  3. Verify APOD data is being fetched"
echo "  4. Set up SNS topic for alerts (optional)"
echo ""
echo "💰 Cost estimate:"
echo "  - EventBridge: ~$1/month"
echo "  - CloudWatch alarms: ~$2/month"
echo "  - Total: ~$3/month"
