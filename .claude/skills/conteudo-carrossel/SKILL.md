---
name: lb-conteudo-carrossel
description: >
  Cria carrosséis e posts visuais pra Instagram, TikTok, LinkedIn com framework RETINA + GCC
  (posicionamento + copy integrados). Gera HTML estilizado + renderiza em PNG 1080x1350 via Playwright,
  com legenda pronta no final. Suporta carrossel texto puro, carrossel com foto IA e post único.
  LBCode.IA assegura que cada slide segue o framework operacional mesmo que visual seja automático.
  Use quando o usuário pedir "carrossel", "post", "conteúdo pro instagram", "criar imagem",
  "gerar foto", "post educativo", ou /conteudo-carrossel.
---

# /conteudo-carrossel — Carrossel e posts visuais

Skill central de criação de conteúdo visual. Pega um tema → entrega HTMLs estilizados + PNGs prontos pra postar + legenda no padrão da marca.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO ler antes (RETINA, GCC, 4 ganchos)
- **Identidade visual:** `identidade/design-guide.md` — LER ANTES de criar qualquer visual
- **Imagens de referência da marca:** TODOS os arquivos `.png`/`.jpg` em `identidade/` (exceto `logo*`) — **OBRIGATÓRIO carregar visualmente via tool `Read` antes de criar qualquer slide**. Esses exemplos são a fonte primária do estilo: paleta exata, tipografia em uso, ritmo de composição, densidade de elementos, tratamento de fundo. O `design-guide.md` é resumo; os PNGs são a verdade.
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Playwright:** pra renderizar HTML em PNG (`npx playwright screenshot` ou via `render.js`)
- **Gemini API (preferencial pra foto IA):** `GEMINI_API_KEY` no `.env` + script `scripts/gerar-imagem-gemini.js`. Modelo default `gemini-2.5-flash-image` (rápido/barato); `gemini-3-pro-image-preview` (nano-banana 2) disponível pra máxima aderência à marca. Aceita imagens de `identidade/` como referência visual nativa. Default sempre que a chave estiver disponível.
- **OpenAI API (fallback):** `OPENAI_API_KEY` + `scripts/gerar-imagem.js` (gpt-image-1). Usar só se Gemini não disponível — não aceita refs visuais, então depende de prompt engineering pesado pra acertar marca.
- **Outputs vão em:** `marketing/conteudo/<tipo>-<tema>-<YYYY-MM-DD>/`

### Regra de calibração visual (obrigatória)

Antes do Passo 1 do workflow, listar `identidade/` e carregar via `Read` cada imagem de exemplo (posts/slides de referência da marca). Isso é o que diferencia um carrossel "no estilo da marca" de um carrossel genérico. Pular esse passo = quebrar a identidade visual. Se a pasta `identidade/` não tiver imagens de referência ainda, avisar o usuário:

> "Não achei imagens de referência em `identidade/`. Pra eu acertar o estilo da marca de primeira, coloca 2-4 posts antigos (ou inspirações aprovadas) nessa pasta. Sigo sem elas se preferir, mas o resultado tende a ficar mais genérico."

---

## Tipos de conteúdo

Ao receber um pedido, identificar qual tipo se encaixa:

### 1. CARROSSEL TEXTO PURO
- **Quando usar:** posts educacionais, dicas, listas, explicações
- **Formato:** 1080x1350 (4:5) — sempre
- **Estilo:** tipografia clean, cores da marca alternadas, sem fotos

### 2. CARROSSEL COM FOTO
- **Quando usar:** apresentação visual, conteúdo aspiracional, capa com personagem
- **Formato:** 1080x1350 (4:5)
- **Estilo:** foto como capa com gradient overlay + slides internos no padrão alternado
- **Foto:** pode ser IA (gerada por OpenAI) ou real (passada pelo usuário)

### 3. POST ÚNICO
- **Quando usar:** frase de impacto, dado/estatística, depoimento, bastidores
- **Formato:** 1080x1350
- **Estilo:** varia conforme o conteúdo (citação, número grande, foto com overlay)

Se o tipo não estiver claro, perguntar:
> "Que tipo de conteúdo? (1) carrossel texto, (2) carrossel com foto, (3) post único"

---

## Estilo visual base

O LBCode.IA tem um estilo próprio — editorial, calmo, premium. Sem clip-art, sem emoji decorativo, sem gradiente arco-íris, sem template genérico de IA. `identidade/design-guide.md` sobrescreve esses padrões; quando o design-guide for vago ou estiver em branco, usar o que tá aqui (não parar pra pedir `/sistema-instalar` — o `/conteudo-carrossel` funciona com defaults bons).

### Tipografia padrão

- **Fonte:** Inter (Google Fonts), pesos 400/500/600/700/800/900
- **Título de capa:** 90-100px, weight 900, line-height 0.98, letter-spacing **-0.04em**
- **H2 (slides internos):** 60-72px, weight 800, line-height 1.04, letter-spacing **-0.035em**
- **Corpo:** 20-24px, weight 500, line-height 1.5
- **Eyebrow/kicker:** 13-16px, weight 700-800, **UPPERCASE**, letter-spacing **0.22-0.32em**, cor de destaque
- **Page counter (canto sup. dir.):** 14-16px, weight 500-600, letter-spacing 0.18em, cor muted
- **Meta/handle (@):** 15-18px, weight 600

Regra do tipo: títulos grandes com kerning **apertado** (-0.035em), eyebrows pequenos com kerning **aberto** (0.22em+). Esse contraste é o coração do estilo.

### Cores padrão (quando design-guide for vago)

Paleta sóbria: fundo dark + off-white + **UMA** cor de destaque. Nunca quatro cores brigando.

- Fundo escuro: `#0E1116` ou `#1A1A1A`
- Fundo claro alternativo: `#F5ECD7` (cream) ou `#FAFAF7`
- Texto sobre escuro: `#FAFAF7`
- Texto sobre claro: `#1A1A1A` (h2) e `#444` (corpo)
- Destaque: cor da marca (uma só)

### Elementos visuais recorrentes

- **Régua fina** (3-4px de altura, 60-80px de largura, cor de destaque) entre kicker e h2 ou como divisor
- **Logo top-left + page counter top-right** em todos os slides
- **Border-top 1px** `rgba(255,255,255,0.12)` separando rodapé do conteúdo (em slides escuros)
- **Stamps circulares** (200x200, border 3px translúcida, rotate -10deg) pra selos/datas/dados
- **Tags/pills** uppercase, padding generoso, kerning 0.2em, pra rotular categoria do slide
- Padding base: 70-100px nas laterais

### Layouts nomeados

Vocabulário de layout — cada slide tem um nome. Variar entre eles pra criar ritmo:

- **CAPA** — eyebrow + título grande + subtítulo + @handle. Fundo: foto com gradient overlay (`rgba(12,10,9,0.55)` → `rgba(12,10,9,0.85)`) OU sólido (escuro/claro/destaque)
- **SOLO** — split horizontal: foto à esquerda 50% + texto à direita 50% (kicker + h2 + régua + parágrafo)
- **DUO** — texto em cima (kicker + h2 + régua + p) + 2 fotos lado a lado embaixo (ou 1 foto larga)
- **NÚMERO** — numeral gigante (200-320px, weight 800, cor de destaque) como elemento gráfico + h2 + parágrafo de apoio
- **CITAÇÃO** — aspas grandes em watermark + frase em h2 + atribuição
- **CTA FINAL** — fundo na cor de destaque, logo centralizado, headline curta, botão/CTA, telefone/@handle

**Ritmo de slide a slide:** alternar fundo escuro ↔ claro ↔ destaque. Nunca dois slides seguidos com o mesmo fundo.

---

## Padrão do carrossel

**Estrutura base (5 a 10 slides):**
- **Slide 1:** layout `CAPA`
- **Slides internos:** usar 2-3 layouts diferentes entre `SOLO` / `DUO` / `NÚMERO` / `CITAÇÃO`
- **Slide final:** layout `CTA FINAL`

Antes de criar HTML: ler `identidade/design-guide.md`. Se estiver em branco, usar o "Estilo visual base" acima como default.

### Sequência de capas no feed (planejamento de grade)

Antes de definir a capa, considerar a **última capa publicada** pra alternar:
- claro → próxima é foto/escuro
- foto/escuro → próxima é cor da marca
- cor da marca → próxima é claro
- nunca duas capas iguais em sequência

Se o usuário não souber qual foi a última, perguntar.

### Linguagem (regra crítica)

Seguir `_memoria/preferencias.md`. Em geral: frases naturais, sem jargão de marketing, sem corporativês. O público real raramente fala "ticket médio", "performance", "B2B". Falar como ele fala.

### Legenda — sempre gerar junto

Ao terminar de renderizar os PNGs, gerar **automaticamente** a legenda do post e salvar em `legenda.md` na mesma pasta. **Não esperar o usuário pedir.** Estrutura padrão:

1. Hook (pergunta ou afirmação)
2. Contexto (1-2 frases sobre o conteúdo)
3. CTA pra arrastar ("Arraste pro lado e confere")
4. Bloco de oferta (diferenciais da empresa, contato)
5. Hashtags (10-15 — público + nicho + local se aplicável)

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

Se usuário não disser, perguntar: *"Que tipo RETINA esse post é?"* — sem isso, sistema gera só T+A e mata diversidade do feed.

**Buscar referências (2 fontes):**
1. **Biblioteca de Anúncios Meta** — `facebook.com/ads/library` — filtrar por nicho (ex.: "empresa estética", "dentista"). Anúncios no topo + mais tempo no ar = vencedores
2. **Instagram pelo termo** — buscar termo do nicho no IG → vídeos/posts mais vistos = referências orgânicas

Salvar 2-3 referências mais fortes (print ou URL) em `marketing/conteudo/<pasta>/referencias/`.

### Passo 1 — Entender e planejar

1. Ler `_memoria/framework-trafego.md` (RETINA, GCC, 4 ganchos)
2. Ler `_memoria/preferencias.md` e `_memoria/empresa.md`
3. Ler `identidade/design-guide.md` pra cores, fontes e logo
4. **Carregar TODAS as imagens de referência em `identidade/` via `Read`** (exceto `logo*`). Inspecionar cada PNG/JPG visualmente pra capturar paleta exata, tipografia em uso, ritmo de elementos, densidade. Esse passo NÃO é opcional — ele define o estilo do carrossel. Se a pasta não tiver referências, avisar o usuário (ver "Regra de calibração visual" nas Dependências) e seguir só com o design-guide
5. Identificar o tipo de conteúdo (1, 2 ou 3)
6. Definir o tema e o ângulo

### Passo 2 — Texto (estrutura GCC)

Aplicar **Gancho + Corpo + CTA** em todo carrossel/post.

**Gancho (slide 1 / primeira frase)** — escolher 1 dos 4 tipos:
1. **Pergunta** — conecta com objeção/dor. *"Sua empresa tá cheia mas o caixa não enche?"*
2. **Contraintuitivo** — confronta crença comum. *"O problema da sua empresa NÃO é falta de marketing."*
3. **História** — algo que pessoa viveu. *"Ano passado a minha empresa quase fechou."*
4. **Segmentado** — fala direto com nicho. *"Dentista de Curitiba — leia isso."*

Oferecer **3 opções de gancho** (preferencialmente de tipos diferentes) pro usuário escolher.

**Corpo (slides internos / parágrafo do meio):**
- 1 ideia por slide, frases naturais, sem bullet points
- Mecanismo explicado: o quê, quando, como, onde, pra quem, por quê

**CTA (slide final / fechamento):**
- Claro e único
- Padrão da marca conforme `_memoria/preferencias.md` (ex.: "Comente SISTEMA", "Clique no link da bio", "Chama no WhatsApp")
- Slide final tem CTA + logo

**Pra carrossel (5-10 slides):**
- Slide 1 (Capa): gancho (1 dos 4 tipos), máx 8 palavras
- Slides internos: corpo (1 ideia por slide)
- Slide final: CTA + logo

**Pra post único:**
- Gancho em destaque
- Corpo curto (1-2 linhas) de apoio
- CTA sutil

**CHECKPOINT:** Mostrar o texto completo (gancho escolhido + corpo + CTA). Esperar aprovação antes do visual.

### Passo 3 — Gerar fotos (se tipo 2)

Só se o usuário pediu carrossel com foto IA.

**Modelo default: `gemini-2.5-flash-image`** (rápido/barato) — usa as imagens de `identidade/` como referência visual nativa, mantém a identidade da marca. Pra máxima aderência à marca, passar `gemini-3-pro-image-preview` (nano-banana 2). Bench 2026-05-25 do pro vs OpenAI gpt-image-1 high: Gemini 29% mais barato (~$0.13/img vs $0.19), 2x mais rápido (~22s vs ~50s), aderência à marca dramaticamente melhor (circuitos ciano automáticos), respeitou "no face" enquanto OpenAI quebrou a regra. Default = Gemini sempre que `GEMINI_API_KEY` estiver no `.env`. Fallback OpenAI só se a chave Gemini não existir.

1. Montar prompt em inglês (modelos performam melhor em inglês). Estrutura recomendada:

```
Create a vertical 1024x1536 background image. Style: match the brand
aesthetic of the reference images — [resumo da paleta + atmosfera].
Scene: [cena específica, sem rostos, sem texto legível, sem logos].
[Iluminação e composição]. Vertical portrait composition.
Premium cinematic editorial photography.
```

Regras de prompt (críticas):
- **No face / no body above wrists** quando houver pessoas — modelos quebram regra fácil
- **No readable text / no logos** — texto IA em PT sai errado, logos genéricos quebram branding
- Pedir **"match the brand aesthetic of the reference images"** explícito quando usar Gemini com refs
- Referenciar paleta e elementos-chave (ciano, circuitos, deep navy) no prompt mesmo com refs — refs guiam, prompt aterra

2. Selecionar 2-3 PNGs de `identidade/` como referências visuais (mais ≠ melhor — payload grande deixa lento). Escolher refs que casam com a cena: capa pra cenas amplas, post de ícones pra cenas com elementos UI, post da marca geral pra paleta.

3. Gerar via script Gemini (preferencial). Rodar `npm install` na raiz uma vez antes (instala
   `@google/genai`, `openai`, `playwright`):
```bash
node --env-file=.env scripts/gerar-imagem-gemini.js \
     "PROMPT" \
     "marketing/conteudo/<pasta>/foto-<nome>.png" \
     "identidade/ref1.png,identidade/ref2.png" \
     "gemini-2.5-flash-image"   # 4º arg opcional = modelo
```

**Escolha de modelo** (4º arg, ou env `GEMINI_IMAGE_MODEL`; o escolhido é tentado primeiro,
os outros viram fallback automático):
- `gemini-2.5-flash-image` — **default**, mais rápido/barato
- `gemini-3-pro-image-preview` — melhor aderência à marca (nano-banana 2)
- `gemini-3.1-flash-image-preview` — flash da geração 3

Se o usuário não pedir modelo, usar o default. Se pedir "mais qualidade/marca", usar o pro.

Fallback OpenAI (sem refs, só prompt):
```bash
node --env-file=.env scripts/gerar-imagem.js \
     "PROMPT" \
     "marketing/conteudo/<pasta>/foto-<nome>.png" high \
     "gpt-image-1"   # 4º arg = quality, 5º arg opcional = modelo
```

Modelo OpenAI (5º arg, ou env `OPENAI_IMAGE_MODEL`): `gpt-image-1` (default) ou `gpt-image-2`.

Se nenhum dos scripts existir ainda, criar usando os exemplos em `scripts/gerar-imagem-gemini.js` e `scripts/gerar-imagem.js` (já no projeto).

4. **Gerar fotos em paralelo** (`run_in_background: true` em cada chamada) — cada uma é ~22s, paralelizar economiza minutos.

5. Mostrar cada foto pro usuário antes de aplicar no HTML.

**CHECKPOINT:** Foto aprovada → seguir. Se não, ajustar prompt (mais específico sobre o que evitar) e regenerar.

### Passo 4 — Criar visuais (HTML + PNG)

1. Criar **um único `carrossel.html`** com TODOS os slides como `<div class="slide">` dentro do mesmo arquivo. Inline CSS, Google Fonts como única dependência externa. Aplicar:
   - Cores e tipografia de `identidade/design-guide.md`
   - Mínimo 2 layouts diferentes (não repetir o mesmo em todos os slides)
   - Logo top-left + slide-counter top-right em todos os slides
   - Slide final: logo + CTA, fundo na cor principal

   **Pra incluir foto IA no HTML:**
   ```html
   <div class="slide" style="
     background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url('foto-xxx.png');
     background-size: cover;
     background-position: center;
   ">
     <div class="content">
       <h2>Texto sobre a foto</h2>
     </div>
   </div>
   ```

2. Criar `render.js` na mesma pasta — script Node com Playwright que abre o HTML e tira screenshot de cada `.slide` em 1080x1350. Pode reutilizar `node_modules` de uma pasta anterior (não precisa rodar `npm install` toda vez):
```bash
node render.js  # rodar da raiz do projeto (usa node_modules local)
```

3. Mostrar slide 1, 2 e o CTA final renderizados. Se aprovado, mostrar os intermediários.

### Passo 5 — Salvar e organizar

```
marketing/conteudo/<tipo>-<tema>-<YYYY-MM-DD>/
  texto.md              ← texto aprovado + legenda + tipo RETINA + gancho escolhido
  referencias/          ← prints/links dos anúncios-referência da Biblioteca Meta + IG
  foto-<nome>.png       ← fotos geradas por IA (se houver)
  carrossel.html
  render.js
  instagram/
    slide-01.png → slide-NN.png
  tiktok/ (se pedido — formato 9:16)
    slide-01.png → ...
  legenda.md            ← legenda Insta+FB
  legenda-linkedin.md   ← (se pedido, mais formal)
```

### Passo 6 — Conexão com blog (opcional)

Depois de criar o conteúdo visual, perguntar:

> "Esse conteúdo dá pra virar artigo no blog também. Quer que eu crie a versão blog pra SEO?"

Se sim, chamar `/conteudo-publicar` com o mesmo tema.

---

## Regras

- Sempre ler `identidade/design-guide.md` antes de criar qualquer visual
- Carrossel: 1080x1350 (4:5 retrato) — sempre. TikTok/Reels: 1080x1920 (9:16) — só quando pedido explicitamente
- Linguagem segue `_memoria/preferencias.md` estritamente
- Sempre considerar a sequência de capa no feed antes de definir capa nova
- Sempre gerar legenda automaticamente ao final, salvando em `legenda.md`
- Fotos IA: sempre pedir aprovação antes de usar no carrossel
- Fotos IA: prompts em inglês
- Fotos IA: nunca gerar fotos de pessoas/rostos identificáveis (usar "only hands, no face, no body above wrists" no prompt)
- Fotos IA: default = **Gemini nano-banana 2** com 2-3 PNGs de `identidade/` como referência. OpenAI gpt-image-1 só como fallback quando `GEMINI_API_KEY` ausente
- Fotos IA: gerar em paralelo (`run_in_background: true`) — cada uma demora 20-50s, paralelizar economiza minutos
- HTMLs: um único arquivo `carrossel.html` com todos os slides + `render.js` na mesma pasta. Inline CSS
- Render: reutilizar `node_modules` quando possível (não rodar `npm install` em cada pasta)
- Não repetir layout entre slides — usar variação visual
