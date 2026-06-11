# Criar Novo Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Botão "Novo Site" na página `/sites` que cria pasta + HTML inicial e redireciona para o editor.

**Architecture:** Backend: `createSite(name)` em `sites.ts` + `POST /api/sites` em `server.ts`. Frontend: inline create form em `sites.index.tsx` com POST + navigate.

**Tech Stack:** Hono, React + TanStack Router, node:fs/promises (mkdir + writeFile), Vitest.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `server/src/sites.ts` | Modify | Add `slugify` helper + `createSite()` export |
| `server/src/sites.test.ts` | Create | Unit tests for `createSite` + integration tests for `POST /api/sites` |
| `server/src/server.ts` | Modify | Register `POST /api/sites` |
| `frontend/src/routes/sites.index.tsx` | Modify | Add inline create form + navigate |

---

## Task 1: Backend — createSite function

**Files:**
- Modify: `server/src/sites.ts`
- Create: `server/src/sites.test.ts`

- [ ] **Step 1: Create test file with failing tests**

Create `server/src/sites.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSite } from "./sites.js";

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  mkdtemp: vi.fn(),
  rmdir: vi.fn(),
  mkdir: vi.fn(),
}));

import { mkdir, writeFile } from "node:fs/promises";
const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => vi.clearAllMocks());

describe("createSite", () => {
  it("creates directory and writes index.html, returns id", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const id = await createSite("Minha Loja");

    expect(id).toMatch(/^minha-loja-\d{4}-\d{2}-\d{2}$/);
    expect(mockMkdir).toHaveBeenCalledTimes(1);
    expect(mockMkdir.mock.calls[0][1]).toEqual({ recursive: true });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const htmlArg = mockWriteFile.mock.calls[0][1] as string;
    expect(htmlArg).toContain("<!DOCTYPE html>");
    expect(htmlArg).toContain("Minha Loja");
  });

  it("slugifies name: removes accents, lowercases, spaces become hyphens", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const id = await createSite("Clínica Saúde & Vida");
    expect(id).toMatch(/^clinica-saude-vida-\d{4}-\d{2}-\d{2}$/);
  });

  it("throws on path traversal attempt", async () => {
    await expect(createSite("../../etc")).rejects.toThrow("Caminho inválido");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/sites.test.ts
```

Expected: FAIL — `createSite is not exported from './sites.js'`

- [ ] **Step 3: Implement createSite in sites.ts**

Add `mkdir` to the existing fs import at the top of `server/src/sites.ts`:

```ts
import { readdir, readFile, stat, writeFile, unlink, mkdtemp, rmdir, mkdir } from "node:fs/promises";
```

Add these two functions at the bottom of `server/src/sites.ts` (after all existing code):

```ts
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function createSite(name: string): Promise<string> {
  const date = new Date().toISOString().slice(0, 10);
  const id = `${slugify(name)}-${date}`;
  const siteDir = resolve(join(SITES_ROOT, id));
  if (!siteDir.startsWith(resolve(SITES_ROOT))) throw new Error("Caminho inválido");
  await mkdir(siteDir, { recursive: true });
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>body { font-family: sans-serif; margin: 0; padding: 40px; }</style>
</head>
<body>
  <h1>${name}</h1>
  <p>Use o assistente para personalizar este site.</p>
</body>
</html>`;
  await writeFile(join(siteDir, "index.html"), html, "utf-8");
  return id;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd server && npx vitest run src/sites.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/sites.ts server/src/sites.test.ts
git commit -m "feat(sites): add createSite with slugify and path safety"
```

---

## Task 2: Wire POST /api/sites

**Files:**
- Modify: `server/src/server.ts`
- Modify: `server/src/sites.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add to bottom of `server/src/sites.test.ts`:

```ts
import { app } from "./server.js";

describe("POST /api/sites", () => {
  it("returns 200 with id on valid name", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Meu Site" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string };
    expect(typeof body.id).toBe("string");
    expect(body.id).toMatch(/^meu-site-\d{4}-\d{2}-\d{2}$/);
  });

  it("returns 400 on malformed body", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "não é json",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is empty", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/sites.test.ts
```

Expected: FAIL — 404 on `POST /api/sites`

- [ ] **Step 3: Register route in server.ts**

Add `createSite` to the existing sites import in `server/src/server.ts`:

```ts
import { listSites, readSiteHtml, writeSiteHtml, streamSiteChat, createSite } from "./sites.js";
```

Add route before the `if (process.argv[1]...)` block:

```ts
app.post("/api/sites", async (c) => {
  let body: { name: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  if (!body.name || !body.name.trim()) {
    return c.json({ error: "name obrigatório" }, 400);
  }
  const id = await createSite(body.name.trim());
  return c.json({ id });
});
```

- [ ] **Step 4: Run all server tests**

```bash
cd server && npx vitest run
```

Expected: All tests PASS (no regressions).

- [ ] **Step 5: Commit**

```bash
git add server/src/server.ts server/src/sites.test.ts
git commit -m "feat(sites): register POST /api/sites"
```

---

## Task 3: Frontend — inline create form in sites.index.tsx

**Files:**
- Modify: `frontend/src/routes/sites.index.tsx`

- [ ] **Step 1: Update the file**

Replace the full content of `frontend/src/routes/sites.index.tsx` with:

```tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, Plus, X, Loader2 } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type SiteInfo = {
  id: string;
  name: string;
  updatedAt: string;
  thumbColor: string;
};

export const Route = createFileRoute("/sites/")({
  component: SitesIndex,
});

function SitesIndex() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [erro, setErro] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/sites`)
      .then((r) => r.json())
      .then(setSites)
      .catch(() => setErro("Backend offline ou sem sites"));
  }, []);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function cancelCreate() {
    setCreating(false);
    setNewName("");
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${BACKEND}/api/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Erro ao criar site");
      const { id } = await res.json() as { id: string };
      navigate({ to: "/sites/$siteId", params: { siteId: id } });
    } catch {
      setIsCreating(false);
      setErro("Erro ao criar site. Tente novamente.");
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title="Meus Sites"
          subtitle="Sites criados no LBCode. Selecione um para editar com a IA."
        />
        {!creating && (
          <Button onClick={() => setCreating(true)} className="shrink-0 mt-1">
            <Plus size={15} className="mr-1.5" />
            Novo Site
          </Button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-2 mb-6">
          <input
            ref={inputRef}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-xs"
            placeholder="Nome do site"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") cancelCreate();
            }}
            disabled={isCreating}
          />
          <Button onClick={handleCreate} disabled={!newName.trim() || isCreating}>
            {isCreating ? <Loader2 size={15} className="animate-spin" /> : "Criar"}
          </Button>
          <button
            onClick={cancelCreate}
            className="p-1.5 text-muted-foreground hover:text-foreground"
            disabled={isCreating}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}

      {sites.length === 0 && !erro && (
        <p className="text-[13px] text-muted-foreground">Nenhum site encontrado em marketing/sites/.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((s) => (
          <Card key={s.id} className="!p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <Link
              to="/sites/$siteId"
              params={{ siteId: s.id }}
              className="aspect-video relative block group"
              style={{ background: s.thumbColor }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Globe size={36} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center">
                <span className="bg-white text-foreground text-[12px] font-semibold px-3 py-1.5 rounded-md">
                  Abrir editor
                </span>
              </div>
            </Link>

            <div className="p-4 flex flex-col gap-1">
              <h3 className="font-semibold text-[14px] capitalize">{s.name}</h3>
              <p className="text-[12px] text-muted-foreground">Atualizado {s.updatedAt}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/sites.index.tsx
git commit -m "feat(sites): add inline create form with POST and redirect to editor"
```
