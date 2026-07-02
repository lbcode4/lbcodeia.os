# Editor de Carrossel — Upgrade de Painéis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add slide management (add/duplicate/reorder/remove), Instagram composition guides (safe zone, profile crop, thirds), one-click AI suggestion prompts, an editable caption panel, and real PNG export to the existing real-HTML carousel editor (`/carrosseis/$id`), matching the panel richness of a reference prototype without adopting its fake/mocked architecture.

**Architecture:** Everything stays layered on top of the existing real pipeline — `carrossel.html` on disk, edited via contenteditable-in-iframe or AI chat, saved via `PUT /api/carrosseis/html` (which already re-renders PNGs through the skill's own `render.js`/Playwright). Slide list operations manipulate the `html` string client-side with `DOMParser`, funneling through the existing `applyHtml()` so undo keeps working for free. Caption gets two new tiny backend endpoints backed by `legenda.md`. PNG export adds zero backend code — it downloads PNGs that already exist on disk after save.

**Tech Stack:** Hono (backend), React + TanStack Router (frontend), vitest (backend tests only — frontend has no test harness, matches existing project convention).

## Global Constraints

- No new npm dependencies (no Playwright added to server, no zip library) — see spec section "Exportar PNG".
- Fixed format only: 1080×1350 (4:5). No format switcher — see spec "Fora de escopo".
- Only two new backend routes: `GET /api/carrosseis/legenda`, `PUT /api/carrosseis/legenda`.
- Frontend has no automated test harness (no vitest/jsdom configured) — verify frontend tasks via `npx tsc --noEmit` + `npm run build`, per the pattern in the three prior carousel-editor plans (`docs/superpowers/plans/2026-06-2{1,3}-editor-carrossel*.md`).
- Spec: `docs/superpowers/specs/2026-07-02-editor-carrossel-upgrade-design.md`.

---

### Task 1: Backend — `readLegenda`/`writeLegenda`

**Files:**
- Modify: `server/src/carrosseis.ts`
- Test: `server/src/carrosseis.test.ts` (new file)

**Interfaces:**
- Produces: `readLegenda(carrosselId: string): Promise<string>`, `writeLegenda(carrosselId: string, legenda: string): Promise<void>` — both exported from `server/src/carrosseis.ts`, both throw `Error("Caminho inválido")` for a path-traversal `carrosselId`.

- [ ] **Step 1: Write the failing tests**

Create `server/src/carrosseis.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readLegenda, writeLegenda } from "./carrosseis.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const LEGENDA_TESTE = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel", "teste", "legenda.md");

describe("readLegenda", () => {
  it("lê legenda.md existente", async () => {
    const legenda = await readLegenda("teste");
    expect(legenda.length).toBeGreaterThan(0);
  });

  it("retorna string vazia se carrossel não tem legenda.md", async () => {
    const legenda = await readLegenda("carrossel-que-nao-existe");
    expect(legenda).toBe("");
  });

  it("rejeita id com path traversal", async () => {
    await expect(readLegenda("../../etc")).rejects.toThrow("Caminho inválido");
  });
});

describe("writeLegenda", () => {
  it("escreve e a leitura seguinte reflete o novo conteúdo (com restauração)", async () => {
    const original = await readFile(LEGENDA_TESTE, "utf-8");
    try {
      await writeLegenda("teste", "legenda de teste temporária");
      const lida = await readLegenda("teste");
      expect(lida).toBe("legenda de teste temporária");
    } finally {
      await writeFile(LEGENDA_TESTE, original, "utf-8");
    }
  });

  it("rejeita id com path traversal", async () => {
    await expect(writeLegenda("../../etc", "x")).rejects.toThrow("Caminho inválido");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/carrosseis.test.ts`
Expected: FAIL — `readLegenda`/`writeLegenda` not exported from `./carrosseis.js`.

- [ ] **Step 3: Implement `readLegenda`/`writeLegenda`**

Modify `server/src/carrosseis.ts` — change the top imports (currently `import { readdir, readFile } from "node:fs/promises";` and `import { join, resolve, extname } from "node:path";`) to:

```ts
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, extname, sep } from "node:path";
```

Then append at the end of the file (after `readSlide`):

```ts

export async function readLegenda(carrosselId: string): Promise<string> {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "legenda.md"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT) + sep)) throw new Error("Caminho inválido");
  try {
    return await readFile(safe, "utf-8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw e;
  }
}

export async function writeLegenda(carrosselId: string, legenda: string): Promise<void> {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "legenda.md"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT) + sep)) throw new Error("Caminho inválido");
  await writeFile(safe, legenda, "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/carrosseis.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/carrosseis.ts server/src/carrosseis.test.ts
git commit -m "feat(server): le/escreve legenda.md do carrossel"
```

---

### Task 2: Backend — rotas `GET`/`PUT /api/carrosseis/legenda`

**Files:**
- Modify: `server/src/server.ts`
- Test: `server/src/server.test.ts`

**Interfaces:**
- Consumes: `readLegenda`, `writeLegenda` from `./carrosseis.js` (Task 1).
- Produces: `GET /api/carrosseis/legenda?id=` → `200 { legenda: string }` / `400` sem id. `PUT /api/carrosseis/legenda?id=` body `{ legenda: string }` → `200 { ok: true }` / `400` sem id.

- [ ] **Step 1: Write the failing tests**

Add to `server/src/server.test.ts` (append, doesn't need new imports — `app` already imported at top):

```ts

describe("GET /api/carrosseis/legenda", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/legenda");
    expect(res.status).toBe(400);
  });

  it("retorna legenda do carrossel de teste", async () => {
    const res = await app.request("/api/carrosseis/legenda?id=teste");
    expect(res.status).toBe(200);
    const body = await res.json() as { legenda: string };
    expect(body.legenda.length).toBeGreaterThan(0);
  });

  it("retorna string vazia pra carrossel sem legenda", async () => {
    const res = await app.request("/api/carrosseis/legenda?id=carrossel-que-nao-existe");
    expect(res.status).toBe(200);
    const body = await res.json() as { legenda: string };
    expect(body.legenda).toBe("");
  });
});

describe("PUT /api/carrosseis/legenda", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/legenda", { method: "PUT" });
    expect(res.status).toBe(400);
  });

  it("escreve e a leitura seguinte reflete o novo conteúdo (com restauração)", async () => {
    const getRes = await app.request("/api/carrosseis/legenda?id=teste");
    const { legenda: original } = await getRes.json() as { legenda: string };
    try {
      const putRes = await app.request("/api/carrosseis/legenda?id=teste", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legenda: "legenda via rota, teste" }),
      });
      expect(putRes.status).toBe(200);
      const checkRes = await app.request("/api/carrosseis/legenda?id=teste");
      const { legenda: lida } = await checkRes.json() as { legenda: string };
      expect(lida).toBe("legenda via rota, teste");
    } finally {
      await app.request("/api/carrosseis/legenda?id=teste", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legenda: original }),
      });
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/server.test.ts -t "carrosseis/legenda"`
Expected: FAIL — routes return 404 (not registered).

- [ ] **Step 3: Add the routes**

Modify `server/src/server.ts` line 11, from:

```ts
import { listCarrosseis, readSlide } from "./carrosseis.js";
```

to:

```ts
import { listCarrosseis, readSlide, readLegenda, writeLegenda } from "./carrosseis.js";
```

Then add, right after the existing `app.put("/api/carrosseis/html", ...)` block (after line 174's closing `});`):

```ts

app.get("/api/carrosseis/legenda", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const legenda = await readLegenda(id);
    return c.json({ legenda });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.put("/api/carrosseis/legenda", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const { legenda } = await c.req.json<{ legenda: string }>();
    await writeLegenda(id, legenda);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/server.test.ts -t "carrosseis/legenda"`
Expected: PASS (5 tests)

- [ ] **Step 5: Run full backend suite**

Run: `cd server && npx vitest run`
Expected: same pass count as baseline plus 10 new tests (5 from Task 1, 5 from Task 2), no new failures.

- [ ] **Step 6: Commit**

```bash
git add server/src/server.ts server/src/server.test.ts
git commit -m "feat(server): rotas GET/PUT /api/carrosseis/legenda"
```

---

### Task 3: Frontend — funções puras de manipulação de slides

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Produces (module-level, used by Task 4): `type SlideInfo = { text: string }`, `parseSlides(html: string): SlideInfo[]`, `duplicateSlideAt(html: string, idx: number): string`, `removeSlideAt(html: string, idx: number): string`, `moveSlideAt(html: string, idx: number, dir: -1 | 1): string`, `addSlideAtEnd(html: string): string`, plus consts `SUGESTOES_IA: string[]`, `HASHTAGS_SUGERIDAS: string[]`. All mutation functions return the **unchanged** `html` string on a no-op (invalid index, single-slide removal guard) — callers compare `next === html` to detect a no-op instead of the function throwing.

- [ ] **Step 1: Add the functions and consts**

Modify `frontend/src/routes/carrosseis.$id.tsx` — insert immediately after the existing `extrairCoresMarca` function (right before the `const EDITOR_SCRIPT = ...` line):

```ts

type SlideInfo = { text: string };

function parseSlides(html: string): SlideInfo[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  return nodes.map((node, i) => {
    const heading = node.querySelector("h1, h2, h3, h4, p");
    const text = heading?.textContent?.trim();
    return { text: text ? text.slice(0, 60) : `Slide ${i + 1}` };
  });
}

function serializeDoc(doc: Document): string {
  return "<!doctype html>" + doc.documentElement.outerHTML;
}

function duplicateSlideAt(html: string, idx: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const target = nodes[idx];
  if (!target) return html;
  const clone = target.cloneNode(true) as Element;
  target.after(clone);
  return serializeDoc(doc);
}

function removeSlideAt(html: string, idx: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  if (nodes.length <= 1) return html;
  const target = nodes[idx];
  if (!target) return html;
  target.remove();
  return serializeDoc(doc);
}

function moveSlideAt(html: string, idx: number, dir: -1 | 1): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const j = idx + dir;
  if (j < 0 || j >= nodes.length) return html;
  const a = nodes[idx];
  const b = nodes[j];
  if (!a || !b) return html;
  if (dir === 1) b.after(a);
  else b.before(a);
  return serializeDoc(doc);
}

function addSlideAtEnd(html: string): string {
  const count = parseSlides(html).length;
  if (count === 0) return html;
  return duplicateSlideAt(html, count - 1);
}

const SUGESTOES_IA = [
  "Reescrever capa com gancho de curiosidade",
  "Gerar 3 variações de CTA",
  "Encurtar textos (regra 20 palavras)",
  "Traduzir carrossel pra inglês",
  "Sugerir hashtags pro tema",
];

const HASHTAGS_SUGERIDAS = ["#carrossel", "#conteudo", "#dicas", "#marketingdigital", "#instagram"];
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors (these are unused module-level exports at this point — `noUnusedLocals`/`noUnusedParameters` are both `false` in `frontend/tsconfig.json`, so this is not an error).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): funções puras de manipulação de slides do carrossel"
```

---

### Task 4: Frontend — estado e handlers (guias, slides, legenda, export)

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `parseSlides`, `duplicateSlideAt`, `removeSlideAt`, `moveSlideAt`, `addSlideAtEnd` (Task 3); existing `applyHtml`, `slideCount`, `id`, `html`, `htmlSalvo`, `salvar` (already in file).
- Produces (component-level, used by Task 5's JSX): state `showSafeZone`, `showFeedCrop`, `showGrid` (booleans, all with setters); `slides: SlideInfo[]`; handlers `handleAddSlide()`, `handleDuplicateSlide(idx: number)`, `handleRemoveSlide(idx: number)`, `handleMoveSlide(idx: number, dir: -1 | 1)`; legenda state `legenda`, `legendaSalva`, `legendaLoading`, `legendaSaving`, `legendaSaved`, `legendaError` + handler `salvarLegenda()`; export state `exporting`, `exportError` + handler `exportarPng()`; `send` changes signature to `send(overrideText?: string)`.

- [ ] **Step 1: Add new state, effect, and derived `slides`**

Modify `frontend/src/routes/carrosseis.$id.tsx` — right after the existing line `const [mostrarFundo, setMostrarFundo] = useState(false);`, add:

```ts

  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showFeedCrop, setShowFeedCrop] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [legenda, setLegenda] = useState("");
  const [legendaSalva, setLegendaSalva] = useState("");
  const [legendaLoading, setLegendaLoading] = useState(true);
  const [legendaSaving, setLegendaSaving] = useState(false);
  const [legendaSaved, setLegendaSaved] = useState(false);
  const [legendaError, setLegendaError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setLegendaLoading(true);
    fetch(`${BACKEND}/api/carrosseis/legenda?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((body: { legenda: string }) => {
        setLegenda(body.legenda);
        setLegendaSalva(body.legenda);
        setLegendaLoading(false);
      })
      .catch(() => setLegendaLoading(false));
  }, [id]);

  const slides = html ? parseSlides(html) : [];
```

- [ ] **Step 2: Add slide-list handlers**

Right after the `move` — wait, this file has no existing `move`/`duplicate`/`remove` functions to anchor on. Add these new handlers right after the `undo` function (which ends with `};` following `return h.slice(0, -1);`):

```ts

  function handleAddSlide() {
    const next = addSlideAtEnd(html);
    if (next === html) return;
    applyHtml(next);
    setActiveSlide(slideCount(next) - 1);
  }

  function handleDuplicateSlide(idx: number) {
    const next = duplicateSlideAt(html, idx);
    if (next === html) return;
    applyHtml(next);
  }

  function handleRemoveSlide(idx: number) {
    const next = removeSlideAt(html, idx);
    if (next === html) return;
    applyHtml(next);
    setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(next) - 1)));
  }

  function handleMoveSlide(idx: number, dir: -1 | 1) {
    const next = moveSlideAt(html, idx, dir);
    if (next === html) return;
    applyHtml(next);
    if (activeSlide === idx) setActiveSlide(idx + dir);
    else if (activeSlide === idx + dir) setActiveSlide(idx);
  }
```

- [ ] **Step 3: Change `send` to accept an override prompt**

Modify the existing `send` function signature and first line, from:

```ts
  async function send() {
    const t = input.trim();
```

to:

```ts
  async function send(overrideText?: string) {
    const t = (overrideText ?? input).trim();
```

(No other line in `send` changes — it already reads `t`, not `input`, for everything after this point.)

- [ ] **Step 4: Add `salvarLegenda` and `exportarPng`**

Right after the existing `cancelar` function, add:

```ts

  async function salvarLegenda() {
    setLegendaSaving(true);
    setLegendaError(null);
    try {
      const res = await fetch(`${BACKEND}/api/carrosseis/legenda?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legenda }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setLegendaSalva(legenda);
      setLegendaSaved(true);
      setTimeout(() => setLegendaSaved(false), 2000);
    } catch (e) {
      setLegendaError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLegendaSaving(false);
    }
  }

  async function exportarPng() {
    setExporting(true);
    setExportError(null);
    try {
      if (html !== htmlSalvo) await salvar();
      const totalSlides = slideCount(html);
      for (let i = 0; i < totalSlides; i++) {
        const filename = `slide-${String(i + 1).padStart(2, "0")}.png`;
        const res = await fetch(`${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${filename}`);
        if (!res.ok) throw new Error(`Falha ao baixar ${filename}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setExporting(false);
    }
  }
```

- [ ] **Step 5: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): estado e handlers pra guias, slides, legenda e export PNG"
```

---

### Task 5: Frontend — layout de 4 colunas (JSX)

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: everything from Tasks 3 and 4 (`slides`, `handleAddSlide`, `handleDuplicateSlide`, `handleRemoveSlide`, `handleMoveSlide`, `showSafeZone`/`showFeedCrop`/`showGrid` + setters, `legenda` state + `salvarLegenda`, `exporting`/`exportError` + `exportarPng`, `send(overrideText?)`, `SUGESTOES_IA`, `HASHTAGS_SUGERIDAS`) plus everything already in the file (`mainIframeRef`, `mainBlobUrl`, `thumbBlobUrls`, `activeSlide`, `total`, `messages`, `input`, `images`, etc).

- [ ] **Step 1: Update imports**

Modify line 4, from:

```ts
import { Button } from "@/components/app-shell";
```

to:

```ts
import { Button, Card } from "@/components/app-shell";
```

Modify line 3, from:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon } from "lucide-react";
```

to:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon, Plus, ArrowUp, ArrowDown, Copy, Trash2, Download } from "lucide-react";
```

- [ ] **Step 2: Replace the entire `return (...)` block**

Replace everything from `return (` to the component's closing `);` and final `}` (the entire JSX return statement — the last ~235 lines of the file) with:

```tsx
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
        <div className="flex items-center gap-2">
          {saveError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={saveError}>{saveError}</span>}
          {exportError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={exportError}>{exportError}</span>}
          <button
            onClick={cancelar}
            className="text-[14px] font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            onClick={exportarPng}
            disabled={exporting || loadingHtml}
            className="text-[14px] font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
            <span className="hidden sm:inline">Exportar PNG</span>
          </button>
          <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:grid xl:grid-cols-[320px_260px_1fr_300px] min-h-0">
        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {SUGESTOES_IA.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={chatLoading}
                  className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
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
              <Button onClick={() => send()} disabled={chatLoading || (!input.trim() && !images.length)} className="!px-3 !py-2 shrink-0">
                {chatLoading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col gap-4 overflow-y-auto p-4">
          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Aparência</h3>
            <div className="relative mb-3">
              <button
                onClick={() => setMostrarFundo((v) => !v)}
                className="w-full text-left text-[12px] font-medium px-3 py-2 rounded-md border border-border bg-card hover:bg-accent"
              >
                Fundo
              </button>
              {mostrarFundo && (
                <div className="mt-2 flex flex-wrap items-center gap-2 p-2 rounded-md border border-border bg-card shadow-lg">
                  {extrairCoresMarca(html).map((hex) => (
                    <button
                      key={hex}
                      onClick={() => aplicarFundo(hex)}
                      title={hex}
                      className="w-7 h-7 rounded-md border border-border"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    onChange={(e) => aplicarFundo(e.target.value)}
                    className="w-7 h-7 rounded-md border border-border cursor-pointer"
                  />
                </div>
              )}
            </div>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) aplicarFonte(e.target.value); }}
              className="w-full text-[12px] px-2 py-2 rounded-md border border-border bg-card"
            >
              <option value="">Fonte…</option>
              {FONTES_GOOGLE.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Card>

          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Guias do Instagram</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowSafeZone((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showSafeZone ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Safe zone
              </button>
              <button
                onClick={() => setShowFeedCrop((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showFeedCrop ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Crop do perfil (1:1)
              </button>
              <button
                onClick={() => setShowGrid((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showGrid ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Regra dos terços
              </button>
            </div>
          </Card>
        </div>

        <div
          ref={previewRef}
          tabIndex={0}
          className="border-b xl:border-b-0 xl:border-r border-border flex flex-col items-center justify-center overflow-auto min-h-[400px] bg-muted/40 outline-none gap-3 py-6"
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
                {showSafeZone && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute border-2 border-dashed"
                      style={{ top: "5%", bottom: "5%", left: "5%", right: "5%", borderColor: "rgba(34,197,94,0.85)" }}
                    />
                    <div
                      className="absolute top-[5%] left-[5%] text-[8px] font-semibold px-1 rounded-sm"
                      style={{ background: "rgba(34,197,94,0.95)", color: "#fff", transform: "translateY(-100%)" }}
                    >
                      SAFE ZONE
                    </div>
                  </div>
                )}
                {showFeedCrop && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute left-0 right-0 top-0"
                      style={{
                        height: "10%",
                        background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.18) 0 6px, transparent 6px 12px)",
                        borderBottom: "1.5px dashed rgba(239,68,68,0.9)",
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 bottom-0"
                      style={{
                        height: "10%",
                        background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.18) 0 6px, transparent 6px 12px)",
                        borderTop: "1.5px dashed rgba(239,68,68,0.9)",
                      }}
                    />
                    <div
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold px-1.5 py-0.5 rounded-sm"
                      style={{ background: "rgba(239,68,68,0.95)", color: "#fff" }}
                    >
                      1:1 perfil
                    </div>
                  </div>
                )}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-white/40 mix-blend-difference" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-white/40 mix-blend-difference" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/40 mix-blend-difference" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/40 mix-blend-difference" />
                  </div>
                )}
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
              {(showSafeZone || showFeedCrop || showGrid) && (
                <div className="flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground max-w-md">
                  {showSafeZone && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgb(34,197,94)" }} />
                      Margem segura
                    </span>
                  )}
                  {showFeedCrop && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm" style={{ background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.6) 0 3px, transparent 3px 6px)" }} />
                      Área cortada no grid do perfil
                    </span>
                  )}
                  {showGrid && <span>Regra dos terços</span>}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-card flex flex-col gap-4 min-h-0 overflow-y-auto p-4">
          <Card className="!p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-semibold text-[13px]">Slides ({slides.length})</h3>
              <button
                onClick={handleAddSlide}
                disabled={loadingHtml}
                className="text-[12px] inline-flex items-center gap-1 text-primary hover:opacity-80 disabled:opacity-40"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {slides.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`group rounded-md border p-2 cursor-pointer transition-colors ${i === activeSlide ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="shrink-0 rounded overflow-hidden border border-border bg-white"
                      style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
                    >
                      {thumbBlobUrls[i] && (
                        <iframe
                          src={thumbBlobUrls[i]}
                          title={`thumb ${i + 1}`}
                          tabIndex={-1}
                          sandbox="allow-same-origin"
                          style={{ width: 1080, height: 1350, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left", border: 0, pointerEvents: "none" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted-foreground">Slide {i + 1}</div>
                      <div className="text-[12px] font-medium truncate mt-0.5">{s.text}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(i, -1); }}
                      disabled={i === 0}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(i, 1); }}
                      disabled={i === slides.length - 1}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(i); }}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSlide(i); }}
                      disabled={slides.length <= 1}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-destructive/10 text-destructive ml-auto disabled:opacity-30"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[13px]">Legenda do post</h3>
              {legendaSaved && <span className="text-[11px] text-[color:var(--success)]">Salvo</span>}
            </div>
            {legendaLoading ? (
              <p className="text-[12px] text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <textarea
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] resize-none"
                />
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
                  <span>{legenda.length} / 2.200 caracteres</span>
                  <span>{(legenda.match(/#\w+/g) ?? []).length} hashtags</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {HASHTAGS_SUGERIDAS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setLegenda((c) => (c ? `${c} ${h}` : h))}
                      className="text-[11px] px-2 py-1 rounded-full border border-border hover:border-primary hover:text-primary"
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {legendaError && <p className="text-[11px] text-destructive mt-2">{legendaError}</p>}
                <button
                  onClick={salvarLegenda}
                  disabled={legendaSaving || legenda === legendaSalva}
                  className="mt-3 w-full text-[12px] font-medium px-3 py-2 rounded-md border border-border bg-card hover:bg-accent disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {legendaSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                  Salvar legenda
                </button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles and builds**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): layout de 4 colunas no editor de carrossel (guias, slides, legenda, export)"
```

---

### Task 6: Verificação final

**Files:** none (verification only)

- [ ] **Step 1: Backend — suite completa**

Run: `cd server && npx vitest run`
Expected: all tests pass (baseline count + 10 new from Tasks 1–2), no new failures.

- [ ] **Step 2: Frontend — typecheck + build**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: both succeed.

- [ ] **Step 3: Note manual walkthrough**

No frontend test harness or browser automation available in this environment (same as the three prior carousel-editor plans). Leave a note for the user: manually open `/carrosseis/$id` for an existing carousel (e.g. `teste`) and check — add/duplicate/move/remove a slide, toggle each guide, click a "Sugestões IA" chip, edit+save the legenda, click "Exportar PNG" and confirm files download.

- [ ] **Step 4: Commit (if any fixups were needed)**

Only if Steps 1–2 required fixes:

```bash
git add -A
git commit -m "fix: ajustes pós-verificação do editor de carrossel"
```

---

## Self-Review Notes

- **Spec coverage:** Chat suggestions (Task 5 step 2 chip row) ✓, Aparência relocation ✓, Guias ✓, Slides panel + ops ✓, Legenda panel + backend (Tasks 1, 2, 5) ✓, Exportar PNG (Task 4 + 5) ✓, header buttons ✓. Excluded items (Formato, Template, Banco de imagens, tamanho de fonte, agendar publicação, gerar legenda via IA) — correctly absent from every task.
- **Placeholder scan:** no TBD/TODO; every step has literal code or an exact command with expected output.
- **Type consistency:** `SlideInfo` (Task 3) used identically in Task 4 (`slides: SlideInfo[]`) and Task 5 (`slides.map((s, i) => ... s.text ...)`). `send(overrideText?: string)` (Task 4 step 3) matches Task 5's two call sites (`send(s)` in chip row, `send()` in submit button and Enter-key handler). Handler names (`handleAddSlide`, `handleDuplicateSlide`, `handleRemoveSlide`, `handleMoveSlide`, `salvarLegenda`, `exportarPng`) match 1:1 between Task 4 (defined) and Task 5 (wired to JSX).
