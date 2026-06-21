# scripts/reels.py
import argparse
import json
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

MEDIA_FIELDS = "id,caption,timestamp,media_type,permalink,like_count,comments_count"
INSIGHTS_METRICS = "reach,saved,shares,ig_reels_avg_watch_time"


def get_ig_user_id(client):
    data = client.get(client.account_id, {"fields": "instagram_actor_id"})
    ig_id = data.get("instagram_actor_id")
    if not ig_id:
        raise MetaAPIError("Instagram Business não vinculado a esta conta de anúncio. "
                           "Verifique a conexão no Business Manager.")
    return ig_id


def fetch_reels(client, days, limit):
    ig_id = get_ig_user_id(client)
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    media = client.get(f"{ig_id}/media", {
        "fields": MEDIA_FIELDS,
        "since": since,
        "limit": limit
    })

    results = []
    for item in media.get("data", []):
        if item.get("media_type") not in ("VIDEO", "REEL"):
            continue

        try:
            insights = client.get(f"{item['id']}/insights", {
                "metric": INSIGHTS_METRICS
            })
            metrics = {m["name"]: m["values"][0]["value"]
                       for m in insights.get("data", [])}
        except MetaAPIError:
            metrics = {}

        reach = int(metrics.get("reach") or 0)
        likes = int(item.get("like_count") or 0)
        comments = int(item.get("comments_count") or 0)
        saves = int(metrics.get("saved") or 0)
        shares = int(metrics.get("shares") or 0)
        # ig_reels_avg_watch_time vem em milissegundos (plays foi descontinuado na v22+)
        watch = round(int(metrics.get("ig_reels_avg_watch_time") or 0) / 1000, 1)

        engagement_rate = (
            round((likes + comments + shares + saves) / reach * 100, 2)
            if reach > 0 else 0.0
        )

        results.append({
            "id": item["id"],
            "caption": (item.get("caption") or "")[:200],
            "timestamp": item.get("timestamp", ""),
            "permalink": item.get("permalink", ""),
            "reach": reach,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "saves": saves,
            "watch": watch,
            "engagement_rate": engagement_rate,
        })

    results.sort(key=lambda x: x["engagement_rate"], reverse=True)
    return results


def main():
    parser = argparse.ArgumentParser(description="Analisa Reels Instagram")
    parser.add_argument("--days", type=int, default=30, choices=[30, 60, 90])
    parser.add_argument("--limit", type=int, default=50)
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
        result = fetch_reels(client, args.days, args.limit)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except MetaAPIError as e:
        print(f"Erro: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
