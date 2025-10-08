#!/bin/bash
# AWS Setup Validation Tests
# Tests for Story 1.1: AWS Project Setup and Region Configuration

set -e  # Exit on any error

echo "🧪 Running AWS Setup Validation Tests..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_passed() {
    echo -e "${GREEN}✅ PASSED: $1${NC}"
}

test_failed() {
    echo -e "${RED}❌ FAILED: $1${NC}"
    exit 1
}

test_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Test 1: AWS CLI Installation
echo "Test 1: AWS CLI Installation"
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    test_passed "AWS CLI is installed: $AWS_VERSION"
else
    test_failed "AWS CLI is not installed"
fi

# Test 2: AWS CLI Configuration
echo "Test 2: AWS CLI Configuration"
if aws configure list --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "Development profile configured"
else
    test_failed "Development profile not configured"
fi

if aws configure list --profile infinite-nasa-apod-prod &> /dev/null; then
    test_passed "Production profile configured"
else
    test_warning "Production profile not configured (optional for development)"
fi

# Test 3: Region Configuration
echo "Test 3: Region Configuration"
DEV_REGION=$(aws configure get region --profile infinite-nasa-apod-dev)
if [ "$DEV_REGION" = "eu-central-1" ]; then
    test_passed "Development region set to eu-central-1"
else
    test_failed "Development region not set to eu-central-1 (current: $DEV_REGION)"
fi

# Test 4: Authentication
echo "Test 4: Authentication"
if aws sts get-caller-identity --profile infinite-nasa-apod-dev &> /dev/null; then
    CALLER_IDENTITY=$(aws sts get-caller-identity --profile infinite-nasa-apod-dev)
    test_passed "Authentication successful"
    echo "  Account: $(echo $CALLER_IDENTITY | jq -r '.Account')"
    echo "  User: $(echo $CALLER_IDENTITY | jq -r '.Arn')"
else
    test_failed "Authentication failed"
fi

# Test 5: Region Access
echo "Test 5: Region Access"
if aws ec2 describe-regions --region eu-central-1 --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "Region eu-central-1 is accessible"
else
    test_failed "Region eu-central-1 is not accessible"
fi

# Test 6: Service Access
echo "Test 6: Service Access"

# Test Lambda
if aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "Lambda service accessible"
else
    test_failed "Lambda service not accessible"
fi

# Test DynamoDB
if aws dynamodb list-tables --region eu-central-1 --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "DynamoDB service accessible"
else
    test_failed "DynamoDB service not accessible"
fi

# Test S3
if aws s3 ls --region eu-central-1 --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "S3 service accessible"
else
    test_failed "S3 service not accessible"
fi

# Test CloudWatch
if aws cloudwatch list-metrics --region eu-central-1 --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "CloudWatch service accessible"
else
    test_failed "CloudWatch service not accessible"
fi

# Test 7: IAM Permissions
echo "Test 7: IAM Permissions"
if aws iam get-user --profile infinite-nasa-apod-dev &> /dev/null; then
    test_passed "IAM service accessible"
else
    test_failed "IAM service not accessible"
fi

# Test 8: Environment Variables
echo "Test 8: Environment Variables"
if [ -f ".env" ]; then
    test_passed "Environment file (.env) exists"
    
    # Check for required variables
    if grep -q "AWS_REGION=eu-central-1" .env; then
        test_passed "AWS_REGION set to eu-central-1 in .env"
    else
        test_warning "AWS_REGION not set in .env"
    fi
    
    if grep -q "AWS_PROFILE=infinite-nasa-apod-dev" .env; then
        test_passed "AWS_PROFILE set in .env"
    else
        test_warning "AWS_PROFILE not set in .env"
    fi
else
    test_warning "Environment file (.env) not found"
fi

# Test 9: Configuration Files
echo "Test 9: Configuration Files"
if [ -f "aws/config/environments/development.yaml" ]; then
    test_passed "Development environment config exists"
else
    test_failed "Development environment config missing"
fi

if [ -f "aws/config/environments/production.yaml" ]; then
    test_passed "Production environment config exists"
else
    test_failed "Production environment config missing"
fi

if [ -f "aws/config/policies/lambda-execution-policy.json" ]; then
    test_passed "Lambda execution policy exists"
else
    test_failed "Lambda execution policy missing"
fi

if [ -f "aws/config/policies/developer-policy.json" ]; then
    test_passed "Developer policy exists"
else
    test_failed "Developer policy missing"
fi

# Test 10: Documentation
echo "Test 10: Documentation"
if [ -f "docs/aws-setup.md" ]; then
    test_passed "AWS setup documentation exists"
else
    test_failed "AWS setup documentation missing"
fi

if [ -f "docs/region-selection.md" ]; then
    test_passed "Region selection documentation exists"
else
    test_failed "Region selection documentation missing"
fi

if [ -f "docs/aws-cli-configuration.md" ]; then
    test_passed "AWS CLI configuration documentation exists"
else
    test_failed "AWS CLI configuration documentation missing"
fi

echo ""
echo "🎉 AWS Setup Validation Tests Complete!"
echo "========================================"
echo "All tests passed! AWS setup is ready for development."
echo ""
echo "Next steps:"
echo "1. Proceed to Story 1.2: AWS CLI Setup and Configuration"
echo "2. Implement Story 1.3: AWS Infrastructure Setup"
echo "3. Begin Story 1.4: NASA API Integration Enhancement"
