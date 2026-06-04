---
name: lb-meta-completo
description: >
  Gera o Dashboard COMPLETO Meta Ads + Instagram LIVE: benchmarks por anúncio, evolução diária,
  evolução de seguidores, comparativo pago vs orgânico, top reels, otimizações prioritárias e
  resumo executivo num HTML só. Mais amplo que /meta-dashboard (que foca hierarquia + funil).
  Resolve a conta em _memoria/contas-ads.md. Use quando o usuário pedir "dashboard completo meta",
  "relatório completo meta", "pago vs orgânico", "evolução de seguidores", ou /meta-completo.
---

# /meta-completo — Dashboard Completo Meta + Instagram (live API)

Visão executiva ampla: pago + orgânico + seguidores + otimizações num HTML.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/dashboard_completo.py`
- **Conta:** `_memoria/contas-ads.md` (precisa act_id + IG User ID, resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `/ads-conectar`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Resolver cliente em `_memoria/contas-ads.md` (precisa act_id E IG User ID).
3. Rodar: `python integracoes/meta-ads/scripts/dashboard_completo.py --cliente "<Cliente>"`
4. Pegar o HTML gerado em `integracoes/meta-ads/output/<slug>/`.
5. **Camada framework (Bolo de Cenoura):** ler o resumo executivo + comparativo pago vs orgânico
   e entregar 3 leituras acionáveis na voz LBCode (onde o pago alavanca o orgânico, otimizações).
6. Devolver: caminho do HTML + as 3 leituras.

## Erros
- Cliente sem IG User ID → este dashboard precisa do orgânico; avisar e pedir cadastro via `/ads-conectar`.
- Credencial faltando → validar com `python integracoes/meta-ads/scripts/meta_api.py --test`.
- NUNCA exibir o token em resposta/log.
