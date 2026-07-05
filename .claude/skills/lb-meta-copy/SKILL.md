---
name: lb-meta-copy
description: >
  Puxa os top performers Meta Ads LIVE via Graph API e gera copy de anúncio nova
  a partir dos criativos vencedores (gatilho, copy, conversão alinhada ao posicionamento).
  Resolve a conta do cliente em _memoria/contas-ads.md. Use quando o usuário pedir
  "copy meta", "anúncio a partir dos top", "gerar copy facebook", "gerar copy instagram",
  "copy dos criativos vencedores", ou /lb-meta-copy.
---

# /lb-meta-copy — Copy de anúncio a partir dos top performers (live API)

Puxa os criativos vencedores por CTR da Graph API v21.0 → gera copy nova baseada nos melhores.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/criativos.py` (puxa top performers por CTR)
- **Agente:** `integracoes/meta-ads/agentes/agente-copy-meta.md` (método de copy Facebook/Instagram)
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (GCC + RETINA)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; se falhar, rodar `/lb-ads-conectar`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/criativos.py --cliente "<Cliente>"`
4. Ler os top criativos retornados pelo motor (títulos, textos, CTR de cada um).
5. **Camada framework (GCC + RETINA):** usar os criativos vencedores como base e gerar
   copy nova do anúncio estruturada em Gatilho → Copy → Conversão, alinhada ao posicionamento
   do negócio (RETINA) — manter o que funcionou nos vencedores, elevar com os pilares GCC.
6. Devolver: copy pronta (título + texto principal + CTA) com justificativa do que foi aproveitado dos top performers.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test`.
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
