# Editor de Carrossel (chat + preview multi-slide) — Design

**Data:** 2026-06-21
**Branch:** v3

---

## Objetivo

Permitir editar visualmente um carrossel já gerado pela skill `/lb-conteudo-carrossel` direto no dashboard, via chat com IA + preview live, sem precisar voltar pro Claude Code. Espelha o editor de sites (`sites.$siteId.tsx` + `server/src/sites.ts`) já existente, adaptado pra HTML multi-slide (1080x1350 por slide) em vez de página única.

Duas formas de editar, lado a lado:
1. **Chat com IA** — mudança estrutural (cor, layout, slides, fotos) via linguagem natural.
2. **Direto no preview, sem IA** — clica no texto e edita; seleciona texto e aparece toolbar de cor/B/I/U.

Fluxo: usuário abre carrossel na galeria → clica "Editar com IA" → tela com chat lateral + preview paginado (setas/miniaturas) → edita via chat OU clicando direto no texto → preview atualiza instantâneo no navegador → "Salvar" persiste o HTML real e roda `render.js` (Playwright) pra regerar os PNGs finais em `instagram/`.

---

## Backend

**Arquivo novo:** `server/src/carrossel-editor.ts`
**Registro em:** `server/src/server.ts`

### `readCarrosselHtml(id: string): Promise<string>`

Lê `saidas/marketing/conteudo/carrossel/{id}/carrossel.html`. Guard de path traversal idêntico a `readSiteHtml`:

```ts
const safe = resolve(join(CARROSSEIS_ROOT, id, "carrossel.html"));
if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
```

### `writeCarrosselHtmlAndRender(id: string, html: string): Promise<{ slides: string[] }>`

1. Aplica o mesmo guard de path traversal.
2. Escreve `carrossel.html` no diretório real (sobrescreve).
3. Roda `node render.js` dentro do diretório do carrossel via `execFile` (mesmo binário/`node_modules` simlink já usado pela skill — ver `clinicup-ia/.../render.js` como referência de contrato: lê `carrossel.html`, screenshot de cada `.slide` em 1080x1350 pra `instagram/slide-NN.png`).
4. Se o `execFile` falhar (HTML quebrado, Playwright crash), propaga o erro com stderr resumido — **não** deixa half-written (o `carrossel.html` já foi escrito; PNGs antigos continuam no disco até o próximo render bem-sucedido).
5. Retorna a lista de arquivos em `instagram/` pós-render (pra frontend invalidar cache de thumbnails).

### `streamCarrosselChat(html, instruction, history): AsyncGenerator<ChatEvent>`

Clone de `streamSiteChat` (mesmo shape de evento `chunk | html | done | error`):

- Grava `html` num arquivo temporário (`mkdtemp`).
- Chama `query()` do `@anthropic-ai/claude-agent-sdk` com `allowedTools: ["Read", "Write", "Edit"]`, `permissionMode: "bypassPermissions"`.
- Prompt (regras carrossel-específicas, diferente do prompt de sites):

```
Você é um assistente especialista em carrosséis de Instagram (HTML).

O arquivo HTML do carrossel está em: ${htmlPath}${historyContext}

MENSAGEM ATUAL DO USUÁRIO: ${instruction}

Regras:
- Cada slide é um <div class="slide ..."> de 1080x1350px. NÃO mude essas dimensões.
- Se adicionar ou remover slides, confirme ao final quantos slides o carrossel ficou.
- Pode ler identidade/design-guide.md (na raiz do projeto) se precisar de contexto de cor/fonte da marca.
- Se for pergunta ou dúvida → responda conversacionalmente, NÃO modifique o arquivo.
- Se for instrução de mudança concreta → leia o arquivo, aplique, salve em ${htmlPath}. Confirme brevemente o que fez.
- Respostas curtas e diretas.
```

- Sem leitura de `framework-trafego.md` / design system completo (diferente de sites) — o carrossel já foi gerado seguindo o framework; aqui são só ajustes pontuais.
- Sem suporte a imagem anexada nesta v1 (fora de escopo — ver seção abaixo).

### Rotas em `server.ts` (mirror de `/api/sites/*`)

```ts
app.get("/api/carrosseis/html", ...)   // ?id= → texto HTML bruto
app.put("/api/carrosseis/html", ...)   // ?id=, body { html } → persiste + renderiza, devolve { ok, slides } | 500
app.post("/api/carrosseis/chat", ...)  // SSE, body { html, instruction, history }
```

- 400 se `id` ausente.
- 404 se `ENOENT` ou `Caminho inválido` na leitura.
- 500 com mensagem resumida do Playwright se o render falhar no PUT.

---

## Frontend

**Arquivo novo:** `frontend/src/routes/carrosseis.$id.tsx` (clone de `sites.$siteId.tsx`)
**Arquivo modificado:** `frontend/src/routes/carrosseis.tsx` — adiciona botão "Editar com IA" no viewer do carrossel aberto, navegando para `/carrosseis/${id}`. O viewer read-only atual (PNG + legenda) continua existindo sem mudança — quem só quer ver/copiar legenda não carrega o editor.

### Preview multi-slide (sem custo de Playwright — tudo client-side)

```ts
function injectPagination(html: string, activeIndex: number, total: number): string {
  const style = `<style>
    .slide { display: none !important; }
    .slide:nth-of-type(${activeIndex + 1}) { display: flex !important; }
    body { margin: 0; display: flex; justify-content: center; align-items: center; }
  </style>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}
```

- `slideCount(html)`: conta ocorrências de `class="slide` via regex — usado pra saber quantas miniaturas renderizar.
- Preview principal: 1 iframe com `blobUrl` de `injectPagination(html, activeSlide, total)`. Recriado (novo blob, revoga o antigo) sempre que `html` ou `activeSlide` mudam — mesmo padrão de `makeBlobUrl`/`useEffect` já usado em `sites.$siteId.tsx`.
- Miniaturas: 1 iframe pequeno por slide (mesma técnica de `injectPagination`), dentro de container fixo com `transform: scale(thumbScale)` + `overflow: hidden`, proporção 4:5.
- Navegação: clique na miniatura seta `activeSlide`; `ArrowLeft`/`ArrowRight` via `keydown` listener quando o preview tem foco. Contador "`{activeSlide+1} / {total}`" abaixo do preview principal.
- Sem toggle desktop/mobile (não existe no clone — carrossel é sempre 1080x1350 fixo, diferente de site responsivo).

### Chat (clone 1:1 da lógica de `sites.$siteId.tsx`)

- Mesmo padrão de `messages`, `history` (array de HTML pra undo), `send()` com streaming SSE parseando `chunk`/`html`/`error`/`done`.
- Sugestões iniciais adaptadas: "Troque a cor de fundo do slide 2", "Aumente a fonte do título", "Inverta a ordem dos slides 3 e 4".
- **Sem upload/colar imagem** nesta v1 — diferente de sites, que suporta imagem de referência. Fotos do carrossel (tipo 2) já passam pelo fluxo separado de geração via `prompts-imagem.md`; editar/trocar foto por chat fica fora de escopo agora.

### Botão "Salvar"

- `PUT /api/carrosseis/html?id=` com o HTML atual em memória.
- Estado de loading: "Salvando… renderizando PNGs" (pode levar 1-3s, Playwright real).
- Sucesso: badge "Salvo", invalida cache das thumbnails na galeria (cache-bust via query string com timestamp, já que `slideUrl()` hoje não tem).
- Erro: mostra mensagem (ex: "Render falhou: <resumo>"), mantém HTML em memória pra usuário corrigir via chat e salvar de novo.

---

## Edição direta de texto (sem IA)

Além do chat, o usuário pode clicar em qualquer texto do preview e editar direto — sem passar pela IA.

### Marcação `contenteditable`

Injetado junto com o `<style>` de paginação, um `<script>` que roda dentro do iframe (mesmo documento, todas as slides — não só a ativa):

```js
document.querySelectorAll(
  '.slide h1,.slide h2,.slide h3,.slide h4,.slide p,.slide span,.slide li,.slide a,.slide strong,.slide em,.slide blockquote'
).forEach((el) => {
  if (el.closest('[contenteditable="true"]')) return; // já dentro de um editável pai
  if (!el.textContent?.trim()) return;
  const hasBlockChild = Array.from(el.children).some((c) =>
    ['DIV', 'SECTION', 'UL', 'OL'].includes(c.tagName)
  );
  if (hasBlockChild) return;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('__lbcode-editable');
});
```

Isso marca o elemento "mais externo com texto próprio" (ex: `<h1>` que contém um `<span class="grad">` aninhado fica editável como unidade — o `span.grad` interno é pulado, evitando `contenteditable` aninhado).

CSS injetado: `.__lbcode-editable:hover{outline:2px dashed rgba(41,197,255,.6);outline-offset:2px;cursor:text}`.

### Commit da edição

- **Somente no `blur`** (não a cada tecla) — evita recriar o `blobUrl`/recarregar o iframe no meio da digitação.
- `Enter` chama `e.preventDefault()` + `el.blur()` — confirma e sai do campo, não quebra linha (textos do template são headline/parágrafo curto de 1 linha — regra já existente na skill, Passo 2).
- No `blur`: clona `document.documentElement`, remove os elementos injetados (`#__lbcode-pagination-style`, `#__lbcode-editor-script`, classe `__lbcode-editable`, atributos `contenteditable`), serializa (`outerHTML`) e manda pro pai via `parent.postMessage({ type: 'lbcode-edit', html }, '*')`.
- Pai escuta `message` (filtrando `event.source === iframeRef.current?.contentWindow` por segurança), seta o `html` recebido como novo estado e empilha no **mesmo** array de histórico/undo já usado pra edição via chat — undo cobre os dois fluxos sem lógica separada.

---

## Toolbar de formatação (cor + B/I/U)

Ao selecionar texto (ou focar um elemento `contenteditable`), aparece uma toolbar flutuante — só pra formatação rápida, não é painel de propriedades completo.

### Onde vive

Construída inteiramente **dentro do iframe** pelo mesmo script injetado (vanilla JS, sem React) — evita ter que converter coordenadas entre o documento do iframe e o React do pai. `document.execCommand` precisa rodar no mesmo documento da seleção.

```js
document.addEventListener('selectionchange', () => {
  const sel = document.getSelection();
  if (!sel || sel.isCollapsed || !sel.anchorNode) { toolbar.style.display = 'none'; return; }
  const el = sel.anchorNode.parentElement?.closest('[contenteditable="true"]');
  if (!el) { toolbar.style.display = 'none'; return; }
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  toolbar.style.left = `${rect.left}px`;
  toolbar.style.top = `${rect.top - toolbar.offsetHeight - 8}px`;
  toolbar.style.display = 'flex';
});
```

### Botões

- **Cor**: swatches extraídos das `--variáveis` do `:root` do próprio `<style>` do carrossel via regex `/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})/g` (garante ficar on-brand) + 1 `<input type="color">` solto pra cor livre.
- **B / I / U**: `document.execCommand('bold' | 'italic' | 'underline')`.
- Aplicar cor: `document.execCommand('foreColor', false, hex)`.

### Gotcha — preservar seleção

Clique no botão precisa de `preventDefault()` no **`mousedown`** (não no `click`) — senão o navegador colapsa a seleção de texto antes do `execCommand` rodar, porque o foco já saiu do `contenteditable` quando o `click` dispara.

```js
toolbarButton.addEventListener('mousedown', (e) => e.preventDefault());
```

### Sincronização

Após qualquer ação da toolbar, dispara o mesmo serialize+`postMessage` usado no `blur` da edição de texto (ação discreta de clique, não digitação contínua — sem risco de recarregar o iframe no meio de uma ação do usuário).

---

## Erros

- Path traversal: guard idêntico a `sites.ts` (`resolve` + `startsWith`) em toda função que recebe `id`.
- Render falhar no Salvar: 500 com stderr resumido; frontend não perde estado.
- ID inexistente: 404.

---

## Testes

Mirror de `sites.test.ts` (mock `node:fs/promises`, sem chamar a SDK real):

- `readCarrosselHtml`/`writeCarrosselHtmlAndRender`: path traversal rejeitado (`"../../etc"` etc).
- Rota `PUT /api/carrosseis/html`: mock `execFile` (render) + `writeFile`, valida 200 + payload `{ ok, slides }`, valida 500 quando `execFile` rejeita.
- Rota `GET /api/carrosseis/html`: 400 sem `id`, 404 em `ENOENT`.
- `streamCarrosselChat`: **não testado diretamente** (mesma decisão de `streamSiteChat` — chama a SDK real, custo/não-determinismo).
- `slideCount()` / `injectPagination()` (funções puras do frontend): testáveis com Vitest se o projeto já tiver testes de frontend; senão, cobertura fica só no backend (consistente com o resto do repo — não há testes de componente React hoje).

---

## Fora do Escopo

- Upload/colar imagem de referência no chat do carrossel.
- Painel de propriedades tipo Figma completo: dropdown de heading, link, lista, alinhamento, fonte/tamanho, padding/margin/posição. Formatação rápida (texto direto + cor/B/I/U) está dentro do escopo; o resto continua só via chat.
- Auto-render a cada turno do chat (decidido: só no "Salvar", pra manter o chat rápido e os PNGs nunca inconsistentes a meio de uma edição).
- Suporte a TikTok (9:16) no editor — o editor assume 1080x1350 (Instagram), igual à skill hoje.
- Histórico de versões persistido em disco (undo é só em memória, perdido ao recarregar a página — igual ao comportamento de sites).
