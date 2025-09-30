# AWS CLI Configuration Guide - Infinite NASA APOD Project

## Overview

This guide provides step-by-step instructions for configuring AWS CLI for the Infinite NASA APOD project, optimized for Slovakia users with the Europe (Frankfurt) - eu-central-1 region.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed (version 2.x recommended)
- Access to AWS Management Console

## Installation

### 1. Check Current Installation
```bash
aws --version
```

### 2. Install AWS CLI (if needed)
```bash
# macOS
brew install awscli

# Or download from AWS website
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

## Configuration

### 1. Configure Development Profile
```bash
aws configure --profile infinite-nasa-apod-dev
```

**Enter the following when prompted:**
```
AWS Access Key ID: [Your Development Access Key]
AWS Secret Access Key: [Your Development Secret Key]
Default region name: eu-central-1
Default output format: json
```

### 2. Configure Production Profile
```bash
aws configure --profile infinite-nasa-apod-prod
```

**Enter the following when prompted:**
```
AWS Access Key ID: [Your Production Access Key]
AWS Secret Access Key: [Your Production Secret Key]
Default region name: eu-central-1
Default output format: json
```

### 3. Set Default Profile (Optional)
```bash
# Set development as default for local development
export AWS_PROFILE=infinite-nasa-apod-dev

# Add to shell profile for persistence
echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> ~/.bashrc
echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> ~/.zshrc
```

## Environment Variables

### 1. Create Environment File
```bash
# Create .env file for local development
cat > .env << EOF
# AWS Configuration
AWS_REGION=eu-central-1
AWS_PROFILE=infinite-nasa-apod-dev

# External APIs
NASA_API_KEY=your-nasa-api-key
OPENAI_API_KEY=your-openai-api-key

# Project Configuration
PROJECT_NAME=infinite-nasa-apod-slk
ENVIRONMENT=development
EOF
```

### 2. Load Environment Variables
```bash
# Load environment variables
source .env

# Or add to shell profile
echo 'source .env' >> ~/.bashrc
```

## Verification

### 1. Test Authentication
```bash
# Test development profile
aws sts get-caller-identity --profile infinite-nasa-apod-dev

# Test production profile
aws sts get-caller-identity --profile infinite-nasa-apod-prod
```

**Expected Output:**
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/infinite-nasa-apod-dev-user"
}
```

### 2. Test Region Access
```bash
# Test region access
aws ec2 describe-regions --region eu-central-1 --profile infinite-nasa-apod-dev
```

### 3. Test Service Access
```bash
# Test Lambda access
aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev

# Test DynamoDB access
aws dynamodb list-tables --region eu-central-1 --profile infinite-nasa-apod-dev

# Test S3 access
aws s3 ls --region eu-central-1 --profile infinite-nasa-apod-dev
```

## Configuration Files

### 1. AWS Credentials File (~/.aws/credentials)
```ini
[infinite-nasa-apod-dev]
aws_access_key_id = YOUR_DEV_ACCESS_KEY
aws_secret_access_key = YOUR_DEV_SECRET_KEY

[infinite-nasa-apod-prod]
aws_access_key_id = YOUR_PROD_ACCESS_KEY
aws_secret_access_key = YOUR_PROD_SECRET_KEY
```

### 2. AWS Config File (~/.aws/config)
```ini
[profile infinite-nasa-apod-dev]
region = eu-central-1
output = json

[profile infinite-nasa-apod-prod]
region = eu-central-1
output = json
```

## Security Best Practices

### 1. Access Key Management
- Use IAM users instead of root account
- Rotate access keys regularly
- Enable MFA for sensitive operations
- Use temporary credentials when possible

### 2. Profile Security
- Never commit credentials to version control
- Use environment variables for sensitive data
- Restrict file permissions on credential files
- Use AWS Secrets Manager for production secrets

### 3. Network Security
- Use HTTPS for all AWS API calls
- Enable CloudTrail for audit logging
- Use VPC endpoints for private communication
- Implement proper security groups

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Error: Unable to locate credentials
# Solution: Check profile configuration
aws configure list --profile infinite-nasa-apod-dev
```

#### 2. Region Errors
```bash
# Error: Invalid region
# Solution: Verify region is correct
aws ec2 describe-regions --region eu-central-1
```

#### 3. Permission Errors
```bash
# Error: Access denied
# Solution: Check IAM permissions
aws iam get-user --profile infinite-nasa-apod-dev
```

### Debug Commands
```bash
# Enable debug logging
export AWS_CLI_AUTO_PROMPT=on-partial
export AWS_CLI_FILE_ENCODING=UTF-8

# Check configuration
aws configure list --profile infinite-nasa-apod-dev

# Test specific service
aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev --debug
```

## Automation Scripts

### 1. Setup Script
```bash
#!/bin/bash
# setup-aws-cli.sh

echo "Setting up AWS CLI for Infinite NASA APOD project..."

# Configure development profile
aws configure --profile infinite-nasa-apod-dev

# Configure production profile
aws configure --profile infinite-nasa-apod-prod

# Test configuration
echo "Testing configuration..."
aws sts get-caller-identity --profile infinite-nasa-apod-dev

echo "AWS CLI setup complete!"
```

### 2. Verification Script
```bash
#!/bin/bash
# verify-aws-cli.sh

echo "Verifying AWS CLI configuration..."

# Test authentication
echo "Testing authentication..."
aws sts get-caller-identity --profile infinite-nasa-apod-dev

# Test region access
echo "Testing region access..."
aws ec2 describe-regions --region eu-central-1 --profile infinite-nasa-apod-dev

# Test service access
echo "Testing service access..."
aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev

echo "Verification complete!"
```

## Next Steps

After completing AWS CLI configuration:

1. **Proceed to Story 1.2:** AWS CLI Setup and Configuration (Complete)
2. **Implement Story 1.3:** AWS Infrastructure Setup
3. **Begin Story 1.4:** NASA API Integration Enhancement

## Support

### Resources
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [AWS CLI Troubleshooting](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-troubleshooting.html)

### Contact
- AWS Support: https://console.aws.amazon.com/support/
- AWS Service Health: https://status.aws.amazon.com/

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Developer Agent  
**Review Status:** Approved
