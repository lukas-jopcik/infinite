#!/bin/bash

# Setup EventBridge cron job for Hubble weekly updates
# This script creates an EventBridge rule that triggers hubble-fetcher every Monday at 6 AM UTC

set -e

echo "⏰ Setting up Hubble weekly cron job..."

# Configuration
REGION="eu-central-1"
FUNCTION_PREFIX="infinite-hubble"
RULE_NAME="${FUNCTION_PREFIX}-weekly-cron"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI configured. Current identity:"
aws sts get-caller-identity

# Get Lambda function ARN
print_status "Getting Lambda function ARN..."
FUNCTION_ARN=$(aws lambda get-function \
    --function-name "${FUNCTION_PREFIX}-fetcher" \
    --region $REGION \
    --query 'Configuration.FunctionArn' \
    --output text)

if [ -z "$FUNCTION_ARN" ]; then
    print_error "Could not find Lambda function: ${FUNCTION_PREFIX}-fetcher"
    exit 1
fi

print_status "Found Lambda function: $FUNCTION_ARN"

# Create EventBridge rule
print_status "Creating EventBridge rule: $RULE_NAME..."

aws events put-rule \
    --name $RULE_NAME \
    --schedule-expression "cron(0 6 ? * MON *)" \
    --description "Weekly Hubble RSS fetch - every Monday at 6 AM UTC" \
    --state ENABLED \
    --region $REGION

print_status "✅ EventBridge rule created successfully"

# Add Lambda function as target
print_status "Adding Lambda function as target..."

aws events put-targets \
    --rule $RULE_NAME \
    --targets "Id"="1","Arn"="$FUNCTION_ARN" \
    --region $REGION

print_status "✅ Lambda function added as target"

# Add permission for EventBridge to invoke Lambda
print_status "Adding EventBridge permission to invoke Lambda..."

aws lambda add-permission \
    --function-name "${FUNCTION_PREFIX}-fetcher" \
    --statement-id "allow-eventbridge-${RULE_NAME}" \
    --action "lambda:InvokeFunction" \
    --principal "events.amazonaws.com" \
    --source-arn "arn:aws:events:${REGION}:$(aws sts get-caller-identity --query Account --output text):rule/${RULE_NAME}" \
    --region $REGION

print_status "✅ EventBridge permission added"

# Display rule information
print_status "EventBridge rule created successfully!"
echo ""
echo "Rule Details:"
echo "  Name: $RULE_NAME"
echo "  Schedule: cron(0 6 ? * MON *) (Every Monday at 6:00 AM UTC)"
echo "  Target: $FUNCTION_ARN"
echo "  State: ENABLED"
echo ""

print_warning "Next steps:"
echo "  1. Test the rule manually: aws events test-event-pattern --event-pattern '{\"source\":[\"aws.events\"]}' --event '{\"source\":\"aws.events\"}'"
echo "  2. Monitor CloudWatch logs for execution"
echo "  3. Verify Hubble data is being processed and stored"

print_status "Hubble cron job setup completed!"
