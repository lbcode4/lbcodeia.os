import os
import sys
import requests
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'credentials', 'meta.env')
load_dotenv(_env_path)

BASE_URL = "https://graph.facebook.com/v21.0"


class MetaAPIError(Exception):
    pass


class MetaAPIClient:
    def __init__(self):
        self.token = os.getenv("META_ACCESS_TOKEN")
        self.account_id = os.getenv("META_AD_ACCOUNT_ID")  # optional — can be None
        if not self.token:
            raise MetaAPIError("META_ACCESS_TOKEN requerido em meta.env")

    def get(self, path, params=None):
        params = dict(params or {})
        params["access_token"] = self.token
        resp = requests.get(f"{BASE_URL}/{path}", params=params)
        if resp.status_code in (400, 401, 403):
            try:
                msg = resp.json().get("error", {}).get("message", resp.text)
            except ValueError:
                msg = resp.text
            raise MetaAPIError(f"API error {resp.status_code}: {msg}")
        resp.raise_for_status()
        return resp.json()

    def post(self, path, data=None):
        params = {"access_token": self.token}
        resp = requests.post(f"{BASE_URL}/{path}", params=params, json=(data or {}))
        if resp.status_code in (400, 401, 403):
            try:
                msg = resp.json().get("error", {}).get("message", resp.text)
            except ValueError:
                msg = resp.text
            raise MetaAPIError(f"API error {resp.status_code}: {msg}")
        resp.raise_for_status()
        return resp.json()

    def test_connection(self):
        status_map = {1: "ATIVO", 2: "DESATIVADO", 3: "UNSETTLED", 7: "PRE_SPEND", 9: "PENDENTE"}
        me = self.get("me", {"fields": "id,name"})
        print(f"✅ Meta conectado: {me.get('name')} (id={me.get('id')})")
        if self.account_id:
            acc = self.get(self.account_id, {"fields": "id,name,account_status"})
            status = status_map.get(acc.get("account_status"), acc.get("account_status"))
            print(f"✅ Ad Account: {acc.get('name')} ({self.account_id}) | Status: {status}")
        else:
            print("ℹ️  META_AD_ACCOUNT_ID não configurado em meta.env — use CLAUDE.md para contas de clientes")
        return me


if __name__ == "__main__":
    if "--test" in sys.argv:
        try:
            client = MetaAPIClient()
            client.test_connection()
        except MetaAPIError as e:
            print(f"Erro: {e}")
            sys.exit(1)
