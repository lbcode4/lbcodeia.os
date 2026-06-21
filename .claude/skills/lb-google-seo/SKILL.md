---
name: lb-google-seo
description: >
  Fluxo completo de SEO, GEO e Google Ads em 8 passos: pesquisa de demanda, análise de
  concorrência, Google Meu Negócio, otimização on-page, estratégia de conteúdo, Google Ads,
  checklist de monitoramento e GEO (aparecer em IAs como ChatGPT, Gemini, Perplexity).
  Use quando o usuário pedir "seo", "geo", "palavras-chave", "google ads",
  "aparecer no google", "aparecer no chatgpt", "aparecer nas ias",
  "google meu negócio", "gmb", "analisar concorrência seo",
  "pesquisa de nicho", "google trends".
---

# /lb-google-seo — SEO completo + GEO + Google Ads

## Dependências

- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Estratégia atual:** `_memoria/estrategia.md`
- **Ferramentas:** WebSearch, WebFetch (nativos)
- **Outputs vão em:** `saidas/marketing/google-seo/`

---

## Como rodar — orquestração

Esta skill é fina de propósito. Cada bloco de passos mora num arquivo de apoio;
**carregar só quando chegar no bloco** (economiza contexto):

| Bloco | Arquivo de apoio | O que faz |
|-------|------------------|-----------|
| Passo 0 — Coleta inicial | → **Carregar `reference/passo-0-coleta.md`** | 3 inputs críticos: site, Instagram, cobertura geográfica |
| Passos 1-4 — Demanda, Concorrência, GMB, On-page | → **Carregar `reference/passos-1-4.md`** | Pesquisa de demanda, análise de concorrentes, Google Meu Negócio (delega `/lb-google-meu-negocio`), otimização on-page |
| Passos 5-8 — Conteúdo, Google Ads, Monitoramento, GEO | → **Carregar `reference/passos-5-8.md`** | Estratégia de conteúdo, campanhas Google Ads, checklist de monitoramento, GEO (aparecer nas IAs) |

**Sequência:** Passo 0 → Passos 1-4 → Passos 5-8.

Antes do Passo 0, ler `_memoria/empresa.md` pra pré-preencher os inputs.

---

## Execução

Ao rodar `/lb-google-seo`, executar **todos os 8 passos em sequência**, salvando cada output no arquivo correspondente. Entre cada passo, mostrar resumo do que foi encontrado antes de seguir.

Se o usuário quiser rodar apenas um passo: `/lb-google-seo passo 3` ou `/lb-google-seo gmb` ou `/lb-google-seo geo`.

Ao finalizar, apresentar **resumo executivo** com:
- Top 5 oportunidades encontradas
- Ações prioritárias (o que fazer primeiro)
- Estimativa de investimento em ads
- Próximos passos recomendados

---

## Regras

- Toda pesquisa deve ser real (usar WebSearch/WebFetch), nunca inventar dados de volume ou concorrência
- Copies e textos seguem `_memoria/preferencias.md` estritamente
- Termos em português do Brasil, como o público busca
- Quando um dado não puder ser obtido (ex: volume exato), deixar claro que é estimativa e explicar a lógica
- Focar em termos com intenção comercial/transacional pra negócio B2C/B2B local
- Schema markup em formato JSON-LD (padrão Google)
- Google Ads: nunca inventar CPC ou estimativas de custo sem base real
