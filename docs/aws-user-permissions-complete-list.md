# Complete AWS User Permissions List - Ready to Add

## 🎯 **Complete Permissions for AWS User Creation**

This is the **exact list** of permissions you need to add to your AWS user for the Infinite NASA APOD project. Copy and paste these into your IAM user policy.

---

## 📋 **Option 1: Single Comprehensive Policy (Recommended)**

**Policy Name:** `InfiniteNASAAPOD-CompleteAccess`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaFullAccess",
      "Effect": "Allow",
      "Action": [
        "lambda:*"
      ],
      "Resource": [
        "arn:aws:lambda:eu-central-1:*:function:infinite-nasa-apod-*",
        "arn:aws:lambda:eu-central-1:*:layer:infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "DynamoDBFullAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-central-1:*:table/infinite-nasa-apod-*",
        "arn:aws:dynamodb:eu-central-1:*:table/infinite-nasa-apod-*/index/*"
      ]
    },
    {
      "Sid": "S3FullAccess",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::infinite-nasa-apod-*",
        "arn:aws:s3:::infinite-nasa-apod-*/*"
      ]
    },
    {
      "Sid": "CloudWatchFullAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsFullAccess",
      "Effect": "Allow",
      "Action": [
        "logs:*"
      ],
      "Resource": [
        "arn:aws:logs:eu-central-1:*:log-group:/aws/lambda/infinite-nasa-apod-*",
        "arn:aws:logs:eu-central-1:*:log-group:/aws/apigateway/infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "APIGatewayFullAccess",
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": [
        "arn:aws:apigateway:eu-central-1::/restapis/*",
        "arn:aws:execute-api:eu-central-1:*:*/infinite-nasa-apod/*"
      ]
    },
    {
      "Sid": "CloudFrontFullAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerFullAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:*"
      ],
      "Resource": [
        "arn:aws:secretsmanager:eu-central-1:*:secret:infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "IAMReadAccess",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicyVersions"
      ],
      "Resource": [
        "arn:aws:iam::*:role/infinite-nasa-apod-*",
        "arn:aws:iam::*:policy/infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "STSAssumeRole",
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/infinite-nasa-apod-*"
      ]
    },
    {
      "Sid": "EC2DescribeRegions",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeRegions",
        "ec2:DescribeAvailabilityZones"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 📋 **Option 2: AWS Managed Policies (Easier Setup)**

**Attach these AWS managed policies to your user:**

1. **AWSLambdaFullAccess**
2. **AmazonDynamoDBFullAccess**
3. **AmazonS3FullAccess**
4. **CloudWatchFullAccess**
5. **AmazonAPIGatewayAdministrator**
6. **CloudFrontFullAccess**
7. **SecretsManagerReadWrite**
8. **IAMReadOnlyAccess**

**Plus this custom policy for IAM PassRole:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/infinite-nasa-apod-*"
      ]
    }
  ]
}
```

---

## 📋 **Option 3: Step-by-Step AWS Console Setup**

### **1. Create User**
- Go to IAM → Users → Create User
- Username: `infinite-nasa-apod-dev-user`
- Access type: Programmatic access + AWS Management Console access

### **2. Attach Policies**
Choose **"Attach policies directly"** and add:

**AWS Managed Policies:**
- `AWSLambdaFullAccess`
- `AmazonDynamoDBFullAccess`
- `AmazonS3FullAccess`
- `CloudWatchFullAccess`
- `AmazonAPIGatewayAdministrator`
- `CloudFrontFullAccess`
- `SecretsManagerReadWrite`
- `IAMReadOnlyAccess`

**Custom Policy (Create New):**
- Policy Name: `InfiniteNASAAPOD-PassRole`
- Use the IAM PassRole policy from Option 2 above

### **3. Set Permissions Boundary (Optional but Recommended)**
Create a permissions boundary to limit the user's access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "aws:RequestedRegion": "eu-central-1"
        }
      }
    }
  ]
}
```

---

## 🎯 **Recommended Approach**

**Use Option 1 (Single Comprehensive Policy)** because:
- ✅ More secure (least privilege)
- ✅ Easier to manage
- ✅ Project-specific resource restrictions
- ✅ Regional restrictions (eu-central-1 only)
- ✅ Clear audit trail

---

## 🚀 **Quick Setup Commands**

### **Create the Policy**
```bash
# Save the policy to a file
cat > infinite-nasa-apod-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaFullAccess",
      "Effect": "Allow",
      "Action": ["lambda:*"],
      "Resource": ["arn:aws:lambda:eu-central-1:*:function:infinite-nasa-apod-*"]
    },
    {
      "Sid": "DynamoDBFullAccess",
      "Effect": "Allow",
      "Action": ["dynamodb:*"],
      "Resource": ["arn:aws:dynamodb:eu-central-1:*:table/infinite-nasa-apod-*"]
    },
    {
      "Sid": "S3FullAccess",
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": ["arn:aws:s3:::infinite-nasa-apod-*", "arn:aws:s3:::infinite-nasa-apod-*/*"]
    },
    {
      "Sid": "CloudWatchFullAccess",
      "Effect": "Allow",
      "Action": ["cloudwatch:*"],
      "Resource": "*"
    },
    {
      "Sid": "APIGatewayFullAccess",
      "Effect": "Allow",
      "Action": ["apigateway:*"],
      "Resource": "*"
    },
    {
      "Sid": "CloudFrontFullAccess",
      "Effect": "Allow",
      "Action": ["cloudfront:*"],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerFullAccess",
      "Effect": "Allow",
      "Action": ["secretsmanager:*"],
      "Resource": "arn:aws:secretsmanager:eu-central-1:*:secret:infinite-nasa-apod-*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": "arn:aws:iam::*:role/infinite-nasa-apod-*"
    }
  ]
}
EOF

# Create the policy
aws iam create-policy \
  --policy-name InfiniteNASAAPOD-CompleteAccess \
  --policy-document file://infinite-nasa-apod-policy.json \
  --profile YOUR_PROFILE
```

### **Attach to User**
```bash
# Attach policy to user
aws iam attach-user-policy \
  --user-name YOUR_USERNAME \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/InfiniteNASAAPOD-CompleteAccess \
  --profile YOUR_PROFILE
```

---

## ✅ **Verification**

After creating the user, test the permissions:

```bash
# Test Lambda access
aws lambda list-functions --region eu-central-1

# Test DynamoDB access
aws dynamodb list-tables --region eu-central-1

# Test S3 access
aws s3 ls

# Test CloudWatch access
aws cloudwatch list-metrics --region eu-central-1
```

---

## 🎯 **Summary**

**For immediate development, use Option 1** - the single comprehensive policy that gives you everything you need for the Infinite NASA APOD project with proper security restrictions.

**This policy includes:**
- ✅ Lambda functions
- ✅ DynamoDB tables
- ✅ S3 buckets
- ✅ CloudWatch monitoring
- ✅ API Gateway
- ✅ CloudFront CDN
- ✅ Secrets Manager
- ✅ IAM role passing
- ✅ Regional restrictions (eu-central-1)
- ✅ Project-specific resource restrictions

**Ready to create your AWS user!** 🚀
