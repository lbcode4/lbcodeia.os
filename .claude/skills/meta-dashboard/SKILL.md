---
name: lb-meta-dashboard
description: >
  Puxa performance Meta Ads LIVE da Graph API e gera dashboard HTML completo
  (hierarquia campanha→adset→ad, comparativo de período, funil de vídeo, dark/light).
  Resolve a conta do cliente em _memoria/contas-ads.md. Diferente de /meta-relatorio
  (que lê CSV manual) — este puxa direto da API. Use quando o usuário pedir
  "dashboard meta live", "puxar dados do meta", "relatório meta da API",
  "performance ao vivo", ou /meta-dashboard.
---

# /meta-dashboard — Dashboard Meta Ads (live API)

Puxa dado real da Graph API v21.0 → HTML. Não é CSV manual.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/relatorio.py`
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; skill `/ads-conectar` chega no Plano 2)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/relatorio.py --cliente "<Cliente>"`
4. Pegar o caminho do HTML gerado em `integracoes/meta-ads/output/`.
5. **Camada framework (Bolo de Cenoura + GCC):** ler os KPIs e entregar
   3 insights acionáveis na voz LBCode — validar consistência termo→anúncio→landing,
   apontar queima de orçamento, CTR baixo, criativo quebrando.
6. Devolver: caminho do HTML + os 3 insights.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
