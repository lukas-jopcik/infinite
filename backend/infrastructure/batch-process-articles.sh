#!/bin/bash

# Batch process all raw articles using AI Content Generator
# This script runs the AI generator multiple times to process all raw content

echo "Starting batch processing of raw articles..."

# Function to run AI generator and check results
run_ai_generator() {
    local batch_num=$1
    echo "Running batch $batch_num..."
    
    # Invoke the AI generator
    aws lambda invoke \
        --function-name infinite-ai-content-generator-dev \
        --invocation-type RequestResponse \
        --payload '{"test": "batch processing raw content"}' \
        --log-type Tail \
        "/tmp/ai-generator-batch-$batch_num-response.json" \
        --region eu-central-1
    
    # Check the response
    if [ $? -eq 0 ]; then
        echo "Batch $batch_num completed successfully"
        cat "/tmp/ai-generator-batch-$batch_num-response.json" | jq -r '.body' | jq -r '.processedCount'
        return 0
    else
        echo "Batch $batch_num failed"
        return 1
    fi
}

# Check how many raw articles are left
check_raw_count() {
    aws dynamodb scan \
        --table-name InfiniteRawContent-dev \
        --filter-expression "#status = :status" \
        --expression-attribute-names '{"#status": "status"}' \
        --expression-attribute-values '{":status": {"S": "raw"}}' \
        --region eu-central-1 \
        --query 'Items[*].contentId.S' \
        --output text | wc -w
}

# Main processing loop
batch_num=1
max_batches=100  # Safety limit

while [ $batch_num -le $max_batches ]; do
    raw_count=$(check_raw_count)
    echo "Raw articles remaining: $raw_count"
    
    if [ $raw_count -eq 0 ]; then
        echo "All articles processed! Exiting."
        break
    fi
    
    echo "Processing batch $batch_num..."
    run_ai_generator $batch_num
    
    if [ $? -ne 0 ]; then
        echo "Error in batch $batch_num. Stopping."
        exit 1
    fi
    
    # Wait a bit between batches to avoid overwhelming the system
    sleep 5
    
    batch_num=$((batch_num + 1))
done

echo "Batch processing completed!"
echo "Final raw article count: $(check_raw_count)"
