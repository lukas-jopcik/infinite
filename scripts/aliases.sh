#!/bin/bash
# DynamoDB MCP Aliases
# ====================
# Tento súbor obsahuje užitočné aliasy pre prácu s DynamoDB

# Načítanie AWS konfigurácie
if [ -f "scripts/aws-config.env" ]; then
    source scripts/aws-config.env
fi

# DynamoDB MCP Aliases
alias db-stats='./scripts/db.sh stats'
alias db-apod='./scripts/db.sh apod'
alias db-list='./scripts/db.sh list'
alias db-scan='./scripts/db.sh scan'
alias db-item='./scripts/db.sh item'
alias db-describe='./scripts/db.sh describe'
alias db-help='./scripts/db.sh help'

# AWS Aliases
alias aws-who='aws sts get-caller-identity --profile infinite-nasa-apod-dev'
alias aws-tables='aws dynamodb list-tables --region eu-central-1 --profile infinite-nasa-apod-dev'
alias aws-table-info='aws dynamodb describe-table --table-name infinite-nasa-apod-dev-content --region eu-central-1 --profile infinite-nasa-apod-dev'

# Python MCP Aliases
alias db-python='python3 scripts/dynamodb-mcp-client.py --profile infinite-nasa-apod-dev --region eu-central-1'

echo "🔗 DynamoDB MCP aliases načítané!"
echo ""
echo "📖 Dostupné aliasy:"
echo "  db-stats      - Štatistiky tabuľky"
echo "  db-apod 3     - 3 najnovšie APOD položky"
echo "  db-list       - Zoznam tabuliek"
echo "  db-scan 10    - Skenovanie tabuľky"
echo "  db-item 2024-12-19 - Konkrétna položka"
echo "  db-describe   - Popis tabuľky"
echo "  db-help       - Nápoveda"
echo ""
echo "🔧 AWS aliasy:"
echo "  aws-who       - AWS identity"
echo "  aws-tables    - Zoznam tabuliek"
echo "  aws-table-info - Info o tabuľke"
echo ""
echo "💡 Použitie: source scripts/aliases.sh"
