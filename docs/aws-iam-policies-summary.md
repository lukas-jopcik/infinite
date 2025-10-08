# AWS IAM Policies Summary - Infinite NASA APOD Project

## Overview

This document provides a comprehensive overview of all AWS IAM policies required for the Infinite NASA APOD project, organized by service and use case.

## Policy Categories

### 1. **Core Service Policies** ✅

#### Lambda Execution Policy
- **File:** `aws/config/policies/lambda-execution-policy.json`
- **Purpose:** Allows Lambda functions to execute and access required services
- **Services:** CloudWatch Logs, DynamoDB, S3
- **Scope:** Project-specific resources only

#### Developer Policy
- **File:** `aws/config/policies/developer-policy.json`
- **Purpose:** Allows developers to manage all project resources
- **Services:** Lambda, DynamoDB, S3, CloudWatch, IAM
- **Scope:** Full project access for development

### 2. **Storage Service Policies** ✅

#### S3 Bucket Policy
- **File:** `aws/config/policies/s3-bucket-policy.json`
- **Purpose:** Manages S3 bucket access and permissions
- **Features:**
  - CloudFront Origin Access Identity
  - Lambda function access
  - Public read access for images (with referer restrictions)
- **Security:** Referer-based access control for public images

#### DynamoDB Access Policy
- **File:** `aws/config/policies/dynamodb-access-policy.json`
- **Purpose:** Manages DynamoDB table access
- **Features:**
  - Full CRUD operations on project tables
  - Index access for efficient querying
  - Table management operations
- **Scope:** Project-specific tables and indexes

### 3. **Monitoring & Logging Policies** ✅

#### CloudWatch Monitoring Policy
- **File:** `aws/config/policies/cloudwatch-monitoring-policy.json`
- **Purpose:** Manages CloudWatch logs and metrics
- **Features:**
  - Log group creation and management
  - Metric data publishing
  - Alarm creation and management
- **Scope:** Project-specific log groups and metrics

### 4. **API & Networking Policies** ✅

#### API Gateway Policy
- **File:** `aws/config/policies/api-gateway-policy.json`
- **Purpose:** Manages API Gateway resources
- **Features:**
  - API management operations
  - API execution permissions
- **Scope:** Project-specific APIs

#### CloudFront Policy
- **File:** `aws/config/policies/cloudfront-policy.json`
- **Purpose:** Manages CloudFront distributions
- **Features:**
  - Distribution management
  - Origin Access Identity management
  - Cache invalidation
- **Scope:** Project-specific distributions

### 5. **Security & Secrets Policies** ✅

#### Secrets Manager Policy
- **File:** `aws/config/policies/secrets-manager-policy.json`
- **Purpose:** Manages API keys and secrets
- **Features:**
  - Secret value retrieval
  - Secret management operations
- **Scope:** Project-specific secrets

## Policy Implementation Guide

### 1. **Create IAM Policies**
```bash
# Create Lambda execution policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-lambda-execution \
  --policy-document file://aws/config/policies/lambda-execution-policy.json \
  --profile infinite-nasa-apod-dev

# Create developer policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-developer \
  --policy-document file://aws/config/policies/developer-policy.json \
  --profile infinite-nasa-apod-dev

# Create S3 bucket policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-s3-access \
  --policy-document file://aws/config/policies/s3-bucket-policy.json \
  --profile infinite-nasa-apod-dev

# Create DynamoDB access policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-dynamodb-access \
  --policy-document file://aws/config/policies/dynamodb-access-policy.json \
  --profile infinite-nasa-apod-dev

# Create CloudWatch monitoring policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-cloudwatch-monitoring \
  --policy-document file://aws/config/policies/cloudwatch-monitoring-policy.json \
  --profile infinite-nasa-apod-dev

# Create API Gateway policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-api-gateway \
  --policy-document file://aws/config/policies/api-gateway-policy.json \
  --profile infinite-nasa-apod-dev

# Create CloudFront policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-cloudfront \
  --policy-document file://aws/config/policies/cloudfront-policy.json \
  --profile infinite-nasa-apod-dev

# Create Secrets Manager policy
aws iam create-policy \
  --policy-name infinite-nasa-apod-secrets-manager \
  --policy-document file://aws/config/policies/secrets-manager-policy.json \
  --profile infinite-nasa-apod-dev
```

### 2. **Attach Policies to Roles**
```bash
# Attach policies to Lambda execution role
aws iam attach-role-policy \
  --role-name infinite-nasa-apod-dev-lambda-role \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/infinite-nasa-apod-lambda-execution \
  --profile infinite-nasa-apod-dev

# Attach policies to developer user
aws iam attach-user-policy \
  --user-name infinite-nasa-apod-dev-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/infinite-nasa-apod-developer \
  --profile infinite-nasa-apod-dev
```

## Security Best Practices

### 1. **Least Privilege Access**
- All policies follow the principle of least privilege
- Access is restricted to project-specific resources
- No wildcard permissions for sensitive operations

### 2. **Resource Naming Convention**
- All resources use the `infinite-nasa-apod-*` prefix
- Environment-specific suffixes (`-dev`, `-prod`)
- Consistent naming across all AWS services

### 3. **Regional Restriction**
- All policies are scoped to `eu-central-1` region
- No cross-region access unless explicitly required
- GDPR compliance maintained

### 4. **Access Control**
- Public access only for image assets with referer restrictions
- API access through proper authentication
- Secrets managed through AWS Secrets Manager

## Policy Validation

### 1. **Test Policy Permissions**
```bash
# Test Lambda execution
aws lambda invoke \
  --function-name infinite-nasa-apod-dev-test-function \
  --payload '{}' \
  response.json \
  --profile infinite-nasa-apod-dev

# Test DynamoDB access
aws dynamodb list-tables \
  --region eu-central-1 \
  --profile infinite-nasa-apod-dev

# Test S3 access
aws s3 ls s3://infinite-nasa-apod-dev-bucket \
  --profile infinite-nasa-apod-dev
```

### 2. **Monitor Policy Usage**
- Use CloudTrail to monitor policy usage
- Set up CloudWatch alarms for unusual access patterns
- Regular policy review and rotation

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Check policy ARNs and resource names
   - Verify region configuration
   - Ensure proper policy attachment

2. **Cross-Service Access Issues**
   - Verify service-to-service permissions
   - Check IAM role trust relationships
   - Validate resource ARNs

3. **Public Access Issues**
   - Check S3 bucket policies
   - Verify CloudFront distribution settings
   - Review CORS configuration

## Policy Maintenance

### 1. **Regular Reviews**
- Monthly policy review
- Quarterly access audit
- Annual policy optimization

### 2. **Version Control**
- All policies stored in version control
- Change tracking and approval process
- Automated policy deployment

### 3. **Documentation Updates**
- Keep policy documentation current
- Update implementation guides
- Maintain troubleshooting guides

## Next Steps

After implementing these policies:

1. **Proceed to Story 1.2:** AWS CLI Setup and Configuration
2. **Implement Story 1.3:** AWS Infrastructure Setup
3. **Begin Story 1.4:** NASA API Integration Enhancement

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Developer Agent  
**Review Status:** Ready for Implementation
