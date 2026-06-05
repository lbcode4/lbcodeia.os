---
name: lb-google-dashboard
description: >
  Puxa performance Google Ads LIVE da API e gera dashboard HTML completo. Resolve a conta
  do cliente pela coluna 'Google Ads ID' de _memoria/contas-ads.md. Diferente de /lb-google-ads
  (que gera CSV pra criar campanha) — este puxa performance real. Use quando o usuário pedir
  "dashboard google", "performance google ads", "relatório google live", ou /lb-google-dashboard.
---

# /lb-google-dashboard — Dashboard Google Ads (live API)

Puxa dado real da Google Ads API → HTML.

## Dependências
- **Motor:** `integracoes/google-ads/lib/dashboard_google.py`
- **Agente:** `integracoes/google-ads/agentes/agente-auditoria-google.md` (método de auditoria: keywords, QS, quick wins)
- **Conta:** `_memoria/contas-ads.md` (coluna Google Ads ID, resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/google-ads.yaml` (validar com `/lb-ads-conectar`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Resolver cliente em `_memoria/contas-ads.md` (precisa Google Ads ID preenchido).
3. Rodar: `python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>"`
4. Pegar o HTML gerado em `saidas/relatorios/<slug>/`.
5. **Camada framework (Bolo de Cenoura):** ler KPIs e entregar 3 insights na voz LBCode.
6. Devolver: caminho do HTML + os 3 insights.

## Erros
- Credencial faltando → instruir `/lb-ads-conectar` (ramo Google).
- Cliente sem Google Ads ID → avisar e pedir cadastro via `/lb-ads-conectar`.
- NUNCA exibir credenciais em resposta/log.
