#!/bin/bash
# DynamoDB MCP Client Wrapper Script
# ===================================
# Jednoduchý wrapper pre dynamodb-mcp-client.py

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/dynamodb-mcp-client.py"

# Farba pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcia pre zobrazenie nápovedy
show_help() {
    echo -e "${BLUE}DynamoDB MCP Client Wrapper${NC}"
    echo "=============================="
    echo ""
    echo "Použitie: $0 [príkaz] [možnosti]"
    echo ""
    echo "Dostupné príkazy:"
    echo "  list                    - Zoznam všetkých tabuliek"
    echo "  stats                   - Štatistiky hlavnej tabuľky"
    echo "  apod [limit]            - APOD položky (default: 5)"
    echo "  scan [limit]            - Skenovanie tabuľky (default: 10)"
    echo "  item <date>             - Konkrétna položka podľa dátumu"
    echo "  describe                - Popis tabuľky"
    echo "  help                    - Táto nápoveda"
    echo ""
    echo "Príklady:"
    echo "  $0 list"
    echo "  $0 stats"
    echo "  $0 apod 3"
    echo "  $0 item 2024-12-19"
    echo "  $0 scan 5"
    echo ""
}

# Kontrola, či existuje Python skript
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo -e "${RED}❌ Chyba: Python skript neexistuje: $PYTHON_SCRIPT${NC}"
    exit 1
fi

# Kontrola, či je Python skript spustiteľný
if [ ! -x "$PYTHON_SCRIPT" ]; then
    echo -e "${YELLOW}⚠️  Urobím Python skript spustiteľným...${NC}"
    chmod +x "$PYTHON_SCRIPT"
fi

# Spracovanie argumentov
case "$1" in
    "list")
        echo -e "${GREEN}📋 Zoznam DynamoDB tabuliek${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 list-tables
        ;;
    "stats")
        echo -e "${GREEN}📊 Štatistiky tabuľky${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 table-stats
        ;;
    "apod")
        limit=${2:-5}
        echo -e "${GREEN}🌌 APOD položky (limit: $limit)${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 query-apod --limit "$limit"
        ;;
    "scan")
        limit=${2:-10}
        echo -e "${GREEN}🔍 Skenovanie tabuľky (limit: $limit)${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 scan-table --limit "$limit"
        ;;
    "item")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Chyba: Musíte zadať dátum (YYYY-MM-DD)${NC}"
            echo "Príklad: $0 item 2024-12-19"
            exit 1
        fi
        echo -e "${GREEN}📅 Položka pre dátum: $2${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 get-item --date "$2"
        ;;
    "describe")
        echo -e "${GREEN}📋 Popis tabuľky${NC}"
        python3 "$PYTHON_SCRIPT" --profile infinite-nasa-apod-dev --region eu-central-1 describe-table
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Neznámy príkaz: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
