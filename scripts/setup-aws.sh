#!/bin/bash
# AWS Setup Script for Infinite NASA APOD Project
# This script helps set up AWS CLI configuration for the project

set -e

echo "🚀 Setting up AWS CLI for Infinite NASA APOD project..."
echo "======================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   macOS: brew install awscli"
    echo "   Or download from: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✅ AWS CLI is installed: $(aws --version)"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p aws/config/environments
mkdir -p aws/config/policies
mkdir -p docs
mkdir -p tests/aws
mkdir -p scripts

# Configure development profile
echo "🔧 Configuring development profile..."
echo "Please enter your AWS credentials for the development environment:"
aws configure --profile infinite-nasa-apod-dev

# Verify development configuration
echo "✅ Verifying development configuration..."
if aws sts get-caller-identity --profile infinite-nasa-apod-dev &> /dev/null; then
    echo -e "${GREEN}✅ Development profile configured successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Development profile configuration failed${NC}"
fi

# Ask about production profile
echo ""
read -p "Do you want to configure the production profile now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Configuring production profile..."
    aws configure --profile infinite-nasa-apod-prod
    
    # Verify production configuration
    if aws sts get-caller-identity --profile infinite-nasa-apod-prod &> /dev/null; then
        echo -e "${GREEN}✅ Production profile configured successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Production profile configuration failed${NC}"
    fi
else
    echo "⏭️  Skipping production profile configuration"
fi

# Create environment file
echo "📝 Creating environment file..."
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

echo -e "${GREEN}✅ Environment file created: .env${NC}"

# Set up shell profile
echo "🔧 Setting up shell profile..."
SHELL_PROFILE=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
fi

if [ -n "$SHELL_PROFILE" ]; then
    if ! grep -q "AWS_PROFILE=infinite-nasa-apod-dev" "$SHELL_PROFILE"; then
        echo 'export AWS_PROFILE=infinite-nasa-apod-dev' >> "$SHELL_PROFILE"
        echo -e "${GREEN}✅ Added AWS_PROFILE to $SHELL_PROFILE${NC}"
    else
        echo -e "${YELLOW}⚠️  AWS_PROFILE already set in $SHELL_PROFILE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not find shell profile file${NC}"
fi

# Run validation tests
echo ""
echo "🧪 Running validation tests..."
if [ -f "tests/aws/test-aws-setup.sh" ]; then
    chmod +x tests/aws/test-aws-setup.sh
    ./tests/aws/test-aws-setup.sh
else
    echo -e "${YELLOW}⚠️  Validation test script not found${NC}"
fi

echo ""
echo "🎉 AWS setup complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Update your API keys in the .env file"
echo "2. Run the validation tests: ./tests/aws/test-aws-setup.sh"
echo "3. Proceed to Story 1.2: AWS CLI Setup and Configuration"
echo "4. Implement Story 1.3: AWS Infrastructure Setup"
echo ""
echo "For more information, see:"
echo "- docs/aws-setup.md"
echo "- docs/region-selection.md"
echo "- docs/aws-cli-configuration.md"
