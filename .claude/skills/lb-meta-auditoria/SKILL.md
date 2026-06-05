---
name: lb-meta-auditoria
description: >
  Faz auditoria completa Meta Ads LIVE via Graph API — analisa adsets, placements,
  criativos e identifica quick wins priorizados (onde está perdendo dinheiro).
  Resolve a conta do cliente em _memoria/contas-ads.md. Use quando o usuário pedir
  "auditoria meta", "auditar conta meta", "quick wins meta",
  "onde tô perdendo dinheiro no meta", ou /lb-meta-auditoria.
---

# /lb-meta-auditoria — Auditoria completa Meta (live API)

Puxa dado real da Graph API v21.0 → auditoria de adsets/placements + quick wins. Não é CSV manual.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/auditoria.py`
- **Agente:** `integracoes/meta-ads/agentes/agente-auditoria-meta.md` (método de auditoria)
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; skill `/lb-ads-conectar` chega no Plano 2)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/auditoria.py --cliente "<Cliente>"`
4. Ler o JSON/texto retornado pelo motor (adsets, placements, criativos, problemas encontrados).
5. **Camada framework (Bolo de Cenoura):** interpretar os achados na voz LBCode e entregar
   quick wins priorizados — onde está queimando orçamento, qual placement/adset desligar primeiro,
   qual criativo tem mais problema de consistência termo→anúncio→landing.
6. Devolver: achados da auditoria + quick wins priorizados (ordenados por impacto).

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
