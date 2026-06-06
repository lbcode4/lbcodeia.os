import os
import sys
import time
import requests
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'credentials', 'meta.env')
load_dotenv(_env_path)

BASE_URL = "https://graph.facebook.com/v21.0"

# Timeout por request + retry com backoff exponencial.
REQUEST_TIMEOUT = 60
MAX_RETRIES = 4
BACKOFF_BASE = 2  # espera = BACKOFF_BASE * 2**tentativa (2s, 4s, 8s, ...)

# Códigos do Graph API que indicam throttling (chegam como HTTP 400):
#   4 = limite da app · 17 = limite do usuário · 32 = limite de página · 613 = rate custom
META_RATE_LIMIT_CODES = {4, 17, 32, 613}


class MetaAPIError(Exception):
    pass


class MetaRateLimitError(MetaAPIError):
    """Throttling persistente após esgotar os retries."""
    pass


class MetaAPIClient:
    def __init__(self):
        self.token = os.getenv("META_ACCESS_TOKEN")
        self.account_id = os.getenv("META_AD_ACCOUNT_ID")  # optional — can be None
        if not self.token:
            raise MetaAPIError("META_ACCESS_TOKEN requerido em meta.env")

    def _error_payload(self, resp):
        try:
            err = resp.json().get("error", {})
            return err.get("message", resp.text), err.get("code")
        except ValueError:
            return resp.text, None

    def _request(self, method, path, *, params=None, json=None):
        """Request com timeout + backoff em rate-limit (429/códigos Meta) e 5xx."""
        url = f"{BASE_URL}/{path}"
        for tentativa in range(MAX_RETRIES + 1):
            resp = requests.request(
                method, url, params=params, json=json, timeout=REQUEST_TIMEOUT,
            )

            # Auth/validação não-transitória: levanta na hora.
            if resp.status_code in (401, 403):
                msg, _ = self._error_payload(resp)
                raise MetaAPIError(f"API error {resp.status_code}: {msg}")

            if resp.status_code == 400:
                msg, code = self._error_payload(resp)
                if code in META_RATE_LIMIT_CODES and tentativa < MAX_RETRIES:
                    time.sleep(BACKOFF_BASE * (2 ** tentativa))
                    continue
                if code in META_RATE_LIMIT_CODES:
                    raise MetaRateLimitError(f"Rate limit Meta (code {code}): {msg}")
                raise MetaAPIError(f"API error 400: {msg}")

            # Throttling HTTP ou erro transitório de servidor: backoff.
            if resp.status_code == 429 or resp.status_code >= 500:
                if tentativa < MAX_RETRIES:
                    time.sleep(BACKOFF_BASE * (2 ** tentativa))
                    continue
                if resp.status_code == 429:
                    raise MetaRateLimitError("Rate limit Meta (HTTP 429) após retries.")

            resp.raise_for_status()
            return resp.json()

    def get(self, path, params=None):
        params = dict(params or {})
        params["access_token"] = self.token
        return self._request("GET", path, params=params)

    def post(self, path, data=None):
        return self._request("POST", path, params={"access_token": self.token}, json=(data or {}))

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
