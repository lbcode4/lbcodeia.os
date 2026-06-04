import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

DATE_PRESETS = {7: "last_7d", 14: "last_14d", 30: "last_30d", 90: "last_90d"}
INSIGHT_FIELDS = "campaign_id,campaign_name,spend,impressions,clicks,ctr,actions,cost_per_action_type"


def fetch_insights(client, days):
    account_id = client.account_id
    date_preset = DATE_PRESETS.get(days, f"last_{days}d")

    campaigns = client.get(f"{account_id}/campaigns", {
        "fields": "id,name,status,daily_budget,lifetime_budget",
        "limit": 100
    })
    insights = client.get(f"{account_id}/insights", {
        "fields": INSIGHT_FIELDS,
        "date_preset": date_preset,
        "level": "campaign",
        "limit": 100
    })
    return {
        "campaigns": campaigns.get("data", []),
        "insights": insights.get("data", []),
        "days": days
    }


def calculate_kpis(data):
    insights = data["insights"]
    total_spend = sum(float(i.get("spend", 0)) for i in insights)
    total_impressions = sum(int(i.get("impressions", 0)) for i in insights)
    total_clicks = sum(int(i.get("clicks", 0)) for i in insights)

    purchases = 0
    for i in insights:
        for action in i.get("actions", []):
            if action["action_type"] == "purchase":
                purchases += int(action.get("value", 0))

    ctr = round(total_clicks / total_impressions * 100, 2) if total_impressions > 0 else 0
    cpl = round(total_spend / purchases, 2) if purchases > 0 else 0

    return {
        "total_spend": round(total_spend, 2),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_purchases": purchases,
        "ctr": ctr,
        "cpl": cpl,
        "campaigns": data["campaigns"],
        "insights": data["insights"],
        "days": data["days"]
    }


def main():
    parser = argparse.ArgumentParser(description="Diagnóstico Meta Ads")
    parser.add_argument("--days", type=int, default=7, choices=[7, 14, 30, 90])
    parser.add_argument("--cliente", default=None)
    args = parser.parse_args()

    client = MetaAPIClient()
    if args.cliente or not client.account_id:
        from contas import resolver_cliente, ContaError
        try:
            conta = resolver_cliente(nome=args.cliente)
            client.account_id = conta["meta_ad_account"]
        except ContaError as e:
            print(f"Erro: {e}")
            sys.exit(1)
    raw = fetch_insights(client, args.days)
    kpis = calculate_kpis(raw)
    print(json.dumps(kpis, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
