#!/bin/bash
# AWS MCP Setup Script
# ====================
# Tento skript nastaví AWS credentials a overí pripojenie k DynamoDB

# Farba pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 AWS MCP Setup Script${NC}"
echo "=========================="
echo ""

# Načítanie AWS konfigurácie
echo -e "${YELLOW}📋 Načítavam AWS konfiguráciu...${NC}"
if [ -f "scripts/aws-config.env" ]; then
    source scripts/aws-config.env
    echo -e "${GREEN}✅ AWS konfigurácia načítaná${NC}"
else
    echo -e "${RED}❌ Súbor scripts/aws-config.env neexistuje${NC}"
    exit 1
fi

# Overenie AWS credentials
echo -e "${YELLOW}🔐 Overujem AWS credentials...${NC}"
if aws sts get-caller-identity --profile "$AWS_PROFILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AWS credentials sú platné${NC}"
    aws sts get-caller-identity --profile "$AWS_PROFILE"
else
    echo -e "${RED}❌ AWS credentials nie sú platné alebo profile '$AWS_PROFILE' neexistuje${NC}"
    echo -e "${YELLOW}💡 Skontrolujte AWS konfiguráciu: aws configure list-profiles${NC}"
    exit 1
fi

echo ""

# Overenie DynamoDB pripojenia
echo -e "${YELLOW}🗃️  Overujem pripojenie k DynamoDB...${NC}"
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE_NAME" --region "$AWS_DEFAULT_REGION" --profile "$AWS_PROFILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DynamoDB tabuľka '$DYNAMODB_TABLE_NAME' je dostupná${NC}"
    
    # Zobrazenie základných informácií o tabuľke
    echo -e "${BLUE}📊 Základné informácie o tabuľke:${NC}"
    aws dynamodb describe-table --table-name "$DYNAMODB_TABLE_NAME" --region "$AWS_DEFAULT_REGION" --profile "$AWS_PROFILE" --query 'Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount,Size:TableSizeBytes}' --output table
else
    echo -e "${RED}❌ DynamoDB tabuľka '$DYNAMODB_TABLE_NAME' nie je dostupná${NC}"
    echo -e "${YELLOW}💡 Skontrolujte názov tabuľky a oprávnenia${NC}"
    exit 1
fi

echo ""

# Test MCP klienta
echo -e "${YELLOW}🧪 Testujem MCP klienta...${NC}"
if python3 scripts/dynamodb-mcp-client.py --profile "$AWS_PROFILE" --region "$AWS_DEFAULT_REGION" list-tables > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP klient funguje správne${NC}"
else
    echo -e "${RED}❌ MCP klient nefunguje správne${NC}"
    echo -e "${YELLOW}💡 Skontrolujte Python závislosti: pip3 install boto3${NC}"
    exit 1
fi

echo ""

# Zobrazenie dostupných príkazov
echo -e "${GREEN}🎉 Setup dokončený úspešne!${NC}"
echo ""
echo -e "${BLUE}📖 Dostupné príkazy:${NC}"
echo "  ./scripts/db.sh stats          - Štatistiky tabuľky"
echo "  ./scripts/db.sh hubble 5       - 5 najnovších Hubble položiek"
echo "  ./scripts/db.sh apod 3         - 3 najnovšie APOD položky"
echo "  ./scripts/db.sh list           - Zoznam tabuliek"
echo "  ./scripts/db.sh help           - Nápoveda"
echo ""
echo -e "${BLUE}🔧 Pokročilé príkazy:${NC}"
echo "  python3 scripts/dynamodb-mcp-client.py --help"
echo "  python3 scripts/dynamodb-mcp-client.py --profile $AWS_PROFILE --region $AWS_DEFAULT_REGION query-hubble --limit 10"
echo ""
echo -e "${YELLOW}💡 Tip: Pre rýchly prístup použite: source scripts/aws-config.env${NC}"
