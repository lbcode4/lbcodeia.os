# Configurações do Negócio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página `/configuracoes` que exibe e permite editar `_memoria/empresa.md` e `_memoria/preferencias.md` via dois textareas com botão Salvar.

**Architecture:** Backend: duas funções novas em `onboarding.ts` + duas rotas em `server.ts`. Frontend: nova rota `configuracoes.tsx` com fetch GET/PUT + link na sidebar do `app-shell.tsx`.

**Tech Stack:** Hono (backend), React + TanStack Router (frontend), node:fs/promises, Tailwind, Vitest.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `server/src/onboarding.ts` | Modify | Add `getConfiguracoes()` and `saveConfiguracoes()` |
| `server/src/onboarding.test.ts` | Modify | Add tests for new functions + routes |
| `server/src/server.ts` | Modify | Register GET + PUT `/api/configuracoes` |
| `frontend/src/routes/configuracoes.tsx` | Create | Page component with two textareas + save |
| `frontend/src/components/app-shell.tsx` | Modify | Add "Configurações" to `bottomNav` |

---

## Task 1: Backend — getConfiguracoes + saveConfiguracoes

**Files:**
- Modify: `server/src/onboarding.ts`
- Modify: `server/src/onboarding.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `server/src/onboarding.test.ts` (after the existing `saveOnboarding` describe block):

```ts
describe("getConfiguracoes", () => {
  it("returns empresa and preferencias content", async () => {
    mockReadFile
      .mockResolvedValueOnce("# Empresa\nconteudo" as unknown as Buffer)
      .mockResolvedValueOnce("# Preferências\nconteudo" as unknown as Buffer);
    const result = await getConfiguracoes();
    expect(result).toEqual({ empresa: "# Empresa\nconteudo", preferencias: "# Preferências\nconteudo" });
  });

  it("returns empty strings when files missing", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await getConfiguracoes();
    expect(result).toEqual({ empresa: "", preferencias: "" });
  });
});

describe("saveConfiguracoes", () => {
  it("writes empresa.md and preferencias.md with given content", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveConfiguracoes({ empresa: "# Empresa\nnovo", preferencias: "# Prefs\nnovo" });

    const empresaCall = mockWriteFile.mock.calls.find((c) => (c[0] as string).endsWith("empresa.md"));
    const prefCall = mockWriteFile.mock.calls.find((c) => (c[0] as string).endsWith("preferencias.md"));

    expect(empresaCall![1]).toBe("# Empresa\nnovo");
    expect(prefCall![1]).toBe("# Prefs\nnovo");
  });

  it("calls writeFile exactly twice", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveConfiguracoes({ empresa: "a", preferencias: "b" });
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });
});
```

Also add `getConfiguracoes` and `saveConfiguracoes` to the import at the top of the test file:

```ts
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, type Profile } from "./onboarding.js";
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/onboarding.test.ts
```

Expected: FAIL — `getConfiguracoes is not exported`

- [ ] **Step 3: Implement in onboarding.ts**

Add to the bottom of `server/src/onboarding.ts`:

```ts
export type Configuracoes = {
  empresa: string;
  preferencias: string;
};

export async function getConfiguracoes(): Promise<Configuracoes> {
  const [empresa, preferencias] = await Promise.allSettled([
    readFile(join(REPO_ROOT, "_memoria/empresa.md"), "utf-8"),
    readFile(join(REPO_ROOT, "_memoria/preferencias.md"), "utf-8"),
  ]);
  return {
    empresa: empresa.status === "fulfilled" ? empresa.value : "",
    preferencias: preferencias.status === "fulfilled" ? preferencias.value : "",
  };
}

export async function saveConfiguracoes(data: Configuracoes): Promise<void> {
  await writeFile(join(REPO_ROOT, "_memoria/empresa.md"), data.empresa, "utf-8");
  await writeFile(join(REPO_ROOT, "_memoria/preferencias.md"), data.preferencias, "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd server && npx vitest run src/onboarding.test.ts
```

Expected: All tests PASS (including pre-existing 9 tests + 4 new = 13 total).

- [ ] **Step 5: Commit**

```bash
git add server/src/onboarding.ts server/src/onboarding.test.ts
git commit -m "feat(configuracoes): add getConfiguracoes and saveConfiguracoes with tests"
```

---

## Task 2: Wire routes into server.ts

**Files:**
- Modify: `server/src/server.ts`
- Modify: `server/src/onboarding.test.ts`

- [ ] **Step 1: Write failing integration tests**

Add these describe blocks at the bottom of `server/src/onboarding.test.ts`:

```ts
describe("GET /api/configuracoes", () => {
  it("returns 200 with empresa and preferencias strings", async () => {
    mockReadFile
      .mockResolvedValueOnce("# Empresa" as unknown as Buffer)
      .mockResolvedValueOnce("# Preferências" as unknown as Buffer);
    const res = await app.request("/api/configuracoes");
    expect(res.status).toBe(200);
    const body = await res.json() as { empresa: string; preferencias: string };
    expect(typeof body.empresa).toBe("string");
    expect(typeof body.preferencias).toBe("string");
  });
});

describe("PUT /api/configuracoes", () => {
  it("returns 200 { ok: true } with valid body", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const res = await app.request("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa: "# Empresa\ntest", preferencias: "# Prefs\ntest" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 400 on malformed body", async () => {
    const res = await app.request("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "não é json",
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/onboarding.test.ts
```

Expected: FAIL — 404 on `/api/configuracoes`

- [ ] **Step 3: Register routes in server.ts**

Add to the import line in `server/src/server.ts` (extend the existing onboarding import):

```ts
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, type Profile, type Configuracoes } from "./onboarding.js";
```

Add routes before the `if (process.argv[1]...)` block:

```ts
app.get("/api/configuracoes", async (c) => {
  return c.json(await getConfiguracoes());
});

app.put("/api/configuracoes", async (c) => {
  let body: Configuracoes;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  await saveConfiguracoes(body);
  return c.json({ ok: true });
});
```

- [ ] **Step 4: Run all server tests**

```bash
cd server && npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/server.ts server/src/onboarding.test.ts
git commit -m "feat(configuracoes): register GET and PUT /api/configuracoes"
```

---

## Task 3: Frontend route — /configuracoes

**Files:**
- Create: `frontend/src/routes/configuracoes.tsx`

- [ ] **Step 1: Create the route**

Create `frontend/src/routes/configuracoes.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Status = "idle" | "loading" | "saving" | "saved" | "error";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [empresa, setEmpresa] = useState("");
  const [preferencias, setPreferencias] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/configuracoes`)
      .then((r) => r.json())
      .then((data: { empresa: string; preferencias: string }) => {
        setEmpresa(data.empresa);
        setPreferencias(data.preferencias);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Não foi possível carregar as configurações.");
      });
  }, []);

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND}/api/configuracoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa, preferencias }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Configurações do Negócio"
        subtitle="Edite as informações que a IA usa para personalizar suas respostas."
      />

      <div className="flex flex-col gap-6 max-w-3xl">
        <Card className="p-5 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            empresa.md
          </label>
          <textarea
            className="w-full bg-transparent text-sm font-mono resize-y focus:outline-none min-h-[180px]"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            spellCheck={false}
          />
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            preferencias.md
          </label>
          <textarea
            className="w-full bg-transparent text-sm font-mono resize-y focus:outline-none min-h-[120px]"
            value={preferencias}
            onChange={(e) => setPreferencias(e.target.value)}
            spellCheck={false}
          />
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? (
              <><Loader2 size={15} className="animate-spin mr-2" />Salvando...</>
            ) : (
              <><Save size={15} className="mr-2" />Salvar</>
            )}
          </Button>

          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={15} />
              Salvo com sucesso!
            </span>
          )}

          {status === "error" && (
            <span className="text-sm text-destructive">{errorMsg}</span>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors (TanStack Router will auto-register the route; if routeTree.gen.ts is stale, run `npx @tanstack/router-cli generate` from the frontend directory).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/configuracoes.tsx
git commit -m "feat(configuracoes): add /configuracoes route with edit and save"
```

---

## Task 4: Sidebar link + routeTree regen

**Files:**
- Modify: `frontend/src/components/app-shell.tsx`

- [ ] **Step 1: Add Settings icon import and bottomNav entry**

In `frontend/src/components/app-shell.tsx`, add `Settings` to the lucide import:

```ts
import {
  LayoutDashboard, Menu, X, Moon, Sun, ChevronDown, User, Bot, Globe, FileBarChart, Target, Library, Newspaper, TrendingUp, Settings,
} from "lucide-react";
```

Replace the `bottomNav` array:

```ts
const bottomNav = [
  { to: "/relatorio-unificado", label: "Relatório Unificado", icon: FileBarChart },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];
```

- [ ] **Step 2: Regenerate routeTree and verify TypeScript**

```bash
cd frontend && npx @tanstack/router-cli generate && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/app-shell.tsx frontend/src/routeTree.gen.ts
git commit -m "feat(configuracoes): add Configurações link to sidebar"
```
