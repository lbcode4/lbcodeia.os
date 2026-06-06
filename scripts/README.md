# scripts/ — utilitários do LBCode.IA

Scripts Node.js e Python que as skills chamam quando precisam fazer coisas fora do alcance da IA pura (gerar imagem, postar em rede social, renderizar HTML em PNG).

Scripts já presentes na pasta (cada skill chama o que precisa). Novos scripts pontuais (ex: `render.js` por conteúdo) são gerados pelas próprias skills sob demanda.

## Scripts disponíveis

| Skill | Script | O que faz |
|---|---|---|
| `/lb-conteudo-carrossel` / `/lb-negocio-site` (foto IA) | `gerar-imagem-gemini.js` | Gera imagem via Gemini nano-banana (**default**) |
| idem (fallback) | `gerar-imagem.js` | Gera imagem via OpenAI gpt-image-1 |
| idem (alternativa) | `gerar-imagem-imagen4.js` | Gera imagem via Google Imagen 4 |
| `/lb-conteudo-carrossel` (render PNG) | `render.js` (gerado por conteúdo, fica na pasta do conteúdo) | Playwright tira screenshot 1080x1350 de cada slide |
| `/lb-conteudo-aprovar` | `postar-instagram.js` | Publica carrossel no Instagram via Meta Graph API |
| `/lb-conteudo-aprovar` | `postar-facebook.js` | Publica carrossel no Facebook via Meta Graph API |
| `/lb-google-ads` | (nenhum — gera CSV direto) | — |
| `/lb-meta-relatorio` | (lê CSV exportado das plataformas) | — |

## Pré-requisitos comuns

A maioria dos scripts depende de:

**Node.js 20+** instalado na máquina

**.env** na raiz do projeto com as chaves de API:
```bash
OPENAI_API_KEY=sk-...               # pra gerar-imagem.js
META_PAGE_ACCESS_TOKEN=...          # pra postar-instagram.js + postar-facebook.js
META_PAGE_ID=...
META_IG_USER_ID=...
SITE_URL=https://seudominio.com.br
```

**Playwright** (pra renderizar HTML em PNG):
```bash
npm install playwright
npx playwright install chromium
```

## Como o LBCode.IA lida com isso

Quando você roda uma skill que precisa de script ausente, o Claude vai:

1. Detectar que falta o script
2. Te perguntar se quer configurar agora
3. Te guiar no setup das chaves de API (Meta, OpenAI, etc.)
4. Criar o script já configurado
5. Rodar a skill

Você não precisa decorar nada. Roda a skill, segue o fluxo.
