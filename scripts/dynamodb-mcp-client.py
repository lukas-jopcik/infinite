#!/usr/bin/env python3
"""
DynamoDB MCP Client Script
==========================

Tento skript umožňuje pripojenie k AWS DynamoDB a prácu s dátami
cez MCP (Model Context Protocol) nástroje.

Použitie:
    python3 dynamodb-mcp-client.py --help
    python3 dynamodb-mcp-client.py list-tables
    python3 dynamodb-mcp-client.py scan-table --table infinite-nasa-apod-dev-content
    python3 dynamodb-mcp-client.py query-hubble --limit 5
    python3 dynamodb-mcp-client.py query-apod --limit 5
"""

import boto3
import json
import argparse
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional

class DynamoDBMCPClient:
    def __init__(self, region: str = 'eu-central-1', profile: str = 'infinite-nasa-apod-dev'):
        """Inicializácia DynamoDB klienta"""
        self.region = region
        self.profile = profile
        
        # Nastavenie AWS session s profile
        session = boto3.Session(profile_name=profile, region_name=region)
        self.dynamodb = session.resource('dynamodb')
        self.client = session.client('dynamodb')
        
        # Overenie pripojenia
        try:
            self.client.list_tables()
            print(f"✅ Pripojenie k AWS DynamoDB úspešné (profile: {profile}, región: {region})")
        except Exception as e:
            print(f"❌ Chyba pri pripojení k AWS DynamoDB: {e}")
            print(f"💡 Skontrolujte AWS credentials a profile: {profile}")
            raise
        
    def list_tables(self) -> List[str]:
        """Zoznam všetkých DynamoDB tabuliek"""
        try:
            response = self.client.list_tables()
            return response.get('TableNames', [])
        except Exception as e:
            print(f"❌ Chyba pri získavaní zoznamu tabuliek: {e}")
            return []
    
    def describe_table(self, table_name: str) -> Optional[Dict[str, Any]]:
        """Popis konkrétnej tabuľky"""
        try:
            response = self.client.describe_table(TableName=table_name)
            return response.get('Table', {})
        except Exception as e:
            print(f"❌ Chyba pri popise tabuľky {table_name}: {e}")
            return None
    
    def scan_table(self, table_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Skenovanie tabuľky"""
        try:
            table = self.dynamodb.Table(table_name)
            response = table.scan(Limit=limit)
            return response.get('Items', [])
        except Exception as e:
            print(f"❌ Chyba pri skenovaní tabuľky {table_name}: {e}")
            return []
    
    
    def query_apod_items(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Query pre APOD položky"""
        try:
            table = self.dynamodb.Table('infinite-nasa-apod-dev-content')
            response = table.query(
                IndexName='gsi_latest',
                KeyConditionExpression='pk = :pk',
                ExpressionAttributeValues={':pk': 'LATEST'},
                Limit=limit,
                ScanIndexForward=False  # Najnovšie najprv
            )
            return response.get('Items', [])
        except Exception as e:
            print(f"❌ Chyba pri query APOD položiek: {e}")
            return []
    
    def get_item_by_date(self, date: str) -> Optional[Dict[str, Any]]:
        """Získanie položky podľa dátumu"""
        try:
            table = self.dynamodb.Table('infinite-nasa-apod-dev-content')
            response = table.get_item(Key={'date': date})
            return response.get('Item')
        except Exception as e:
            print(f"❌ Chyba pri získavaní položky pre dátum {date}: {e}")
            return None
    
    def get_table_stats(self, table_name: str) -> Dict[str, Any]:
        """Štatistiky tabuľky"""
        try:
            table_info = self.describe_table(table_name)
            if not table_info:
                return {}
            
            return {
                'table_name': table_info.get('TableName'),
                'status': table_info.get('TableStatus'),
                'item_count': table_info.get('ItemCount', 0),
                'table_size_bytes': table_info.get('TableSizeBytes', 0),
                'creation_date': table_info.get('CreationDateTime'),
                'billing_mode': table_info.get('BillingModeSummary', {}).get('BillingMode'),
                'region': self.region
            }
        except Exception as e:
            print(f"❌ Chyba pri získavaní štatistík tabuľky {table_name}: {e}")
            return {}
    

def format_item(item: Dict[str, Any], item_type: str = "unknown") -> str:
    """Formátovanie položky pre výpis"""
    output = []
    
    if item_type == "apod":
        output.append(f"🌌 **APOD Item**")
        output.append(f"   📅 Dátum: {item.get('date', 'N/A')}")
        output.append(f"   📝 Názov: {item.get('originalTitle', 'N/A')}")
        output.append(f"   🏷️  Slovenský názov: {item.get('slovakTitle', 'N/A')}")
        output.append(f"   🖼️  Obrázok: {item.get('imageUrl', 'N/A')}")
        output.append(f"   ⭐ Kvalita: {item.get('contentQuality', 'N/A')}")
        output.append(f"   📊 Dĺžka článku: {item.get('articleLengthWords', 0)} slov")
        output.append(f"   📰 Copyright: {item.get('copyright', 'N/A')}")
    
    output.append(f"   🕒 Posledná aktualizácia: {item.get('lastUpdated', 'N/A')}")
    output.append("")
    
    return "\n".join(output)

def main():
    parser = argparse.ArgumentParser(description='DynamoDB MCP Client')
    parser.add_argument('--region', default='eu-central-1', help='AWS región')
    parser.add_argument('--profile', default='infinite-nasa-apod-dev', help='AWS profile')
    parser.add_argument('--table', default='infinite-nasa-apod-dev-content', help='Názov tabuľky')
    
    subparsers = parser.add_subparsers(dest='command', help='Dostupné príkazy')
    
    # List tables
    subparsers.add_parser('list-tables', help='Zoznam všetkých tabuliek')
    
    # Describe table
    describe_parser = subparsers.add_parser('describe-table', help='Popis tabuľky')
    describe_parser.add_argument('--table', help='Názov tabuľky')
    
    # Scan table
    scan_parser = subparsers.add_parser('scan-table', help='Skenovanie tabuľky')
    scan_parser.add_argument('--table', help='Názov tabuľky')
    scan_parser.add_argument('--limit', type=int, default=10, help='Počet položiek')
    
    
    # Query APOD
    apod_parser = subparsers.add_parser('query-apod', help='Query APOD položiek')
    apod_parser.add_argument('--limit', type=int, default=10, help='Počet položiek')
    
    # Get item by date
    date_parser = subparsers.add_parser('get-item', help='Získanie položky podľa dátumu')
    date_parser.add_argument('--date', required=True, help='Dátum (YYYY-MM-DD)')
    
    # Table stats
    stats_parser = subparsers.add_parser('table-stats', help='Štatistiky tabuľky')
    stats_parser.add_argument('--table', help='Názov tabuľky')
    
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Inicializácia klienta
    client = DynamoDBMCPClient(region=args.region, profile=args.profile)
    
    print("=" * 50)
    
    if args.command == 'list-tables':
        tables = client.list_tables()
        print(f"📋 DynamoDB tabuľky v regióne {args.region}:")
        for table in tables:
            print(f"   • {table}")
    
    elif args.command == 'describe-table':
        table_name = args.table or 'infinite-nasa-apod-dev-content'
        table_info = client.describe_table(table_name)
        if table_info:
            print(f"📊 Popis tabuľky: {table_name}")
            print(json.dumps(table_info, indent=2, default=str))
    
    elif args.command == 'scan-table':
        table_name = args.table or 'infinite-nasa-apod-dev-content'
        items = client.scan_table(table_name, args.limit)
        print(f"🔍 Skenovanie tabuľky: {table_name} (limit: {args.limit})")
        print(f"📊 Nájdených položiek: {len(items)}")
        for i, item in enumerate(items, 1):
            print(f"\n--- Položka {i} ---")
            print(json.dumps(item, indent=2, default=str))
    
    
    elif args.command == 'query-apod':
        items = client.query_apod_items(args.limit)
        print(f"🌌 APOD položky (limit: {args.limit})")
        print(f"📊 Nájdených položiek: {len(items)}")
        for item in items:
            print(format_item(item, "apod"))
    
    elif args.command == 'get-item':
        item = client.get_item_by_date(args.date)
        if item:
            print(f"📅 Položka pre dátum: {args.date}")
            print(json.dumps(item, indent=2, default=str))
        else:
            print(f"❌ Položka pre dátum {args.date} nebola nájdená")
    
    elif args.command == 'table-stats':
        table_name = args.table or 'infinite-nasa-apod-dev-content'
        stats = client.get_table_stats(table_name)
        if stats:
            print(f"📊 Štatistiky tabuľky: {table_name}")
            print(json.dumps(stats, indent=2, default=str))
        else:
            print(f"❌ Nepodarilo sa získať štatistiky pre tabuľku {table_name}")
    

if __name__ == '__main__':
    main()
