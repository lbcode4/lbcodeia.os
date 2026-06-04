# scripts/criativos.py
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

DATE_PRESETS = {7: "last_7d", 14: "last_14d", 30: "last_30d", 90: "last_90d"}
CREATIVE_FIELDS = "id,name,status,creative{body,title,object_story_spec}"
INSIGHT_FIELDS = "spend,ctr,clicks,actions"
MIN_SPEND = 10.0


def fetch_top_creatives(client, limit, days):
    account_id = client.account_id
    date_preset = DATE_PRESETS.get(days, f"last_{days}d")

    ads = client.get(f"{account_id}/ads", {
        "fields": f"{CREATIVE_FIELDS},insights.date_preset({date_preset}){{{INSIGHT_FIELDS}}}",
        "limit": 200
    })

    results = []
    for ad in ads.get("data", []):
        insights_list = ad.get("insights", {}).get("data", [])
        insight = insights_list[0] if insights_list else {}
        spend = float(insight.get("spend") or 0)
        if spend < MIN_SPEND:
            continue

        ctr = float(insight.get("ctr") or 0)
        creative = ad.get("creative", {})
        story_spec = creative.get("object_story_spec", {})
        link_data = story_spec.get("link_data", {})
        body = creative.get("body") or link_data.get("message", "")
        title = creative.get("title") or link_data.get("name", "")

        purchases = sum(
            int(float(a.get("value") or 0))
            for a in insight.get("actions", [])
            if a.get("action_type") == "purchase"
        )

        results.append({
            "ad_id": ad["id"],
            "ad_name": ad.get("name", ""),
            "spend": round(spend, 2),
            "ctr": round(ctr, 2),
            "clicks": int(insight.get("clicks") or 0),
            "purchases": purchases,
            "body": body,
            "title": title,
        })

    results.sort(key=lambda x: x["ctr"], reverse=True)
    return results[:limit]


def main():
    parser = argparse.ArgumentParser(description="Busca top criativos Meta Ads")
    parser.add_argument("--limit", type=int, default=10)
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
        result = fetch_top_creatives(client, args.limit, args.days)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except MetaAPIError as e:
        print(f"Erro: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
