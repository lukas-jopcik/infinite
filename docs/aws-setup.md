# AWS Setup Guide - Infinite NASA APOD Project

## Project Overview
**Project Name:** infinite-nasa-apod-slk  
**Environment:** Development & Production  
**Region:** Europe (Frankfurt) - eu-central-1  
**Optimized for:** Slovakia users  

## Region Selection Rationale

### Why Europe (Frankfurt) - eu-central-1?

1. **Geographic Proximity to Slovakia**
   - Frankfurt is the closest AWS region to Slovakia
   - Reduces latency for Slovak users
   - Improves page load times and user experience

2. **GDPR Compliance**
   - EU region ensures GDPR compliance
   - Data stays within European Union
   - Meets Slovak data protection requirements

3. **Performance Benefits**
   - Lower latency: ~20-30ms from Slovakia
   - Better CDN performance with CloudFront
   - Optimized for European traffic patterns

4. **Service Availability**
   - All required AWS services available in eu-central-1
   - Lambda, DynamoDB, S3, CloudFront all supported
   - Consistent service performance

## AWS Account Setup

### 1. Account Requirements
- AWS Account with billing enabled
- Access to AWS Management Console
- AWS CLI installed (version 2.x recommended)

### 2. Project Naming Convention
- **Project Prefix:** `infinite-nasa-apod`
- **Environment Suffix:** `-dev` (development), `-prod` (production)
- **Example:** `infinite-nasa-apod-dev-lambda-function`

## AWS CLI Configuration

### 1. Install AWS CLI (if not already installed)
```bash
# macOS
brew install awscli

# Or download from AWS website
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### 2. Configure AWS CLI for Development
```bash
# Configure development profile
aws configure --profile infinite-nasa-apod-dev

# Enter your credentials when prompted:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: eu-central-1
# Default output format: json
```

### 3. Configure AWS CLI for Production
```bash
# Configure production profile
aws configure --profile infinite-nasa-apod-prod

# Enter your production credentials when prompted
```

### 4. Set Default Profile (Optional)
```bash
# Set development as default for local development
export AWS_PROFILE=infinite-nasa-apod-dev

# Or add to your shell profile (.bashrc, .zshrc)
echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> ~/.bashrc
```

## IAM Setup

### 1. Create IAM User for Development
```bash
# Create development user
aws iam create-user --user-name infinite-nasa-apod-dev-user --profile infinite-nasa-apod-dev

# Attach developer policy
aws iam attach-user-policy \
  --user-name infinite-nasa-apod-dev-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/infinite-nasa-apod-dev-policy \
  --profile infinite-nasa-apod-dev
```

### 2. Create IAM Roles for Services
```bash
# Create Lambda execution role
aws iam create-role \
  --role-name infinite-nasa-apod-dev-lambda-role \
  --assume-role-policy-document file://aws/config/policies/lambda-trust-policy.json \
  --profile infinite-nasa-apod-dev

# Attach execution policy
aws iam attach-role-policy \
  --role-name infinite-nasa-apod-dev-lambda-role \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/infinite-nasa-apod-lambda-policy \
  --profile infinite-nasa-apod-dev
```

## Billing and Cost Monitoring

### 1. Set Up Billing Alerts
```bash
# Create CloudWatch billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "infinite-nasa-apod-dev-billing-alert" \
  --alarm-description "Alert when AWS charges exceed $25" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 25.0 \
  --comparison-operator GreaterThanThreshold \
  --profile infinite-nasa-apod-dev
```

### 2. Cost Allocation Tags
```bash
# Enable cost allocation tags
aws ce create-cost-category-definition \
  --name "infinite-nasa-apod-cost-category" \
  --rules '[
    {
      "Value": "infinite-nasa-apod-dev",
      "Rule": {
        "Tags": {
          "Key": "Project",
          "Values": ["infinite-nasa-apod"]
        }
      }
    }
  ]' \
  --profile infinite-nasa-apod-dev
```

## Environment Variables

### 1. Required Environment Variables
```bash
# NASA API
export NASA_API_KEY="your-nasa-api-key"

# OpenAI API
export OPENAI_API_KEY="your-openai-api-key"

# AWS Configuration
export AWS_REGION="eu-central-1"
export AWS_PROFILE="infinite-nasa-apod-dev"
```

### 2. Create .env File
```bash
# Create .env file for local development
cat > .env << EOF
NASA_API_KEY=your-nasa-api-key
OPENAI_API_KEY=your-openai-api-key
AWS_REGION=eu-central-1
AWS_PROFILE=infinite-nasa-apod-dev
EOF
```

## Verification Steps

### 1. Test AWS CLI Configuration
```bash
# Test authentication
aws sts get-caller-identity --profile infinite-nasa-apod-dev

# Test region access
aws ec2 describe-regions --region eu-central-1 --profile infinite-nasa-apod-dev

# List available services
aws service-quotas list-services --region eu-central-1 --profile infinite-nasa-apod-dev
```

### 2. Test Service Access
```bash
# Test Lambda access
aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev

# Test DynamoDB access
aws dynamodb list-tables --region eu-central-1 --profile infinite-nasa-apod-dev

# Test S3 access
aws s3 ls --region eu-central-1 --profile infinite-nasa-apod-dev
```

## Security Best Practices

### 1. IAM Security
- Use least-privilege access
- Enable MFA for root account
- Rotate access keys regularly
- Use IAM roles instead of users when possible

### 2. Network Security
- Use VPC for Lambda functions
- Enable encryption at rest and in transit
- Configure security groups properly
- Use CloudTrail for audit logging

### 3. Data Protection
- Enable S3 versioning
- Use DynamoDB point-in-time recovery
- Implement backup strategies
- Follow GDPR compliance requirements

## Troubleshooting

### Common Issues

1. **Region Not Available**
   - Verify region is supported for all services
   - Check AWS service status page

2. **Permission Denied**
   - Verify IAM policies are attached
   - Check resource ARNs in policies
   - Ensure correct profile is being used

3. **Billing Alerts Not Working**
   - Verify CloudWatch permissions
   - Check alarm configuration
   - Ensure billing data is available

### Support Resources
- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support Center: https://console.aws.amazon.com/support/
- AWS Service Health: https://status.aws.amazon.com/

## Next Steps

After completing this setup:
1. Proceed to Story 1.2: AWS CLI Setup and Configuration
2. Implement Story 1.3: AWS Infrastructure Setup
3. Begin Story 1.4: NASA API Integration Enhancement

---

**Last Updated:** December 19, 2024  
**Version:** 1.0  
**Author:** Developer Agent
