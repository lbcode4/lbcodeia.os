import argparse
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

LOG_FILE = os.path.join(os.path.dirname(__file__), '..', 'output', 'acoes-log.json')


def search_ads(client, name):
    result = client.get(f"{client.account_id}/ads", {
        "fields": "id,name,status,adset_id",
        "filtering": json.dumps([{"field": "name", "operator": "CONTAIN", "value": name}]),
        "limit": 50
    })
    return result.get("data", [])


def set_ad_status(client, ad_id, status):
    return client.post(ad_id, {"status": status})


def log_action(action, ad_id, ad_name, previous_status):
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    log = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE) as f:
            log = json.load(f)
    log.append({
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "ad_id": ad_id,
        "ad_name": ad_name,
        "previous_status": previous_status
    })
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Gerenciar anúncios Meta Ads")
    parser.add_argument("--action", required=True, choices=["search", "pause", "activate"])
    parser.add_argument("--name", default="")
    parser.add_argument("--ad-id", default="")
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

    if args.action == "search":
        if not args.name:
            print(json.dumps({"error": "--name requerido para search"}))
            sys.exit(1)
        ads = search_ads(client, args.name)
        print(json.dumps({"ads": ads}, ensure_ascii=False, indent=2))

    elif args.action in ("pause", "activate"):
        if not args.ad_id:
            print(json.dumps({"error": "--ad-id requerido"}))
            sys.exit(1)
        status = "PAUSED" if args.action == "pause" else "ACTIVE"
        current = client.get(args.ad_id, {"fields": "name,status"})
        previous_status = current.get("status", "UNKNOWN")
        set_ad_status(client, args.ad_id, status)
        log_action(args.action, args.ad_id, current.get("name", ""), previous_status)
        print(json.dumps({
            "success": True,
            "ad_id": args.ad_id,
            "ad_name": current.get("name", ""),
            "new_status": status,
            "previous_status": previous_status
        }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
