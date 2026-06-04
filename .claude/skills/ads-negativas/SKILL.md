---
name: lb-ads-negativas
description: >
  Analisa termos de busca do Google Ads (search_term_view) e monta lista de palavras-chave
  negativas pronta pra implementar, agrupada por tema, com gasto desperdiçado justificando cada
  uma. Resolve a conta pela coluna Google Ads ID de _memoria/contas-ads.md. Use quando o usuário
  pedir "negativas", "palavras-chave negativas", "termos de busca", "onde tô gastando à toa no
  google", ou /ads-negativas.
---

# /ads-negativas — Lista de negativas Google Ads (live)

Puxa search_term_view → categoriza desperdício → lista de negativas.

## Dependências
- **Motor:** `integracoes/google-ads/lib/negativas.py` (puxa os dados)
- **Agente:** `integracoes/google-ads/agentes/agente-negativas.md` (método de análise)
- **Conta:** `_memoria/contas-ads.md` (Google Ads ID)
- **Credencial:** `integracoes/credentials/google-ads.yaml`

## Passos
1. Resolver cliente → pegar Google Ads ID em `_memoria/contas-ads.md`.
2. Rodar: `python integracoes/google-ads/lib/negativas.py --customer-id <ID> --days 30`
3. **Aplicar o método** de `integracoes/google-ads/agentes/agente-negativas.md`:
   categorizar desperdício (irrelevante, informacional, concorrente, emprego, DIY, geo, público).
4. Montar lista de negativas agrupada por tema + tipo de correspondência (exata/frase).
5. Calcular impacto: gasto desperdiçado no período + economia projetada.
6. Devolver: lista pronta pra implementar + justificativa de gasto por negativa.

## Erros
- Credencial faltando → instruir `/ads-conectar` (ramo Google).
- NUNCA exibir credenciais.
