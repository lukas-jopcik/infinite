#!/bin/bash

# Setup scheduled fetchers for ongoing content updates
# This script creates EventBridge rules for automated content fetching

echo "Setting up scheduled content fetchers..."

# Configuration
REGION="eu-central-1"
ACCOUNT_ID="349660737637"

# Function to create EventBridge rule
create_rule() {
    local rule_name=$1
    local schedule_expression=$2
    local function_name=$3
    local description=$4
    
    echo "Creating rule: $rule_name"
    
    # Create the EventBridge rule
    aws events put-rule \
        --name "$rule_name" \
        --schedule-expression "$schedule_expression" \
        --description "$description" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo "Rule $rule_name created successfully"
    else
        echo "Failed to create rule $rule_name"
        return 1
    fi
    
    # Add Lambda permission for EventBridge to invoke the function
    aws lambda add-permission \
        --function-name "$function_name" \
        --statement-id "allow-eventbridge-$rule_name" \
        --action "lambda:InvokeFunction" \
        --principal "events.amazonaws.com" \
        --source-arn "arn:aws:events:$REGION:$ACCOUNT_ID:rule/$rule_name" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo "Permission added for $function_name"
    else
        echo "Failed to add permission for $function_name"
        return 1
    fi
    
    # Add target to the rule
    aws events put-targets \
        --rule "$rule_name" \
        --targets "Id"="1","Arn"="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$function_name" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo "Target added to rule $rule_name"
    else
        echo "Failed to add target to rule $rule_name"
        return 1
    fi
}

# 1. Daily APOD fetcher (every day at 6 AM UTC)
create_rule \
    "infinite-apod-daily-fetcher-dev" \
    "cron(0 6 * * ? *)" \
    "infinite-apod-fetcher-dev" \
    "Daily APOD fetcher - runs every day at 6 AM UTC"

# 2. Weekly ESA Hubble fetcher (every Monday at 8 AM UTC)
create_rule \
    "infinite-esa-weekly-fetcher-dev" \
    "cron(0 8 ? * MON *)" \
    "infinite-esa-fetcher-dev" \
    "Weekly ESA Hubble fetcher - runs every Monday at 8 AM UTC"

# 3. Daily AI Content Generator (every day at 7 AM UTC)
create_rule \
    "infinite-ai-daily-generator-dev" \
    "cron(0 7 * * ? *)" \
    "infinite-ai-content-generator-dev" \
    "Daily AI content generator - runs every day at 7 AM UTC"

# 4. Weekly APOD RSS fetcher (every Sunday at 9 AM UTC for historical content)
create_rule \
    "infinite-apod-rss-weekly-fetcher-dev" \
    "cron(0 9 ? * SUN *)" \
    "infinite-apod-rss-fetcher-dev" \
    "Weekly APOD RSS fetcher - runs every Sunday at 9 AM UTC for historical content"

echo "All scheduled fetchers have been set up!"
echo ""
echo "Schedule Summary:"
echo "- Daily APOD fetcher: Every day at 6 AM UTC"
echo "- Weekly ESA Hubble fetcher: Every Monday at 8 AM UTC"
echo "- Daily AI Content Generator: Every day at 7 AM UTC"
echo "- Weekly APOD RSS fetcher: Every Sunday at 9 AM UTC"
echo ""
echo "You can view and manage these rules in the AWS EventBridge console."
