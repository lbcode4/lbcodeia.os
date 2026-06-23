# Editor de Carrossel — Imagens de Referência no Chat — Design

**Data:** 2026-06-23
**Branch:** v3

---

## Objetivo

O editor de site (`/sites/$siteId`) já permite colar/anexar imagens de referência no chat
com a IA — ela lê a imagem (via ferramenta `Read`) pra aplicar mudanças visuais informadas
por ela (ex: "use essa paleta de cor", "deixa parecido com essa foto"). O editor de
carrossel (`/carrosseis/$id`) nunca teve isso — era explicitamente fora de escopo na spec
original (`docs/superpowers/specs/2026-06-21-editor-carrossel-design.md`, seção "Fora do
Escopo": "Upload/colar imagem de referência no chat do carrossel").

Esta spec porta o mecanismo já existente (e já funcionando em produção) de
`sites.ts`/`sites.$siteId.tsx` pro carrossel, sem reinventar nada — mesmo contrato, mesma
UX, adaptado aos arquivos do carrossel.

**Fora de escopo:** substituir a foto de um slide específico (carrossel "tipo 2") direto,
sem passar pelo chat — essa foto já tem fluxo próprio de geração via
`prompts-imagem.md`/skill `/lb-conteudo-carrossel`; trocar por upload manual fica pra uma
iteração futura se for pedido.

---

## Backend

### `streamCarrosselChat` ganha parâmetro `images`

Hoje (`server/src/carrossel-editor.ts:71-75`):

```ts
export async function* streamCarrosselChat(
  html: string,
  instruction: string,
  history: ChatMessage[] = [],
): AsyncGenerator<CarrosselChatEvent> {
```

Passa a ter a mesma assinatura de `streamSiteChat` (`server/src/sites.ts:100-105`):

```ts
export async function* streamCarrosselChat(
  html: string,
  instruction: string,
  images: { mediaType: string; data: string }[],
  history: ChatMessage[] = [],
): AsyncGenerator<CarrosselChatEvent> {
```

Mecânica idêntica a `streamSiteChat` (mesmo `tmpDir` já criado em
`mkdtemp(join(tmpdir(), "lbcarrossel-"))`, mesmo padrão de limpeza no `finally` via `rm`):

1. Pra cada imagem, grava `tmpDir/ref-{i}.{ext}` (extensão derivada de `mediaType`, decode
   base64).
2. Monta `imageContext` — mesma string-template de `sites.ts:120-122`:
   ```ts
   const imageContext = imagePaths.length
     ? `\nImagens de referência salvas em:\n${imagePaths.map((p) => `- ${p}`).join("\n")}\nUse a ferramenta Read para visualizá-las.`
     : "";
   ```
3. Injeta `${imageContext}` no prompt, no mesmo lugar que `sites.ts` injeta (depois do
   caminho do HTML, antes do histórico) — adaptado ao prompt já existente do carrossel
   (`carrossel-editor.ts:84-96`), sem mudar as regras já documentadas ali (dimensão fixa de
   slide, ler `design-guide.md`, etc).
4. `finally`: deleta os `imagePaths` junto com o `htmlPath` antes do `rm(tmpDir, ...)` —
   mesmo padrão de `sites.ts:184-186` (lá usa `unlink` individual + `rmdir`; aqui já existe
   `rm(tmpDir, {recursive:true,force:true})`, que sozinho já cobre os arquivos de imagem
   dentro do dir — não precisa do passo de `unlink` individual que `sites.ts` faz, só
   garantir que os `imagePaths` foram criados dentro do mesmo `tmpDir` que o `rm` recursivo
   já remove).

### Rota `POST /api/carrosseis/chat`

Hoje (`server/src/server.ts:170-179`):

```ts
app.post("/api/carrosseis/chat", async (c) => {
  let body: { html: string; instruction: string; history?: ChatMessage[] };
  ...
  const { html, instruction, history = [] } = body;
  ...
  for await (const ev of streamCarrosselChat(html, instruction, history)) {
```

Espelha exatamente `/api/sites/chat` (`server.ts:429-436`): adiciona
`images?: { mediaType: string; data: string }[]` ao tipo do body, default `[]`, passa pra
`streamCarrosselChat(html, instruction, images, history)`.

---

## Frontend

`frontend/src/routes/carrosseis.$id.tsx` ganha os mesmos elementos de
`frontend/src/routes/sites.$siteId.tsx`:

### Tipos e helper

```ts
type CarrosselImage = { dataUrl: string; mediaType: string; data: string };
```

`Msg` (já existe em `carrosseis.$id.tsx:153`) ganha `images?: CarrosselImage[]`.

`fileToCarrosselImage(file: File): Promise<CarrosselImage | null>` — cópia exata de
`fileToSiteImage` (`sites.$siteId.tsx:63-74`), `FileReader.readAsDataURL` + split do base64.

### Estado e handlers

- `const [images, setImages] = useState<CarrosselImage[]>([]);`
- `const fileInputRef = useRef<HTMLInputElement>(null);`
- `handlePaste(e: React.ClipboardEvent)` — cópia de `sites.$siteId.tsx:127-139`.
- `handleFiles(files: FileList | null)` — cópia de `sites.$siteId.tsx:141-145`.
- `send()` (já existe, `carrosseis.$id.tsx:256`) — ganha o mesmo tratamento de
  `sites.$siteId.tsx:147-159`: captura `sentImages = [...images]` antes de limpar, inclui
  `images: sentImages.map(({mediaType,data}) => ({mediaType,data}))` no body do POST,
  anexa `images: sentImages.length ? sentImages : undefined` na mensagem do usuário, limpa
  `setImages([])` depois de disparar o envio.

### UI

- Botão `<ImagePlus>` (ícone já usado em `sites.$siteId.tsx`) ao lado do botão "Desfazer"
  existente, abre o `<input type="file" accept="image/*" multiple className="hidden">`.
- `onPaste={handlePaste}` no `<textarea>` já existente.
- Preview de thumbnails (64×64, removível com X no hover) entre a área de mensagens e a
  linha de input — mesmo padrão de `sites.$siteId.tsx:407-426`.
- Mensagens do usuário no histórico do chat mostram as imagens anexadas (mesma renderização
  de `sites.$siteId.tsx:348-355`, adaptada ao bubble já existente em
  `carrosseis.$id.tsx:365-375`).
- Botão "Enviar" passa a habilitar também quando só há imagem sem texto:
  `disabled={chatLoading || (!input.trim() && !images.length)}` (hoje é só
  `!input.trim()`).

---

## Erros

Nenhum caminho de erro novo — mesmo tratamento que já existe pro chat (erro de rede/SDK cai
no `chatError` existente). Arquivo de imagem que falha ao converter (`fileToCarrosselImage`
retorna `null`) é descartado silenciosamente, mesmo comportamento de `sites.$siteId.tsx`.

---

## Testes

Backend: `streamCarrosselChat` não é testado diretamente hoje (chama a SDK real — mesma
decisão já documentada na spec original do editor). A mudança de assinatura não introduz
lógica pura nova testável isoladamente (é só grafia de arquivo + string de prompt, mesmo
padrão não-testado de `streamSiteChat`). Rota `POST /api/carrosseis/chat` já tem testes de
validação (400 sem html/instruction) em `carrossel-editor.test.ts` — continuam válidos sem
mudança, já que `images` é opcional com default `[]`.

Frontend: sem test runner configurado (mesma decisão das specs anteriores) — verificação via
`tsc --noEmit` + `npm run build`.

---

## Fora do Escopo

- Substituir foto de slide direto via upload (sem chat).
- Limite de tamanho/quantidade de imagens anexadas — mesma ausência de validação que
  `sites.$siteId.tsx` já tem hoje (não introduzir validação nova aqui, ficaria inconsistente
  com o editor de site).
- Drag-and-drop de arquivo (sites também não tem — só paste e botão de anexo).
