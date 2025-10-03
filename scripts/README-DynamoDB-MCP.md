# DynamoDB MCP Client

Tento skript umožňuje pripojenie k AWS DynamoDB a prácu s dátami cez MCP (Model Context Protocol) nástroje.

## 📋 Požiadavky

- Python 3.7+
- boto3 (AWS SDK pre Python)
- Nakonfigurované AWS credentials (AWS CLI alebo environment variables)

## 🚀 Inštalácia

```bash
# Inštalácia boto3
pip3 install boto3

# Urobiť skript spustiteľným
chmod +x scripts/dynamodb-mcp-client.py
```

## 🔧 Konfigurácia AWS

### Automatické nastavenie (Odporúčané)

```bash
# Spustenie setup skriptu
./scripts/setup-aws-mcp.sh

# Alebo manuálne načítanie konfigurácie
source scripts/aws-config.env
```

### Manuálne nastavenie

```bash
# Cez AWS CLI
aws configure --profile infinite-nasa-apod-dev

# Alebo cez environment variables
export AWS_PROFILE=infinite-nasa-apod-dev
export AWS_DEFAULT_REGION=eu-central-1
```

### Overenie konfigurácie

```bash
# Skontrolujte AWS credentials
aws sts get-caller-identity --profile infinite-nasa-apod-dev

# Skontrolujte DynamoDB tabuľku
aws dynamodb describe-table --table-name infinite-nasa-apod-dev-content --region eu-central-1 --profile infinite-nasa-apod-dev
```

## 📖 Použitie

### Rýchly štart

```bash
# 1. Spustenie setup skriptu (len raz)
./scripts/setup-aws-mcp.sh

# 2. Použitie shell wrapper (najjednoduchšie)
./scripts/db.sh stats          # Štatistiky tabuľky
./scripts/db.sh hubble 5       # 5 najnovších Hubble položiek
./scripts/db.sh apod 3         # 3 najnovšie APOD položky
./scripts/db.sh list           # Zoznam tabuliek
```

### Základné príkazy

```bash
# Zobrazenie nápovedy
python3 scripts/dynamodb-mcp-client.py --help

# Zoznam všetkých DynamoDB tabuliek
python3 scripts/dynamodb-mcp-client.py list-tables

# Popis konkrétnej tabuľky
python3 scripts/dynamodb-mcp-client.py describe-table --table infinite-nasa-apod-dev-content

# Štatistiky tabuľky
python3 scripts/dynamodb-mcp-client.py table-stats
```

### Práca s dátami

```bash
# Skenovanie tabuľky (všetky položky)
python3 scripts/dynamodb-mcp-client.py scan-table --limit 10

# Query Hubble položiek
python3 scripts/dynamodb-mcp-client.py query-hubble --limit 5

# Query APOD položiek
python3 scripts/dynamodb-mcp-client.py query-apod --limit 5

# Získanie konkrétnej položky podľa dátumu
python3 scripts/dynamodb-mcp-client.py get-item --date 2024-12-19
```

### Pokročilé možnosti

```bash
# Použitie iného AWS regiónu
python3 scripts/dynamodb-mcp-client.py --region us-east-1 list-tables

# Skenovanie inej tabuľky
python3 scripts/dynamodb-mcp-client.py scan-table --table my-table --limit 20
```

## 📊 Výstup

Skript poskytuje štruktúrovaný výstup s emoji ikonami pre lepšiu čitateľnosť:

- 🔗 Pripojenie k DynamoDB
- 📋 Zoznam tabuliek
- 📊 Štatistiky
- 🔭 Hubble položky
- 🌌 APOD položky
- 📅 Dátumy
- 📝 Názvy
- 🏷️ Slovenské názvy
- 🔗 Linky
- 🖼️ Obrázky
- ⭐ Kvalita obsahu
- 📊 Dĺžka článkov
- 🕒 Časové značky

## 🗃️ Štruktúra dát

### DynamoDB Tabuľka: `infinite-nasa-apod-dev-content`

**Primary Key:** `date` (String)
**GSI:** `gsi_latest` (pk, date)

#### Partition Keys:
- `HUBBLE` - ESA Hubble Picture of the Week položky
- `LATEST` - NASA APOD položky

#### Kľúčové atribúty:

**Hubble položky:**
- `date` - Dátum publikácie
- `originalTitle` - Pôvodný názov
- `slovakTitle` - Slovenský názov
- `link` - Link na ESA Hubble
- `imageUrl` - URL obrázka
- `contentQuality` - Kvalita obsahu (0-100)
- `articleLengthWords` - Dĺžka článku v slovách
- `lastUpdated` - Posledná aktualizácia

**APOD položky:**
- `date` - Dátum publikácie
- `originalTitle` - Pôvodný názov
- `slovakTitle` - Slovenský názov
- `imageUrl` - URL obrázka
- `copyright` - Copyright informácie
- `contentQuality` - Kvalita obsahu (0-100)
- `articleLengthWords` - Dĺžka článku v slovách
- `seoArticle` - SEO optimalizovaný článok

## 🔍 Príklady použitia

### Kontrola stavu databázy
```bash
# Celkové štatistiky
python3 scripts/dynamodb-mcp-client.py table-stats

# Počet Hubble položiek
python3 scripts/dynamodb-mcp-client.py query-hubble --limit 100 | grep "Nájdených položiek"

# Počet APOD položiek
python3 scripts/dynamodb-mcp-client.py query-apod --limit 100 | grep "Nájdených položiek"
```

### Analýza kvality obsahu
```bash
# Najnovšie Hubble položky
python3 scripts/dynamodb-mcp-client.py query-hubble --limit 10

# Najnovšie APOD položky
python3 scripts/dynamodb-mcp-client.py query-apod --limit 10
```

### Debugging
```bash
# Skenovanie všetkých položiek
python3 scripts/dynamodb-mcp-client.py scan-table --limit 5

# Detailný popis tabuľky
python3 scripts/dynamodb-mcp-client.py describe-table
```

## 🛠️ Rozšírenie

Skript je navrhnutý tak, aby bol ľahko rozšíriteľný:

1. **Pridanie nových query metód** - Rozšírte `DynamoDBMCPClient` triedu
2. **Nové formátovanie výstupu** - Upravte `format_item` funkciu
3. **Export dát** - Pridajte možnosti exportu do JSON/CSV
4. **Filtrovanie** - Pridajte možnosti filtrovania podľa kvality, dátumu, atď.

## 🔒 Bezpečnosť

- Skript používa AWS SDK s automatickým získavaním credentials
- Uistite sa, že máte správne IAM oprávnenia pre DynamoDB
- Nikdy neukladajte AWS credentials do kódu

## 📞 Podpora

Pre otázky a problémy:
1. Skontrolujte AWS credentials a oprávnenia
2. Overte, že DynamoDB tabuľka existuje v správnom regióne
3. Skontrolujte AWS CLI konfiguráciu: `aws sts get-caller-identity`
