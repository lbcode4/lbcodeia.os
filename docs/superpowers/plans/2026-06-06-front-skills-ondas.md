# Front-end Skills — Todas as 42 Skills em Ondas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar todas as 42 skills do lbcodeia.os ao front-end em 3 ondas: infraestrutura genérica, skills de texto completo e telas data-driven com JSON estruturado.

**Architecture:** Backend (server/) recebe `mode: "text" | "data"` por skill; no modo data acumula chunks e extrai último bloco ```json``` para emitir evento `data`. Front tem rota genérica `/skill/$skillId` para 30+ skills de texto e 6 telas dedicadas que consomem o evento `data` para popular dashboards reais.

**Tech Stack:** Node + Hono + `@anthropic-ai/claude-agent-sdk` (backend) · TanStack Start + React 19 + Tailwind v4 (frontend) · Vitest (testes backend)

---

## Contexto importante

```
lbcodeia.os/
  server/src/
    skills-map.ts   ← define SkillSpec, registra skills
    runner.ts       ← executa via Agent SDK, emite SkillEvent SSE
    server.ts       ← Hono HTTP, rota POST /api/skills/run
    contas.ts       ← parse contas-ads.md
  frontend/src/
    lib/
      skills.ts         ← hubs + skills com id, name, description, route?
      skill-client.ts   ← fetchContas(), runSkill(), tipos SkillEvent
    routes/
      hub.$hubId.tsx            ← lista cards de skills por hub
      gerador-copy.tsx          ← tela dedicada lb-meta-copy (MVP concluído)
      dashboard-meta.tsx        ← mock, precisa virar data-driven (Onda 3)
      diagnostico-meta.tsx      ← mock
      auditoria-meta.tsx        ← mock
      reels.tsx                 ← mock
      negativas.tsx             ← mock
      dashboard-google.tsx      ← mock
```

**MVP concluído:** `lb-meta-copy` ponta-a-ponta funcionando em `/gerador-copy`.

**Skill IDs em `skills.ts`:** precisam bater com IDs do backend (ex: `lb-meta-copy`). Hoje alguns estão sem prefixo `lb-` — a Task 1 do frontend corrige isso.

---

## Onda 1 — Infraestrutura (backend + frontend)

### Task 1: Expandir `skills-map.ts` com as 42 skills e campo `mode`

**Files:**
- Modify: `server/src/skills-map.ts`
- Modify: `server/src/skills-map.test.ts`

- [ ] **Step 1: Escrever testes que vão falhar**

Abrir `server/src/skills-map.test.ts`. Adicionar ao final:

```typescript
import { getAllSkillIds } from "./skills-map.js";

describe("todas as skills registradas", () => {
  it("tem pelo menos 42 skills", () => {
    expect(getAllSkillIds().length).toBeGreaterThanOrEqual(42);
  });

  it("cada skill tem mode definido", () => {
    for (const id of getAllSkillIds()) {
      const spec = resolveSkill(id);
      expect(["text", "data"]).toContain(spec.mode);
    }
  });

  it("skills data têm outputContract", () => {
    const dataSkills = ["lb-meta-dashboard", "lb-meta-diagnostico", "lb-meta-auditoria", "lb-meta-analise-reels", "lb-ads-negativas", "lb-google-dashboard"];
    for (const id of dataSkills) {
      const spec = resolveSkill(id);
      expect(spec.mode).toBe("data");
      expect(spec.outputContract).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
cd server && npm test
```
Esperado: `getAllSkillIds is not a function` e falhas nos novos testes.

- [ ] **Step 3: Reescrever `server/src/skills-map.ts`**

```typescript
export type SkillSpec = {
  skillName: string;
  allowedTools: string[];
  mode: "text" | "data";
  outputContract?: unknown;
};

const TEXT_TOOLS = ["Skill", "Read", "Glob", "Grep"];
const SCRIPT_TOOLS = ["Skill", "Bash", "Read", "Glob", "Grep"];

const SKILLS: Record<string, SkillSpec> = {
  // ── Meta Ads ──────────────────────────────────────────────────────────
  "lb-meta-copy": { skillName: "lb-meta-copy", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-relatorio": { skillName: "lb-meta-relatorio", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-completo": { skillName: "lb-meta-completo", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-campanha-seguidores": { skillName: "lb-meta-campanha-seguidores", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-meta-campanha-whatsapp": { skillName: "lb-meta-campanha-whatsapp", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-meta-gerenciar": { skillName: "lb-meta-gerenciar", allowedTools: SCRIPT_TOOLS, mode: "text" },

  // ── Meta Ads — data-driven ─────────────────────────────────────────────
  "lb-meta-dashboard": {
    skillName: "lb-meta-dashboard", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      periodo: "string",
      gastos: "number",
      impressoes: "number",
      cliques: "number",
      ctr: "number",
      cpm: "number",
      topCreativos: [{ id: "string", nome: "string", ctr: "number", gastos: "number" }],
    },
  },
  "lb-meta-diagnostico": {
    skillName: "lb-meta-diagnostico", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      score: "number (0-100)",
      alertas: [{ nivel: "critico|atencao|ok", mensagem: "string" }],
      recomendacoes: ["string"],
      metricas: { "chave": "number" },
    },
  },
  "lb-meta-auditoria": {
    skillName: "lb-meta-auditoria", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      estrutura: { campanhas: "number", conjuntos: "number", anuncios: "number" },
      copys: [{ anuncio: "string", problema: "string", sugestao: "string" }],
      segmentacoes: [{ conjunto: "string", problema: "string" }],
      itensCriticos: ["string"],
    },
  },
  "lb-meta-analise-reels": {
    skillName: "lb-meta-analise-reels", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      reels: [{ id: "string", views: "number", retencao: "number", ctaRate: "number", sugestao: "string" }],
    },
  },

  // ── Google Ads ─────────────────────────────────────────────────────────
  "lb-google-ads": { skillName: "lb-google-ads", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-seo": { skillName: "lb-google-seo", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-avaliacoes": { skillName: "lb-google-avaliacoes", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-meu-negocio": { skillName: "lb-google-meu-negocio", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-dashboard": {
    skillName: "lb-google-dashboard", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      campanhas: [{ nome: "string", gastos: "number", conversoes: "number", roas: "number" }],
      cpc: "number",
      conversoes: "number",
      roas: "number",
      alertas: ["string"],
    },
  },

  // ── Ads unificado ─────────────────────────────────────────────────────
  "lb-ads-unificado": { skillName: "lb-ads-unificado", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-ads-conectar": { skillName: "lb-ads-conectar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-ads-negativas": {
    skillName: "lb-ads-negativas", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      novasNegativas: [{ termo: "string", motivo: "string", campanha: "string" }],
      existentes: ["string"],
      impactoEstimado: "string",
    },
  },

  // ── Conteúdo Orgânico ─────────────────────────────────────────────────
  "lb-conteudo-reels": { skillName: "lb-conteudo-reels", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-stories": { skillName: "lb-conteudo-stories", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-carrossel": { skillName: "lb-conteudo-carrossel", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-calendario": { skillName: "lb-conteudo-calendario", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-publicar": { skillName: "lb-conteudo-publicar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-aprovar": { skillName: "lb-conteudo-aprovar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-auditoria-insta": { skillName: "lb-conteudo-auditoria-insta", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-analise-reels-organico": { skillName: "lb-meta-analise-reels-organico", allowedTools: SCRIPT_TOOLS, mode: "text" },

  // ── Vendas & CRM ──────────────────────────────────────────────────────
  "lb-venda-prospectar": { skillName: "lb-venda-prospectar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-diagnostico": { skillName: "lb-venda-diagnostico", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-dossie": { skillName: "lb-venda-dossie", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-proposta": { skillName: "lb-venda-proposta", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-precificar": { skillName: "lb-venda-precificar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-objecoes": { skillName: "lb-venda-objecoes", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-follow-up": { skillName: "lb-venda-follow-up", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-email": { skillName: "lb-venda-email", allowedTools: TEXT_TOOLS, mode: "text" },

  // ── Negócio do Cliente ────────────────────────────────────────────────
  "lb-negocio-site": { skillName: "lb-negocio-site", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-plano-mensal": { skillName: "lb-negocio-plano-mensal", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-mapear-rotinas": { skillName: "lb-negocio-mapear-rotinas", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-analisar-dados": { skillName: "lb-negocio-analisar-dados", allowedTools: SCRIPT_TOOLS, mode: "text" },

  // ── Sistema ───────────────────────────────────────────────────────────
  "lb-sistema-novo-projeto": { skillName: "lb-sistema-novo-projeto", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-abrir": { skillName: "lb-sistema-abrir", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-instalar": { skillName: "lb-sistema-instalar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-atualizar": { skillName: "lb-sistema-atualizar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-salvar": { skillName: "lb-sistema-salvar", allowedTools: TEXT_TOOLS, mode: "text" },
};

export function isAllowedSkill(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(SKILLS, id);
}

export function resolveSkill(id: string): SkillSpec {
  const spec = SKILLS[id];
  if (!spec) throw new Error(`Skill não permitida: ${id}`);
  return spec;
}

export function getAllSkillIds(): string[] {
  return Object.keys(SKILLS);
}
```

- [ ] **Step 4: Rodar testes**

```bash
cd server && npm test
```
Esperado: todos passam incluindo os novos 3.

- [ ] **Step 5: Commit**

```bash
git add server/src/skills-map.ts server/src/skills-map.test.ts
git commit -m "feat(server): registra 42 skills com mode text/data e outputContract"
```

---

### Task 2: `extractJsonBlock` + atualizar `runner.ts` para mode data

**Files:**
- Modify: `server/src/runner.ts`
- Create: `server/src/runner-helpers.test.ts`

- [ ] **Step 1: Escrever testes para `extractJsonBlock`**

Criar `server/src/runner-helpers.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { extractJsonBlock } from "./runner.js";

describe("extractJsonBlock", () => {
  it("extrai bloco json simples", () => {
    const text = 'texto\n```json\n{"a":1}\n```\nmais texto';
    expect(extractJsonBlock(text)).toEqual({ a: 1 });
  });

  it("extrai o ÚLTIMO bloco quando há múltiplos", () => {
    const text = '```json\n{"first":1}\n```\n...\n```json\n{"last":2}\n```';
    expect(extractJsonBlock(text)).toEqual({ last: 2 });
  });

  it("retorna null quando não há bloco", () => {
    expect(extractJsonBlock("sem bloco json aqui")).toBeNull();
  });

  it("retorna null quando bloco tem JSON inválido", () => {
    expect(extractJsonBlock("```json\n{invalid}\n```")).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
cd server && npm test
```
Esperado: `extractJsonBlock is not a function`.

- [ ] **Step 3: Atualizar `server/src/runner.ts`**

Substituir o conteúdo completo:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { join } from "node:path";
import { resolveSkill } from "./skills-map.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown };

/** Extrai o último bloco ```json...``` de um texto. Retorna o objeto parseado ou null. */
export function extractJsonBlock(text: string): unknown | null {
  const regex = /```json\s*([\s\S]*?)```/g;
  let last: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    last = match[1].trim();
  }
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

export function buildPrompt(
  skill: string,
  cliente: string,
  input: string,
  mode: "text" | "data",
  outputContract?: unknown,
): string {
  const parts = [
    `Use a skill ${skill}.`,
    `Cliente: ${cliente}.`,
  ];
  if (input.trim()) {
    parts.push(`Briefing / contexto do usuário: ${input}`);
  }
  parts.push("Siga a skill à risca e entregue o resultado final.");
  if (mode === "data" && outputContract) {
    parts.push(
      `\nAo final, emita OBRIGATORIAMENTE um bloco \`\`\`json com o resultado estruturado seguindo este contrato:\n${JSON.stringify(outputContract, null, 2)}\nNenhum texto após o bloco JSON.`,
    );
  }
  return parts.join("\n");
}

function statusForTool(name: string, toolInput: unknown): string | null {
  if (name === "Bash") {
    const cmd = (toolInput as { command?: string })?.command ?? "";
    if (cmd.includes("criativos.py")) return "Puxando top performers…";
    return "Executando script…";
  }
  if (name === "Skill") return "Carregando a skill…";
  return null;
}

export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
): AsyncGenerator<SkillEvent> {
  const spec = resolveSkill(skill);
  const prompt = buildPrompt(spec.skillName, cliente, input, spec.mode, spec.outputContract);

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        allowedTools: spec.allowedTools,
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    let accumulated = "";

    for await (const message of messages) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text.trim()) {
              accumulated += text;
              if (spec.mode === "text") yield { type: "chunk", text };
            }
          } else if (block.type === "tool_use") {
            const b = block as { type: "tool_use"; name: string; input: unknown };
            const s = statusForTool(b.name, b.input);
            if (s) yield { type: "status", text: s };
          }
        }
      } else if (message.type === "result") {
        if (spec.mode === "data") {
          const payload = extractJsonBlock(accumulated);
          if (payload !== null) {
            yield { type: "data", payload };
          } else {
            yield { type: "error", text: "Resposta sem bloco JSON estruturado" };
          }
        }
        yield { type: "done" };
        return;
      }
    }
    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}
```

- [ ] **Step 4: Atualizar `server/src/runner.test.ts`** para nova assinatura de `buildPrompt`

Substituir o teste existente:
```typescript
import { describe, it, expect } from "vitest";
import { buildPrompt } from "./runner.js";

describe("buildPrompt", () => {
  it("inclui nome da skill, cliente e briefing", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian Store", "anúncio de tênis", "text");
    expect(p).toContain("lb-meta-copy");
    expect(p).toContain("Dordrian Store");
    expect(p).toContain("anúncio de tênis");
  });

  it("injeta contrato JSON quando mode=data", () => {
    const contract = { score: "number" };
    const p = buildPrompt("lb-meta-diagnostico", "Dordrian", "", "data", contract);
    expect(p).toContain("```json");
    expect(p).toContain('"score"');
  });

  it("não injeta JSON quando mode=text", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian", "briefing", "text");
    expect(p).not.toContain("```json");
  });
});
```

- [ ] **Step 5: Rodar testes**

```bash
cd server && npm test
```
Esperado: todos passam incluindo os 4 novos de `extractJsonBlock` e os 3 atualizados de `buildPrompt`.

- [ ] **Step 6: Commit**

```bash
git add server/src/runner.ts server/src/runner-helpers.test.ts server/src/runner.test.ts
git commit -m "feat(server): mode data, extractJsonBlock, buildPrompt genérico"
```

---

### Task 3: Adicionar evento `data` ao `skill-client.ts` (frontend)

**Files:**
- Modify: `frontend/src/lib/skill-client.ts`

- [ ] **Step 1: Atualizar tipo `SkillEvent` em `frontend/src/lib/skill-client.ts`**

Localizar a definição atual:
```typescript
export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string };
```

Substituir por:
```typescript
export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown };
```

- [ ] **Step 2: Build para confirmar sem erros de tipo**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
```
Esperado: sem linhas de erro.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/skill-client.ts
git commit -m "feat(frontend): SkillEvent adiciona variante data para skills data-driven"
```

---

### Task 4: Atualizar IDs em `skills.ts` para usar prefixo `lb-`

**Files:**
- Modify: `frontend/src/lib/skills.ts`

> Os IDs das skills no front precisam bater com os IDs do backend. Hoje estão sem prefixo `lb-`. Também dois IDs têm nomes diferentes do diretório real da skill.

- [ ] **Step 1: Fazer as substituições em `frontend/src/lib/skills.ts`**

Substituir os `id:` de cada skill conforme tabela:

| Antes | Depois |
|-------|--------|
| `"meta-dashboard"` | `"lb-meta-dashboard"` |
| `"meta-diagnostico"` | `"lb-meta-diagnostico"` |
| `"meta-auditoria"` | `"lb-meta-auditoria"` |
| `"meta-relatorio"` | `"lb-meta-relatorio"` |
| `"meta-gerenciar"` | `"lb-meta-gerenciar"` |
| `"meta-reels"` | `"lb-meta-analise-reels"` |
| `"meta-copy"` | `"lb-meta-copy"` |
| `"meta-completo"` | `"lb-meta-completo"` |
| `"meta-campanha-seguidores"` | `"lb-meta-campanha-seguidores"` |
| `"meta-campanha-whatsapp"` | `"lb-meta-campanha-whatsapp"` |
| `"google-dashboard"` | `"lb-google-dashboard"` |
| `"google-ads"` | `"lb-google-ads"` |
| `"google-seo"` | `"lb-google-seo"` |
| `"google-avaliacoes"` | `"lb-google-avaliacoes"` |
| `"google-meu-negocio"` | `"lb-google-meu-negocio"` |
| `"conteudo-reels"` | `"lb-conteudo-reels"` |
| `"conteudo-stories"` | `"lb-conteudo-stories"` |
| `"conteudo-carrossel"` | `"lb-conteudo-carrossel"` |
| `"conteudo-calendario"` | `"lb-conteudo-calendario"` |
| `"conteudo-publicar"` | `"lb-conteudo-publicar"` |
| `"conteudo-aprovar"` | `"lb-conteudo-aprovar"` |
| `"conteudo-auditoria-insta"` | `"lb-conteudo-auditoria-insta"` |
| `"venda-prospectar"` | `"lb-venda-prospectar"` |
| `"venda-diagnostico"` | `"lb-venda-diagnostico"` |
| `"venda-dossie"` | `"lb-venda-dossie"` |
| `"venda-proposta"` | `"lb-venda-proposta"` |
| `"venda-precificar"` | `"lb-venda-precificar"` |
| `"venda-objecoes"` | `"lb-venda-objecoes"` |
| `"venda-follow-up"` | `"lb-venda-follow-up"` |
| `"venda-email"` | `"lb-venda-email"` |
| `"negocio-site"` | `"lb-negocio-site"` |
| `"negocio-plano-mensal"` | `"lb-negocio-plano-mensal"` |
| `"negocio-mapear-rotinas"` | `"lb-negocio-mapear-rotinas"` |
| `"negocio-analisar-dados"` | `"lb-negocio-analisar-dados"` |
| `"sistema-novo-projeto"` | `"lb-sistema-novo-projeto"` |
| `"sistema-abrir"` | `"lb-sistema-abrir"` |
| `"sistema-instalar"` | `"lb-sistema-instalar"` |
| `"sistema-atualizar"` | `"lb-sistema-atualizar"` |
| `"sistema-salvar"` | `"lb-sistema-salvar"` |
| `"sistema-conectar-contas"` | `"lb-ads-conectar"` |

- [ ] **Step 2: Build para confirmar sem erros**

```bash
cd frontend && npm run build 2>&1 | grep -E "^.*(error|Error)" | head -20
```
Esperado: sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/skills.ts
git commit -m "refactor(frontend): IDs das skills usam prefixo lb- para bater com backend"
```

---

### Task 5: Criar rota genérica `/skill/$skillId`

**Files:**
- Create: `frontend/src/routes/skill.$skillId.tsx`

- [ ] **Step 1: Criar `frontend/src/routes/skill.$skillId.tsx`**

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta, type SkillEvent } from "@/lib/skill-client";
import { findSkillById } from "@/lib/skills";
import { Sparkles, Loader2, Copy } from "lucide-react";

export const Route = createFileRoute("/skill/$skillId")({
  component: SkillPanel,
});

function SkillPanel() {
  const { skillId } = Route.useParams();
  const meta = findSkillById(skillId);

  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [briefing, setBriefing] = useState("");
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContas()
      .then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); })
      .catch(() => setErro("Backend offline?"));
  }, []);

  const executar = async () => {
    setRunning(true);
    setOutput("");
    setStatus("Iniciando…");
    setErro("");
    try {
      await runSkill({ skill: skillId, cliente, input: briefing }, (ev: SkillEvent) => {
        if (ev.type === "status") setStatus(ev.text);
        else if (ev.type === "chunk") setOutput((o) => o + ev.text);
        else if (ev.type === "error") setErro(ev.text);
        else if (ev.type === "done") setStatus("");
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao executar");
      setStatus("");
    } finally {
      setRunning(false);
    }
  };

  const copiar = () => {
    navigator.clipboard?.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PageHeader
        title={meta?.name ?? skillId}
        subtitle={meta?.description ?? "Execute esta skill com IA"}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <label htmlFor="cliente" className="text-[12px] uppercase tracking-wide text-muted-foreground">Cliente</label>
            <select
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px]"
            >
              {contas.map((c) => (
                <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="briefing" className="text-[12px] uppercase tracking-wide text-muted-foreground">Briefing (opcional)</label>
            <textarea
              id="briefing"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              rows={5}
              placeholder="Contexto adicional para a skill…"
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
            />
          </div>
          <Button onClick={executar} disabled={running || !cliente}>
            {running ? "Executando…" : "Executar"}
          </Button>
          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Resultado
            </h3>
            {output && (
              <button onClick={copiar} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Copy size={12} /> {copied ? "Copiado" : "Copiar"}
              </button>
            )}
          </div>
          {status && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-3">
              <Loader2 size={14} className="animate-spin" /> {status}
            </div>
          )}
          {output ? (
            <div className="whitespace-pre-wrap text-[14px] leading-relaxed">{output}</div>
          ) : (
            !status && <p className="text-[13px] text-muted-foreground">Escolha o cliente e clique em Executar.</p>
          )}
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Adicionar `findSkillById` em `frontend/src/lib/skills.ts`**

No final do arquivo, após `findHub`, adicionar:

```typescript
export function findSkillById(id: string): Skill | undefined {
  for (const hub of hubs) {
    const s = hub.skills.find((sk) => sk.id === id);
    if (s) return s;
  }
  return undefined;
}
```

- [ ] **Step 3: Build**

```bash
cd frontend && npm run build 2>&1 | grep -E "^.*(error TS|Error)" | head -20
```
Esperado: sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/skill.\$skillId.tsx frontend/src/lib/skills.ts
git commit -m "feat(frontend): rota genérica /skill/\$skillId para skills de texto"
```

---

### Task 6: Atualizar hub cards para linkar a `/skill/$skillId`

**Files:**
- Modify: `frontend/src/routes/hub.$hubId.tsx`

> Hoje skills sem `route` navegam para `/assistente?skill=...`. Precisa mudar para `/skill/$skillId`.

- [ ] **Step 1: Editar `frontend/src/routes/hub.$hubId.tsx`**

Localizar o bloco:
```typescript
          if (skill.route) {
            return (
              <Link key={skill.id} to={skill.route} className="block">
                {content}
              </Link>
            );
          }
          return (
            <button
              key={skill.id}
              type="button"
              className="text-left"
              onClick={() =>
                navigate({
                  to: "/assistente",
                  search: { skill: skill.id, hub: hub.id } as never,
                })
              }
            >
              {content}
            </button>
          );
```

Substituir por:
```typescript
          if (skill.route) {
            return (
              <Link key={skill.id} to={skill.route} className="block">
                {content}
              </Link>
            );
          }
          return (
            <Link key={skill.id} to="/skill/$skillId" params={{ skillId: skill.id }} className="block text-left">
              {content}
            </Link>
          );
```

Remover `useNavigate` do import se não for mais usado (linha `const navigate = useNavigate();` pode ser removida).

- [ ] **Step 2: Build**

```bash
cd frontend && npm run build 2>&1 | grep -E "^.*(error TS|Error)" | head -20
```
Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/hub.\$hubId.tsx
git commit -m "feat(frontend): cards de skill sem rota linkam para /skill/\$skillId"
```

---

## Onda 2 — Verificação das skills de texto

### Task 7: Smoke test manual das skills de texto

> Esta task é verificação manual, não código. Confirma que o painel genérico funciona pra categorias diferentes.

**Pré-requisito:** backend rodando (`cd server && npm run start`) e frontend rodando (`cd frontend && npm run dev`).

- [ ] **Step 1: Iniciar backend e frontend**

```bash
# Terminal 1
cd /path/to/lbcodeia.os/server && npm run start

# Terminal 2
cd /path/to/lbcodeia.os/frontend && npm run dev
```

- [ ] **Step 2: Testar 5 skills representativas**

Para cada skill abaixo: abrir `/skill/<id>`, selecionar cliente, colocar briefing básico, clicar Executar, confirmar que output aparece.

| Skill ID | Hub | Briefing teste |
|----------|-----|----------------|
| `lb-venda-prospectar` | Vendas | "prospectar academia premium" |
| `lb-conteudo-reels` | Conteúdo | "reel de lançamento de tênis" |
| `lb-google-seo` | Google | "site de loja de calçados" |
| `lb-negocio-plano-mensal` | Negócio | "e-commerce de moda" |
| `lb-meta-relatorio` | Meta | "relatório outubro" |

- [ ] **Step 3: Confirmar que hub cards linkam corretamente**

Abrir `/hub/vendas`, clicar "Prospectar Cliente" → deve ir para `/skill/lb-venda-prospectar`.

---

## Onda 3 — Telas data-driven

> Cada tela recebe um botão "Executar análise" que roda a skill correspondente, recebe evento `data` e substitui o mock por dados reais. Mock permanece como fallback visual se o skill ainda não foi executado.

### Task 8: Dashboard Meta — `/dashboard-meta`

**Files:**
- Modify: `frontend/src/routes/dashboard-meta.tsx`

- [ ] **Step 1: Adicionar imports e estado ao componente `DashboardMeta`**

No topo do arquivo, após os imports existentes, adicionar:
```typescript
import { useState, useEffect } from "react";
import { fetchContas, runSkill, type Conta } from "@/lib/skill-client";
import { Loader2 } from "lucide-react";
```

Dentro de `function DashboardMeta()`, antes do `return`, adicionar:
```typescript
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    periodo: string;
    gastos: number;
    impressoes: number;
    cliques: number;
    ctr: number;
    cpm: number;
    topCreativos: Array<{ id: string; nome: string; ctr: number; gastos: number }>;
  }>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas().then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); }).catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Analisando conta…");
    try {
      await runSkill({ skill: "lb-meta-dashboard", cliente, input: "" }, (ev) => {
        if (ev.type === "status") setStatusMsg(ev.text);
        else if (ev.type === "data") setLiveData(ev.payload as typeof liveData);
        else if (ev.type === "done") setStatusMsg("");
        else if (ev.type === "error") { setStatusMsg(""); console.error(ev.text); }
      });
    } finally {
      setRunning(false);
    }
  };
```

- [ ] **Step 2: Adicionar painel de controle no topo do `return`**

Após o primeiro elemento visual (geralmente o `<PageHeader>` ou header customizado), adicionar:
```tsx
      <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border">
        <select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-card text-[13px]"
        >
          {contas.map((c) => <option key={c.cliente} value={c.cliente}>{c.cliente}</option>)}
        </select>
        <button
          onClick={executarAnalise}
          disabled={running || !cliente}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          {running && <Loader2 size={13} className="animate-spin" />}
          {running ? statusMsg || "Analisando…" : "Executar análise real"}
        </button>
        {liveData && <span className="text-[12px] text-muted-foreground">Período: {liveData.periodo}</span>}
      </div>
```

- [ ] **Step 3: Usar `liveData` nos KPIs quando disponível**

Localizar o array `kpis` no topo do arquivo. No JSX onde os KPIs são renderizados, substituir os valores estáticos por: se `liveData` existir, usar os campos do liveData; caso contrário, usar mock.

Exemplo — localizar onde `kpis.map` renderiza e adicionar condição:
```tsx
        {(liveData ? [
          { label: "Investimento", value: `R$ ${liveData.gastos.toFixed(2)}`, foot: "" },
          { label: "Impressões", value: fmtInt(liveData.impressoes), foot: "" },
          { label: "Cliques", value: fmtInt(liveData.cliques), foot: "" },
          { label: "CTR", value: `${liveData.ctr.toFixed(2)}%`, foot: "" },
          { label: "CPM", value: `R$ ${liveData.cpm.toFixed(2)}`, foot: "" },
        ] : kpis).map((k) => (
          // ... render existente
        ))}
```

- [ ] **Step 4: Build**

```bash
cd frontend && npm run build 2>&1 | grep -E "error TS" | head -10
```
Esperado: sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/dashboard-meta.tsx
git commit -m "feat(frontend): dashboard-meta aceita dados reais via lb-meta-dashboard"
```

---

### Task 9: Diagnóstico Meta — `/diagnostico-meta`

**Files:**
- Modify: `frontend/src/routes/diagnostico-meta.tsx`

- [ ] **Step 1: Ler o arquivo para entender a estrutura atual**

```bash
cat frontend/src/routes/diagnostico-meta.tsx
```

- [ ] **Step 2: Adicionar estado + executarAnalise ao componente**

Mesmo padrão da Task 8. Estado liveData para:
```typescript
type DiagnosticoData = {
  score: number;
  alertas: Array<{ nivel: "critico" | "atencao" | "ok"; mensagem: string }>;
  recomendacoes: string[];
  metricas: Record<string, number>;
};
```

Função `executarAnalise` chama `runSkill({ skill: "lb-meta-diagnostico", cliente, input: "" }, ...)`.

- [ ] **Step 3: Adicionar painel de controle no return**

Mesmo padrão da Task 8 (select cliente + botão "Executar análise real").

- [ ] **Step 4: Usar liveData onde disponível**

Se `liveData` existe:
- Score: mostrar `liveData.score` no lugar do valor mock
- Alertas: mapear `liveData.alertas` no lugar da lista mock
- Recomendações: mapear `liveData.recomendacoes`

- [ ] **Step 5: Build + commit**

```bash
cd frontend && npm run build 2>&1 | grep "error TS" | head -5
git add frontend/src/routes/diagnostico-meta.tsx
git commit -m "feat(frontend): diagnostico-meta aceita dados reais via lb-meta-diagnostico"
```

---

### Task 10: Auditoria Meta — `/auditoria-meta`

**Files:**
- Modify: `frontend/src/routes/auditoria-meta.tsx`

- [ ] **Step 1: Ler estrutura atual**

```bash
cat frontend/src/routes/auditoria-meta.tsx
```

- [ ] **Step 2: Adicionar estado liveData**

```typescript
type AuditoriaData = {
  estrutura: { campanhas: number; conjuntos: number; anuncios: number };
  copys: Array<{ anuncio: string; problema: string; sugestao: string }>;
  segmentacoes: Array<{ conjunto: string; problema: string }>;
  itensCriticos: string[];
};
```

Skill: `lb-meta-auditoria`.

- [ ] **Step 3: Painel de controle + substituição de mock**

Mesmo padrão Tasks 8-9. Se `liveData` existe, render itens críticos de `liveData.itensCriticos`, copys de `liveData.copys` etc.

- [ ] **Step 4: Build + commit**

```bash
cd frontend && npm run build 2>&1 | grep "error TS" | head -5
git add frontend/src/routes/auditoria-meta.tsx
git commit -m "feat(frontend): auditoria-meta aceita dados reais via lb-meta-auditoria"
```

---

### Task 11: Análise de Reels — `/reels`

**Files:**
- Modify: `frontend/src/routes/reels.tsx`

- [ ] **Step 1: Ler estrutura atual**

```bash
cat frontend/src/routes/reels.tsx
```

- [ ] **Step 2: Adicionar estado liveData**

```typescript
type ReelsData = {
  reels: Array<{
    id: string;
    views: number;
    retencao: number;
    ctaRate: number;
    sugestao: string;
  }>;
};
```

Skill: `lb-meta-analise-reels`.

- [ ] **Step 3: Painel de controle + substituição de mock**

Se `liveData` existe, mapear `liveData.reels` nos cards de reel.

- [ ] **Step 4: Build + commit**

```bash
cd frontend && npm run build 2>&1 | grep "error TS" | head -5
git add frontend/src/routes/reels.tsx
git commit -m "feat(frontend): reels aceita dados reais via lb-meta-analise-reels"
```

---

### Task 12: Negativas — `/negativas`

**Files:**
- Modify: `frontend/src/routes/negativas.tsx`

- [ ] **Step 1: Ler estrutura atual**

```bash
cat frontend/src/routes/negativas.tsx
```

- [ ] **Step 2: Adicionar estado liveData**

```typescript
type NegativasData = {
  novasNegativas: Array<{ termo: string; motivo: string; campanha: string }>;
  existentes: string[];
  impactoEstimado: string;
};
```

Skill: `lb-ads-negativas`.

- [ ] **Step 3: Painel de controle + substituição de mock**

Se `liveData` existe, listar `liveData.novasNegativas` e `liveData.existentes`.

- [ ] **Step 4: Build + commit**

```bash
cd frontend && npm run build 2>&1 | grep "error TS" | head -5
git add frontend/src/routes/negativas.tsx
git commit -m "feat(frontend): negativas aceita dados reais via lb-ads-negativas"
```

---

### Task 13: Dashboard Google — `/dashboard-google`

**Files:**
- Modify: `frontend/src/routes/dashboard-google.tsx`

- [ ] **Step 1: Ler estrutura atual**

```bash
cat frontend/src/routes/dashboard-google.tsx
```

- [ ] **Step 2: Adicionar estado liveData**

```typescript
type GoogleData = {
  campanhas: Array<{ nome: string; gastos: number; conversoes: number; roas: number }>;
  cpc: number;
  conversoes: number;
  roas: number;
  alertas: string[];
};
```

Skill: `lb-google-dashboard`.

- [ ] **Step 3: Painel de controle + substituição de mock**

Se `liveData` existe, exibir métricas reais de `liveData`.

- [ ] **Step 4: Build + commit**

```bash
cd frontend && npm run build 2>&1 | grep "error TS" | head -5
git add frontend/src/routes/dashboard-google.tsx
git commit -m "feat(frontend): dashboard-google aceita dados reais via lb-google-dashboard"
```

---

## Checklist final

Após todas as tasks:

```bash
# Backend — todos os testes passam
cd server && npm test

# Frontend — build limpo
cd frontend && npm run build

# Smoke test end-to-end
# 1. Iniciar backend: cd server && npm run start
# 2. Iniciar frontend: cd frontend && npm run dev
# 3. Abrir /hub/vendas → clicar "Prospectar Cliente" → deve ir a /skill/lb-venda-prospectar
# 4. Executar skill → ver output streamado
# 5. Abrir /dashboard-meta → clicar "Executar análise real" → ver dados reais (ou erro esperado sem API key)
```
