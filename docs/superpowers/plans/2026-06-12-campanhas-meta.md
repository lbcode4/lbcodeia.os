# Gerenciar Campanhas Meta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock-based `gerenciar-anuncios.tsx` with a real Meta Graph API integration for listing, activating, and pausing campaigns and ad sets.

**Architecture:** New `server/src/meta-campanhas.ts` exports pure functions `(accountId, token)` → Meta Graph API. Route handlers in `server.ts` read credentials from `integracoes/credentials/meta.env` and resolve `accountId` from `listContas()`. Frontend calls these 4 REST endpoints with optimistic updates.

**Tech Stack:** Hono (server routes), native `fetch` (Graph API calls), React + TanStack Router (frontend), vitest (tests)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `server/src/meta-campanhas.ts` | Create | Types, token reader, Graph API functions |
| `server/src/meta-campanhas.test.ts` | Create | Unit + integration tests |
| `server/src/server.ts` | Modify | Register 4 new routes |
| `frontend/src/routes/gerenciar-anuncios.tsx` | Replace | Campaign management UI with real API |

---

## Task 1: Types and failing tests for `meta-campanhas.ts`

**Files:**
- Create: `server/src/meta-campanhas.test.ts`
- Create: `server/src/meta-campanhas.ts` (skeleton only)

- [ ] **Step 1: Create skeleton `meta-campanhas.ts` with types**

```typescript
// server/src/meta-campanhas.ts
export type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

export type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

const BASE_URL = "https://graph.facebook.com/v21.0";
const CAMPANHA_FIELDS = "id,name,status,effective_status,objective,daily_budget,lifetime_budget";
const ADSET_FIELDS = "id,name,status,effective_status,daily_budget,lifetime_budget";

export async function listCampanhas(accountId: string, token: string): Promise<Campanha[]> {
  throw new Error("not implemented");
}

export async function setCampanhaStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  throw new Error("not implemented");
}

export async function listAdsets(campaignId: string, token: string): Promise<Adset[]> {
  throw new Error("not implemented");
}

export async function setAdsetStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  throw new Error("not implemented");
}
```

- [ ] **Step 2: Write failing tests**

```typescript
// server/src/meta-campanhas.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { listCampanhas, setCampanhaStatus, listAdsets, setAdsetStatus } from "./meta-campanhas.js";

const TOKEN = "test-token";
const ACCOUNT_ID = "act_123";
const CAMPAIGN_ID = "cam_456";
const ADSET_ID = "ads_789";

const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

function mockGraphOk(data: unknown) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response);
}

function mockGraphError(status: number, message: string) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: { message, code: 1 } }),
  } as Response);
}

describe("listCampanhas", () => {
  it("fetches active and paused campaigns for account", async () => {
    const apiData = {
      data: [
        { id: "1", name: "Camp A", status: "ACTIVE", effective_status: "ACTIVE", objective: "MESSAGES", daily_budget: "5000" },
        { id: "2", name: "Camp B", status: "PAUSED", effective_status: "PAUSED", objective: "REACH" },
      ],
    };
    mockGraphOk(apiData);
    const result = await listCampanhas(ACCOUNT_ID, TOKEN);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Camp A");
    expect(result[1].status).toBe("PAUSED");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(ACCOUNT_ID);
    expect(url).toContain("campaigns");
    expect(url).toContain(TOKEN);
  });

  it("filters out archived/deleted campaigns", async () => {
    mockGraphOk({
      data: [
        { id: "1", name: "Camp A", status: "ACTIVE", effective_status: "ACTIVE", objective: "MESSAGES" },
        { id: "2", name: "Camp B", status: "ARCHIVED", effective_status: "ARCHIVED", objective: "REACH" },
        { id: "3", name: "Camp C", status: "DELETED", effective_status: "DELETED", objective: "REACH" },
      ],
    });
    const result = await listCampanhas(ACCOUNT_ID, TOKEN);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("throws on Graph API error", async () => {
    mockGraphError(400, "Invalid account");
    await expect(listCampanhas(ACCOUNT_ID, TOKEN)).rejects.toThrow("Invalid account");
  });
});

describe("setCampanhaStatus", () => {
  it("POSTs status to campaign endpoint", async () => {
    mockGraphOk({ success: true });
    await setCampanhaStatus(CAMPAIGN_ID, "PAUSED", TOKEN);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(CAMPAIGN_ID);
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body as string);
    expect(body.status).toBe("PAUSED");
  });

  it("throws on Graph API error", async () => {
    mockGraphError(400, "Permission denied");
    await expect(setCampanhaStatus(CAMPAIGN_ID, "ACTIVE", TOKEN)).rejects.toThrow("Permission denied");
  });
});

describe("listAdsets", () => {
  it("fetches adsets for campaign, filters out non-active/paused", async () => {
    mockGraphOk({
      data: [
        { id: "a1", name: "Adset 1", status: "ACTIVE", effective_status: "ACTIVE", daily_budget: "2500" },
        { id: "a2", name: "Adset 2", status: "ARCHIVED", effective_status: "ARCHIVED" },
      ],
    });
    const result = await listAdsets(CAMPAIGN_ID, TOKEN);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(CAMPAIGN_ID);
    expect(url).toContain("adsets");
  });
});

describe("setAdsetStatus", () => {
  it("POSTs status to adset endpoint", async () => {
    mockGraphOk({ success: true });
    await setAdsetStatus(ADSET_ID, "ACTIVE", TOKEN);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(ADSET_ID);
    const body = JSON.parse(opts.body as string);
    expect(body.status).toBe("ACTIVE");
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
cd server && npx vitest run src/meta-campanhas.test.ts
```

Expected: all tests FAIL with `Error: not implemented`

---

## Task 2: Implement `meta-campanhas.ts`

**Files:**
- Modify: `server/src/meta-campanhas.ts`

- [ ] **Step 1: Implement all four functions**

Replace the full file content:

```typescript
// server/src/meta-campanhas.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

export type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

const BASE_URL = "https://graph.facebook.com/v21.0";
const CAMPANHA_FIELDS = "id,name,status,effective_status,objective,daily_budget,lifetime_budget";
const ADSET_FIELDS = "id,name,status,effective_status,daily_budget,lifetime_budget";
const ACTIVE_STATUSES = new Set(["ACTIVE", "PAUSED"]);

async function graphGet(path: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/${path}?${qs}`);
  const json = await res.json() as { error?: { message: string }; data?: unknown };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
  return json;
}

async function graphPost(path: string, token: string, body: Record<string, string>): Promise<void> {
  const res = await fetch(`${BASE_URL}/${path}?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { error?: { message: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
}

export async function readMetaToken(): Promise<string> {
  const envPath = join(import.meta.dirname, "..", "..", "integracoes", "credentials", "meta.env");
  const content = await readFile(envPath, "utf-8");
  const match = content.match(/^META_ACCESS_TOKEN=(.+)$/m);
  if (!match) throw new Error("META_ACCESS_TOKEN não encontrado em meta.env");
  return match[1].trim();
}

export async function listCampanhas(accountId: string, token: string): Promise<Campanha[]> {
  const data = await graphGet(`${accountId}/campaigns`, {
    access_token: token,
    fields: CAMPANHA_FIELDS,
    limit: "100",
  }) as { data: Campanha[] };
  return data.data.filter((c) => ACTIVE_STATUSES.has(c.status));
}

export async function setCampanhaStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}

export async function listAdsets(campaignId: string, token: string): Promise<Adset[]> {
  const data = await graphGet(`${campaignId}/adsets`, {
    access_token: token,
    fields: ADSET_FIELDS,
    limit: "100",
  }) as { data: Adset[] };
  return data.data.filter((a) => ACTIVE_STATUSES.has(a.status));
}

export async function setAdsetStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}
```

- [ ] **Step 2: Run tests — all must pass**

```bash
cd server && npx vitest run src/meta-campanhas.test.ts
```

Expected: all 7 tests PASS

- [ ] **Step 3: Commit**

```bash
git add server/src/meta-campanhas.ts server/src/meta-campanhas.test.ts
git commit -m "feat(server): add meta-campanhas module with Graph API integration"
```

---

## Task 3: Register routes in `server.ts` + route tests

**Files:**
- Modify: `server/src/server.ts` (add import + 4 routes)
- Modify: `server/src/meta-campanhas.test.ts` (add route-level tests)

- [ ] **Step 1: Add import to `server.ts`**

After the existing imports at the top of `server/src/server.ts`, add:

```typescript
import { listCampanhas, setCampanhaStatus, listAdsets, setAdsetStatus, readMetaToken } from "./meta-campanhas.js";
```

- [ ] **Step 2: Add 4 routes before the listener block at the bottom of `server.ts`**

Insert before the line `// Só sobe o listener quando executado direto`:

```typescript
app.get("/api/meta/campanhas", async (c) => {
  const cliente = c.req.query("cliente");
  if (!cliente) return c.json({ error: "cliente obrigatório" }, 400);
  try {
    const contas = await listContas();
    const conta = contas.find((ct) => ct.cliente === cliente);
    if (!conta?.metaAdAccount) return c.json({ error: "Conta Meta não configurada para este cliente" }, 404);
    const token = await readMetaToken();
    const campanhas = await listCampanhas(conta.metaAdAccount, token);
    return c.json(campanhas);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.put("/api/meta/campanhas/:id/status", async (c) => {
  const id = c.req.param("id");
  let body: { status: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "JSON inválido" }, 400); }
  if (body.status !== "ACTIVE" && body.status !== "PAUSED") {
    return c.json({ error: "status deve ser ACTIVE ou PAUSED" }, 400);
  }
  try {
    const token = await readMetaToken();
    await setCampanhaStatus(id, body.status as "ACTIVE" | "PAUSED", token);
    return c.json({ id, new_status: body.status });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.get("/api/meta/adsets", async (c) => {
  const campanha_id = c.req.query("campanha_id");
  const cliente = c.req.query("cliente");
  if (!campanha_id || !cliente) return c.json({ error: "campanha_id e cliente obrigatórios" }, 400);
  try {
    const token = await readMetaToken();
    const adsets = await listAdsets(campanha_id, token);
    return c.json(adsets);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.put("/api/meta/adsets/:id/status", async (c) => {
  const id = c.req.param("id");
  let body: { status: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "JSON inválido" }, 400); }
  if (body.status !== "ACTIVE" && body.status !== "PAUSED") {
    return c.json({ error: "status deve ser ACTIVE ou PAUSED" }, 400);
  }
  try {
    const token = await readMetaToken();
    await setAdsetStatus(id, body.status as "ACTIVE" | "PAUSED", token);
    return c.json({ id, new_status: body.status });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});
```

- [ ] **Step 3: Add route validation tests to `server.test.ts`**

Append to `server/src/server.test.ts`:

```typescript
describe("GET /api/meta/campanhas", () => {
  it("retorna 400 quando cliente não informado", async () => {
    const res = await app.request("/api/meta/campanhas");
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("cliente");
  });
});

describe("PUT /api/meta/campanhas/:id/status", () => {
  it("retorna 400 para status inválido", async () => {
    const res = await app.request("/api/meta/campanhas/cam_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INVALID" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("ACTIVE");
  });

  it("retorna 400 para JSON malformado", async () => {
    const res = await app.request("/api/meta/campanhas/cam_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "isso nao eh json",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/meta/adsets", () => {
  it("retorna 400 quando campanha_id não informado", async () => {
    const res = await app.request("/api/meta/adsets?cliente=X");
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando cliente não informado", async () => {
    const res = await app.request("/api/meta/adsets?campanha_id=123");
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/meta/adsets/:id/status", () => {
  it("retorna 400 para status inválido", async () => {
    const res = await app.request("/api/meta/adsets/ads_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "NOPE" }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 4: Run all server tests**

```bash
cd server && npx vitest run
```

Expected: all tests PASS (the new route tests don't hit Meta API so no 502 from missing token in CI — the 400 validations fire before token read)

- [ ] **Step 5: Commit**

```bash
git add server/src/server.ts server/src/server.test.ts
git commit -m "feat(server): register /api/meta/campanhas and /api/meta/adsets routes"
```

---

## Task 4: Replace `gerenciar-anuncios.tsx`

**Files:**
- Replace: `frontend/src/routes/gerenciar-anuncios.tsx`

- [ ] **Step 1: Write new frontend file**

Replace the entire file content with:

```tsx
// frontend/src/routes/gerenciar-anuncios.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { fetchContas, type Conta } from "@/lib/skill-client";
import { ChevronDown, ChevronRight, History, RefreshCw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/gerenciar-anuncios")({
  head: () => ({
    meta: [
      { title: "Campanhas Meta — LBCode Ads" },
      { name: "description", content: "Veja e gerencie campanhas e conjuntos de anúncios do Meta Ads." },
    ],
  }),
  component: GerenciarCampanhas,
});

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

type LogEntry = { ts: string; nivel: string; nome: string; acao: string };

type ModalState = {
  id: string;
  nivel: "campanha" | "adset";
  next: "ACTIVE" | "PAUSED";
  nome: string;
};

function fmtBudget(c: Campanha | Adset): string {
  if (c.daily_budget) return `R$ ${(Number(c.daily_budget) / 100).toFixed(2)}/dia`;
  if (c.lifetime_budget) return `R$ ${(Number(c.lifetime_budget) / 100).toFixed(2)} total`;
  return "—";
}

function ts(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function StatusToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[color:var(--success)]" : "bg-muted"}`}
      aria-label="Alternar status"
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function GerenciarCampanhas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [adsets, setAdsets] = useState<Record<string, Adset[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAdsets, setLoadingAdsets] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toggling, setToggling] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) setCliente(cs[0].cliente);
      })
      .catch(() => setErro("Falha ao carregar contas"));
  }, []);

  useEffect(() => {
    if (cliente) carregarCampanhas();
  }, [cliente]);

  async function carregarCampanhas() {
    setLoading(true);
    setErro("");
    setCampanhas([]);
    setExpandedId(null);
    setAdsets({});
    try {
      const res = await fetch(`${BACKEND}/api/meta/campanhas?cliente=${encodeURIComponent(cliente)}`);
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status}`);
      }
      setCampanhas(await res.json() as Campanha[]);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function expandCampanha(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (adsets[id]) return;
    setLoadingAdsets(id);
    try {
      const res = await fetch(`${BACKEND}/api/meta/adsets?campanha_id=${id}&cliente=${encodeURIComponent(cliente)}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json() as Adset[];
      setAdsets((prev) => ({ ...prev, [id]: data }));
    } catch (e) {
      setAdsets((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingAdsets(null);
    }
  }

  function requestToggle(id: string, nivel: "campanha" | "adset", current: "ACTIVE" | "PAUSED", nome: string) {
    setModal({ id, nivel, next: current === "ACTIVE" ? "PAUSED" : "ACTIVE", nome });
  }

  async function confirmarToggle() {
    if (!modal) return;
    setToggling(true);

    // Optimistic update
    const prevCampanhas = campanhas;
    const prevAdsets = { ...adsets };

    if (modal.nivel === "campanha") {
      setCampanhas((prev) => prev.map((c) => c.id === modal.id ? { ...c, status: modal.next } : c));
    } else {
      setAdsets((prev) => {
        const updated = { ...prev };
        for (const [cId, as] of Object.entries(updated)) {
          if (as.some((a) => a.id === modal.id)) {
            updated[cId] = as.map((a) => a.id === modal.id ? { ...a, status: modal.next } : a);
          }
        }
        return updated;
      });
    }

    const endpoint = modal.nivel === "campanha"
      ? `/api/meta/campanhas/${modal.id}/status`
      : `/api/meta/adsets/${modal.id}/status`;

    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modal.next }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status}`);
      }
      const acao = modal.next === "ACTIVE" ? "Ativou" : "Pausou";
      const nivel = modal.nivel === "campanha" ? "Campanha" : "Conjunto";
      setLog((prev) => [{ ts: ts(), nivel, nome: modal.nome, acao }, ...prev]);
    } catch (e) {
      // Revert
      setCampanhas(prevCampanhas);
      setAdsets(prevAdsets);
      setLog((prev) => [{ ts: ts(), nivel: "Erro", nome: modal.nome, acao: (e as Error).message }, ...prev]);
    } finally {
      setToggling(false);
      setModal(null);
    }
  }

  const filtered = campanhas.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Campanhas Meta" subtitle="Ative ou pause campanhas e conjuntos. Toda ação fica registrada no log." />

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="h-9 rounded-md border border-border bg-card text-[13px] px-3 min-w-[160px]"
        >
          {contas.map((c) => (
            <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={carregarCampanhas} disabled={loading || !cliente}>
          {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}
          Atualizar
        </Button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar campanhas…"
          className="h-9 rounded-md border border-border bg-card text-[13px] px-3 flex-1 min-w-[180px]"
        />
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-[13px] px-4 py-3">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabela de campanhas */}
        <div className="lg:col-span-2">
          <Card className="!p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-[13px] gap-2">
                <Loader2 size={16} className="animate-spin" /> Carregando campanhas…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-[13px]">
                {campanhas.length === 0 ? "Selecione um cliente para carregar as campanhas." : "Nenhuma campanha encontrada."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium py-2 px-3 w-6"></th>
                      <th className="text-left font-medium py-2 px-3">Campanha</th>
                      <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Objetivo</th>
                      <th className="text-right font-medium py-2 px-3 hidden sm:table-cell">Orçamento</th>
                      <th className="text-center font-medium py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((camp) => {
                      const on = camp.status === "ACTIVE";
                      const expanded = expandedId === camp.id;
                      const campAdsets = adsets[camp.id] ?? [];
                      return (
                        <>
                          <tr key={camp.id} className="border-b border-border hover:bg-muted/20 cursor-pointer" onClick={() => expandCampanha(camp.id)}>
                            <td className="py-3 px-3 text-muted-foreground">
                              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </td>
                            <td className="py-3 px-3 font-medium">{camp.name}</td>
                            <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell text-[11px]">{camp.objective}</td>
                            <td className="py-3 px-3 text-right hidden sm:table-cell tabular-nums">{fmtBudget(camp)}</td>
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <StatusToggle on={on} onClick={() => requestToggle(camp.id, "campanha", camp.status, camp.name)} />
                              <div className="text-[10px] text-muted-foreground mt-1">{camp.status}</div>
                            </td>
                          </tr>
                          {expanded && (
                            loadingAdsets === camp.id ? (
                              <tr key={`${camp.id}-loading`} className="border-b border-border bg-muted/10">
                                <td colSpan={5} className="py-3 px-10 text-muted-foreground text-[12px]">
                                  <Loader2 size={12} className="animate-spin inline mr-1" /> Carregando conjuntos…
                                </td>
                              </tr>
                            ) : campAdsets.length === 0 ? (
                              <tr key={`${camp.id}-empty`} className="border-b border-border bg-muted/10">
                                <td colSpan={5} className="py-3 px-10 text-muted-foreground text-[12px]">Nenhum conjunto ativo ou pausado.</td>
                              </tr>
                            ) : campAdsets.map((adset) => {
                              const adOn = adset.status === "ACTIVE";
                              return (
                                <tr key={adset.id} className="border-b border-border last:border-0 bg-muted/10">
                                  <td className="py-2 px-3"></td>
                                  <td className="py-2 px-3 pl-8 text-muted-foreground">↳ {adset.name}</td>
                                  <td className="py-2 px-3 hidden sm:table-cell"></td>
                                  <td className="py-2 px-3 text-right hidden sm:table-cell tabular-nums text-[12px]">{fmtBudget(adset)}</td>
                                  <td className="py-2 px-3 text-center">
                                    <StatusToggle on={adOn} onClick={() => requestToggle(adset.id, "adset", adset.status, adset.name)} />
                                    <div className="text-[10px] text-muted-foreground mt-1">{adset.status}</div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Log de ações */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <History size={16} />
            <h3 className="font-semibold text-[14px]">Log de ações</h3>
          </div>
          {log.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Nenhuma ação nesta sessão.</p>
          ) : (
            <ul className="space-y-3 text-[13px]">
              {log.map((l, i) => (
                <li key={i} className="pb-3 border-b border-border last:border-0">
                  <div className="text-[11px] text-muted-foreground">{l.ts}</div>
                  <div className="mt-0.5">
                    <span className={`font-medium ${l.nivel === "Erro" ? "text-destructive" : ""}`}>{l.acao}</span>{" "}
                    <span className="text-muted-foreground text-[11px]">[{l.nivel}]</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.nome}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Modal de confirmação */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !toggling && setModal(null)}
        >
          <Card className="max-w-md w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h3 className="font-semibold text-[16px] mb-2">
              {modal.next === "PAUSED" ? "Pausar" : "Ativar"}{" "}
              {modal.nivel === "campanha" ? "campanha" : "conjunto"}?
            </h3>
            <p className="text-[13px] text-muted-foreground mb-5">
              <span className="font-medium text-foreground">'{modal.nome}'</span> será{" "}
              {modal.next === "PAUSED" ? "pausado" : "ativado"} no Meta Ads.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)} disabled={toggling}>
                Cancelar
              </Button>
              <Button onClick={confirmarToggle} disabled={toggling}>
                {toggling ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/gerenciar-anuncios.tsx
git commit -m "feat(frontend): replace mock gerenciar-anuncios with real Meta campaigns UI"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start the app**

```bash
cd /home/luan/LBCodeOS/LBCodeOS && npm run dev
```

- [ ] **Step 2: Navigate to Gerenciar Anúncios in the sidebar**

Open browser at `http://localhost:3000` → click "Gerenciar Anúncios" in the sidebar

- [ ] **Step 3: Verify client selector loads**

Dropdown shows clients from `_memoria/contas-ads.md`. Select a client, click Atualizar — campaigns load.

- [ ] **Step 4: Verify campaign expand**

Click a campaign row → chevron opens, ad sets load below. Click again → collapses.

- [ ] **Step 5: Verify toggle flow**

Click a toggle → modal appears with correct name and action. Click Confirmar → toggle updates optimistically, log entry appears.

- [ ] **Step 6: Verify error state**

Temporarily break token (edit `meta.env`) → reload page → click Atualizar → red error banner appears. Restore token.

- [ ] **Step 7: Final commit if any adjustments were made**

```bash
git add -p && git commit -m "fix(frontend): gerenciar-campanhas adjustments from manual testing"
```
