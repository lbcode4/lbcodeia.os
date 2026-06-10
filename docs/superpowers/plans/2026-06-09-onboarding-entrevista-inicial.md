# Onboarding — Entrevista Inicial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guided 6-question chat flow that collects client business data on first access and writes `_memoria/empresa.md` + `_memoria/preferencias.md`.

**Architecture:** Backend exposes `GET /api/onboarding/status` and `POST /api/onboarding/save`; frontend renders a focused chat component at `/onboarding`; `__root.tsx` auto-redirects there when status is incomplete.

**Tech Stack:** Hono (backend), TanStack Router + React (frontend), Vitest (tests), node:fs/promises (file writes), Tailwind + existing app-shell components.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `server/src/onboarding.ts` | Create | Status check + file generation + save logic |
| `server/src/onboarding.test.ts` | Create | Unit + integration tests for onboarding endpoints |
| `server/src/server.ts` | Modify | Register 2 new routes |
| `frontend/src/routes/onboarding.tsx` | Create | Route shell for `/onboarding` |
| `frontend/src/components/onboarding-chat.tsx` | Create | Full chat+review UI component |
| `frontend/src/routes/__root.tsx` | Modify | Auto-redirect when onboarding incomplete |

---

## Task 1: Backend — onboarding.ts

**Files:**
- Create: `server/src/onboarding.ts`
- Create: `server/src/onboarding.test.ts`

- [ ] **Step 1: Write failing tests**

Create `server/src/onboarding.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOnboardingStatus, saveOnboarding, type Profile } from "./onboarding.js";

// Mock node:fs/promises so tests don't touch real files
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOnboardingStatus", () => {
  it("returns complete=false when empresa.md missing", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: false });
  });

  it("returns complete=false when empresa.md has fewer than 50 chars", async () => {
    mockReadFile.mockResolvedValue("# Empresa\n" as unknown as Buffer);
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: false });
  });

  it("returns complete=true when empresa.md has 50+ meaningful chars", async () => {
    mockReadFile.mockResolvedValue("# Empresa\n\n**Nome:** Clínica Sorriso\n**Setor:** Odontologia\n**Produto:** Clareamento" as unknown as Buffer);
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: true });
  });
});

describe("saveOnboarding", () => {
  const profile: Profile = {
    nome: "Clínica Sorriso",
    setor: "Odontologia",
    produto: "Clareamento dental e ortodontia",
    publico: "Mulheres 28-45, classe B/C, Belém-PA",
    diferencial: "Atendimento no mesmo dia, parcelamento em 18x",
    tom: "Profissional mas acolhedor",
    objetivo: "Gerar leads para WhatsApp",
  };

  it("writes empresa.md with nome, setor, produto, publico, diferencial", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);

    const empresaCall = mockWriteFile.mock.calls.find((c) =>
      (c[0] as string).endsWith("empresa.md"),
    );
    expect(empresaCall).toBeDefined();
    const content = empresaCall![1] as string;
    expect(content).toContain("Clínica Sorriso");
    expect(content).toContain("Odontologia");
    expect(content).toContain("Clareamento dental e ortodontia");
    expect(content).toContain("Mulheres 28-45");
    expect(content).toContain("Atendimento no mesmo dia");
  });

  it("writes preferencias.md with tom and objetivo", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);

    const prefCall = mockWriteFile.mock.calls.find((c) =>
      (c[0] as string).endsWith("preferencias.md"),
    );
    expect(prefCall).toBeDefined();
    const content = prefCall![1] as string;
    expect(content).toContain("Profissional mas acolhedor");
    expect(content).toContain("Gerar leads para WhatsApp");
  });

  it("calls writeFile exactly twice", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/onboarding.test.ts
```

Expected: FAIL — `Cannot find module './onboarding.js'`

- [ ] **Step 3: Implement onboarding.ts**

Create `server/src/onboarding.ts`:

```ts
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

export type Profile = {
  nome: string;
  setor: string;
  produto: string;
  publico: string;
  diferencial: string;
  tom: string;
  objetivo: string;
};

export async function getOnboardingStatus(): Promise<{ complete: boolean }> {
  try {
    const content = await readFile(join(REPO_ROOT, "_memoria/empresa.md"), "utf-8");
    return { complete: content.trim().length >= 50 };
  } catch {
    return { complete: false };
  }
}

export async function saveOnboarding(profile: Profile): Promise<void> {
  const empresa = `# Empresa

> Preenchido via entrevista inicial. Edite a qualquer momento.

**Nome:** ${profile.nome}
**Setor:** ${profile.setor}
**Produto/Serviço:** ${profile.produto}
**Público-alvo:** ${profile.publico}
**Diferencial:** ${profile.diferencial}
`;

  const preferencias = `# Preferências

> Preenchido via entrevista inicial. Edite a qualquer momento.

## Tom de voz
${profile.tom}

## Objetivo principal com tráfego pago
${profile.objetivo}
`;

  await writeFile(join(REPO_ROOT, "_memoria/empresa.md"), empresa, "utf-8");
  await writeFile(join(REPO_ROOT, "_memoria/preferencias.md"), preferencias, "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd server && npx vitest run src/onboarding.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/onboarding.ts server/src/onboarding.test.ts
git commit -m "feat(onboarding): add getOnboardingStatus and saveOnboarding with tests"
```

---

## Task 2: Wire endpoints into server.ts

**Files:**
- Modify: `server/src/server.ts`
- Modify: `server/src/onboarding.test.ts` (add integration tests)

- [ ] **Step 1: Write failing integration tests**

Append to `server/src/onboarding.test.ts` (after existing imports, add `app` import at top and new describe block at bottom):

Add to top of file:
```ts
import { app } from "./server.js";
```

Add at bottom of file:
```ts
describe("GET /api/onboarding/status", () => {
  it("returns 200 with complete boolean", async () => {
    // readFile already mocked above — reset to return empty string
    mockReadFile.mockResolvedValue("" as unknown as Buffer);
    const res = await app.request("/api/onboarding/status");
    expect(res.status).toBe(200);
    const body = await res.json() as { complete: boolean };
    expect(typeof body.complete).toBe("boolean");
  });
});

describe("POST /api/onboarding/save", () => {
  it("returns 200 { ok: true } with valid profile", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const profile: Profile = {
      nome: "Teste", setor: "Tech", produto: "SaaS",
      publico: "PMEs", diferencial: "Rápido", tom: "Direto", objetivo: "Leads",
    };
    const res = await app.request("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 400 when body is malformed", async () => {
    const res = await app.request("/api/onboarding/save", {
      method: "POST",
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

Expected: FAIL — `404` on `/api/onboarding/status` (route not registered yet).

- [ ] **Step 3: Register routes in server.ts**

Add import near top of `server/src/server.ts` (after existing imports):
```ts
import { getOnboardingStatus, saveOnboarding, type Profile } from "./onboarding.js";
```

Add routes before the `if (process.argv[1]...)` block at the bottom of `server/src/server.ts`:
```ts
app.get("/api/onboarding/status", async (c) => {
  return c.json(await getOnboardingStatus());
});

app.post("/api/onboarding/save", async (c) => {
  let body: Profile;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  await saveOnboarding(body);
  return c.json({ ok: true });
});
```

- [ ] **Step 4: Run all server tests**

```bash
cd server && npx vitest run
```

Expected: All tests PASS (including pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add server/src/server.ts server/src/onboarding.test.ts
git commit -m "feat(onboarding): register GET /api/onboarding/status and POST /api/onboarding/save"
```

---

## Task 3: Frontend component — OnboardingChat

**Files:**
- Create: `frontend/src/components/onboarding-chat.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/onboarding-chat.tsx`:

```tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Profile = {
  nome: string;
  setor: string;
  produto: string;
  publico: string;
  diferencial: string;
  tom: string;
  objetivo: string;
};

type Field = keyof Profile;
type Phase = "chat" | "review" | "saving" | "done";

const STEPS: { question: string; example: string; field: Field }[] = [
  {
    question: "Qual o nome e setor do seu negócio?",
    example: "ex: Clínica Sorriso Pleno / Odontologia",
    field: "nome",
  },
  {
    question: "O que você vende? Descreva seu principal produto ou serviço.",
    example: "ex: Clareamento dental, ortodontia e implantes",
    field: "produto",
  },
  {
    question: "Para quem você vende? Descreva seu cliente ideal.",
    example: "ex: Mulheres 28-45, classe B/C, Belém-PA, querem sorriso bonito",
    field: "publico",
  },
  {
    question: "Por que o cliente escolhe você e não o concorrente?",
    example: "ex: Atendimento no mesmo dia, parcelamento em 18x, sem espera",
    field: "diferencial",
  },
  {
    question: "Como quer ser percebido? Descreva o tom da sua marca.",
    example: "ex: Profissional mas acolhedor, linguagem simples, sem termos técnicos",
    field: "tom",
  },
  {
    question: "Qual seu principal objetivo com tráfego pago?",
    example: "ex: Gerar leads para WhatsApp e agendar consultas",
    field: "objetivo",
  },
];

const LABELS: Record<Field, string> = {
  nome: "Nome do negócio",
  setor: "Setor",
  produto: "Produto / Serviço",
  publico: "Público-alvo",
  diferencial: "Diferencial",
  tom: "Tom de voz",
  objetivo: "Objetivo com tráfego pago",
};

export function OnboardingChat() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("chat");
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: STEPS[0].question },
  ]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function parseNomeSetor(answer: string): Pick<Profile, "nome" | "setor"> {
    const parts = answer.split("/").map((s) => s.trim());
    return { nome: parts[0] ?? answer, setor: parts[1] ?? "" };
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const currentStep = STEPS[step];
    let update: Partial<Profile> = { [currentStep.field]: trimmed };

    // Step 0 parses "Nome / Setor" into two fields
    if (step === 0) {
      update = parseNomeSetor(trimmed);
    }

    const nextProfile = { ...profile, ...update };
    setProfile(nextProfile);

    const nextStep = step + 1;
    const nextHistory = [...history, { role: "user" as const, text: trimmed }];

    if (nextStep < STEPS.length) {
      setHistory([...nextHistory, { role: "ai", text: STEPS[nextStep].question }]);
      setStep(nextStep);
    } else {
      setHistory([...nextHistory, { role: "ai", text: "Ótimo! Revise suas respostas abaixo antes de salvar." }]);
      setPhase("review");
    }

    setInput("");
  }

  async function handleSave() {
    setPhase("saving");
    setSaveError(null);
    try {
      const res = await fetch(`${BACKEND}/api/onboarding/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setPhase("done");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro desconhecido");
      setPhase("review");
    }
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <p className="text-lg font-medium">Tudo pronto! Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Conta-me sobre o seu negócio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vou fazer {STEPS.length} perguntas rápidas pra personalizar o sistema pra você.
        </p>
      </div>

      {/* Progress bar */}
      {phase === "chat" && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / {STEPS.length}</span>
        </div>
      )}

      {/* Chat history */}
      {phase === "chat" && (
        <>
          <div ref={scrollRef} className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                  {msg.role === "ai" && i === history.length - 1 && step < STEPS.length && (
                    <p className="text-xs text-muted-foreground mt-1">{STEPS[step].example}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Sua resposta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              autoFocus
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </>
      )}

      {/* Review phase */}
      {(phase === "review" || phase === "saving") && (
        <>
          <p className="text-sm text-muted-foreground">Revise suas respostas antes de salvar. Edite o que precisar.</p>
          <div className="flex flex-col gap-3">
            {(Object.keys(LABELS) as Field[])
              .filter((f) => f !== "setor")
              .map((field) => (
                <Card key={field} className="p-4 flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {LABELS[field]}
                  </label>
                  <textarea
                    className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[40px]"
                    value={(profile[field] as string) ?? ""}
                    rows={2}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                </Card>
              ))}
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <Button onClick={handleSave} disabled={phase === "saving"} className="w-full">
            {phase === "saving" ? (
              <><Loader2 size={16} className="animate-spin mr-2" /> Salvando...</>
            ) : (
              "Confirmar e Salvar"
            )}
          </Button>
        </>
      )}
    </div>
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
git add frontend/src/components/onboarding-chat.tsx
git commit -m "feat(onboarding): add OnboardingChat component with 6-step guided flow"
```

---

## Task 4: Frontend route — /onboarding

**Files:**
- Create: `frontend/src/routes/onboarding.tsx`

- [ ] **Step 1: Create the route file**

Create `frontend/src/routes/onboarding.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { OnboardingChat } from "@/components/onboarding-chat";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return <OnboardingChat />;
}
```

- [ ] **Step 2: Verify route is picked up (TanStack Router auto-generates routeTree)**

```bash
cd frontend && npx vite dev &
sleep 3 && curl -s http://localhost:3000/onboarding | grep -c "LBCode"
```

Expected: Returns a number > 0 (HTML loaded). Kill dev server after: `kill %1`

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/onboarding.tsx
git commit -m "feat(onboarding): add /onboarding route"
```

---

## Task 5: Auto-redirect in __root.tsx

**Files:**
- Modify: `frontend/src/routes/__root.tsx`

- [ ] **Step 1: Add redirect logic to RootComponent**

In `frontend/src/routes/__root.tsx`, add `useNavigate` to the imports at the top:

```ts
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, useNavigate } from "@tanstack/react-router";
```

Add `useLocation` too:
```ts
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, useNavigate, useRouterState } from "@tanstack/react-router";
```

Replace the `RootComponent` function with:

```tsx
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

  useEffect(() => {
    if (pathname === "/onboarding") return;
    fetch(`${BACKEND}/api/onboarding/status`)
      .then((r) => r.json())
      .then((data: { complete: boolean }) => {
        if (!data.complete) navigate({ to: "/onboarding" });
      })
      .catch(() => { /* network error — don't redirect */ });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

Note: `useEffect` is already imported in `__root.tsx`.

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/__root.tsx
git commit -m "feat(onboarding): auto-redirect to /onboarding when empresa.md incomplete"
```

---

## Task 6: Manual test — end-to-end flow

- [ ] **Step 1: Rename empresa.md temporarily to simulate first-time access**

```bash
mv _memoria/empresa.md _memoria/empresa.md.bak
```

- [ ] **Step 2: Start backend and frontend**

```bash
cd server && npm run dev &
cd frontend && npm run dev &
```

- [ ] **Step 3: Open http://localhost:3000 — verify redirect to /onboarding**

Expected: Browser lands on `/onboarding`, shows first question "Qual o nome e setor do seu negócio?".

- [ ] **Step 4: Complete the 6-question flow**

Answer all 6 questions. Verify:
- Progress bar advances each step
- Previous answers show as chat bubbles
- Review screen shows all 6 editable fields
- "Confirmar e Salvar" sends POST to backend

- [ ] **Step 5: Verify files written**

```bash
cat _memoria/empresa.md
cat _memoria/preferencias.md
```

Expected: Both files contain the answers from the interview.

- [ ] **Step 6: Restore original empresa.md**

```bash
mv _memoria/empresa.md.bak _memoria/empresa.md
```

- [ ] **Step 7: Stop dev servers and commit final**

```bash
kill %1 %2 2>/dev/null; true
git add -A
git commit -m "test(onboarding): verify end-to-end flow works"
```
