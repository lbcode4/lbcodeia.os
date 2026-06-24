# Editor de Carrossel — Cor de Fundo, Tipografia e Cancelar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three direct controls to the carousel editor (`/carrosseis/$id`) that today only work via chat: background color of the active slide, typography for the whole carousel, and an explicit Cancel button.

**Architecture:** No backend changes — the contract stays "HTML string in, HTML string out" (`PUT /api/carrosseis/html`, unchanged). All three features are frontend-only: a new bidirectional `postMessage` channel between the React parent and the already-injected editor script inside the preview iframe (parent sends `lbcode-set-background`/`lbcode-set-font`, the iframe mutates its real DOM and replies through the existing `lbcode-edit` channel — already wired to the undo stack via `applyHtml()`). Background/typography overrides are written as inline styles / a small `<style>` override block that survive serialization into the saved HTML, so `render.js` (Playwright, reads the saved file fresh) picks them up too.

**Tech Stack:** React + TanStack Router (frontend only this time — no backend task).

## Global Constraints

- No backend route changes — `carrossel-editor.ts` / `server.ts` are not touched.
- Background color applies to the **active slide only** (per spec decision) — never all slides at once.
- Typography applies to the **whole carousel** (all slides share one `font-family`, mirroring the template's existing shared `.slide{font-family:...}` rule) — never per-selected-text.
- The Google Fonts `<link>` and the `#__lbcode-font-override` `<style>` block must NOT be in `serializeAndNotify()`'s strip list — they are part of the saved design, not transient editor UI (unlike `#__lbcode-pagination-style`/`#__lbcode-active-slide`/`#__lbcode-editor-style`/`#__lbcode-editor-script`/`#__lbcode-toolbar`, which ARE stripped).
- Cancelar must ask `window.confirm("Descartar alterações não salvas?")` only when `html !== htmlSalvo` — silent navigation when there's nothing unsaved.
- No frontend test runner exists in this project (confirmed: no vitest, no `.test.` files under `frontend/src`). Verification is `npx tsc --noEmit` + `npm run build`. No browser automation tool is available this session — interactive/visual verification is deferred to a human (same constraint as the prior Identidade da Marca plan).

---

## Task 1: Fontes curadas — extrair pra util compartilhado

**Files:**
- Create: `frontend/src/lib/fontes-google.ts`
- Modify: `frontend/src/routes/identidade.tsx`

**Interfaces:**
- Produces: `export const FONTES_GOOGLE: string[]` (12 curated font names).

- [ ] **Step 1: Create the shared util**

Create `frontend/src/lib/fontes-google.ts`:

```ts
export const FONTES_GOOGLE = [
  "Inter", "Poppins", "Montserrat", "Roboto", "Sora", "Manrope",
  "Work Sans", "Playfair Display", "Space Grotesk", "DM Sans", "Outfit", "Lexend",
];
```

- [ ] **Step 2: Update `identidade.tsx` to import from the new util**

In `frontend/src/routes/identidade.tsx`, find:

```ts
import { sugerirCoresRelacionadas, type CorMarca } from "@/lib/cor-sugestoes";
```

Add right after it:

```ts
import { FONTES_GOOGLE } from "@/lib/fontes-google";
```

Then find:

```ts
const FONTES_GOOGLE = [
  "Inter", "Poppins", "Montserrat", "Roboto", "Sora", "Manrope",
  "Work Sans", "Playfair Display", "Space Grotesk", "DM Sans", "Outfit", "Lexend",
];

const fontesCarregadas = new Set<string>();
```

Replace with (drop the now-duplicate local const, keep the `Set`):

```ts
const fontesCarregadas = new Set<string>();
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors (the import resolves, `FONTES_GOOGLE` is used exactly as before in the `<select>` options list further down the file).

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/fontes-google.ts frontend/src/routes/identidade.tsx
rtk proxy git commit -m "refactor(frontend): extrai lista de fontes curadas pra util compartilhado"
```

(Use `rtk proxy git commit`, not plain `git commit` — the `rtk` Bash hook in this environment has been observed to over-stage unrelated untracked files on plain `git commit`. Always verify with `git show --stat HEAD` after committing that only the intended files appear.)

---

## Task 2: Cor de fundo do slide ativo

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces: `extrairCoresMarca(html: string): string[]` (used as-is by Task 3's UI is not required, but kept as a small pure helper other future controls could reuse); a new `postMessage` type `{ type: "lbcode-set-background"; hex: string }` that the injected script now listens for; `window.__lbcodeActiveSlide: number` global set inside the iframe by `injectPagination`.

- [ ] **Step 1: `injectPagination` exposes the active slide index to the iframe's own scripts**

Find:

```ts
function injectPagination(html: string, activeIndex: number): string {
  const style = `<style id="__lbcode-pagination-style">
    .slide { display: none !important; }
    .slide:nth-child(${activeIndex + 1} of .slide) { display: flex !important; }
    html, body { margin: 0; height: 100%; display: flex; justify-content: center; align-items: center; background: #1a1a1a; }
  </style>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}
```

Replace with:

```ts
function injectPagination(html: string, activeIndex: number): string {
  const style = `<style id="__lbcode-pagination-style">
    .slide { display: none !important; }
    .slide:nth-child(${activeIndex + 1} of .slide) { display: flex !important; }
    html, body { margin: 0; height: 100%; display: flex; justify-content: center; align-items: center; background: #1a1a1a; }
  </style>
  <script id="__lbcode-active-slide">window.__lbcodeActiveSlide = ${activeIndex};</script>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}
```

(A `<head>` script tag runs synchronously during parse, before any `<body>` content — so `window.__lbcodeActiveSlide` is guaranteed set before `EDITOR_SCRIPT`, injected at the end of `<body>`, ever runs.)

- [ ] **Step 2: Strip the new active-slide script on serialize, same as the other editor-only injected elements**

Find (inside `EDITOR_SCRIPT`'s `serializeAndNotify` function):

```
    clone.querySelectorAll('#__lbcode-pagination-style,#__lbcode-editor-style,#__lbcode-editor-script,#__lbcode-toolbar').forEach(function(el){ el.remove(); });
```

Replace with:

```
    clone.querySelectorAll('#__lbcode-pagination-style,#__lbcode-active-slide,#__lbcode-editor-style,#__lbcode-editor-script,#__lbcode-toolbar').forEach(function(el){ el.remove(); });
```

- [ ] **Step 3: Add the `postMessage` listener inside `EDITOR_SCRIPT`, with the background handler**

Find the end of `EDITOR_SCRIPT` (the `selectionchange` listener's closing, right before the IIFE closes):

```
    toolbar.style.left = Math.max(4, left) + 'px';
    toolbar.style.top = top + 'px';
  });
})();
</script>`;
```

Replace with:

```
    toolbar.style.left = Math.max(4, left) + 'px';
    toolbar.style.top = top + 'px';
  });

  window.addEventListener('message', function(e){
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'lbcode-set-background') {
      var slides = document.querySelectorAll('.slide');
      var ativo = slides[window.__lbcodeActiveSlide || 0];
      if (ativo) { ativo.style.background = e.data.hex; serializeAndNotify(); }
    }
  });
})();
</script>`;
```

- [ ] **Step 4: Parent-side pure helper to compute swatch colors from the carousel's own CSS**

Find:

```ts
function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}
```

Replace with:

```ts
function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

function extrairCoresMarca(html: string): string[] {
  const matches = html.match(/--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g) ?? [];
  return [...new Set(matches.map((m) => m.split(":")[1].trim()))].slice(0, 6);
}
```

- [ ] **Step 5: Component state + sender**

Find:

```ts
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
```

Replace with:

```ts
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [mostrarFundo, setMostrarFundo] = useState(false);

  function aplicarFundo(hex: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-background", hex }, "*");
    setMostrarFundo(false);
  }
```

- [ ] **Step 6: UI — "Fundo" button + swatch popover above the slide preview**

Find:

```tsx
            <>
              <div className="relative bg-white shadow-lg overflow-hidden" style={{ width: 1080 * MAIN_SCALE, height: 1350 * MAIN_SCALE }}>
```

Replace with:

```tsx
            <>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setMostrarFundo((v) => !v)}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent"
                >
                  Fundo
                </button>
                {mostrarFundo && (
                  <div className="absolute top-full left-0 mt-1 z-10 flex items-center gap-2 p-2 rounded-md border border-border bg-card shadow-lg">
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
              <div className="relative bg-white shadow-lg overflow-hidden" style={{ width: 1080 * MAIN_SCALE, height: 1350 * MAIN_SCALE }}>
```

No change needed to the existing `onMessage` `useEffect` (it already forwards any `{type: "lbcode-edit", html}` message — regardless of what triggered it inside the iframe — into `applyHtml()`, which pushes the previous `html` onto `htmlHistory` for undo. The background change flows through that exact same path.)

- [ ] **Step 7: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
rtk proxy git commit -m "feat(frontend): cor de fundo do slide ativo no editor de carrossel"
```

(Verify with `git show --stat HEAD` that only this one file is in the commit.)

---

## Task 3: Tipografia do carrossel inteiro

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `FONTES_GOOGLE` (Task 1); the `window.addEventListener('message', ...)` block added in Task 2 Step 3 (this task adds a second `if` branch to that same listener).
- Produces: a new `postMessage` type `{ type: "lbcode-set-font"; fonte: string }`.

- [ ] **Step 1: Add the font branch to the existing message listener**

Find (this is exactly what Task 2 Step 3 left in the file):

```
  window.addEventListener('message', function(e){
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'lbcode-set-background') {
      var slides = document.querySelectorAll('.slide');
      var ativo = slides[window.__lbcodeActiveSlide || 0];
      if (ativo) { ativo.style.background = e.data.hex; serializeAndNotify(); }
    }
  });
```

Replace with:

```
  window.addEventListener('message', function(e){
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'lbcode-set-background') {
      var slides = document.querySelectorAll('.slide');
      var ativo = slides[window.__lbcodeActiveSlide || 0];
      if (ativo) { ativo.style.background = e.data.hex; serializeAndNotify(); }
    }
    if (e.data.type === 'lbcode-set-font') {
      var fonte = e.data.fonte;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fonte) + ':wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);

      var override = document.getElementById('__lbcode-font-override');
      if (!override) {
        override = document.createElement('style');
        override.id = '__lbcode-font-override';
        document.head.appendChild(override);
      }
      override.textContent = ".slide{font-family:'" + fonte + "','Inter',Arial,sans-serif}";

      serializeAndNotify();
    }
  });
```

Note: neither the new `<link>` nor `#__lbcode-font-override` are added to the strip list in `serializeAndNotify` (unlike `#__lbcode-active-slide` in Task 2) — they must survive into the saved HTML so `render.js`/Playwright loads the right font when generating the final PNGs.

- [ ] **Step 2: Import the shared font list**

Find:

```ts
import { Button } from "@/components/app-shell";
```

Replace with:

```ts
import { Button } from "@/components/app-shell";
import { FONTES_GOOGLE } from "@/lib/fontes-google";
```

- [ ] **Step 3: Sender function**

Find (left by Task 2 Step 5):

```ts
  const [mostrarFundo, setMostrarFundo] = useState(false);

  function aplicarFundo(hex: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-background", hex }, "*");
    setMostrarFundo(false);
  }
```

Replace with:

```ts
  const [mostrarFundo, setMostrarFundo] = useState(false);

  function aplicarFundo(hex: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-background", hex }, "*");
    setMostrarFundo(false);
  }

  function aplicarFonte(fonte: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-font", fonte }, "*");
  }
```

- [ ] **Step 4: UI — font `<select>` next to the "Fundo" button**

Find (left by Task 2 Step 6):

```tsx
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setMostrarFundo((v) => !v)}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent"
                >
                  Fundo
                </button>
```

Replace with:

```tsx
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setMostrarFundo((v) => !v)}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent"
                >
                  Fundo
                </button>
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) aplicarFonte(e.target.value); }}
                  className="text-[12px] px-2 py-1.5 rounded-md border border-border bg-card"
                >
                  <option value="">Fonte…</option>
                  {FONTES_GOOGLE.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
```

This `<select>` always resets to the "Fonte…" placeholder after a pick — it's a one-shot apply action, not a persistent field showing the carousel's current font (deriving "current font" would mean re-parsing CSS text on every render; out of scope per YAGNI, matches the spec's level of ambition).

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx frontend/src/lib/fontes-google.ts
rtk proxy git commit -m "feat(frontend): tipografia do carrossel inteiro no editor"
```

(Verify with `git show --stat HEAD`.)

---

## Task 4: Cancelar

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: nothing from Tasks 2/3 — independent of the background/font work.
- Produces: `cancelar()` function wired to a new header button.

- [ ] **Step 1: Import `useNavigate`**

Find:

```ts
import { createFileRoute, Link } from "@tanstack/react-router";
```

Replace with:

```ts
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
```

- [ ] **Step 2: Track the last-saved HTML alongside the working HTML**

Find:

```ts
  const [html, setHtml] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(true);
```

Replace with:

```ts
  const [html, setHtml] = useState("");
  const [htmlSalvo, setHtmlSalvo] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(true);
```

Find (the load effect's success branch):

```ts
      .then((h) => {
        setHtml(h);
        setActiveSlide(0);
        setLoadingHtml(false);
      })
```

Replace with:

```ts
      .then((h) => {
        setHtml(h);
        setHtmlSalvo(h);
        setActiveSlide(0);
        setLoadingHtml(false);
      })
```

Find (inside `salvar()`, the success branch):

```ts
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
```

Replace with:

```ts
      setHtmlSalvo(html);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
```

- [ ] **Step 3: `navigate` hook + `cancelar()` function**

Find:

```ts
  const { id } = Route.useParams();
```

Replace with:

```ts
  const { id } = Route.useParams();
  const navigate = useNavigate();
```

Find (end of `salvar()`, right before the component's `return`):

```ts
    } finally {
      setSaving(false);
    }
  }

  return (
```

Replace with:

```ts
    } finally {
      setSaving(false);
    }
  }

  function cancelar() {
    if (html !== htmlSalvo && !window.confirm("Descartar alterações não salvas?")) return;
    navigate({ to: "/carrosseis" });
  }

  return (
```

- [ ] **Step 4: UI — Cancelar button in the header**

Find:

```tsx
          {saveError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={saveError}>{saveError}</span>}
          <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
          </Button>
```

Replace with:

```tsx
          {saveError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={saveError}>{saveError}</span>}
          <button
            onClick={cancelar}
            className="text-[14px] font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
          </Button>
```

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
rtk proxy git commit -m "feat(frontend): botao Cancelar no editor de carrossel"
```

(Verify with `git show --stat HEAD`.)

---

## Task 5: Verificação final

**Files:** none (verification only).

- [ ] **Step 1: Type-check + build the whole frontend once, after all three features**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

Run: `cd frontend && npm run build`
Expected: succeeds.

- [ ] **Step 2: Manual browser walkthrough (human, no browser tool available this session)**

With `server` and `frontend` dev servers running, open `/carrosseis/<algum-id-existente>` and exercise, in order:
1. Click "Fundo" → popover shows swatches from the carousel's own brand colors + a free color picker → pick one → only the currently active slide's background changes (navigate to another slide via thumbnails — its background is untouched) → click "Desfazer" → reverts.
2. Pick a font from the new "Fonte…" select → all slides' text re-renders in the new font (navigate through slides to confirm it's carousel-wide, not just the active one) → click "Salvar" → reload the page → font persists (confirms the `<link>`/`#__lbcode-font-override` survived serialization).
3. Make any change (chat, direct text edit, fundo, or fonte), then click "Cancelar" → confirm dialog appears → cancel the dialog → still on the editor, change intact → click "Cancelar" again → confirm → navigates to `/carrosseis` → change was never persisted (re-open the same carousel, original state).
4. With no unsaved changes (fresh load, nothing touched), click "Cancelar" → navigates immediately, no dialog.
5. Run `node render.js` inside the edited carousel's folder (or trigger a normal Salvar, which already does this server-side) and check the resulting `instagram/slide-NN.png` files show the new background/font — confirms Playwright's headless render picks up the persisted styles correctly, not just the live preview.

- [ ] **Step 3: Final commit (only if manual fixups were needed)**

Run `git status --short` first and add only the files this task actually touched (the
working tree in this repo routinely has unrelated untracked files sitting around — never
use `git add -A`/`git add .` here):

```bash
git add frontend/src/routes/carrosseis.\$id.tsx frontend/src/lib/fontes-google.ts
rtk proxy git commit -m "fix: ajustes pos-verificacao manual do editor de carrossel"
```

(Skip if no fixups were needed. Verify with `git show --stat HEAD` that only the intended
files are included.)
