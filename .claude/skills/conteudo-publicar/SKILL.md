---
name: lb-conteudo-publicar
description: >
  Orquestra pipeline completo: tema → blog + carrossel + legendas (IG/FB/LinkedIn) + metadata,
  tudo com RETINA integrado e amarrado. Usa pesquisa SEO + tom de voz + framework GCC.
  Saída: artigo em draft + visual + 3 legendas prontas, aguardando `/conteudo-aprovar` pra publicar.
  Use quando disser "publicar tema X", "cria conteúdo completo", "transforma tema em post",
  "/conteudo-publicar".
---

# /conteudo-publicar — Do tema ao contenteúdo pronto

Pipeline orquestrado. Entrada: tema. Saída: blog + visual + legendas, tudo integrado no framework RETINA.

## Dependências

- **Pesquisa SEO:** `marketing/google-seo/05-estrategia-conteudo.md` (lista de temas, keywords)
- **Análise concorrência:** `marketing/google-seo/02-analise-concorrencia.md` (ângulos únicos)
- **GEO (se aplicável):** `marketing/google-seo/08-geo-otimizacao-ia.md`
- **Framework:** `_memoria/framework-trafego.md` (RETINA — posicionamento + diferenciação)
- **Tom:** `_memoria/preferencias.md`
- **Blog destino:** `site/astro-site/src/content/blog/` (ou confirmar se outro stack)
- **Skill `/conteudo-carrossel`:** pra gerar visual

## Fluxo

### Passo 0 — Tema

Usuário passa tema explícito OU sistema lista de `05-estrategia-conteudo.md`:

> "Qual tema? (opções A, B, C — marca quais já viraram blog)"

Descartar duplicatas.

### Passo 1 — Contexto SEO

Ler sobre tema nas pesquisas:
- Keyword principal + variações
- Como concorrentes tratam (fugir do óbvio)
- Ângulo GEO (perguntas pra IAs, se aplicável)

**Objetivo:** saber em que piscina você tá nadando antes de escrever.

### Passo 2 — Escrever blog (RETINA integrado)

**Arquivo:** `site/astro-site/src/content/blog/<slug>.md`

**Slug:** kebab-case, sem stopwords. Ex: "conservar-carne-salgada"

**Frontmatter:**
```yaml
---
title: "[Keyword + benefício] — 60 chars max"
description: "Meta description com keyword + CTA velado — 155 chars"
publishedAt: YYYY-MM-DD
author: "[nome de empresa]"
keywords: [palavra1, palavra2, palavra3]
draft: true
---
```

**Sempre** `draft: true` — usuário revisa, flipa pra false quando aprova.

**Estrutura (RETINA integrado):**

1. **Lead:** problema concreto em 2-3 linhas. Sem enrolação.
2. **H2 O quê/Por quê:** defina, explique brevemente
3. **H2 Como/O que olhar:** ação prática (main content)
4. **H2 Detalhe/Comparativo:** (opcional, só se relevante)
5. **H2 Conexão com sua solução:** onde empresa se encaixa (natural, não propaganda)
6. **CTA final:** WhatsApp / formulário / contato — 1 linha

**Tom:** segue `_memoria/preferencias.md`. Direto, sem blá-blá.

**Tamanho:** 800-1500 palavras.

### Passo 3 — Carrossel (via `/conteudo-carrossel`)

Chamar skill `/conteudo-carrossel` passando:
- Tema
- 5-7 pontos principais do artigo
- Legenda (vai ser composta depois)

Saída: 9 slides PNG (Insta padrão) em `marketing/conteudo/conteudo-carrossel-YYYY-MM-DD/`

### Passo 4 — 3 Legendas (Insta/FB/LinkedIn)

Gerar 3 versões + CTA único pra blog:

**Instagram (criativo, emoji, hashtags):**
```
[Hook em 1 linha com emoji]
[Contexto em 2-3 linhas]
[CTA: "Link na bio 👆"]
#hashtag1 #hashtag2 #hashtag3
```

**Facebook (corporativo, mais palavras):**
```
[Contexto mais explicativo]
[Chamada pro link]
[CTA: "Leia completo →"]
```

**LinkedIn (profissional, sem emoji, insights):**
```
[Insight/aprendizado do artigo em 1 frase]
[Contexto profissional]
[CTA: "Leia na íntegra →"]
```

Salvar em: `marketing/conteudo/legendas-YYYY-MM-DD.md`

### Passo 5 — Resumo

```
✓ Blog: [link do artigo]
✓ Carrossel: [pasta com 9 PNGs]
✓ Legendas: [arquivo .md com 3 versões]

Próxima: `/conteudo-aprovar <slug>` pra publicar tudo junto.
```

## Regras

- Sempre draft=true no blog (segurança)
- Cada tema vira 1 blog + 1 carrossel (não separar)
- Legendas devem levar pro blog (amarração)
- Slug único (sem repetição)
- Framework RETINA não é opcional — cada artigo posiciona diferenciando

## Integração

Pipeline operacional completo:
- Tema vira Blog → Carrossel → Legendas → Versão (via `/sistema-salvar`)
- Pesquisa SEO alimenta ângulos (não repete concorrência)
- Legenda aponta pro blog (cross-traffic)
- Tudo aguarda `/conteudo-aprovar` pra ir ao ar simultâneo

Quando aprovado, `/conteudo-aprovar` publica blog + carrossel IG/FB numa tacada.
