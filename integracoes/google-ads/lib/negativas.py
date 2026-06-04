"""
negativas.py — puxa search_term_view da Google Ads API para análise de negativas.
A análise (categorizar desperdício, sugerir negativas) é feita pela skill /ads-negativas
usando o agente em integracoes/google-ads/agente-negativas.md. Aqui só extraímos os dados crus.
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))
from utils import get_client, fmt_cost

PERIODOS = {7: "LAST_7_DAYS", 14: "LAST_14_DAYS", 30: "LAST_30_DAYS"}


def build_query(days=30):
    """GAQL para search_term_view com métricas de custo/clique/conversão.
    Google Ads não tem preset LAST_90_DAYS — usamos só 7/14/30 dias."""
    periodo = PERIODOS.get(days, "LAST_30_DAYS")
    return (
        "SELECT search_term_view.search_term, metrics.clicks, "
        "metrics.cost_micros, metrics.conversions, metrics.impressions "
        "FROM search_term_view "
        f"WHERE segments.date DURING {periodo} "
        "ORDER BY metrics.cost_micros DESC"
    )


def parse_search_terms(batches):
    """Extrai termos de busca dos batches do search_stream."""
    termos = []
    for batch in batches:
        for row in batch.results:
            termos.append({
                "termo": row.search_term_view.search_term,
                "clicks": row.metrics.clicks,
                "custo": fmt_cost(row.metrics.cost_micros),
                "conversoes": row.metrics.conversions,
            })
    return termos


def fetch_search_terms(customer_id, days=30):
    """Roda a query live contra a API (requer credencial)."""
    client = get_client()
    ga_service = client.get_service("GoogleAdsService")
    stream = ga_service.search_stream(customer_id=customer_id, query=build_query(days))
    return parse_search_terms(stream)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Puxa search_term_view Google Ads")
    parser.add_argument("--customer-id", required=True)
    parser.add_argument("--days", type=int, default=30, choices=[7, 14, 30])
    args = parser.parse_args()
    termos = fetch_search_terms(args.customer_id, args.days)
    print(json.dumps({"termos": termos}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
