# Editor de carrossel — paridade visual completa com protótipo de referência

Data: 2026-07-02

## Problema

O upgrade anterior (`docs/superpowers/specs/2026-07-02-editor-carrossel-upgrade-design.md`) portou
guias de Instagram, lista de slides, legenda e export PNG, mas deixou de fora Formato, Template,
tamanho de fonte e Banco de imagens — excluídos por não terem contrapartida real na época. O usuário
comparou lado a lado com o protótipo (`../remix-of-remix-of-lbcode-ads-suite.v2`) e quer esses painéis
de volta, e também revelou um gap que passou despercebido: o protótipo tem um painel "Conteúdo do
slide" (campos Título/Texto) que não existe no editor real — edição hoje só acontece por clique direto
no preview (contenteditable) ou por chat com IA.

Decisão tomada em brainstorm: implementar tudo de verdade (não clonar botão morto), aproveitando
mecanismos que já existem sempre que possível.

## Descobertas relevantes

- `GET/POST /api/carrosseis/inspiracoes?id=` e `GET /api/carrosseis/inspiracao?id=&file=`
  (`server/src/server.ts:280-331`, backend `server/src/identidade.ts`... na verdade `saveInspiracao`/
  `listInspiracoes`/`readInspiracao` — banco de imagem POR CARROSSEL) já existem, testados, e **não são
  consumidos por nenhuma UI hoje**. Serve de banco de imagens de verdade, sem precisar de rota nova.
- `EDITOR_SCRIPT` (script injetado no iframe, `frontend/src/routes/carrosseis.$id.tsx`) já tem uma
  barra flutuante de formatação que aparece ao selecionar texto (`B`/`I`/`U` + cor via
  `execCommand`) — é o lugar certo pra tamanho de fonte, não um controle de página inteira.
- `aplicarFundo(hex)` e `aplicarFonte(fonte)` (postMessage `lbcode-set-background`/`lbcode-set-font`)
  já existem — Template é só uma combinação curada dos dois.

## Decisões

1. **Formato**: 4:5 Feed (padrão) e 1:1 Quadrado alternam de verdade — 1:1 recorta o preview mostrando
   o crop central real (mesma matemática do guia "Crop do perfil (1:1)" já existente: 10% removidos
   de cada lado verticalmente). 9:16 Story aparece desabilitado com tooltip explicando que o carrossel
   é gerado em 4:5 — sem fingir funcionar.
2. **Template**: 6 presets fixos `{ nome, bg (hex), fonte }` (curados, não extraídos de marca — isso
   já existe via "Fundo"/brand swatches). Clicar aplica `aplicarFundo(bg)` + `aplicarFonte(fonte)` em
   sequência. Card separado de "Aparência" (que continua com as brand swatches + picker custom).
3. **Tamanho de fonte**: 3 botões (P/M/G) na barra flutuante de seleção de texto do iframe, ao lado de
   B/I/U, usando `document.execCommand('fontSize', false, N)` (N = 2/4/6 na escala legada 1-7) — mesmo
   padrão já usado pelos outros botões dessa barra.
4. **Banco de imagens**: novo card na coluna direita. Lista imagens já salvas
   (`GET /api/carrosseis/inspiracoes?id=`), botão de upload (`POST`, multipart, reaproveita rota
   existente), clique numa thumbnail aplica direto como fundo do slide ativo via novo comando
   `lbcode-set-slide-image` no `EDITOR_SCRIPT` (mesmo padrão do `lbcode-set-background`, troca
   `background` do slide ativo por `url('...') center/cover no-repeat`). Undo já cobre reverter (mesmo
   mecanismo do Fundo/Fonte — toda mudança por postMessage serializa e entra no histórico).
5. **Conteúdo do slide** (novo painel, abaixo do preview): campos Título (`input`) e Texto (`textarea`)
   ligados ao `h1`/primeiro `p` do slide ativo. Extração via nova função pura `getSlideFields(html, idx)`
   (mesma técnica de `parseSlides`, mas retorna texto completo, não truncado). Grava no `html` só no
   blur do campo (não a cada tecla — evita salto de cursor), via nova função pura
   `setSlideFields(html, idx, {title, body})` que substitui o `textContent` dos elementos encontrados
   e serializa. Sem os chips de tipo (Capa/Conteúdo/Lista/Citação/Cta) do protótipo — não existe
   taxonomia equivalente no HTML real gerado pela skill (6 layouts nomeados livres, não um enum fixo).
   Sem campo de imagem aqui — fica só no Banco de imagens (evita dois mecanismos concorrentes pra
   mesma coisa).
6. **Layout**: coluna entre chat e preview passa a ser, de cima pra baixo: Formato → Template →
   Aparência (existente) → Guias do Instagram (existente). Coluna direita: Slides (existente) →
   Banco de imagens (novo) → Legenda do post (existente). Abaixo do preview, antes da legenda de guias:
   card "Conteúdo do slide" (novo). Card estático "Dica da IA" (texto fixo, sem interatividade,
   decorativo — mesmo conteúdo do protótipo) volta pra coluna direita, no fim.

## Fora de escopo (mantido da spec anterior)

- Formato 9:16 real (exigiria regenerar HTML em outra proporção — fora de escopo).
- Chips de tipo de slide (Capa/Conteúdo/Lista/Citação/Cta) — taxonomia não existe no HTML real.
- Agendar publicação, geração de legenda via IA — inalterado da spec anterior.
- Remover imagem aplicada via Banco de imagens (usuário usa Undo, mesmo padrão de Fundo/Fonte).

## Backend

Nenhuma rota nova. `listInspiracoes(carrosselId): Promise<string[]>`, `saveInspiracao(carrosselId,
filename, data): Promise<void>` e `readInspiracao(carrosselId, filename): Promise<{buf, mime}>`
(`server/src/identidade.ts:174-204`) já existem, já expostas via `server/src/server.ts:280-331`
(`GET/POST /api/carrosseis/inspiracoes`, `GET /api/carrosseis/inspiracao`) e já têm cobertura de teste
(`server/src/server.test.ts`, describe blocks "GET /api/carrosseis/inspiracoes" e
"GET /api/carrosseis/inspiracao").

## Frontend — `frontend/src/routes/carrosseis.$id.tsx`

Novo:
- `TEMPLATES: { nome: string; bg: string; fonte: string }[]` (6 presets, módulo).
- `getSlideFields(html, idx): { title: string; body: string }` (pura).
- `setSlideFields(html, idx, fields): string` (pura, retorna `html` inalterado se `idx` inválido).
- Estado: `previewFormat: "4:5" | "1:1"`, `inspiracoes: string[]` (filenames) + loading/error,
  `tituloSlide`/`textoSlide` (sincronizados via `useEffect` em `[html, activeSlide]`).
- `EDITOR_SCRIPT`: novo handler `lbcode-set-slide-image` (postMessage) + 3 botões P/M/G na toolbar
  flutuante existente.

## Testes

Sem harness de teste no frontend (mesmo padrão do resto do projeto) — verificação via
`tsc --noEmit` + `npm run build`. Nenhum backend novo, então nenhum teste de backend novo.
