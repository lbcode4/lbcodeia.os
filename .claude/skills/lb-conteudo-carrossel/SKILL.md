---
name: lb-conteudo-carrossel
description: >
  Cria carrosséis e posts visuais pra Instagram, TikTok, LinkedIn com framework RETINA + GCC
  (posicionamento + copy integrados). Gera HTML estilizado + renderiza em PNG 1080x1350 via Playwright,
  com legenda pronta no final. Suporta carrossel texto puro, carrossel com foto IA e post único.
  LBCode.IA assegura que cada slide segue o framework operacional mesmo que visual seja automático.
  Use quando o usuário pedir "carrossel", "post", "conteúdo pro instagram", "criar imagem",
  "gerar foto", "post educativo", ou /lb-conteudo-carrossel.
---

# /lb-conteudo-carrossel — Carrossel e posts visuais

Skill central de criação de conteúdo visual. Pega um tema → entrega HTMLs estilizados + PNGs prontos pra postar + legenda no padrão da marca.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO ler antes (RETINA, GCC, 4 ganchos)
- **Identidade visual:** `identidade/design-guide.md` — LER ANTES de criar qualquer visual
- **Imagens de referência da marca:** TODOS os arquivos `.png`/`.jpg` em `identidade/` (exceto `logo*`) — **OBRIGATÓRIO carregar visualmente via tool `Read` antes de criar qualquer slide**. São a fonte primária do estilo (paleta, tipografia em uso, ritmo de composição, densidade, fundo). O `design-guide.md` é resumo; os PNGs são a verdade.
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Playwright:** pra renderizar HTML em PNG (`npx playwright screenshot` ou via `render.js`)
- **Gemini / OpenAI API (foto IA):** ver `reference/prompts-imagem.md`
- **Outputs vão em:** `marketing/conteudo/carrossel/<tema>-<YYYY-MM-DD>/`

### Regra de calibração visual (obrigatória)

Antes do Passo 1, listar `identidade/` e carregar via `Read` cada imagem de exemplo. Isso diferencia um carrossel "no estilo da marca" de um genérico. Pular = quebrar a identidade. Se a pasta não tiver referências:

> "Não achei imagens de referência em `identidade/`. Pra eu acertar o estilo da marca de primeira, coloca 2-4 posts antigos (ou inspirações aprovadas) nessa pasta. Sigo sem elas se preferir, mas o resultado tende a ficar mais genérico."

---

## Tipos de conteúdo

Identificar qual se encaixa (se não estiver claro, perguntar):

1. **CARROSSEL TEXTO PURO** — educacional, dicas, listas. 1080x1350, tipografia clean, sem fotos.
2. **CARROSSEL COM FOTO** — aspiracional, capa com personagem. 1080x1350, foto (IA ou real) com gradient overlay + slides internos no padrão.
3. **POST ÚNICO** — frase de impacto, dado, depoimento, bastidores. 1080x1350, layout varia.

> "Que tipo de conteúdo? (1) carrossel texto, (2) carrossel com foto, (3) post único"

---

## Estilo visual

Estilo próprio — editorial, calmo, premium. Sem clip-art, sem emoji decorativo, sem gradiente arco-íris, sem template genérico de IA. `identidade/design-guide.md` sobrescreve; quando vago/em branco, usar os defaults.

**Tipografia, cores, elementos visuais, layouts nomeados (CAPA/SOLO/DUO/NÚMERO/CITAÇÃO/CTA FINAL) e montagem do HTML completo: ver `reference/template-html.md`.**

**Ritmo:** alternar fundo escuro ↔ claro ↔ destaque. Nunca dois slides seguidos com o mesmo fundo.

### Sequência de capas no feed

Antes de definir a capa, considerar a **última capa publicada** pra alternar (claro → foto/escuro → cor da marca → claro; nunca duas capas iguais em sequência). Se o usuário não souber a última, perguntar.

### Legenda — sempre gerar junto

Ao terminar de renderizar os PNGs, gerar **automaticamente** a legenda e salvar em `legenda.md` na mesma pasta. **Não esperar o usuário pedir.** Estrutura: (1) Hook, (2) Contexto, (3) CTA pra arrastar, (4) Bloco de oferta + contato, (5) Hashtags (10-15: público + nicho + local).

---

## Workflow

### Passo 0 — Classificar tipo RETINA + buscar referências

**RETINA — escolher 1 dos 6 tipos** (algoritmo IG gosta de mix, não só vendas):
- **R — Relacionamento** — conexão humana, bastidores, propósito
- **E — Engajamento** — meme, curiosidade, food porn, trend
- **T — Transformação** — leva A→B (case, antes/depois)
- **I — Interação** — convida resposta (enquete, "qual você prefere?")
- **N — Níveis de consciência** — venda direta (problema+solução, depoimento)
- **A — Autoridade** — prova que domina (dados, processo, prêmio)

Se usuário não disser, perguntar: *"Que tipo RETINA esse post é?"* — sem isso, gera só T+A e mata a diversidade do feed.

**Buscar referências (3 fontes):**
1. **Biblioteca de Anúncios Meta** — `facebook.com/ads/library` — filtrar por nicho. Topo + mais tempo no ar = vencedores
2. **Instagram pelo termo** — buscar termo do nicho → posts mais vistos = referências orgânicas
3. **Inspirações do carrossel** — verificar se existe `marketing/conteudo/carrossel/{id-do-tema}/inspiracoes/`. Se tiver imagens, carregar via `Read` e incluir no contexto: "O usuário quer imitar o layout/estilo das imagens de inspiração nessa pasta. Adapte a composição, hierarquia tipográfica e uso de espaço ao que você vê nelas, mantendo a paleta e identidade da marca."

Salvar 2-3 referências em `marketing/conteudo/carrossel/<pasta>/referencias/`.

### Passo 1 — Entender e planejar

1. Ler `_memoria/framework-trafego.md`, `_memoria/preferencias.md`, `_memoria/empresa.md`
2. Ler `identidade/design-guide.md` (cores, fontes, logo)
3. **Carregar TODAS as imagens de referência em `identidade/` via `Read`** (exceto `logo*`) — inspecionar cada uma visualmente. NÃO é opcional. Se a pasta não tiver referências, avisar (ver "Regra de calibração visual") e seguir só com o design-guide
4. Identificar o tipo de conteúdo (1, 2 ou 3) + definir tema e ângulo

### Passo 2 — Texto (estrutura GCC)

Aplicar **Gancho + Corpo + CTA**.

**Gancho (slide 1)** — oferecer **3 opções** (de tipos diferentes): (1) Pergunta — conecta com dor; (2) Contraintuitivo — confronta crença; (3) História — algo vivido; (4) Segmentado — fala direto com o nicho.

**Corpo (slides internos):** 1 ideia por slide, frases naturais, sem bullets. Mecanismo: o quê, quando, como, onde, pra quem, por quê.

**CTA (slide final):** claro e único, padrão da marca conforme `_memoria/preferencias.md`. Slide final tem CTA + logo.

- Carrossel (5-10 slides): capa = gancho (máx 8 palavras) · internos = corpo · final = CTA + logo
- Post único: gancho em destaque + corpo curto + CTA sutil

**CHECKPOINT:** mostrar o texto completo (gancho escolhido + corpo + CTA). Esperar aprovação antes do visual.

### Passo 3 — Gerar fotos (só tipo 2)

Só se o usuário pediu carrossel com foto IA. **Detalhe completo (modelos, prompts, scripts, paralelização): ver `reference/prompts-imagem.md`.**

Resumo: prompt em inglês, sem rostos/texto/logos; default `gemini-2.5-flash-image` com 2-3 PNGs de `identidade/` como referência; gerar em paralelo (`run_in_background: true`); mostrar cada foto e aprovar antes de aplicar.

### Passo 4 — Criar visuais (HTML + PNG)

Criar **um único `carrossel.html`** (todos os slides como `<div class="slide">`, inline CSS) + `render.js` na mesma pasta (Playwright, screenshot de cada slide em 1080x1350). **Detalhe da montagem do HTML, layouts e render: ver `reference/template-html.md`.**

Rodar da raiz (reutiliza `node_modules` local, sem `npm install` toda vez):
```bash
node render.js
```

Mostrar slide 1, 2 e o CTA final renderizados. Se aprovado, mostrar os intermediários.

### Passo 5 — Salvar e organizar

```
marketing/conteudo/carrossel/<tema>-<YYYY-MM-DD>/
  texto.md              ← texto aprovado + legenda + tipo RETINA + gancho escolhido
  referencias/          ← prints/links dos anúncios-referência (Meta + IG)
  foto-<nome>.png       ← fotos IA (se houver)
  carrossel.html
  render.js
  instagram/  slide-01.png → slide-NN.png
  tiktok/     (se pedido — formato 9:16)
  legenda.md            ← legenda Insta+FB
  legenda-linkedin.md   ← (se pedido, mais formal)
```

### Passo 6 — Conexão com blog (opcional)

> "Esse conteúdo dá pra virar artigo no blog também. Quer que eu crie a versão blog pra SEO?"

Se sim, chamar `/lb-conteudo-publicar` com o mesmo tema.

---

## Regras

- Sempre ler `identidade/design-guide.md` antes de criar qualquer visual
- Carrossel: 1080x1350 (4:5) sempre. TikTok/Reels: 1080x1920 (9:16) só quando pedido
- Linguagem segue `_memoria/preferencias.md` estritamente
- Sempre considerar a sequência de capa no feed antes de definir capa nova
- Sempre gerar legenda automaticamente ao final (`legenda.md`)
- Fotos IA: prompts em inglês, sempre pedir aprovação, nunca rostos identificáveis ("only hands, no face, no body above wrists"), default Gemini + refs de `identidade/`, gerar em paralelo (ver `reference/prompts-imagem.md`)
- HTMLs: um único `carrossel.html` + `render.js` na mesma pasta, inline CSS
- Render: reutilizar `node_modules` quando possível
- Não repetir layout entre slides — usar variação visual
