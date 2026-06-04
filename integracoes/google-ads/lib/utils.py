"""
utils.py — helpers Google Ads API (porte de ClaudeCode, paths Linux).
"""
import os
import sys
import io
import unicodedata
from google.ads.googleads.client import GoogleAdsClient

YAML_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "credentials", "google-ads.yaml"))


def setup_encoding():
    """Garante output UTF-8."""
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def get_client(yaml_path=YAML_PATH):
    """Retorna GoogleAdsClient configurado a partir do yaml."""
    return GoogleAdsClient.load_from_storage(yaml_path)


def fmt_brl(v):
    """Formata valor em BRL: R$ 1.234,56"""
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def fmt_pct(v):
    """Formata percentual com vírgula: 9,40%"""
    return f"{v:.2f}".replace(".", ",") + "%"


def safe_div(a, b):
    """Divisão segura — retorna 0 se denominador for zero."""
    return a / b if b else 0


def normalizar(s):
    """Remove acentos e converte para minúsculas para comparações."""
    nfkd = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()


def fmt_cost(cost_micros):
    """Converte cost_micros para float em BRL."""
    return cost_micros / 1_000_000
