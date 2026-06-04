# integracoes/google-ads

Motor Python da integração Google Ads live. Portado de ClaudeCode.
Skills `lb-google-dashboard`, `lb-ads-unificado`, `lb-ads-negativas` consomem estes scripts.

- `lib/utils.py` — get_client, fmt_brl/pct, safe_div, fmt_cost, normalizar
- `lib/dashboard_google.py` — dashboard HTML Google Ads
- `lib/dashboard_unificado.py` — funde Google + Meta (chama relatorio.py + dashboard_google.py)
- `lib/negativas.py` — puxa search_term_view (GAQL)
- `tests/` — `pytest integracoes/google-ads/ -v`

Conta: coluna `Google Ads ID` de `_memoria/contas-ads.md` (resolve via --cliente).
Credencial OAuth2: `integracoes/credentials/google-ads.yaml` (gitignored, NUNCA commitar).
Requer `developer_token` aprovado no Google Ads API Center.
