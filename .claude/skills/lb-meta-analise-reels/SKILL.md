---
name: lb-meta-analise-reels
description: >
  Analisa Reels Instagram LIVE via Graph API — classifica por performance
  e recomenda quais impulsionar alinhado ao posicionamento do negócio.
  Resolve a conta do cliente em _memoria/contas-ads.md. Use quando o usuário pedir
  "analisar reels", "ranking de reels", "qual reel impulsionar", "melhores reels",
  "reels meta", ou /lb-meta-analise-reels.
---

# /lb-meta-analise-reels — Análise + ranking de Reels Instagram (live API)

Puxa dado real da Graph API v21.0 → ranking de Reels + recomendação de impulsionamento.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/reels.py`
- **Agente:** `integracoes/meta-ads/agentes/agente-reels-organico.md` (método de análise de Reels orgânicos)
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (RETINA)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; se falhar, rodar `/lb-ads-conectar`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>"`
4. Ler o JSON/texto retornado pelo motor (ranking de Reels por performance: alcance, engajamento, retenção).
5. **Camada framework (RETINA):** interpretar o ranking na voz LBCode — qual conteúdo ressoou com o posicionamento,
   qual Reel impulsionar (e por quê alinha ao diferencial do negócio), qual evitar impulsionar
   (tema fora do posicionamento mesmo com bom engajamento).
6. Devolver: ranking dos Reels + recomendação de quais impulsionar com justificativa de posicionamento.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
