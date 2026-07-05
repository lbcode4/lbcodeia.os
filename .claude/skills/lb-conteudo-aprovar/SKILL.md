---
name: lb-conteudo-aprovar
allowed-tools: Bash, Read, Edit, Glob, Grep
description: >
  Aprova + publica pipeline completo: blog draft → published, carrossel PNG → público,
  commit + deploy automático (Netlify/Vercel), posta no IG + FB via Meta API. Uso: /lb-conteudo-aprovar <slug>
  após conteúdo estar pronto em /lb-conteudo-publicar. Tudo é versionado + automatizado.
  Use quando o usuário disser "aprovar post X", "publicar o tema Y", "/lb-conteudo-aprovar <slug>".
---

# /lb-conteudo-aprovar — Aprovação + Publicação automática

Última milha do conteúdo. Usuário aprova → tudo sai simultâneo (site, redes, versionado).

## Pré-requisitos

Uma vez só, setup:

- `.env` com:
  - `META_PAGE_ACCESS_TOKEN` (token FB longa duração)
  - `META_PAGE_ID` (página FB ID)
  - `META_IG_USER_ID` (conta IG Business ID)
  - `SITE_URL` (ex: https://exemplo.com.br)
- Site com deploy automático a partir do `main` (Netlify/Vercel)
- Insta Business conectada à Página FB
- Permissões corretas no Meta App
- Scripts `scripts/postar-instagram.js` + `scripts/postar-facebook.js`

> **Atenção — duas credenciais Meta distintas:** o `.env` da raiz guarda o **token de Página**
> (publicar no IG/FB via `postar-*.js`). O `integracoes/credentials/meta.env` guarda o **token
> de Marketing API** (skills `lb-meta-*` de ads). Não são intercambiáveis — não misturar.

Falta algo? Parar e avisar — criar `saidas/marketing/setup-automacao-meta.md` se precisar.

## Fluxo

**Chamada:** `/lb-conteudo-aprovar como-conservar-produto`

(Slug = nome do arquivo blog **sem .md**)

1. **Validar**
   - **Preferir o manifest:** ler `saidas/marketing/conteudo/carrossel/<slug>-*/manifest.json`
     (gerado por `/lb-conteudo-publicar`) — aponta blog, pasta dos PNGs e legendas. Se houver
     mais de uma pasta com o slug, usar a de data mais recente.
   - **Sem manifest** (conteúdo antigo ou avulso), resolver na mão:
     - Blog: `site/astro-site/src/content/blog/<slug>.md` ou `saidas/marketing/conteudo/blog/<slug>.md`
     - Carrossel PNG: `saidas/marketing/conteudo/carrossel/<slug>-<YYYY-MM-DD>/instagram/`
     - Legendas: `legendas.md` na mesma pasta do carrossel

2. **Publicar site** *(só se houver site configurado)*
   - **Checar primeiro:** existe `site/astro-site/` (ou outro stack de site)?
     - **Não existe** → pular esta etapa. Avisar uma vez: "⚠️ Sem site configurado — pulei a publicação do blog. Carrossel + redes seguem." Ainda assim commitar o markdown do blog (`git add`/`commit`/`push`) pra versionar. Ir pro Passo 3.
     - **Existe** → seguir abaixo.
   - Mudar status do blog: `draft: true` → `draft: false`
   - Copiar PNGs pro `public/` (ou assets do site)
   - `git add .` → `git commit -m "Publica [tema]"` → `git push`
   - Aguardar deploy (~30s-2min)
   - Confirmar site live

3. **Postar redes**
   - Chamar Meta API pra postar carrossel no IG (com legenda)
   - Compartilhar no FB (link pra blog)
   - Se falhar em IG/FB: pausar, avisar, não quebra publicação do site

4. **Resultado**
   ```
   ✓ Blog publicado (site.com/blog/como-conservar-produto)
   ✓ Carrossel no Instagram
   ✓ Link compartilhado no Facebook
   ✓ Commit versionado: "[data] Publica como-conservar-produto"
   ```

## Regras

- Não rodar até usuário dizer "aprovado"
- Conteúdo deve vir de `/lb-conteudo-publicar` (se vier avulso, avisar)
- Se Meta API falhar: site continua público (redes é bônus)
- Tudo é versionado — histórico fica no GitHub

## Integração

É a execução final da operação de conteúdo:
- Contexto vem de `_memoria/empresa.md` (site, redes)
- Tom já calibrado em `/lb-conteudo-publicar`
- Outputs vão pro histórico (`/lb-sistema-versionar`)
- Próxima execução rodeia `/lb-meta-relatorio` pra medir performance
