# Editor de Carrossel (chat + preview multi-slide) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user open an already-generated carousel from the `/carrosseis` gallery and edit it visually — via AI chat, by clicking text directly, or by selecting text and changing its color/bold/italic/underline — with a live multi-slide preview, then persist + re-render the final PNGs on demand.

**Architecture:** Backend mirrors the existing site editor (`server/src/sites.ts` + `sites.$siteId.tsx`): a temp-dir-based Claude Agent SDK chat loop for AI edits, plus plain read/write endpoints. New pieces specific to carousels: multi-slide pagination done entirely client-side (CSS injected into the preview iframe, no Playwright needed for live preview), a `contenteditable`-based direct text editor injected into the same iframe, and a small in-iframe floating toolbar for color/B/I/U. The PNGs (`instagram/slide-NN.png`) are only regenerated when the user clicks "Salvar", which writes the real `carrossel.html` and shells out to the carousel's own `render.js` (Playwright).

**Tech Stack:** Hono (backend), `@anthropic-ai/claude-agent-sdk`, Vitest, TanStack Router + React 19 (frontend), Playwright (render, already a project dependency), vanilla JS injected into preview iframes (no new frontend libraries).

## Global Constraints

- Every slide is a `<div class="slide ...">` of fixed 1080x1350px — the editor never changes those dimensions, in chat-driven edits or direct edits.
- PNG re-render happens **only** on explicit "Salvar" — never automatically after a chat turn or a text edit. This keeps the chat/edit loop fast and guarantees `instagram/*.png` is never left mid-update.
- No image upload/paste in the carousel chat in this version (sites' chat supports it; carousels' doesn't).
- Path traversal guard (`resolve(...).startsWith(resolve(CARROSSEIS_ROOT))`) is required in every function that takes a carousel `id`.
- Direct text edits commit **only on blur** (not on every keystroke) — switching slides or running a chat edit while a field is focused must trigger that blur first so no edit is lost silently. The one exception is the formatting toolbar (Task 7): its buttons commit immediately on click, because a click is a discrete action, not a keystroke stream, so it carries none of the mid-typing iframe-reload risk the blur-only rule exists to avoid.
- `Enter` inside an editable text element confirms (blurs) instead of inserting a newline.
- `streamCarrosselChat` (the live SDK call) is not unit-tested, mirroring the existing decision for `streamSiteChat` in `sites.test.ts` — it's exercised only by the manual end-to-end pass in Task 9.

---

### Task 1: Backend — read/write/render core (`carrossel-editor.ts`)

**Files:**
- Create: `server/src/carrossel-editor.ts`
- Create: `server/src/carrossel-editor.test.ts`

**Interfaces:**
- Produces: `readCarrosselHtml(id: string): Promise<string>`, `writeCarrosselHtmlAndRender(id: string, html: string): Promise<{ slides: string[] }>` — both throw `Error("Caminho inválido")` on path traversal. Later tasks (2, 3) import these.

- [ ] **Step 1: Write the failing test**

```ts
// server/src/carrossel-editor.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
  mkdtemp: vi.fn(),
  rm: vi.fn(),
}));
vi.mock("node:child_process", () => ({
  execFile: vi.fn((_cmd: unknown, _args: unknown, _opts: unknown, cb: (e: Error | null) => void) => cb(null)),
}));

import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { readCarrosselHtml, writeCarrosselHtmlAndRender } from "./carrossel-editor.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockReaddir = vi.mocked(readdir);
const mockUnlink = vi.mocked(unlink);
const mockExecFile = vi.mocked(execFile);

beforeEach(() => vi.clearAllMocks());

describe("readCarrosselHtml", () => {
  it("lê o html do carrossel", async () => {
    mockReadFile.mockResolvedValue("<html></html>" as never);
    const html = await readCarrosselHtml("dor-processo-manual-2026-06-21");
    expect(html).toBe("<html></html>");
  });

  it("rejeita path traversal", async () => {
    await expect(readCarrosselHtml("../../etc")).rejects.toThrow("Caminho inválido");
  });
});

describe("writeCarrosselHtmlAndRender", () => {
  it("escreve o html, roda o render.js e devolve os slides finais", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue(["slide-01.png"] as never);

    const result = await writeCarrosselHtmlAndRender("teste-2026-06-21", '<div class="slide">a</div>');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockExecFile).toHaveBeenCalledTimes(1);
    expect(result.slides).toEqual(["slide-01.png"]);
  });

  it("remove PNGs sobrando quando o carrossel encolhe de slides", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReaddir
      .mockResolvedValueOnce(["slide-01.png", "slide-02.png", "slide-03.png"] as never)
      .mockResolvedValueOnce(["slide-01.png"] as never);
    mockUnlink.mockResolvedValue(undefined);

    await writeCarrosselHtmlAndRender("teste-2026-06-21", '<div class="slide">só uma agora</div>');

    expect(mockUnlink).toHaveBeenCalledTimes(2);
  });

  it("rejeita path traversal", async () => {
    await expect(writeCarrosselHtmlAndRender("../../etc", "<html></html>")).rejects.toThrow("Caminho inválido");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npx vitest run carrossel-editor.test.ts`
Expected: FAIL — `Cannot find module './carrossel-editor.js'`

- [ ] **Step 3: Write minimal implementation**

```ts
// server/src/carrossel-editor.ts
import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CARROSSEIS_ROOT = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel");

function safeHtmlPath(id: string): string {
  const safe = resolve(join(CARROSSEIS_ROOT, id, "carrossel.html"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  return safe;
}

export async function readCarrosselHtml(id: string): Promise<string> {
  return readFile(safeHtmlPath(id), "utf-8");
}

function countSlides(html: string): number {
  return (html.match(/class="slide/g) ?? []).length;
}

export async function writeCarrosselHtmlAndRender(id: string, html: string): Promise<{ slides: string[] }> {
  const htmlPath = safeHtmlPath(id);
  const carrosselDir = join(CARROSSEIS_ROOT, id);
  const renderPath = resolve(join(carrosselDir, "render.js"));
  if (!renderPath.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");

  await writeFile(htmlPath, html, "utf-8");
  await execFileAsync("node", [renderPath], { cwd: carrosselDir, timeout: 30000 });

  const outDir = join(carrosselDir, "instagram");
  const newCount = countSlides(html);
  const beforeCleanup = await readdir(outDir);
  const stale = beforeCleanup.filter((f) => {
    const m = f.match(/^slide-(\d+)\.png$/);
    return m !== null && parseInt(m[1], 10) > newCount;
  });
  await Promise.all(stale.map((f) => unlink(join(outDir, f))));

  const afterCleanup = await readdir(outDir);
  return { slides: afterCleanup.filter((f) => /^slide-\d+\.png$/.test(f)).sort() };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npx vitest run carrossel-editor.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/carrossel-editor.ts server/src/carrossel-editor.test.ts
git commit -m "feat(server): read/write/render core do editor de carrossel"
```

---

### Task 2: Backend — `streamCarrosselChat`

**Files:**
- Modify: `server/src/carrossel-editor.ts`

**Interfaces:**
- Consumes: `type ChatMessage` from `./sites.js` (already `{ role: "user" | "assistant"; content: string }`).
- Produces: `type CarrosselChatEvent = { type: "chunk"; text: string } | { type: "html"; html: string } | { type: "done" } | { type: "error"; text: string }`, `streamCarrosselChat(html: string, instruction: string, history?: ChatMessage[]): AsyncGenerator<CarrosselChatEvent>`. Task 3's `POST /api/carrosseis/chat` route consumes this directly.

Not unit tested (same decision as `streamSiteChat` — it calls the live SDK). Verified manually in Task 9.

- [ ] **Step 1: Add the function**

Edit the top imports of `server/src/carrossel-editor.ts`:

```ts
import { readFile, writeFile, readdir, unlink, mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { ChatMessage } from "./sites.js";
```

Append to the end of `server/src/carrossel-editor.ts`:

```ts
export type CarrosselChatEvent =
  | { type: "chunk"; text: string }
  | { type: "html"; html: string }
  | { type: "done" }
  | { type: "error"; text: string };

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

  const MODEL = process.env.LBCODE_MODEL ?? "claude-sonnet-4-6";

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        allowedTools: ["Read", "Write", "Edit"],
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    for await (const msg of messages) {
      if (msg.type === "assistant") {
        for (const block of msg.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text) yield { type: "chunk", text };
          }
        }
      } else if (msg.type === "result") {
        try {
          const modified = await readFile(htmlPath, "utf-8");
          if (modified !== html) yield { type: "html", html: modified };
        } catch { /* arquivo pode não existir se algo falhou */ }
        break;
      }
    }

    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `cd server && npx tsc --noEmit`
Expected: no errors (confirms the `ChatMessage` import and SDK types line up).

- [ ] **Step 3: Run existing tests to confirm nothing broke**

Run: `cd server && npx vitest run carrossel-editor.test.ts`
Expected: PASS (same 5 tests as Task 1 — this task only adds new exports)

- [ ] **Step 4: Commit**

```bash
git add server/src/carrossel-editor.ts
git commit -m "feat(server): streamCarrosselChat via Claude Agent SDK"
```

---

### Task 3: Backend — wire routes into `server.ts`

**Files:**
- Modify: `server/src/server.ts`
- Modify: `server/src/carrossel-editor.test.ts`

**Interfaces:**
- Consumes: `readCarrosselHtml`, `writeCarrosselHtmlAndRender`, `streamCarrosselChat` from `./carrossel-editor.js` (Tasks 1–2); `type ChatMessage` from `./sites.js`.
- Produces: `GET /api/carrosseis/html?id=`, `PUT /api/carrosseis/html?id=`, `POST /api/carrosseis/chat` — consumed by Task 4/5's frontend route.

- [ ] **Step 1: Write the failing tests**

Append to `server/src/carrossel-editor.test.ts`:

```ts
import { app } from "./server.js";

describe("GET /api/carrosseis/html", () => {
  it("400 sem id", async () => {
    const res = await app.request("/api/carrosseis/html");
    expect(res.status).toBe(400);
  });

  it("404 quando o arquivo não existe", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("not found"), { code: "ENOENT" }));
    const res = await app.request("/api/carrosseis/html?id=inexistente");
    expect(res.status).toBe(404);
  });

  it("200 com o html quando existe", async () => {
    mockReadFile.mockResolvedValue("<html>ok</html>" as never);
    const res = await app.request("/api/carrosseis/html?id=teste");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<html>ok</html>");
  });
});

describe("PUT /api/carrosseis/html", () => {
  it("400 sem id", async () => {
    const res = await app.request("/api/carrosseis/html", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<a></a>" }),
    });
    expect(res.status).toBe(400);
  });

  it("200 com slides quando o render funciona", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue(["slide-01.png"] as never);

    const res = await app.request("/api/carrosseis/html?id=teste", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: '<div class="slide">a</div>' }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; slides: string[] };
    expect(body.ok).toBe(true);
    expect(body.slides).toEqual(["slide-01.png"]);
  });

  it("500 quando o render falha", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockExecFile.mockImplementationOnce((_cmd, _args, _opts, cb) =>
      (cb as (e: Error) => void)(new Error("Playwright crashou")),
    );

    const res = await app.request("/api/carrosseis/html?id=teste", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: '<div class="slide">a</div>' }),
    });

    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npx vitest run carrossel-editor.test.ts`
Expected: FAIL — all 4 new tests get 404 (routes don't exist yet, Hono's default 404)

- [ ] **Step 3: Write minimal implementation**

In `server/src/server.ts`, add the import (after the existing `carrosseis.js` import line):

```ts
import { listCarrosseis, readSlide } from "./carrosseis.js";
import { readCarrosselHtml, writeCarrosselHtmlAndRender, streamCarrosselChat } from "./carrossel-editor.js";
```

Add the three routes right after the existing `app.get("/api/carrosseis/slide", ...)` block:

```ts
app.get("/api/carrosseis/html", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const html = await readCarrosselHtml(id);
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido")
      return c.json({ error: "Carrossel não encontrado" }, 404);
    return c.json({ error: "Erro ao ler carrossel" }, 500);
  }
});

app.put("/api/carrosseis/html", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const { html } = await c.req.json<{ html: string }>();
    const { slides } = await writeCarrosselHtmlAndRender(id, html);
    return c.json({ ok: true, slides });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

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

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npx vitest run carrossel-editor.test.ts`
Expected: PASS (all 9 tests — 5 from Task 1, 4 new)

- [ ] **Step 5: Run the full server test suite to confirm no regressions**

Run: `cd server && npx vitest run`
Expected: PASS (all suites, including unrelated `sites.test.ts`, `server.test.ts`, etc.)

- [ ] **Step 6: Commit**

```bash
git add server/src/server.ts server/src/carrossel-editor.test.ts
git commit -m "feat(server): expõe rotas GET/PUT html e POST chat do editor de carrossel"
```

---

### Task 4: Frontend — route skeleton with read-only multi-slide preview

**Files:**
- Create: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `GET /api/carrosseis/html?id=` (Task 3).
- Produces: route component `CarrosselEditor` with state `html`, `activeSlide`, `mainIframeRef` (a `useRef<HTMLIFrameElement>`), helper `slideCount(html)`, `injectPagination(html, activeIndex)`. Tasks 5–8 modify this same file and rely on these exact names.

No backend test needed; this task has no automated test (no React test runner in this repo — `sites.$siteId.tsx` has none either). Verified manually at the end of Task 4 and again, end-to-end, in Task 9.

- [ ] **Step 1: Create the route file**

```tsx
// frontend/src/routes/carrosseis.$id.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

export const Route = createFileRoute("/carrosseis/$id")({
  component: CarrosselEditor,
});

function slideCount(html: string): number {
  return (html.match(/class="slide/g) ?? []).length;
}

function injectPagination(html: string, activeIndex: number): string {
  const style = `<style id="__lbcode-pagination-style">
    .slide { display: none !important; }
    .slide:nth-of-type(${activeIndex + 1}) { display: flex !important; }
    html, body { margin: 0; height: 100%; display: flex; justify-content: center; align-items: center; background: #1a1a1a; }
  </style>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}

function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

const MAIN_SCALE = 1 / 3;
const THUMB_SCALE = 56 / 1080;

function CarrosselEditor() {
  const { id } = Route.useParams();
  const [html, setHtml] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(true);
  const [loadErro, setLoadErro] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [mainBlobUrl, setMainBlobUrl] = useState("");
  const [thumbBlobUrls, setThumbBlobUrls] = useState<string[]>([]);
  const mainIframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadingHtml(true);
    fetch(`${BACKEND}/api/carrosseis/html?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((h) => {
        setHtml(h);
        setActiveSlide(0);
        setLoadingHtml(false);
      })
      .catch((e) => {
        setLoadErro(e.message);
        setLoadingHtml(false);
      });
  }, [id]);

  const total = html ? slideCount(html) : 0;

  useEffect(() => {
    if (!html) return;
    setMainBlobUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return makeBlobUrl(injectPagination(html, activeSlide));
    });
  }, [html, activeSlide]);

  useEffect(() => {
    if (!html || total === 0) return;
    const urls = Array.from({ length: total }, (_, i) => makeBlobUrl(injectPagination(html, i)));
    setThumbBlobUrls((old) => {
      old.forEach((u) => URL.revokeObjectURL(u));
      return urls;
    });
  }, [html, total]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setActiveSlide((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setActiveSlide((i) => Math.min(total - 1, i + 1));
    }
    const node = previewRef.current;
    node?.addEventListener("keydown", onKeyDown);
    return () => node?.removeEventListener("keydown", onKeyDown);
  }, [total]);

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/carrosseis" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="font-semibold text-[14px] truncate capitalize">
            {id.replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-/g, " ")}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="lg:w-[400px] lg:border-r border-b lg:border-b-0 border-border bg-card flex items-center justify-center text-muted-foreground text-[13px] p-4">
          Chat chega na próxima task.
        </div>

        <div
          ref={previewRef}
          tabIndex={0}
          className="flex-1 flex flex-col items-center justify-center overflow-auto min-h-[400px] bg-muted/40 outline-none gap-3 py-6"
        >
          {loadingHtml ? (
            <div className="flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="animate-spin" size={18} /> Carregando carrossel…
            </div>
          ) : loadErro ? (
            <div className="text-red-500 text-[13px]">Erro ao carregar: {loadErro}</div>
          ) : (
            <>
              <div className="relative bg-white shadow-lg overflow-hidden" style={{ width: 1080 * MAIN_SCALE, height: 1350 * MAIN_SCALE }}>
                <iframe
                  ref={mainIframeRef}
                  key={mainBlobUrl}
                  src={mainBlobUrl || undefined}
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: 1080, height: 1350, transform: `scale(${MAIN_SCALE})`, transformOrigin: "top left", border: 0 }}
                />
                {total > 1 && (
                  <>
                    <button
                      onClick={() => setActiveSlide((i) => Math.max(0, i - 1))}
                      disabled={activeSlide === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveSlide((i) => Math.min(total - 1, i + 1))}
                      disabled={activeSlide === total - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-center text-[12px] text-muted-foreground">{activeSlide + 1} / {total}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {thumbBlobUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`shrink-0 rounded-md overflow-hidden border-2 transition-colors bg-white ${i === activeSlide ? "border-primary" : "border-transparent"}`}
                    style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
                  >
                    <iframe
                      src={url}
                      title={`thumb ${i + 1}`}
                      tabIndex={-1}
                      sandbox="allow-same-origin"
                      style={{ width: 1080, height: 1350, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left", border: 0, pointerEvents: "none" }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the dev server and verify manually**

Run: `cd frontend && npm run dev` (background — leave it running)
Open `http://localhost:3000/carrosseis/dor-processo-manual-2026-06-21` in a browser (requires the backend dev server running too — Task 9 covers starting both together; for this task it's fine to run `cd server && npm run dev` in a second terminal).
Expected: page shows the header with "dor processo manual", a single scaled-down slide in the preview, the counter "1 / 1", and no thumbnails row issue (single thumbnail, since this fixture has 1 slide — confirms pagination math works for `total = 1`).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): preview multi-slide paginado e somente leitura do editor de carrossel"
```

---

### Task 5: Frontend — AI chat panel + undo history

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `POST /api/carrosseis/chat` (Task 3, SSE).
- Produces: `applyHtml(newHtml: string): void` and `htmlHistory` state — Tasks 6 and 7 call `applyHtml` directly from the `message` event listener they add, so both AI edits and direct/toolbar edits share one undo stack.

- [ ] **Step 1: Replace the chat placeholder with the real panel**

Add imports (merge with the existing `lucide-react` import):

```tsx
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/app-shell";
```

Add state (inside `CarrosselEditor`, alongside the existing state):

```tsx
type Msg = { role: "user" | "assistant"; content: string };

const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
const [messages, setMessages] = useState<Msg[]>([
  { role: "assistant", content: "Olá! Me diga o que quer mudar nesse carrossel — texto, cor, slides. Ou clique direto no texto do preview pra editar sem IA." },
]);
const [input, setInput] = useState("");
const [chatLoading, setChatLoading] = useState(false);
const [chatError, setChatError] = useState<string | null>(null);
const scrollRef = useRef<HTMLDivElement>(null);
```

Add `applyHtml`/`undo` (function declarations, alongside the other helpers inside the component):

```tsx
function applyHtml(newHtml: string) {
  setHtmlHistory((h) => [...h, html]);
  setHtml(newHtml);
  setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(newHtml) - 1)));
}

function undo() {
  setHtmlHistory((h) => {
    if (h.length === 0) return h;
    const prev = h[h.length - 1];
    setHtml(prev);
    setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(prev) - 1)));
    return h.slice(0, -1);
  });
}
```

Add `send()` (function declaration):

```tsx
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
    if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const appendChunk = (text: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + text };
        return copy;
      });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        try {
          const ev = JSON.parse(dataLine.slice(5).trim()) as { type: string; text?: string; html?: string };
          if (ev.type === "chunk" && ev.text) appendChunk(ev.text);
          else if (ev.type === "html" && ev.html) applyHtml(ev.html);
          else if (ev.type === "error" && ev.text) {
            setChatError(ev.text);
            appendChunk(`\n\n⚠️ ${ev.text}`);
          }
        } catch { /* ignora frame malformado */ }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    setChatError(msg);
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { ...copy[copy.length - 1], content: `Erro: ${msg}` };
      return copy;
    });
  } finally {
    setChatLoading(false);
  }
}
```

Add the scroll-to-bottom effect:

```tsx
useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
}, [messages, chatLoading]);
```

Replace the placeholder `<div>` ("Chat chega na próxima task.") with:

```tsx
<div className="lg:w-[400px] lg:border-r border-b lg:border-b-0 border-border bg-card flex flex-col min-h-0">
  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
    {chatLoading && (
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Sparkles size={13} />
        </div>
        <div className="bg-muted rounded-lg px-3 py-2 text-[13px] flex items-center gap-2">
          <Loader2 className="animate-spin" size={13} /> Aplicando mudança…
        </div>
      </div>
    )}
    {chatError && (
      <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">{chatError}</div>
    )}
  </div>

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
</div>
```

- [ ] **Step 2: Run the dev server and verify manually**

Run: `cd server && npm run dev` (background) and `cd frontend && npm run dev` (background)
Open `http://localhost:3000/carrosseis/dor-processo-manual-2026-06-21`, type "responda só 'ok', não mude nada" and send.
Expected: assistant message streams in and replies; no `html` event fires (preview unchanged) since the instruction was a question, matching the prompt rule.
Then type a real change, e.g. "troque a cor do label 'O PROBLEMA REAL' para branco" and send.
Expected: assistant replies, the preview updates after a few seconds, and the "Desfazer" button becomes enabled. Click it — preview reverts to the previous version.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): chat com IA + undo no editor de carrossel"
```

---

### Task 6: Frontend — direct text editing (no AI)

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `applyHtml` (Task 5), `mainIframeRef` (Task 4).
- Produces: `EDITOR_SCRIPT` constant and `injectEditor(html)` — Task 7 appends to `EDITOR_SCRIPT`'s body (same constant, same closure) to add the formatting toolbar.

- [ ] **Step 1: Add the injected editor script and wire it into the main iframe only**

Add this constant near the other helpers (`injectPagination`, `makeBlobUrl`):

```tsx
const EDITOR_SCRIPT = `<script id="__lbcode-editor-script">
(function(){
  document.addEventListener('click', function(e){
    var t = e.target;
    while (t && t.tagName !== 'A') t = t.parentElement;
    if (!t) return;
    var h = t.getAttribute('href') || '';
    if (!h || h.startsWith('#') || h.startsWith('javascript:')) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  function markEditable(){
    var sel = '.slide h1,.slide h2,.slide h3,.slide h4,.slide p,.slide span,.slide li,.slide a,.slide strong,.slide em,.slide blockquote';
    document.querySelectorAll(sel).forEach(function(el){
      if (el.closest('[contenteditable="true"]')) return;
      if (!el.textContent || !el.textContent.trim()) return;
      var hasBlockChild = Array.prototype.some.call(el.children, function(c){
        return ['DIV','SECTION','UL','OL'].indexOf(c.tagName) !== -1;
      });
      if (hasBlockChild) return;
      el.setAttribute('contenteditable', 'true');
      el.classList.add('__lbcode-editable');
    });
  }
  markEditable();

  var style = document.createElement('style');
  style.id = '__lbcode-editor-style';
  style.textContent = '.__lbcode-editable:hover{outline:2px dashed rgba(41,197,255,.6);outline-offset:2px;cursor:text}.__lbcode-editable:focus{outline:2px solid #29C5FF}';
  document.head.appendChild(style);

  function serializeAndNotify(){
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('#__lbcode-pagination-style,#__lbcode-editor-style,#__lbcode-editor-script,#__lbcode-toolbar').forEach(function(el){ el.remove(); });
    clone.querySelectorAll('.__lbcode-editable').forEach(function(el){ el.classList.remove('__lbcode-editable'); el.removeAttribute('contenteditable'); });
    parent.postMessage({ type: 'lbcode-edit', html: '<!doctype html>' + clone.outerHTML }, '*');
  }

  document.addEventListener('blur', function(e){
    if (e.target && e.target.classList && e.target.classList.contains('__lbcode-editable')) serializeAndNotify();
  }, true);

  document.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('__lbcode-editable')) {
      e.preventDefault();
      e.target.blur();
    }
  }, true);
})();
</script>`;

function injectEditor(html: string): string {
  const idx = html.indexOf("</body>");
  return idx !== -1 ? html.slice(0, idx) + EDITOR_SCRIPT + html.slice(idx) : html + EDITOR_SCRIPT;
}
```

Change the main-preview `useEffect` (the one with deps `[html, activeSlide]`) so it wraps with `injectEditor` too — **only the main iframe, not the thumbnails**:

```tsx
useEffect(() => {
  if (!html) return;
  setMainBlobUrl((old) => {
    if (old) URL.revokeObjectURL(old);
    return makeBlobUrl(injectEditor(injectPagination(html, activeSlide)));
  });
}, [html, activeSlide]);
```

(The thumbnails `useEffect` keeps calling plain `injectPagination`, unchanged — leave it as-is.)

Add the `message` listener that turns the iframe's `postMessage` into an `applyHtml` call:

```tsx
useEffect(() => {
  function onMessage(e: MessageEvent) {
    if (e.data?.type !== "lbcode-edit") return;
    if (e.source !== mainIframeRef.current?.contentWindow) return;
    applyHtml(e.data.html as string);
  }
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}, [html]);
```

- [ ] **Step 2: Run the dev server and verify manually**

With both dev servers running, open `http://localhost:3000/carrosseis/dor-processo-manual-2026-06-21`.
Hover over the heading text in the preview — expect a dashed cyan outline to appear.
Click it, type a change, click elsewhere (or press Enter).
Expected: the preview updates with the new text, and "Desfazer" becomes enabled (confirms it went through `applyHtml` and joined the same undo stack as chat edits).
Click on a thumbnail — expected: clicking inside a thumbnail does **not** let you edit text (no outline on hover, `pointer-events: none` on the thumbnail iframe).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): edição direta de texto no preview, sem IA"
```

---

### Task 7: Frontend — floating color/B/I/U toolbar

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `EDITOR_SCRIPT`, `serializeAndNotify` (both from Task 6, same in-iframe closure).
- Produces: nothing new for later tasks — this is the last in-iframe addition.

- [ ] **Step 1: Append the toolbar code inside `EDITOR_SCRIPT`**

Insert this block right before the closing `})();` of `EDITOR_SCRIPT` (defined in Task 6):

```js
  var brandColors = [];
  document.querySelectorAll('style').forEach(function(styleEl){
    var matches = styleEl.textContent.match(/--[\\w-]+:\\s*#[0-9a-fA-F]{3,8}/g) || [];
    matches.forEach(function(m){
      var hex = m.split(':')[1].trim();
      if (brandColors.indexOf(hex) === -1) brandColors.push(hex);
    });
  });

  var toolbar = document.createElement('div');
  toolbar.id = '__lbcode-toolbar';
  toolbar.style.cssText = 'position:fixed;display:none;gap:4px;align-items:center;background:#1f1f1f;border-radius:8px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:999999;';

  brandColors.slice(0, 6).forEach(function(hex){
    var sw = document.createElement('button');
    sw.style.cssText = 'width:18px;height:18px;border-radius:4px;border:1px solid rgba(255,255,255,.3);cursor:pointer;background:' + hex;
    sw.addEventListener('mousedown', function(e){ e.preventDefault(); });
    sw.addEventListener('click', function(){ document.execCommand('foreColor', false, hex); serializeAndNotify(); });
    toolbar.appendChild(sw);
  });

  var customColor = document.createElement('input');
  customColor.type = 'color';
  customColor.style.cssText = 'width:20px;height:20px;border:none;cursor:pointer;background:none;padding:0;';
  customColor.addEventListener('mousedown', function(e){ e.preventDefault(); });
  customColor.addEventListener('input', function(){ document.execCommand('foreColor', false, customColor.value); serializeAndNotify(); });
  toolbar.appendChild(customColor);

  [['B','bold'],['I','italic'],['U','underline']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:22px;height:22px;border-radius:4px;border:none;background:#3a3a3a;color:#fff;font-size:12px;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand(pair[1]); serializeAndNotify(); });
    toolbar.appendChild(btn);
  });

  document.body.appendChild(toolbar);

  document.addEventListener('selectionchange', function(){
    var sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.anchorNode) { toolbar.style.display = 'none'; return; }
    var anchorEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    var editable = anchorEl ? anchorEl.closest('[contenteditable="true"]') : null;
    if (!editable) { toolbar.style.display = 'none'; return; }
    var rect = sel.getRangeAt(0).getBoundingClientRect();
    toolbar.style.left = Math.max(4, rect.left) + 'px';
    toolbar.style.top = Math.max(4, rect.top - 36) + 'px';
    toolbar.style.display = 'flex';
  });
```

(`serializeAndNotify` is a `function` declaration earlier in the same IIFE from Task 6 — hoisted, so it's safe to reference here regardless of source order.)

- [ ] **Step 2: Run the dev server and verify manually**

Open the editor, click into a heading, select part of the text with the mouse.
Expected: a small dark toolbar appears just above the selection with a few color swatches (matching the carousel's own `--roxo`/`--ciano`/etc. variables), a free-color picker, and B/I/U buttons.
Click a color swatch.
Expected: the selected text changes color in the preview immediately, the toolbar stays open (selection preserved — confirms the `mousedown` `preventDefault()` worked), and "Desfazer" is enabled.
Click elsewhere to deselect.
Expected: toolbar disappears.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): toolbar flutuante de cor/B/I/U no editor de carrossel"
```

---

### Task 8: Frontend — Save button + gallery entry point

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`
- Modify: `frontend/src/routes/carrosseis.tsx`

**Interfaces:**
- Consumes: `PUT /api/carrosseis/html?id=` (Task 3).
- Produces: nothing consumed by later tasks — this closes the loop (Task 9 exercises it end-to-end).

- [ ] **Step 1: Add the Save button to the editor**

Add imports (merge into the existing `lucide-react` import) and state:

```tsx
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2 } from "lucide-react";
```

```tsx
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
const [saved, setSaved] = useState(false);

async function salvar() {
  setSaving(true);
  setSaveError(null);
  try {
    const res = await fetch(`${BACKEND}/api/carrosseis/html?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (e) {
    setSaveError(e instanceof Error ? e.message : "Erro desconhecido");
  } finally {
    setSaving(false);
  }
}
```

Add the button to the header bar (inside the existing `<div className="h-14 ...">`, as a sibling of the title `div`, on the right side):

```tsx
<div className="flex items-center gap-2">
  {saveError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={saveError}>{saveError}</span>}
  <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
    {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
    <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
  </Button>
</div>
```

- [ ] **Step 2: Add the entry point + cache-bust in the gallery**

In `frontend/src/routes/carrosseis.tsx`, change the import line:

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { ChevronLeft, ChevronRight, Copy, Check, Sparkles } from "lucide-react";
```

Add `loadedAt` state and set it on fetch success:

```tsx
const [loadedAt, setLoadedAt] = useState(0);
// ...
useEffect(() => {
  fetchCarrosseis()
    .then((list) => {
      setCarrosseis(list);
      setLoadedAt(Date.now());
    })
    .catch(() => setErro("Backend offline ou sem carrosseis"));
}, []);
```

Change `slideUrl` to take a version param, and update all three call sites:

```tsx
function slideUrl(id: string, slide: string, v: number) {
  return `${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${encodeURIComponent(slide)}&v=${v}`;
}
```

- `slideUrl(c.id, c.slides[0])` → `slideUrl(c.id, c.slides[0], loadedAt)`
- `slideUrl(aberto.id, aberto.slides[slideIdx])` → `slideUrl(aberto.id, aberto.slides[slideIdx], loadedAt)`
- `slideUrl(aberto.id, s)` (inside the thumbnails `.map`) → `slideUrl(aberto.id, s, loadedAt)`

Add `const navigate = useNavigate();` inside `CarrosseisPagina`, and add the entry-point button next to "Voltar à galeria":

```tsx
<div className="flex items-center justify-between mb-4">
  <button onClick={fechar} className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
    <ChevronLeft size={14} /> Voltar à galeria
  </button>
  <button
    onClick={() => navigate({ to: "/carrosseis/$id", params: { id: aberto.id } })}
    className="flex items-center gap-1.5 text-[13px] bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90"
  >
    <Sparkles size={14} /> Editar com IA
  </button>
</div>
```

(This replaces the existing standalone "Voltar à galeria" `<button>` — keep it, just wrap both buttons in the new flex row instead of the old single line.)

- [ ] **Step 3: Run the dev server and verify manually**

Open `/carrosseis`, click a carousel card, click "Editar com IA" → lands on `/carrosseis/$id`.
Edit some text, click "Salvar".
Expected: button shows a spinner, then "Salvo" for ~2s. No error banner.
Click the back arrow (`Link to="/carrosseis"`), confirm the gallery's thumbnail for that carousel reflects the edited text (not a stale cached image).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx frontend/src/routes/carrosseis.tsx
git commit -m "feat(frontend): botão Salvar no editor + entrada 'Editar com IA' na galeria"
```

---

### Task 9: End-to-end manual verification (disposable fixture)

**Files:**
- Create (temporary, deleted at the end of this task): `saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21/carrossel.html`, `.../render.js`

This task does **not** touch any real carousel (e.g. `dor-processo-manual-2026-06-21`) — it uses a throwaway 2-slide fixture so the full pagination/thumbnail/save loop is exercised without risking the user's actual content.

- [ ] **Step 1: Create the fixture**

```bash
mkdir -p "saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21"
```

`saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21/carrossel.html`:

```html
<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><style>
:root{ --roxo:#A24BFF; --ciano:#29C5FF; --bg:#07070F; --txt:#FFFFFF; }
*{margin:0;padding:0;box-sizing:border-box}
.slide{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Arial,sans-serif;color:var(--txt);background:var(--bg);display:flex;flex-direction:column;justify-content:center;padding:96px}
h1{font-size:58px;font-weight:800}
p{font-size:28px;margin-top:24px;color:#C9C9D6}
</style></head><body>
  <div class="slide">
    <h1>Slide um de teste</h1>
    <p>Texto de teste pra validar o editor.</p>
  </div>
  <div class="slide">
    <h1>Slide dois de teste</h1>
    <p>Segundo slide pra validar navegação e miniaturas.</p>
  </div>
</body></html>
```

`saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21/render.js`:

```js
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "carrossel.html");
const outDir = path.join(__dirname, "instagram");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const slides = await page.locator(".slide").all();
for (let i = 0; i < slides.length; i++) {
  const num = String(i + 1).padStart(2, "0");
  const out = path.join(outDir, `slide-${num}.png`);
  await slides[i].screenshot({ path: out });
  console.log("OK:", out);
}

await browser.close();
```

- [ ] **Step 2: Render the baseline PNGs**

Run: `cd "saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21" && node render.js`
Expected: two lines `OK: .../instagram/slide-01.png` and `OK: .../instagram/slide-02.png`. Confirm with `ls instagram/` — both files exist.

- [ ] **Step 3: Start both dev servers**

Run (background): `npm run dev` from the repo root (`/home/luan/LBCodeOS/LBCodeOS`) — this runs both `server` and `frontend` concurrently per the root `package.json`.
Wait for both "back" and "front" ready logs, then confirm `http://localhost:8787/api/carrosseis` (or the frontend gallery) responds.

- [ ] **Step 4: Walk through the full flow in the browser**

1. Open `http://localhost:3000/carrosseis` — confirm a card titled "Teste Editor Temp" shows 2 slides (the gallery's `labelFromId` strips the trailing `-2026-06-21` date and title-cases the rest via CSS, same as every other carousel card).
2. Click the card, then click "Editar com IA" — confirm it navigates to `/carrosseis/teste-editor-temp-2026-06-21` and the preview shows slide 1 with 2 thumbnails below.
3. Click the right arrow or the second thumbnail — confirm the preview switches to "Slide dois de teste".
4. Go back to slide 1. Click directly on "Slide um de teste", change it to "Slide editado", click elsewhere.
   Expected: preview shows "Slide editado"; "Desfazer" button is now enabled.
5. Select the word "editado" with the mouse.
   Expected: floating toolbar appears above the selection. Click a color swatch.
   Expected: the word changes color in the preview.
6. In the chat, send: "troque o fundo do slide 1 para #1a1a2e".
   Expected: assistant replies in a few seconds, and the slide 1 background updates in the preview (this is a real Claude Agent SDK call — may take 10–30s).
7. Click "Desfazer" once.
   Expected: the background change from chat reverts (preview shows the previous background), confirming chat edits and direct edits share one undo stack.
8. Click "Salvar".
   Expected: button shows a spinner then "Salvo".

- [ ] **Step 5: Verify the PNGs actually changed on disk**

Run: `ls -la "saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21/instagram/"`
Expected: `slide-01.png` and `slide-02.png` both have an `mtime` newer than Step 2's render.
Use the Read tool to open `saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21/instagram/slide-01.png` and visually confirm it shows "Slide editado" with the colored word — proof the Save → render.js → PNG loop works end-to-end, not just the in-browser preview.

- [ ] **Step 6: Clean up the fixture**

```bash
rm -rf "saidas/marketing/conteudo/carrossel/teste-editor-temp-2026-06-21"
```

Confirm: `ls saidas/marketing/conteudo/carrossel/` no longer lists `teste-editor-temp-2026-06-21`, and the real `dor-processo-manual-2026-06-21` carousel was never touched (`git status` / `ls -la` on that folder shows no modification — it's gitignored so this is just an `ls` sanity check, not a git diff).

- [ ] **Step 7: Stop the dev servers**

Stop the background `npm run dev` process started in Step 3.

No commit for this task — it's verification only, and the fixture is deleted at the end.
