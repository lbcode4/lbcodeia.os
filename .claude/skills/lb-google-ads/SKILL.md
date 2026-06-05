---
name: lb-google-ads
description: >
  Cria estrutura completa de campanha do Google Ads a partir de um briefing ou da pesquisa SEO.
  Gera CSV pronto pra importar no Google Ads Editor com campanhas Search organizadas por cluster
  de palavras-chave, grupos de anúncios, RSAs (Responsive Search Ads), extensões e palavras-chave
  negativas. Lê o briefing de _memoria/empresa.md e da pesquisa SEO se existir.
  Use quando o usuário pedir "criar campanha google ads", "anúncio google", "google ads",
  "csv pro google ads", ou /lb-google-ads.
---

# /lb-google-ads — Estrutura de campanha Google Ads

Skill que monta a campanha inteira em CSV pronto pra importar no Google Ads Editor. Sai do briefing direto pro CSV — sem montar grupo por grupo na mão na interface do Google.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — **OBRIGATÓRIO ler antes** (OPA, Bolo Cenoura, regras transversais)
- **Contexto do negócio:** `_memoria/empresa.md` (produto/serviço, público, região, diferenciais)
- **Tom de voz:** `_memoria/preferencias.md`
- **Pesquisa SEO (se existir):** `marketing/google-seo/01-pesquisa-demanda.md`, `06-google-ads.md` — usar como insumo
- **GBP otimizado (pra Dominação Top 1):** ver `/lb-google-meu-negocio` — campanha #3 exige perfil GBP completo antes
- **Outputs vão em:** `marketing/campanhas/conversao/google-ads-<YYYY-MM-DD>/`

---

## Princípio central — Lógica do Bolo de Cenoura Fofinho

Toda campanha Google obedece correspondência em cadeia:

```
Termo pesquisado  =  Anúncio mostrado  =  Página de destino
```

Antes de gerar CSV, validar:
- Termo (keyword) bate com texto do anúncio (RSA repete a keyword)?
- Anúncio bate com landing (página entrega o prometido)?

Quebrar a cadeia = Quality Score baixo = anúncio caro e mal entregue.

**Incluir tabela de validação em `configuracoes.md`** (1 linha por grupo):

| Cluster | Termo → Anúncio | Anúncio → Landing | Status |
|---------|-----------------|-------------------|--------|
| Nome do grupo | ✅/⚠️ RSA repete keyword? | ✅/⚠️ LP entrega o prometido? | Forte/Médio/Fraco |

Documentar elos fracos (⚠️) e o que fazer pra corrigir (LP específica, LP de comparativo, etc).

---

## Modos de campanha

Skill cobre 2 caminhos. Escolher com o usuário:

| Modo | Quando usar | Esforço | Tempo até resultado |
|------|-------------|---------|---------------------|
| **A — Search via Google Ads Editor** (padrão) | Cliente com site/landing e orçamento >R$500/mês | Alto | 7-14 dias |
| **B — Dominação Top 1 (botão Anunciar dentro do GBP)** | Cliente novo, sem site, negócio local, ROI rápido | Baixo | 1-3 dias |

Default = modo A. Modo B detalhado em `reference/dominacao-top1.md`.

---

## Como rodar — orquestração

Esta skill é fina de propósito. Cada fase mora num arquivo de apoio; **carregar só quando
chegar na fase** (economiza contexto):

| Fase | Arquivo de apoio | O que faz |
|------|------------------|-----------|
| Passos 1-2 — Briefing + Keywords | `reference/keywords-clusters.md` | Coleta briefing, pesquisa keywords, refina match types, agrupa em clusters |
| Passos 3-4 — Estrutura + RSAs | `reference/estrutura-rsa.md` | OPA-1 (estrutura de campanha + negativas) + OPA-A (RSAs, headlines/descriptions, restrições) |
| Passos 5-6 — Extensões + Config | `reference/extensoes-configuracoes.md` | OPA-A extensões + OPA-O/OPA-P (lances, redes, geo, idioma, conversões) |
| Passos 7-8 — CSVs + Plano 30d | `reference/estrutura-csv.md` | Gera os CSVs, estrutura de pastas, resumo e plano de monitoramento |
| Modo B — Dominação Top 1 | `reference/dominacao-top1.md` | Campanha #3 dentro do GBP (botão Anunciar), sem CSV |

**Sequência modo A:** Passos 1-2 → Passos 3-4 → Passos 5-6 → Passos 7-8.
**Sequência modo B:** Passos 1-2 (keywords) → Modo B.

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md` antes de executar.**
- **Nunca inventar dados de CPC.** Se cliente perguntar quanto vai custar, falar que depende da concorrência real e dar faixa baseada em WebSearch
- **Sempre começar pausado.** Cliente revisa, ativa quando aprovar
- **Não anunciar pra termos informacionais.** "Como fazer X" raramente converte — deixar pra SEO orgânico
- **Match type:** começar com **frase + exata** na maioria. Ampla só com 30+ dias de dados consistentes
- **Lista de negativas global** obrigatória — sem ela, queima dinheiro em buscas irrelevantes
- **Conversões antes de tudo.** Sem conversão configurada, Google não otimiza — relatar e exigir setup antes de ativar
- **Idiomas:** sempre português + inglês + espanhol (não só pt)
- **Local:** sempre opção **"Presença"** (não "Interesse")
- **Bolo de Cenoura:** validar correspondência keyword=anúncio=landing em toda campanha
- Copies seguem `_memoria/preferencias.md` estritamente. Sem jargão de marketing se público não usa
