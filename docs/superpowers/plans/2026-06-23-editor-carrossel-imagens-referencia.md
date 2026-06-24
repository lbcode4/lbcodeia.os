# Editor de Carrossel — Imagens de Referência no Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the carousel editor's chat accept pasted/attached reference images, exactly like the site editor already does — the AI reads them via the `Read` tool to inform an edit.

**Architecture:** Pure port of an existing, working mechanism. `streamSiteChat`/`sites.$siteId.tsx` already implement this end-to-end; this plan copies the same contract (backend: write images to a temp dir, mention their paths in the prompt; frontend: paste/attach, preview, send as part of the chat request, render in the message bubble) onto `streamCarrosselChat`/`carrosseis.$id.tsx`. No new abstractions, no new files.

**Tech Stack:** Hono (backend route), `@anthropic-ai/claude-agent-sdk` (already in use), React (frontend) — same stack as the feature being mirrored.

## Global Constraints

- Mirror `sites.ts`/`sites.$siteId.tsx` exactly — same parameter order (`html, instruction, images, history`), same `imageContext` string format, same frontend type shape (`{ dataUrl, mediaType, data }`), same UX (paste, attach button, removable thumbnails, images shown in chat history).
- No size/count limit on attached images — `sites.$siteId.tsx` has none either; don't introduce inconsistency by adding validation here that the mirrored feature doesn't have.
- No drag-and-drop — `sites.$siteId.tsx` doesn't have it either (only paste + file picker).
- Out of scope: replacing a specific slide's photo directly (bypassing chat) — that has its own existing flow via `prompts-imagem.md`/the `/lb-conteudo-carrossel` skill.
- No frontend test runner exists in this project — verification is `npx tsc --noEmit` + `npm run build`. No browser automation tool is available this session — interactive verification is deferred to a human.
- Commits in this repo must use `rtk proxy git commit`, not plain `git commit` — a Bash-intercepting hook has been observed to over-stage unrelated untracked files otherwise. Verify with `git show --stat HEAD` after every commit.

---

## Task 1: Backend — `streamCarrosselChat` ganha parâmetro `images`

**Files:**
- Modify: `server/src/carrossel-editor.ts`

**Interfaces:**
- Produces: `streamCarrosselChat(html: string, instruction: string, images: { mediaType: string; data: string }[], history: ChatMessage[] = [])` — `images` is the new third parameter, inserted before `history` (matching `streamSiteChat`'s exact parameter order in `server/src/sites.ts`).

- [ ] **Step 1: Update the function signature and write images to the temp dir**

Find (`server/src/carrossel-editor.ts`):

```ts
export async function* streamCarrosselChat(
  html: string,
  instruction: string,
  history: ChatMessage[] = [],
): AsyncGenerator<CarrosselChatEvent> {
  const tmpDir = await mkdtemp(join(tmpdir(), "lbcarrossel-"));
  const htmlPath = join(tmpDir, "carrossel.html");
  await writeFile(htmlPath, html, "utf-8");

  const historyContext = history.length > 0
    ? `\n\nHISTÓRICO DA CONVERSA:\n${history.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n")}\n`
    : "";

  const prompt = `Você é um assistente especialista em carrosséis de Instagram (HTML).

O arquivo HTML do carrossel está em: ${htmlPath}${historyContext}

MENSAGEM ATUAL DO USUÁRIO: ${instruction}

Regras:
- Cada slide é um <div class="slide ..."> de 1080x1350px. NÃO mude essas dimensões.
- Se adicionar ou remover slides, confirme ao final quantos slides o carrossel ficou.
- Pode ler identidade/design-guide.md (na raiz do projeto) se precisar de contexto de cor/fonte da marca.
- Se for pergunta ou dúvida → responda conversacionalmente, NÃO modifique o arquivo.
- Se for instrução de mudança concreta → leia o arquivo, aplique, salve em ${htmlPath}. Confirme brevemente o que fez.
- Respostas curtas e diretas.`;
```

Replace with:

```ts
export async function* streamCarrosselChat(
  html: string,
  instruction: string,
  images: { mediaType: string; data: string }[],
  history: ChatMessage[] = [],
): AsyncGenerator<CarrosselChatEvent> {
  const tmpDir = await mkdtemp(join(tmpdir(), "lbcarrossel-"));
  const htmlPath = join(tmpDir, "carrossel.html");
  await writeFile(htmlPath, html, "utf-8");

  const imagePaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = img.mediaType.split("/")[1] ?? "png";
    const imgPath = join(tmpDir, `ref-${i}.${ext}`);
    await writeFile(imgPath, Buffer.from(img.data, "base64"));
    imagePaths.push(imgPath);
  }

  const imageContext = imagePaths.length
    ? `\nImagens de referência salvas em:\n${imagePaths.map((p) => `- ${p}`).join("\n")}\nUse a ferramenta Read para visualizá-las.`
    : "";

  const historyContext = history.length > 0
    ? `\n\nHISTÓRICO DA CONVERSA:\n${history.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n")}\n`
    : "";

  const prompt = `Você é um assistente especialista em carrosséis de Instagram (HTML).

O arquivo HTML do carrossel está em: ${htmlPath}${imageContext}${historyContext}

MENSAGEM ATUAL DO USUÁRIO: ${instruction}

Regras:
- Cada slide é um <div class="slide ..."> de 1080x1350px. NÃO mude essas dimensões.
- Se adicionar ou remover slides, confirme ao final quantos slides o carrossel ficou.
- Pode ler identidade/design-guide.md (na raiz do projeto) se precisar de contexto de cor/fonte da marca.
- Pode ler imagens de referência anexadas com a ferramenta Read para analisá-las.
- Se for pergunta ou dúvida → responda conversacionalmente, NÃO modifique o arquivo.
- Se for instrução de mudança concreta → leia o arquivo, aplique, salve em ${htmlPath}. Confirme brevemente o que fez.
- Respostas curtas e diretas.`;
```

Note: the existing `finally` block (`await rm(tmpDir, { recursive: true, force: true });`) already deletes everything inside `tmpDir`, including the new `ref-*` image files — no change needed there (unlike `sites.ts`, which deletes files individually before an `rmdir`; `carrossel-editor.ts` already uses a recursive `rm` that covers this in one call).

- [ ] **Step 2: Verify**

Run: `cd server && npx vitest run`
Expected: all tests pass except the one pre-existing unrelated failure ("GET /api/contas ... Loja Beta", `contas-ads.md` drift, nothing to do with this change). No NEW failures — `streamCarrosselChat` isn't directly tested (calls the real SDK, same as `streamSiteChat` — documented decision, not a gap to fix here), and no existing test calls this function with the old 3-argument signature.

Run: `cd server && npx tsc --noEmit` (if this command exists in `server/package.json`; if not, skip — the build step below covers type errors)

- [ ] **Step 3: Commit**

```bash
git add server/src/carrossel-editor.ts
rtk proxy git commit -m "feat(server): streamCarrosselChat aceita imagens de referencia"
```

(Verify with `git show --stat HEAD` that only this one file appears.)

---

## Task 2: Backend — rota `POST /api/carrosseis/chat` aceita `images`

**Files:**
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `streamCarrosselChat(html, instruction, images, history)` (Task 1's new signature).

- [ ] **Step 1: Update the route**

Find (`server/src/server.ts`):

```ts
app.post("/api/carrosseis/chat", async (c) => {
  let body: { html: string; instruction: string; history?: ChatMessage[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const { html, instruction, history = [] } = body;
  if (!html || !instruction) return c.json({ error: "html e instruction obrigatórios" }, 400);

  return streamSSE(c, async (stream) => {
    for await (const ev of streamCarrosselChat(html, instruction, history)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});
```

Replace with:

```ts
app.post("/api/carrosseis/chat", async (c) => {
  let body: { html: string; instruction: string; images?: { mediaType: string; data: string }[]; history?: ChatMessage[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const { html, instruction, images = [], history = [] } = body;
  if (!html || !instruction) return c.json({ error: "html e instruction obrigatórios" }, 400);

  return streamSSE(c, async (stream) => {
    for await (const ev of streamCarrosselChat(html, instruction, images, history)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});
```

This is the exact same pattern already used by `/api/sites/chat` (`server.ts:429-436`) — `images` is optional, defaults to `[]`, so existing callers that don't send it keep working unchanged.

- [ ] **Step 2: Verify**

Run: `cd server && npx vitest run`
Expected: same result as Task 1's Step 2 — only the one pre-existing unrelated failure, nothing new. There is no existing test exercising `POST /api/carrosseis/chat` (confirmed: `carrossel-editor.test.ts` only tests the `GET`/`PUT /api/carrosseis/html` routes), so this change has no test to break.

- [ ] **Step 3: Commit**

```bash
git add server/src/server.ts
rtk proxy git commit -m "feat(server): rota de chat do carrossel aceita imagens de referencia"
```

(Verify with `git show --stat HEAD` that only this one file appears.)

---

## Task 3: Frontend — anexar/colar imagem no chat do editor de carrossel

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `POST /api/carrosseis/chat` now accepting `images` (Task 2).
- Produces: `type CarrosselImage = { dataUrl: string; mediaType: string; data: string }`; `Msg` gains `images?: CarrosselImage[]`.

- [ ] **Step 1: Add the `ImagePlus`/`X` icons to the existing import**

Find:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2 } from "lucide-react";
```

Replace with:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon } from "lucide-react";
```

- [ ] **Step 2: Add the image type and the file-to-image helper, extend `Msg`**

Find:

```ts
type Msg = { role: "user" | "assistant"; content: string };
```

Replace with:

```ts
type CarrosselImage = { dataUrl: string; mediaType: string; data: string };
type Msg = { role: "user" | "assistant"; content: string; images?: CarrosselImage[] };

async function fileToCarrosselImage(file: File): Promise<CarrosselImage | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const data = dataUrl.split(",")[1];
      resolve({ dataUrl, mediaType: file.type, data });
    };
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 3: Add component state and a file input ref**

Find:

```ts
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
```

Replace with:

```ts
  const [chatError, setChatError] = useState<string | null>(null);
  const [images, setImages] = useState<CarrosselImage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
```

- [ ] **Step 4: Add `handlePaste`/`handleFiles`**

Find:

```ts
  function undo() {
    setHtmlHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setHtml(prev);
      setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(prev) - 1)));
      return h.slice(0, -1);
    });
  }

  async function send() {
```

Replace with:

```ts
  function undo() {
    setHtmlHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setHtml(prev);
      setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(prev) - 1)));
      return h.slice(0, -1);
    });
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((i) => i.type.startsWith("image/"));
    if (!imageItems.length) return;
    e.preventDefault();
    const results = await Promise.all(
      imageItems.map((item) => {
        const file = item.getAsFile();
        return file ? fileToCarrosselImage(file) : Promise.resolve(null);
      }),
    );
    setImages((prev) => [...prev, ...results.filter((r): r is CarrosselImage => r !== null)]);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const results = await Promise.all(Array.from(files).map(fileToCarrosselImage));
    setImages((prev) => [...prev, ...results.filter((r): r is CarrosselImage => r !== null)]);
  }

  async function send() {
```

- [ ] **Step 5: Update `send()` to capture, send, and clear images**

Find:

```ts
  async function send() {
    const t = input.trim();
    if (!t || chatLoading) return;
    setChatError(null);
    setMessages((m) => [...m, { role: "user", content: t }, { role: "assistant", content: "" }]);
    setInput("");
    setChatLoading(true);

    try {
      const resp = await fetch(`${BACKEND}/api/carrosseis/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          instruction: t,
          history: messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
```

Replace with:

```ts
  async function send() {
    const t = input.trim();
    if ((!t && !images.length) || chatLoading) return;
    setChatError(null);
    const sentImages = [...images];
    setMessages((m) => [
      ...m,
      { role: "user", content: t, images: sentImages.length ? sentImages : undefined },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setImages([]);
    setChatLoading(true);

    try {
      const resp = await fetch(`${BACKEND}/api/carrosseis/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          instruction: t,
          images: sentImages.map((img) => ({ mediaType: img.mediaType, data: img.data })),
          history: messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
```

- [ ] **Step 6: Show attached images in the chat history bubbles**

Find:

```tsx
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"}`}>
                  {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>
                {m.content && (
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {m.content}
                  </div>
                )}
              </div>
            ))}
```

Replace with:

```tsx
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"}`}>
                  {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>
                <div className="max-w-[85%] space-y-1.5">
                  {m.images?.map((img, j) => (
                    <img
                      key={j}
                      src={img.dataUrl}
                      alt="referência"
                      className="rounded-md max-h-40 object-contain border border-border"
                    />
                  ))}
                  {m.content && (
                    <div className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
```

- [ ] **Step 7: Add the attach button, hidden file input, image previews, and paste wiring to the input area**

Find:

```tsx
          <div className="border-t border-border p-3 flex gap-2">
            <button
              onClick={undo}
              disabled={htmlHistory.length === 0}
              title="Desfazer"
              className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
            >
              <RotateCcw size={15} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={3}
              placeholder="Peça uma alteração…"
              disabled={chatLoading}
              className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-48"
            />
            <Button onClick={send} disabled={chatLoading || !input.trim()} className="!px-3 !py-2 shrink-0">
              {chatLoading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            </Button>
          </div>
```

Replace with:

```tsx
          <div className="border-t border-border p-3 space-y-2">
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt="anexo"
                      className="h-16 w-16 object-cover rounded-md border border-border"
                    />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                onClick={undo}
                disabled={htmlHistory.length === 0}
                title="Desfazer"
                className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar imagem"
                className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <ImagePlus size={15} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                onPaste={handlePaste}
                rows={3}
                placeholder="Peça uma alteração… ou cole uma imagem de referência"
                disabled={chatLoading}
                className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-48"
              />
              <Button onClick={send} disabled={chatLoading || (!input.trim() && !images.length)} className="!px-3 !py-2 shrink-0">
                {chatLoading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              </Button>
            </div>
          </div>
```

- [ ] **Step 8: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
rtk proxy git commit -m "feat(frontend): anexar/colar imagem de referencia no chat do carrossel"
```

(Verify with `git show --stat HEAD` that only this one file appears.)

---

## Task 4: Verificação final

**Files:** none (verification only).

- [ ] **Step 1: Full backend suite + frontend type-check/build, once, after both tasks**

Run: `cd server && npx vitest run`
Expected: same single pre-existing unrelated failure ("Loja Beta"), nothing new.

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 2: Manual browser walkthrough (human, no browser tool available this session)**

With `server` and `frontend` dev servers running, open `/carrosseis/<algum-id-existente>` and exercise, in order:
1. Click the new image-attach button (next to "Desfazer") → file picker opens → pick an image → a removable 64×64 thumbnail appears above the input.
2. Copy an image to the clipboard (e.g. screenshot) and paste with the textarea focused → same thumbnail behavior, no page-level paste interference.
3. Type an instruction referencing the attached image (e.g. "troque a cor de fundo pra parecer com essa imagem") and send → the user's message bubble in the chat history shows the attached image above the text → the AI's response in the chat reflects it actually looked at the image (not a generic answer).
4. Send a message with an image and NO text at all → confirm the Send button is enabled and the request goes through (this is the `(!t && !images.length)` guard in `send()` — text-only is no longer required).
5. Remove an attached thumbnail (hover → click the × ) before sending → confirm it's gone from the preview and not included in the next send.

- [ ] **Step 3: Final commit (only if manual fixups were needed)**

Run `git status --short` first and add only the files this task actually touched (never `git add -A`/`git add .` in this repo — the working tree routinely has unrelated untracked files sitting around):

```bash
git add server/src/carrossel-editor.ts server/src/server.ts frontend/src/routes/carrosseis.\$id.tsx
rtk proxy git commit -m "fix: ajustes pos-verificacao manual de imagens de referencia no carrossel"
```

(Skip if no fixups were needed. Verify with `git show --stat HEAD` that only the intended files are included.)
