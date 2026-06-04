# scripts/auditoria.py
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

DATE_PRESETS = {7: "last_7d", 14: "last_14d", 30: "last_30d", 90: "last_90d"}
INSIGHT_FIELDS = (
    "campaign_id,campaign_name,adset_id,adset_name,"
    "spend,impressions,frequency,actions,cpm,publisher_platform"
)


def fetch_audit_data(client, days):
    account_id = client.account_id
    date_preset = DATE_PRESETS.get(days, f"last_{days}d")

    insights = client.get(f"{account_id}/insights", {
        "fields": INSIGHT_FIELDS,
        "date_preset": date_preset,
        "level": "adset",
        "breakdowns": "publisher_platform",
        "limit": 500
    })

    campaigns = client.get(f"{account_id}/campaigns", {
        "fields": "id,name,status,daily_budget",
        "limit": 100
    })

    return {
        "insights": insights.get("data", []),
        "campaigns": campaigns.get("data", []),
        "days": days
    }


def main():
    parser = argparse.ArgumentParser(description="Auditoria Meta Ads para quick wins")
    parser.add_argument("--days", type=int, default=30, choices=[7, 14, 30, 90])
    parser.add_argument("--cliente", default=None)
    args = parser.parse_args()

    try:
        client = MetaAPIClient()
        if args.cliente or not client.account_id:
            from contas import resolver_cliente, ContaError
            try:
                conta = resolver_cliente(nome=args.cliente)
                client.account_id = conta["meta_ad_account"]
            except ContaError as e:
                print(f"Erro: {e}")
                sys.exit(1)
        result = fetch_audit_data(client, args.days)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except MetaAPIError as e:
        print(f"Erro: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
