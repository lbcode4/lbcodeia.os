# Editor de carrossel — upgrade de painéis (paridade com protótipo de referência)

Data: 2026-07-02

## Problema

O editor real (`/carrosseis/$id`) carrega o HTML gerado pela skill `/lb-conteudo-carrossel`, permite
edição por clique (contenteditable) ou por chat com IA, tem undo, salvar e fundo/fonte — mas não tem
nenhuma UI de organização de slides (adicionar/duplicar/reordenar/remover), guias de composição
(safe zone, crop do perfil, regra dos terços), atalhos de IA, legenda editável ou exportação de PNG.

O usuário mostrou um protótipo de referência (`../remix-of-remix-of-lbcode-ads-suite.v2`, arquivo
`src/routes/carrosseis.tsx`) com esses painéis, mas construído do zero: slide = `{title, body, bullets}`
tipado, 6 templates de cor fixa, sem HTML real por trás, e vários botões sem `onClick` (decorativos).
Pediu pra atualizar nossa edição pra "ficar igual" — decisão tomada em brainstorm: portar a
**experiência de painéis**, não a arquitetura (que é um protótipo sem backend real).

## Decisões (tomadas em brainstorm)

1. Editor continua rodando sobre o HTML real (Playwright/PNG/histórico já existentes) — não migra pro
   modelo `Slide[]` tipado do protótipo.
2. Substitui a página `/carrosseis/$id` atual (não cria fluxo paralelo).
3. "Exportar PNG" é implementado de verdade — **sem backend novo**: `writeCarrosselHtmlAndRender`
   (`server/src/carrossel-editor.ts`), já disparado pelo botão "Salvar" existente, roda o `render.js`
   da própria skill (Playwright) a cada save e regrava `instagram/slide-XX.png`. Os PNGs já existem e já
   são servidos por `GET /api/carrosseis/slide?id=&slide=`. "Exportar PNG" só precisa: salvar se houver
   mudança pendente, depois baixar cada PNG já renderizado via `<a download>` no navegador.
4. "Agendar publicação" fica fora de escopo (sem integração de publicação orgânica hoje — não entra
   nem como modal mock).
5. Excluídos por não terem contrapartida real ou por já serem cobertos melhor pelo que existe: seletor
   de Formato (skill só gera 4:5), Template de cor fixa (Fundo/Fonte já usam cores reais da marca),
   Banco de imagens / Inspirar-se em imagem (redundante com anexar imagem no chat), Tamanho de fonte
   S/M/L (sem `onClick` no próprio protótipo — decorativo lá também), "Gerar com IA" na legenda (sem
   endpoint).

## Layout (4 colunas desktop, empilha em telas menores — mesmo padrão `lg:flex-row`/`flex-col` já usado)

```
[ Chat IA 320px ] [ Aparência+Guias 260px ] [ Preview 1fr ] [ Slides+Legenda 300px ]
```

### 1. Chat IA (coluna esquerda, existente — só ganha um adicional)

- Mantém tudo: histórico de mensagens, textarea, anexar imagem, undo, streaming.
- **Novo**: linha de chips "Sugestões IA" acima do textarea, com 5 prompts prontos que preenchem
  `input` e chamam `send()` direto:
  - "Reescrever capa com gancho de curiosidade"
  - "Gerar 3 variações de CTA"
  - "Encurtar textos (regra 20 palavras)"
  - "Traduzir carrossel pra inglês"
  - "Sugerir hashtags pro tema"

### 2. Aparência + Guias (nova coluna, 260px)

- **Aparência**: os controles "Fundo" (swatches de cor extraídas da marca + custom picker) e "Fonte"
  (dropdown Google Fonts) que hoje ficam soltos na barra acima do preview, movidos pra um `Card` dedicado
  nessa coluna. Mesmo mecanismo (`postMessage` pro iframe), só reposicionados.
- **Guias do Instagram**: 3 toggles (Safe zone / Crop do perfil 1:1 / Regra dos terços), estado local
  (`showSafeZone`, `showFeedCrop`, `showGrid`), desenhados como `div`s absolutos por cima do iframe do
  preview principal, escalados por `MAIN_SCALE`. Portado 1:1 do protótipo (só o branch 4:5, sem o branch
  9:16 já que não existe seletor de formato). Legenda dos guias abaixo do preview quando algum estiver ativo.

### 3. Preview (centro, existente)

- Iframe principal + setas prev/next, inalterado. Guias da seção 2 desenham por cima dele (mesmo
  container `relative`).
- **Remove** a faixa horizontal de miniaturas que hoje fica abaixo do preview — vira a lista da seção 4.

### 4. Slides + Legenda (nova coluna, 300px)

**Card "Slides (N)"**:
- Lista vertical, uma linha por slide: miniatura (reaproveita `thumbBlobUrls` já gerado) + texto do
  primeiro heading/parágrafo com conteúdo dentro do slide (extraído via `DOMParser`, truncado).
  Checado o HTML real gerado pela skill (`class="slide"` sempre, sem segunda classe semântica — a
  variação de layout vive só num comentário HTML tipo `<!-- SLIDE 1 — CAPA -->`, frágil demais pra
  parsear como badge): **sem badge de tipo** — só número do slide + texto, mais simples e fiel ao que
  existe de verdade. Fallback (nenhum texto encontrado): mostra `Slide N`.
- Clique seleciona (`setActiveSlide`).
- Hover mostra: Duplicar, Mover ↑, Mover ↓, Remover (Remover desabilitado se só sobrar 1 slide).
- Botão "+ Novo slide" no fim da lista.
- Toda operação estrutural (duplicar/mover/remover/adicionar) manipula `.slide` nodes via `DOMParser`
  sobre a string `html` atual, serializa de volta (`'<!doctype html>' + doc.documentElement.outerHTML`)
  e passa por `applyHtml()` — ganha undo de graça, sem nenhum código novo de histórico.
  - Duplicar(idx): clona o node do slide idx, insere logo depois.
  - Adicionar: duplica o último slide (não existe "slide em branco" — layouts são HTML livre; duplicar
    o último dá um ponto de partida editável por clique ou chat).
  - Remover(idx): remove o node; guarda mínimo de 1 slide.
  - Mover(idx, dir): troca a posição dos dois nodes `.slide` adjacentes no DOM.
  - Ajusta `activeSlide` depois de cada operação (mesma lógica de clamping que já existe em `remove`/`move`
    do protótipo, adaptada).

**Card "Legenda do post"** (novo):
- Carrega `legenda.md` do carrossel ao montar a página (`GET /api/carrosseis/legenda?id=`).
- Textarea editável + contador `caption.length / 2.200` + contagem de hashtags (`match(/#\w+/g)`).
- Chips de hashtags sugeridas (lista estática curta, mesmo padrão do protótipo) que fazem `append` no texto.
- Botão "Salvar legenda" (estado próprio de saving/erro, separado do salvar do HTML) →
  `PUT /api/carrosseis/legenda?id=` com `{ legenda }`.

### Header (existente, ganha 1 botão)

- Mantém "Cancelar" / "Salvar" como estão.
- **Novo**: "Exportar PNG" (100% frontend, sem rota nova):
  1. Se `html !== htmlSalvo`, chama a `salvar()` já existente e aguarda (garante que `instagram/slide-XX.png`
     reflete o que tá na tela — `writeCarrosselHtmlAndRender` já roda o `render.js` nesse caminho).
  2. `total = slideCount(html)` (função já existe no arquivo).
  3. Pra cada índice `i` de `0` a `total-1`: monta `filename = 'slide-' + String(i+1).padStart(2,'0') + '.png'`
     (mesma convenção de `carrossel-editor.ts`), busca
     `${BACKEND}/api/carrosseis/slide?id=${id}&slide=${filename}` como blob, cria `<a>` temporário
     com `download={filename}` e `href` de `URL.createObjectURL(blob)`, clica, revoga a URL. Espera
     ~150ms entre downloads (Chrome pode bloquear silenciosamente downloads múltiplos disparados no
     mesmo tick sem esse intervalo).
  4. Estado `exporting` desabilita o botão e mostra spinner durante o processo; erro (de `salvar()` ou
     de algum `fetch` de slide) aparece como texto de erro reaproveitando o padrão de `saveError`.

## Backend

### `server/src/carrosseis.ts` — extensão

- `readLegenda(id): Promise<string>` — lê `legenda.md` da pasta do carrossel (mesmo guard de path de
  `readSlide`); retorna `""` se arquivo não existir (carrossel pode não ter legenda ainda).
- `writeLegenda(id, legenda): Promise<void>` — escreve/sobrescreve `legenda.md`, mesmo guard de path.

### `server/src/server.ts` — rotas novas

- `GET /api/carrosseis/legenda?id=` → `{ legenda: string }` (200; 400 se `id` faltando)
- `PUT /api/carrosseis/legenda?id=` → body `{ legenda: string }` → escreve, 200 `{ ok: true }`

Nenhuma rota nova pra export — reaproveita `PUT /api/carrosseis/html` (já roda `render.js`) e
`GET /api/carrosseis/slide` (já serve os PNGs), ambas existentes.

## Frontend — arquivos afetados

- `frontend/src/routes/carrosseis.$id.tsx` — reescrita do layout (4 colunas), novos estados
  (`showSafeZone`, `showFeedCrop`, `showGrid`, lista de slides derivada de `html` via `DOMParser`,
  `legenda`/`legendaSalva`/`legendaSaving`, `exporting`), novas funções (`addSlide`, `duplicateSlide`,
  `removeSlide`, `moveSlide`, `salvarLegenda`, `exportarPng`).
- Nenhum componente novo em `components/` necessário — tudo cabe em cards já existentes (`Card`, `Button`
  de `app-shell`).

## Fora de escopo

- Seletor de Formato (4:5/1:1/9:16).
- Templates de cor fixa (substituídos por Fundo/Fonte reais).
- Banco de imagens / extração de paleta via IA a partir de imagem de referência.
- Tamanho de fonte S/M/L.
- Agendar publicação (sem integração de publicação orgânica).
- Geração de legenda via IA.
- Multi-tenant / contas diferentes na legenda (não há conceito de "conta" no carrossel, é 1 legenda por
  pasta, como já é hoje).

## Testes

- `server/src/carrosseis.test.ts` (não existe hoje — criar; `carrosseis.ts` não tinha testes próprios
  antes desta mudança): `readLegenda`/`writeLegenda` (roundtrip, arquivo ausente retorna `""`).
- `server/src/server.test.ts`: rotas `GET/PUT /api/carrosseis/legenda` (id faltando → 400, roundtrip
  via arquivo temporário).
- Frontend: sem harness de teste pra rotas hoje (mesmo padrão das últimas 3 specs de editor de
  carrossel — verificação por `tsc --noEmit` + `npm run build`, walkthrough visual fica pro usuário).
