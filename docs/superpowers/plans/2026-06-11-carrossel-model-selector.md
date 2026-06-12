# Carrossel Model Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar seletor de modelo Claude ao form de geração de carrossel, persistindo a escolha em `_memoria/ai-config.json` e passando-a ao runner na execução.

**Architecture:** Novo arquivo JSON guarda config de IA. Backend expõe GET/PUT `/api/ai-config` e aceita `model?` em `/api/skills/run`. Frontend busca config no mount, exibe dropdown, salva ao mudar, passa modelo na execução.

**Tech Stack:** Hono, Vitest, React, TanStack Router, TypeScript

---

### Task 1: AiConfig — storage functions

**Files:**
- Modify: `server/src/onboarding.ts`
- Test: `server/src/onboarding.test.ts`

- [ ] **Step 1: Write failing tests** — adicionar ao final de `server/src/onboarding.test.ts`

```ts
describe("getAiConfig", () => {
  it("returns default model when file missing", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await getAiConfig();
    expect(result).toEqual({ carrosselModel: "claude-sonnet-4-6" });
  });

  it("returns saved model when file exists", async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ carrosselModel: "claude-opus-4-8" }) as unknown as Buffer,
    );
    const result = await getAiConfig();
    expect(result).toEqual({ carrosselModel: "claude-opus-4-8" });
  });
});

describe("saveAiConfig", () => {
  it("writes ai-config.json with given model", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveAiConfig({ carrosselModel: "claude-haiku-4-5-20251001" });
    const call = mockWriteFile.mock.calls.find((c) =>
      (c[0] as string).endsWith("ai-config.json"),
    );
    expect(call).toBeDefined();
    expect(JSON.parse(call![1] as string)).toEqual({
      carrosselModel: "claude-haiku-4-5-20251001",
    });
  });

  it("calls writeFile exactly once", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveAiConfig({ carrosselModel: "claude-sonnet-4-6" });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npx vitest run src/onboarding.test.ts
```
Expected: FAIL — `getAiConfig is not a function` / `saveAiConfig is not a function`

- [ ] **Step 3: Add import to test file** — adicionar `getAiConfig, saveAiConfig, type AiConfig` ao import existente no topo de `server/src/onboarding.test.ts`:

```ts
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, getAiConfig, saveAiConfig, type Profile, type AiConfig } from "./onboarding.js";
```

- [ ] **Step 4: Implement in `server/src/onboarding.ts`** — adicionar após o bloco `saveConfiguracoes`:

```ts
export type AiConfig = {
  carrosselModel: string;
};

const AI_CONFIG_PATH = join(REPO_ROOT, "_memoria/ai-config.json");
const DEFAULT_AI_CONFIG: AiConfig = { carrosselModel: "claude-sonnet-4-6" };

export async function getAiConfig(): Promise<AiConfig> {
  try {
    const raw = await readFile(AI_CONFIG_PATH, "utf-8");
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export async function saveAiConfig(data: AiConfig): Promise<void> {
  await writeFile(AI_CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}
```

Note: `readFile` e `writeFile` já estão importados no topo do arquivo.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd server && npx vitest run src/onboarding.test.ts
```
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/onboarding.ts server/src/onboarding.test.ts
git commit -m "feat(ai-config): add getAiConfig/saveAiConfig with ai-config.json storage"
```

---

### Task 2: API endpoints — GET/PUT /api/ai-config + model em /api/skills/run

**Files:**
- Modify: `server/src/server.ts`
- Test: `server/src/onboarding.test.ts` (adiciona testes de endpoint)

- [ ] **Step 1: Write failing tests** — adicionar ao final de `server/src/onboarding.test.ts`

```ts
describe("GET /api/ai-config", () => {
  it("returns 200 with carrosselModel string", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const res = await app.request("/api/ai-config");
    expect(res.status).toBe(200);
    const body = await res.json() as AiConfig;
    expect(typeof body.carrosselModel).toBe("string");
    expect(body.carrosselModel).toBe("claude-sonnet-4-6");
  });
});

describe("PUT /api/ai-config", () => {
  it("returns 200 { ok: true } with valid body", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const res = await app.request("/api/ai-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrosselModel: "claude-opus-4-8" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 400 on malformed body", async () => {
    const res = await app.request("/api/ai-config", {
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
Expected: FAIL — 404 on `/api/ai-config`

- [ ] **Step 3: Add import to `server/src/server.ts`** — adicionar `getAiConfig, saveAiConfig, type AiConfig` ao import de `onboarding.js`:

```ts
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, getAiConfig, saveAiConfig, type AiConfig } from "./onboarding.js";
```

- [ ] **Step 4: Add endpoints to `server/src/server.ts`** — adicionar após o bloco `PUT /api/configuracoes`:

```ts
app.get("/api/ai-config", async (c) => {
  try {
    return c.json(await getAiConfig());
  } catch {
    return c.json({ error: "Falha ao carregar ai-config" }, 500);
  }
});

app.put("/api/ai-config", async (c) => {
  let body: AiConfig;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo inválido: JSON esperado" }, 400);
  }
  if (!body.carrosselModel || typeof body.carrosselModel !== "string") {
    return c.json({ error: "carrosselModel é obrigatório" }, 400);
  }
  await saveAiConfig(body);
  return c.json({ ok: true });
});
```

- [ ] **Step 5: Update `POST /api/skills/run` body type** — localizar a linha com `let body: { skill: string; cliente: string; input: string };` em `server.ts` e substituir por:

```ts
let body: { skill: string; cliente: string; input: string; model?: string };
```

E a desestruturação logo abaixo:

```ts
const { skill, cliente, input, model } = body;
```

E a chamada de `runSkill`:

```ts
for await (const ev of runSkill(skill, cliente, input, model)) {
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd server && npx vitest run src/onboarding.test.ts
```
Expected: all PASS

- [ ] **Step 7: Commit**

```bash
git add server/src/server.ts server/src/onboarding.test.ts
git commit -m "feat(api): add GET/PUT /api/ai-config endpoints and model param on /api/skills/run"
```

---

### Task 3: Runner — usar model param

**Files:**
- Modify: `server/src/runner.ts`
- Test: `server/src/runner.test.ts`

- [ ] **Step 1: Write failing test** — adicionar ao final de `server/src/runner.test.ts`

```ts
describe("runSkill signature", () => {
  it("buildPrompt still works — model param is separate", () => {
    // buildPrompt não muda; só verifica que assinatura de runSkill
    // aceita model sem quebrar buildPrompt
    const p = buildPrompt("lb-conteudo-carrossel", "Cliente", "briefing", "text");
    expect(p).toContain("lb-conteudo-carrossel");
    expect(p).toContain("Cliente");
  });
});
```

- [ ] **Step 2: Run test to verify it passes (já deve passar)**

```bash
cd server && npx vitest run src/runner.test.ts
```
Expected: PASS (buildPrompt não muda)

- [ ] **Step 3: Update `runSkill` signature in `server/src/runner.ts`** — localizar:

```ts
export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
): AsyncGenerator<SkillEvent> {
```

Substituir por:

```ts
export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
  model?: string,
): AsyncGenerator<SkillEvent> {
```

- [ ] **Step 4: Use model param in query call** — dentro de `runSkill`, localizar:

```ts
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
```

Substituir `model: MODEL` por:

```ts
        model: model ?? MODEL,
```

- [ ] **Step 5: Run all server tests**

```bash
cd server && npx vitest run
```
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/runner.ts server/src/runner.test.ts
git commit -m "feat(runner): accept optional model param, falls back to LBCODE_MODEL env"
```

---

### Task 4: Frontend — model selector no form de carrossel

**Files:**
- Modify: `frontend/src/routes/skill.$skillId.tsx`

Note: sem testes de componente neste projeto — testar manualmente no browser.

- [ ] **Step 1: Add model constants** — no topo de `skill.$skillId.tsx`, após os imports existentes, adicionar:

```ts
const CARROSSEL_MODELS: { value: string; label: string }[] = [
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — Rápido" },
  { value: "claude-sonnet-4-6", label: "Sonnet 4.6 — Padrão" },
  { value: "claude-opus-4-8", label: "Opus 4.8 — Mais capaz" },
];
```

- [ ] **Step 2: Add model state** — dentro de `SkillPanel()`, após a declaração de `carrosselSlideIdx`:

```ts
const [carrosselModel, setCarrosselModel] = useState("claude-sonnet-4-6");
```

- [ ] **Step 3: Fetch ai-config on mount** — dentro do `useEffect` que já faz `fetchContas()`, adicionar chamada paralela. Substituir o useEffect existente por:

```ts
useEffect(() => {
  Promise.all([
    fetchContas(),
    isCarrossel ? fetch(`${BACKEND}/api/ai-config`).then((r) => r.json()) : Promise.resolve(null),
  ])
    .then(([cs, aiCfg]) => {
      const contas = cs as Conta[];
      setContas(contas);
      if (contas[0]) setCliente(contas[0].cliente);
      if (aiCfg && typeof (aiCfg as { carrosselModel?: string }).carrosselModel === "string") {
        setCarrosselModel((aiCfg as { carrosselModel: string }).carrosselModel);
      }
    })
    .catch(() => setErro("Backend offline?"));
}, []);
```

- [ ] **Step 4: Persist model on change** — adicionar função após `reset()`:

```ts
const handleModelChange = async (value: string) => {
  setCarrosselModel(value);
  try {
    await fetch(`${BACKEND}/api/ai-config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrosselModel: value }),
    });
  } catch { /* silencioso — estado local já atualizou */ }
};
```

- [ ] **Step 5: Pass model to executar** — dentro de `executar()`, localizar a chamada:

```ts
await runSkill({ skill: skillId, cliente, input: buildInput(inputText) }, (ev: SkillEvent) => {
```

Verificar a assinatura de `runSkill` em `frontend/src/lib/skill-client.ts` — se aceita `model`, adicionar. Primeiro checar o arquivo:

```bash
cat frontend/src/lib/skill-client.ts
```

Se `runSkill` em skill-client envia body via fetch, atualizar o body para incluir `model: carrosselModel` quando `isCarrossel`.

Localizar a linha que monta o body (provavelmente `{ skill, cliente, input }`) e substituir por:

```ts
{ skill: skillId, cliente, input: buildInput(inputText), ...(isCarrossel ? { model: carrosselModel } : {}) }
```

- [ ] **Step 6: Add model selector UI** — dentro do JSX, localizar o bloco `{!hasTurns ? (` e dentro dele, logo **antes** do `<Button onClick={iniciar}`, adicionar:

```tsx
{isCarrossel && (
  <div>
    <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
      Modelo IA
    </label>
    <select
      value={carrosselModel}
      onChange={(e) => handleModelChange(e.target.value)}
      className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px]"
    >
      {CARROSSEL_MODELS.map((m) => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  </div>
)}
```

- [ ] **Step 7: Check skill-client.ts and update if needed**

```bash
cat frontend/src/lib/skill-client.ts
```

Se `runSkill` aceita objeto com `skill, cliente, input` e faz fetch, adicionar `model?` ao tipo e ao body enviado.

- [ ] **Step 8: Manual test**

1. Iniciar backend: `cd server && npm run dev`
2. Iniciar frontend: `cd frontend && npm run dev`
3. Abrir `http://localhost:3000/skill/lb-conteudo-carrossel`
4. Verificar dropdown "Modelo IA" aparece acima do botão Executar
5. Mudar para "Opus 4.8 — Mais capaz"
6. Recarregar página — verificar se Opus continua selecionado (persistência)
7. Clicar Executar — verificar no log do backend que `model: "claude-opus-4-8"` chegou

- [ ] **Step 9: Commit**

```bash
git add frontend/src/routes/skill.\$skillId.tsx frontend/src/lib/skill-client.ts
git commit -m "feat(carrossel): add model selector with backend persistence"
```

---

## Self-Review

**Spec coverage:**
- ✅ Seletor sempre visível (Task 4 Step 6 — não condicionado ao tipo de conteúdo)
- ✅ Default = modelo configurado (Task 1 default `claude-sonnet-4-6`, Task 4 Step 3 fetch no mount)
- ✅ Persiste no backend (Task 4 Step 4 PUT ao mudar)
- ✅ Modelo passado ao runner (Tasks 2+3+4)
- ✅ 3 modelos Claude disponíveis (Task 4 Step 1)
- ✅ Só carrossel recebe o seletor (Task 4 Step 6 `{isCarrossel && ...}`)

**Gaps identificados:**
- Task 4 Step 5 depende de verificar `skill-client.ts` primeiro — Step 7 já cobre isso

**Type consistency:**
- `AiConfig` definido em Task 1, usado em Task 2 ✅
- `carrosselModel` string em todos os lugares ✅
- `runSkill(skill, cliente, input, model?)` consistente entre Tasks 2 e 3 ✅
