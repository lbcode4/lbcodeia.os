"""
conectar.py — lista ad accounts acessíveis pelo token Meta.
Usado pela skill /ads-conectar para descobrir contas e preencher _memoria/contas-ads.md.
O token NÃO é exibido — só os ids/nomes das contas que ele alcança.
"""
import sys
import os
import json

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

STATUS_MAP = {1: "ATIVO", 2: "DESATIVADO", 3: "UNSETTLED", 7: "PRE_SPEND", 9: "PENDENTE"}


def listar_contas(client):
    """Retorna lista de ad accounts acessíveis pelo token: id, name, status."""
    resp = client.get("me/adaccounts", {"fields": "id,name,account_status"})
    contas = []
    for acc in resp.get("data", []):
        contas.append({
            "id": acc.get("id"),
            "name": acc.get("name"),
            "status": STATUS_MAP.get(acc.get("account_status"), acc.get("account_status")),
        })
    return contas


def main():
    try:
        client = MetaAPIClient()
        contas = listar_contas(client)
    except MetaAPIError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)
    print(json.dumps({"contas": contas}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
