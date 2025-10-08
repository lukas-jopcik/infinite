# AWS CLI Manual Setup Guide - Infinite NASA APOD Project

## 🚀 **Manual AWS CLI Configuration**

Since the interactive setup script isn't working in this environment, here's how to manually configure your AWS CLI for the Infinite NASA APOD project.

---

## **Step 1: Configure Development Profile**

Run this command in your terminal:

```bash
aws configure --profile infinite-nasa-apod-dev
```

**Enter the following when prompted:**
- **AWS Access Key ID:** `[Your Access Key from the user you just created]`
- **AWS Secret Access Key:** `[Your Secret Key from the user you just created]`
- **Default region name:** `eu-central-1`
- **Default output format:** `json`

---

## **Step 2: Configure Production Profile (Optional)**

```bash
aws configure --profile infinite-nasa-apod-prod
```

**Enter your production credentials when prompted.**

---

## **Step 3: Set Default Profile (Optional)**

```bash
# Set development as default
export AWS_PROFILE=infinite-nasa-apod-dev

# Add to your shell profile for persistence
echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> ~/.bashrc
echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> ~/.zshrc
```

---

## **Step 4: Create Environment File**

```bash
# Create .env file
cat > .env << EOF
# AWS Configuration
AWS_REGION=eu-central-1
AWS_PROFILE=infinite-nasa-apod-dev

# External APIs (replace with your actual keys)
NASA_API_KEY=your-nasa-api-key
OPENAI_API_KEY=your-openai-api-key

# Project Configuration
PROJECT_NAME=infinite-nasa-apod-slk
ENVIRONMENT=development
EOF
```

---

## **Step 5: Verify Configuration**

```bash
# Test authentication
aws sts get-caller-identity --profile infinite-nasa-apod-dev

# Test region access
aws ec2 describe-regions --region eu-central-1 --profile infinite-nasa-apod-dev

# Test service access
aws lambda list-functions --region eu-central-1 --profile infinite-nasa-apod-dev
aws dynamodb list-tables --region eu-central-1 --profile infinite-nasa-apod-dev
aws s3 ls --region eu-central-1 --profile infinite-nasa-apod-dev
```

---

## **Step 6: Run Validation Tests**

```bash
# Make test script executable
chmod +x tests/aws/test-aws-setup.sh

# Run validation tests
./tests/aws/test-aws-setup.sh
```

---

## **Expected Output**

After successful configuration, you should see:

```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/infinite-nasa-apod-dev-user"
}
```

---

## **Troubleshooting**

### **If you get "Access Denied" errors:**
1. Check that your user has the correct policies attached
2. Verify the region is set to `eu-central-1`
3. Ensure your access keys are correct

### **If you get "Invalid region" errors:**
1. Verify `eu-central-1` is the correct region
2. Check that the region is available in your AWS account

### **If you get "Profile not found" errors:**
1. Make sure you're using the correct profile name: `infinite-nasa-apod-dev`
2. Check your `~/.aws/credentials` file

---

## **Next Steps**

After successful configuration:

1. ✅ **Story 1.1 Complete:** AWS Project Setup and Region Configuration
2. 🚀 **Proceed to Story 1.2:** AWS CLI Setup and Configuration (Complete)
3. 🚀 **Proceed to Story 1.3:** AWS Infrastructure Setup

---

**Ready to continue with the next story!** 🎉
