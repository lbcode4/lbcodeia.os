---
name: lb-meta-diagnostico
description: >
  Puxa KPIs Meta Ads LIVE da Graph API e gera diagnóstico da conta com alertas
  e recomendações priorizadas (gasto, CPL, CTR, conversões, saúde geral).
  Resolve a conta do cliente em _memoria/contas-ads.md. Use quando o usuário pedir
  "diagnóstico meta", "como tá a conta", "kpis meta", "saúde da conta meta",
  ou /lb-meta-diagnostico.
---

# /lb-meta-diagnostico — KPIs + alertas Meta (live API)

Puxa dado real da Graph API v21.0 → KPIs + alertas + recomendações. Não é CSV manual.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/diagnostico.py`
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; skill `/lb-ads-conectar` chega no Plano 2)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/diagnostico.py --cliente "<Cliente>"`
4. Ler o JSON de KPIs retornado pelo motor (gasto, CPL, CTR, conversões, alertas).
5. **Camada framework (Bolo de Cenoura):** interpretar os KPIs na voz LBCode e entregar
   3 recomendações priorizadas — validar consistência termo→anúncio→landing,
   identificar o maior gargalo do funil, apontar ação imediata de maior impacto.
6. Devolver: KPIs + alertas + 3 recomendações priorizadas.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
