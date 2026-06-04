---
name: lb-ads-unificado
description: >
  Gera relatório unificado Google Ads + Meta Ads num HTML só, com resumo cross-platform.
  Roda os dois motores live e funde. Resolve a conta em _memoria/contas-ads.md (precisa
  Google Ads ID E Meta Ad Account preenchidos). Use quando o usuário pedir "relatório
  unificado", "google e meta juntos", "dashboard geral de ads", ou /ads-unificado.
---

# /ads-unificado — Relatório unificado Google + Meta (live)

Funde os 2 dashboards num HTML cross-platform.

## Dependências
- **Motor:** `integracoes/google-ads/lib/dashboard_unificado.py` (chama relatorio.py + dashboard_google.py)
- **Conta:** `_memoria/contas-ads.md` (precisa Google Ads ID + Meta Ad Account)
- **Framework:** Bolo de Cenoura (consistência cross-platform)
- **Credenciais:** Meta (`meta.env`) + Google (`google-ads.yaml`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Resolver cliente (precisa AMBOS os IDs). Se faltar um, avisar qual.
3. Rodar: `python integracoes/google-ads/lib/dashboard_unificado.py --cliente "<Cliente>"`
4. Pegar o HTML unificado em `output/`.
5. **Camada framework:** comparar Google vs Meta, apontar onde o orçamento rende mais, na voz LBCode.
6. Devolver: caminho do HTML + leitura cross-platform.

## Erros
- Falta credencial de uma plataforma → rodar só a que tem + avisar.
- Cliente sem um dos IDs → instruir cadastro via `/ads-conectar`.
