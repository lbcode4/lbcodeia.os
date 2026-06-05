# Passo 0 — COLETA INICIAL (ANTES dos 8 passos)

Antes de rodar pesquisa, coletar **3 inputs críticos** que mudam toda a análise:

1. **Site da empresa** — se existe URL. Skill faz **WebFetch** pra analisar:
   - Meta title + meta description atuais (pra Passo 4)
   - Estrutura de páginas existentes (pra Passo 5)
   - Schema markup (pra Passo 8)
   - Tem blog ativo?

2. **Instagram da empresa** — pra analisar **como a empresa se comunica hoje**:
   - Tentar WebFetch ou curl pra extrair og:description (seguidores, posts)
   - Analisar últimos 10 posts (se possível via prints — IG bloqueia muito)
   - Identificar tom de voz real vs `_memoria/preferencias.md`
   - Detectar termos/hashtags que já usa (alimenta Passo 1)

3. **Tipo de cobertura geográfica:**
   - 🅰️ **Nacional** (SaaS, e-commerce, atende Brasil todo)
   - 🅱️ **Regional** (atende estado / 2-3 cidades)
   - 🅲 **Local** (1 cidade ou bairro) → **pedir CEP exato pra Passo 2 (concorrentes locais via Maps)**

**Pré-preenchimento:** ler `_memoria/empresa.md` antes — se site/Instagram/cidade já estiverem lá, mostrar como rascunho e perguntar só o que faltar.

**Mensagem ao user:**

> "Antes de rodar os 8 passos do /lb-google-seo, preciso de 3 coisas:
>
> 1. **Site:** [URL ou 'sem site']
> 2. **Instagram:** [@handle ou 'sem IG']
> 3. **Cobertura geográfica:** nacional / regional (quais estados?) / local (qual CEP?)
>
> Pré-preenchi com o que tinha em `_memoria/empresa.md`. Confirma ou ajusta."

Após resposta, rodar fetches em paralelo (site + Instagram) e seguir pro Passo 1 com contexto enriquecido.
