# Front-end Skills via Claude — MVP (lb-meta-copy) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ligar a tela `/gerador-copy` do protótipo `lbcode-ad-pilot` à skill real `lb-meta-copy`, executada por Claude via Agent SDK num backend Node, com top performers vindos de um fixture.

**Architecture:** Backend Node novo em `lbcodeia.os/server/` (Hono) expõe `POST /api/skills/run` (SSE) e `GET /api/contas`. Usa `@anthropic-ai/claude-agent-sdk` com `cwd` = raiz do repo, carregando `.claude/skills` via preset `claude_code`. O script Python `criativos.py` ganha fallback de fixture quando não há credencial Meta. O front troca o mock por um cliente de streaming.

**Tech Stack:** Node v22 + npm, TypeScript, Hono + @hono/node-server, @anthropic-ai/claude-agent-sdk, vitest (backend). Python 3.13 + unittest (integração). React 19 + TanStack Start (front, já existe).

---

## Repos e caminhos absolutos

- Repo skills/backend: `/home/luan/teste/lbcodeia.os`
- Repo front: `/home/luan/teste/lbcode-ad-pilot`
- Backend novo: `/home/luan/teste/lbcodeia.os/server/`

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `integracoes/meta-ads/fixtures/criativos-sample.json` | Fixture de top performers (shape de `fetch_top_creatives`). |
| `integracoes/meta-ads/scripts/criativos.py` (modificar) | Fallback: sem `META_ACCESS_TOKEN` ou com `--mock`, imprime o fixture. |
| `integracoes/meta-ads/tests/test_criativos.py` | Teste unittest+subprocess do modo mock. |
| `server/package.json`, `server/tsconfig.json`, `server/.env.example` | Projeto Node do backend. |
| `server/src/skills-map.ts` | id da skill → { skillName, allowedTools }. |
| `server/src/contas.ts` | Parse de `_memoria/contas-ads.md` → lista de clientes. |
| `server/src/runner.ts` | `runSkill()` async generator sobre o Agent SDK. |
| `server/src/server.ts` | Hono app: `POST /api/skills/run` (SSE), `GET /api/contas`. |
| `server/src/*.test.ts` | Testes vitest. |
| `lbcode-ad-pilot/src/lib/skill-client.ts` | Cliente de streaming SSE no front. |
| `lbcode-ad-pilot/src/routes/gerador-copy.tsx` (modificar) | Liga UI ao stream. |

---

## Task 1: Fixture + fallback mock no criativos.py

**Files:**
- Create: `/home/luan/teste/lbcodeia.os/integracoes/meta-ads/fixtures/criativos-sample.json`
- Modify: `/home/luan/teste/lbcodeia.os/integracoes/meta-ads/scripts/criativos.py`
- Test: `/home/luan/teste/lbcodeia.os/integracoes/meta-ads/tests/test_criativos.py`

- [ ] **Step 1: Criar o fixture**

Create `integracoes/meta-ads/fixtures/criativos-sample.json` — mesmo shape que `fetch_top_creatives` retorna (lista ordenada por CTR desc):

```json
[
  {
    "ad_id": "1001",
    "ad_name": "Vídeo — Depoimento Cliente",
    "spend": 720.40,
    "ctr": 2.41,
    "clicks": 540,
    "purchases": 38,
    "body": "Mais de 12.000 clientes já compraram. Garantia de 30 dias e entrega expressa. Veja por que esse é o queridinho do mês.",
    "title": "O tênis que todo mundo está comprando"
  },
  {
    "ad_id": "1002",
    "ad_name": "Carrossel — 4 produtos",
    "spend": 520.40,
    "ctr": 1.91,
    "clicks": 410,
    "purchases": 22,
    "body": "Conforto que dura o dia todo. Modelos mais pedidos com 4,9 estrelas. Frete grátis acima de R$ 199.",
    "title": "Coleção nova com até 40% OFF"
  },
  {
    "ad_id": "1003",
    "ad_name": "Imagem — Promo Frete Grátis",
    "spend": 410.80,
    "ctr": 1.78,
    "clicks": 300,
    "purchases": 15,
    "body": "Frete grátis acabando. Troca fácil em qualquer loja parceira. Garanta o seu antes que o estoque acabe.",
    "title": "Frete grátis nas próximas 48h"
  }
]
```

- [ ] **Step 2: Escrever o teste (falhando)**

Create `integracoes/meta-ads/tests/test_criativos.py`. Usa `unittest` + `subprocess` (não depende de pytest nem de conftest):

```python
import json
import os
import subprocess
import sys
import unittest

SCRIPT = os.path.join(
    os.path.dirname(__file__), "..", "scripts", "criativos.py"
)


class TestCriativosMock(unittest.TestCase):
    def _run(self, *args):
        # Roda sem META_ACCESS_TOKEN no ambiente para forçar o fallback.
        env = {k: v for k, v in os.environ.items() if k != "META_ACCESS_TOKEN"}
        return subprocess.run(
            [sys.executable, SCRIPT, *args],
            capture_output=True, text=True, env=env,
        )

    def test_flag_mock_retorna_json_valido(self):
        proc = self._run("--mock")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        data = json.loads(proc.stdout)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertIn("ctr", data[0])
        self.assertIn("body", data[0])

    def test_sem_token_cai_no_fixture(self):
        # Sem --mock e sem token: ainda deve devolver o fixture, não estourar.
        proc = self._run("--cliente", "Dordrian")
        self.assertEqual(proc.returncode, 0, proc.stderr)
        data = json.loads(proc.stdout)
        self.assertGreater(len(data), 0)
```

- [ ] **Step 3: Rodar o teste e ver falhar**

Run: `cd /home/luan/teste/lbcodeia.os && python3 -m unittest integracoes.meta-ads.tests.test_criativos -v`

Se o caminho com hífen quebrar o import do módulo, rodar direto pelo arquivo:
Run: `cd /home/luan/teste/lbcodeia.os/integracoes/meta-ads && python3 -m unittest tests.test_criativos -v`
Expected: FAIL — `criativos.py` não reconhece `--mock` (erro de argumento) / tenta construir `MetaAPIClient` e estoura `META_ACCESS_TOKEN requerido`.

- [ ] **Step 4: Implementar o fallback no criativos.py**

Modify `integracoes/meta-ads/scripts/criativos.py`. Adicionar a flag `--mock`, e logo no início de `main()` (antes do `try`) inserir o curto-circuito de fixture. Substituir a função `main()` atual por:

```python
def _load_fixture():
    fixture = os.path.join(
        os.path.dirname(__file__), "..", "fixtures", "criativos-sample.json"
    )
    with open(fixture, encoding="utf-8") as f:
        return f.read()


def main():
    parser = argparse.ArgumentParser(description="Busca top criativos Meta Ads")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--days", type=int, default=30, choices=[7, 14, 30, 90])
    parser.add_argument("--cliente", default=None)
    parser.add_argument("--mock", action="store_true",
                        help="Usa fixture de exemplo, sem chamar a Graph API")
    args = parser.parse_args()

    # Fallback: sem token (ou com --mock), devolve o fixture e encerra.
    if args.mock or not os.getenv("META_ACCESS_TOKEN"):
        print(_load_fixture())
        return

    try:
        client = MetaAPIClient()
        if args.cliente or not client.account_id:
            from contas import resolver_cliente, ContaError
            try:
                conta = resolver_cliente(nome=args.cliente)
                client.account_id = conta["meta_ad_account"]
            except ContaError as e:
                print(f"Erro: {e}")
                sys.exit(1)
        result = fetch_top_creatives(client, args.limit, args.days)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except MetaAPIError as e:
        print(f"Erro: {e}", file=sys.stderr)
        sys.exit(1)
```

> Nota: `meta_api` chama `load_dotenv` no import. Sem `meta.env`, `os.getenv("META_ACCESS_TOKEN")` é `None` → cai no fixture. A `SKILL.md` de `lb-meta-copy` não muda — o comando `python ... criativos.py --cliente X` passa a funcionar mesmo sem credencial.

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `cd /home/luan/teste/lbcodeia.os/integracoes/meta-ads && python3 -m unittest tests.test_criativos -v`
Expected: PASS (2 testes).

- [ ] **Step 6: Verificar que o comando real da skill funciona**

Run: `cd /home/luan/teste/lbcodeia.os && python3 integracoes/meta-ads/scripts/criativos.py --cliente "Dordrian Store"`
Expected: imprime o JSON do fixture (3 criativos), exit 0.

- [ ] **Step 7: Commit**

```bash
cd /home/luan/teste/lbcodeia.os
git add integracoes/meta-ads/fixtures/criativos-sample.json integracoes/meta-ads/scripts/criativos.py integracoes/meta-ads/tests/test_criativos.py
git commit -m "feat(integracoes): fallback de fixture no criativos.py p/ rodar sem credencial Meta"
```

---

## Task 2: Scaffold do backend + skills-map

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/.gitignore`
- Create: `server/src/skills-map.ts`
- Test: `server/src/skills-map.test.ts`

- [ ] **Step 1: package.json**

Create `/home/luan/teste/lbcodeia.os/server/package.json`:

```json
{
  "name": "lbcode-backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0",
    "@hono/node-server": "^1.13.0",
    "hono": "^4.6.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.8.3",
    "vitest": "^2.1.0",
    "@types/node": "^22.16.5"
  }
}
```

- [ ] **Step 2: tsconfig.json**

Create `/home/luan/teste/lbcodeia.os/server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: .env.example e .gitignore**

Create `/home/luan/teste/lbcodeia.os/server/.env.example`:

```
ANTHROPIC_API_KEY=sk-ant-...
LBCODE_MODEL=claude-sonnet-4-6
PORT=8787
```

Create `/home/luan/teste/lbcodeia.os/server/.gitignore`:

```
node_modules
dist
.env
```

- [ ] **Step 4: Instalar deps**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm install`
Expected: cria `node_modules` e `package-lock.json`, sem erro.

> Se a versão `^0.1.0` do SDK não existir, rodar `npm install @anthropic-ai/claude-agent-sdk@latest` e fixar a versão resolvida no package.json.

- [ ] **Step 5: Escrever o teste do skills-map (falhando)**

Create `/home/luan/teste/lbcodeia.os/server/src/skills-map.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolveSkill, isAllowedSkill } from "./skills-map.js";

describe("skills-map", () => {
  it("resolve lb-meta-copy", () => {
    const s = resolveSkill("lb-meta-copy");
    expect(s.skillName).toBe("lb-meta-copy");
    expect(s.allowedTools).toContain("Bash");
    expect(s.allowedTools).toContain("Skill");
  });

  it("rejeita skill desconhecida", () => {
    expect(isAllowedSkill("nao-existe")).toBe(false);
    expect(() => resolveSkill("nao-existe")).toThrow();
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: FAIL — `./skills-map.js` não existe.

- [ ] **Step 7: Implementar skills-map.ts**

Create `/home/luan/teste/lbcodeia.os/server/src/skills-map.ts`:

```typescript
export type SkillSpec = {
  skillName: string;
  allowedTools: string[];
};

// MVP: apenas a skill validada ponta-a-ponta. Adicionar entradas conforme liga novas telas.
const SKILLS: Record<string, SkillSpec> = {
  "lb-meta-copy": {
    skillName: "lb-meta-copy",
    allowedTools: ["Skill", "Bash", "Read", "Glob", "Grep"],
  },
};

export function isAllowedSkill(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(SKILLS, id);
}

export function resolveSkill(id: string): SkillSpec {
  const spec = SKILLS[id];
  if (!spec) throw new Error(`Skill não permitida: ${id}`);
  return spec;
}
```

- [ ] **Step 8: Rodar e ver passar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: PASS (2 testes).

- [ ] **Step 9: Commit**

```bash
cd /home/luan/teste/lbcodeia.os
git add server/package.json server/package-lock.json server/tsconfig.json server/.env.example server/.gitignore server/src/skills-map.ts server/src/skills-map.test.ts
git commit -m "feat(server): scaffold do backend Node + skills-map"
```

---

## Task 3: Parser de contas-ads.md

**Files:**
- Create: `server/src/contas.ts`
- Test: `server/src/contas.test.ts`

- [ ] **Step 1: Escrever o teste (falhando)**

Create `/home/luan/teste/lbcodeia.os/server/src/contas.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseContas } from "./contas.js";

const TABELA = `# Contas de Anúncios

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | act_123 | 999 | @dordrian | — | sim |
| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |
`;

describe("parseContas", () => {
  it("extrai clientes da tabela markdown", () => {
    const contas = parseContas(TABELA);
    expect(contas).toHaveLength(2);
    expect(contas[0]).toEqual({
      cliente: "Dordrian Store",
      metaAdAccount: "act_123",
      handleIg: "@dordrian",
      ativo: true,
    });
  });

  it("ignora linhas de cabeçalho/separador e texto fora da tabela", () => {
    const contas = parseContas("texto solto\nsem tabela\n");
    expect(contas).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: FAIL — `./contas.js` não existe.

- [ ] **Step 3: Implementar contas.ts**

Create `/home/luan/teste/lbcodeia.os/server/src/contas.ts`:

```typescript
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Conta = {
  cliente: string;
  metaAdAccount: string;
  handleIg: string;
  ativo: boolean;
};

// Raiz do repo lbcodeia.os = um nível acima de server/.
const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CONTAS_PATH = join(REPO_ROOT, "_memoria", "contas-ads.md");

/** Faz parse da tabela markdown de contas. Recebe o conteúdo bruto do .md. */
export function parseContas(markdown: string): Conta[] {
  const out: Conta[] = [];
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    if (cells[0] === "Cliente") continue;        // cabeçalho
    if (/^-+$/.test(cells[0].replace(/\s/g, "-"))) continue; // separador ---
    if (cells[0] === "" || cells[0].startsWith("--")) continue;
    out.push({
      cliente: cells[0],
      metaAdAccount: cells[1],
      handleIg: cells[3],
      ativo: cells[5].toLowerCase() === "sim",
    });
  }
  return out;
}

/** Lê o arquivo real do repo e retorna as contas. */
export async function listContas(): Promise<Conta[]> {
  const md = await readFile(CONTAS_PATH, "utf-8");
  return parseContas(md);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: PASS. Se o teste do separador `---` falhar, ajustar o guard: a linha separadora tem células compostas só de hífens — o filtro `cells.length < 6` já não a barra, então a checagem `/^-+$/` sobre `cells[0]` (ex: `---------`) deve pegá-la. Confirmar que `cells[0]` da linha separadora casa `^-+$` e manter só esse guard se o outro for redundante.

- [ ] **Step 5: Verificar contra o arquivo real**

Run: `cd /home/luan/teste/lbcodeia.os/server && node --input-type=module -e "import('./src/contas.ts').catch(()=>import('tsx/esm').then(()=>0)); " 2>/dev/null; npx tsx -e "import {listContas} from './src/contas.ts'; listContas().then(c=>console.log(JSON.stringify(c,null,2)))"`
Expected: imprime `[{ cliente: "Dordrian Store", metaAdAccount: "act_1388795691981562", handleIg: "@dordrianstore", ativo: true }]`.

- [ ] **Step 6: Commit**

```bash
cd /home/luan/teste/lbcodeia.os
git add server/src/contas.ts server/src/contas.test.ts
git commit -m "feat(server): parser de contas-ads.md p/ dropdown de clientes"
```

---

## Task 4: Runner do Agent SDK

**Files:**
- Create: `server/src/runner.ts`
- Test: `server/src/runner.test.ts` (testa só `buildPrompt`, puro)

- [ ] **Step 1: Escrever o teste do buildPrompt (falhando)**

Create `/home/luan/teste/lbcodeia.os/server/src/runner.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildPrompt } from "./runner.js";

describe("buildPrompt", () => {
  it("inclui nome da skill, cliente e briefing", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian Store", "anúncio de tênis");
    expect(p).toContain("lb-meta-copy");
    expect(p).toContain("Dordrian Store");
    expect(p).toContain("anúncio de tênis");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: FAIL — `./runner.js` não existe.

- [ ] **Step 3: Implementar runner.ts**

Create `/home/luan/teste/lbcodeia.os/server/src/runner.ts`:

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
  | { type: "error"; text: string };

/** Monta a instrução que dispara a skill dentro do Claude. */
export function buildPrompt(skill: string, cliente: string, input: string): string {
  return [
    `Use a skill ${skill}.`,
    `Cliente: ${cliente}.`,
    `Briefing do usuário: ${input}`,
    `Siga a skill à risca e entregue a copy final (título, texto principal, CTA).`,
  ].join("\n");
}

/** Deriva um texto de status amigável a partir de um bloco tool_use. */
function statusForTool(name: string, toolInput: unknown): string | null {
  if (name === "Bash") {
    const cmd = (toolInput as { command?: string })?.command ?? "";
    if (cmd.includes("criativos.py")) return "Puxando top performers…";
    return "Executando script…";
  }
  if (name === "Skill") return "Carregando a skill…";
  return null;
}

/** Executa a skill e emite eventos de stream. */
export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
): AsyncGenerator<SkillEvent> {
  const spec = resolveSkill(skill); // lança se não permitida
  const prompt = buildPrompt(spec.skillName, cliente, input);

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowedTools: spec.allowedTools,
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    for await (const message of messages) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "text" && block.text.trim()) {
            yield { type: "chunk", text: block.text };
          } else if (block.type === "tool_use") {
            const s = statusForTool(block.name, block.input);
            if (s) yield { type: "status", text: s };
          }
        }
      } else if (message.type === "result") {
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

- [ ] **Step 4: Rodar e ver passar (unit)**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: PASS (teste do `buildPrompt`).

- [ ] **Step 5: Verificar o shape do SDK (sanidade de tipos)**

Run: `cd /home/luan/teste/lbcodeia.os/server && npx tsc --noEmit`
Expected: sem erro de tipo. Se `message.type === "result"` ou `block.type`/`message.message.content` não casarem com os tipos do SDK instalado, abrir `node_modules/@anthropic-ai/claude-agent-sdk/**/*.d.ts`, localizar `SDKMessage`/`SDKAssistantMessage` e ajustar os nomes dos campos (ex: `message.message.content` vs `message.content`). Corrigir o runner conforme os tipos reais e re-rodar.

- [ ] **Step 6: Teste de integração manual (gasta token; precisa ANTHROPIC_API_KEY)**

Run:
```bash
cd /home/luan/teste/lbcodeia.os/server
ANTHROPIC_API_KEY=<sua-chave> npx tsx -e "
import { runSkill } from './src/runner.ts';
for await (const ev of runSkill('lb-meta-copy','Dordrian Store','anúncio de tênis de corrida')) {
  console.log(ev.type, ev.type==='chunk'||ev.type==='status'||ev.type==='error' ? ev.text.slice(0,80) : '');
}
"
```
Expected: sequência com ao menos um `status` ("Puxando top performers…"), vários `chunk` com a copy, e um `done`. A copy final menciona elementos dos top performers do fixture.

- [ ] **Step 7: Commit**

```bash
cd /home/luan/teste/lbcodeia.os
git add server/src/runner.ts server/src/runner.test.ts
git commit -m "feat(server): runner do Agent SDK que executa skill e streama eventos"
```

---

## Task 5: HTTP server (Hono) — SSE + /api/contas

**Files:**
- Create: `server/src/server.ts`
- Test: `server/src/server.test.ts`

- [ ] **Step 1: Escrever o teste (falhando)**

Create `/home/luan/teste/lbcodeia.os/server/src/server.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { app } from "./server.js";

describe("GET /api/contas", () => {
  it("retorna lista de contas com Dordrian", async () => {
    const res = await app.request("/api/contas");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((c: { cliente: string }) => c.cliente.includes("Dordrian"))).toBe(true);
  });
});

describe("POST /api/skills/run validação", () => {
  it("rejeita skill não permitida com 400", async () => {
    const res = await app.request("/api/skills/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "nao-existe", cliente: "X", input: "y" }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: FAIL — `./server.js` não existe.

- [ ] **Step 3: Implementar server.ts**

Create `/home/luan/teste/lbcodeia.os/server/src/server.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { listContas } from "./contas.js";
import { isAllowedSkill } from "./skills-map.js";
import { runSkill } from "./runner.js";

export const app = new Hono();

app.use("/api/*", cors()); // dev: front em :3000 chama backend em :8787

app.get("/api/contas", async (c) => {
  const contas = await listContas();
  return c.json(contas);
});

app.post("/api/skills/run", async (c) => {
  const { skill, cliente, input } = await c.req.json<{
    skill: string;
    cliente: string;
    input: string;
  }>();

  if (!isAllowedSkill(skill)) {
    return c.json({ error: `Skill não permitida: ${skill}` }, 400);
  }

  return streamSSE(c, async (stream) => {
    for await (const ev of runSkill(skill, cliente, input)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});

// Só sobe o listener quando executado direto (não nos testes).
if (process.argv[1] && process.argv[1].endsWith("server.ts")) {
  const port = Number(process.env.PORT || 8787);
  serve({ fetch: app.fetch, port });
  console.log(`lbcode-backend on http://localhost:${port}`);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd /home/luan/teste/lbcodeia.os/server && npm test`
Expected: PASS (2 testes). O teste de `/api/skills/run` rejeita antes de chamar o SDK, então não gasta token.

- [ ] **Step 5: Smoke manual do server**

Run (terminal 1): `cd /home/luan/teste/lbcodeia.os/server && ANTHROPIC_API_KEY=<chave> npm run dev`
Run (terminal 2): `curl -s http://localhost:8787/api/contas`
Expected: JSON com Dordrian Store.

Run (terminal 2): `curl -N -X POST http://localhost:8787/api/skills/run -H 'Content-Type: application/json' -d '{"skill":"lb-meta-copy","cliente":"Dordrian Store","input":"anúncio de tênis"}'`
Expected: stream de eventos SSE (`event: status`, `event: chunk` …, `event: done`).

- [ ] **Step 6: Commit**

```bash
cd /home/luan/teste/lbcodeia.os
git add server/src/server.ts server/src/server.test.ts
git commit -m "feat(server): Hono com SSE /api/skills/run e GET /api/contas"
```

---

## Task 6: Cliente de streaming no front

**Files:**
- Create: `lbcode-ad-pilot/src/lib/skill-client.ts`

> Front não tem test runner; verificação é manual (Task 7). Manter este módulo pequeno e puro o suficiente para ler de relance.

- [ ] **Step 1: Implementar skill-client.ts**

Create `/home/luan/teste/lbcode-ad-pilot/src/lib/skill-client.ts`:

```typescript
export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string };

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

export type Conta = {
  cliente: string;
  metaAdAccount: string;
  handleIg: string;
  ativo: boolean;
};

export async function fetchContas(): Promise<Conta[]> {
  const res = await fetch(`${BACKEND}/api/contas`);
  if (!res.ok) throw new Error("Falha ao carregar contas");
  return res.json();
}

/** Abre o stream SSE e chama onEvent para cada evento da skill. */
export async function runSkill(
  body: { skill: string; cliente: string; input: string },
  onEvent: (ev: SkillEvent) => void,
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/skills/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    onEvent({ type: "error", text: msg || `HTTP ${res.status}` });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE: eventos separados por linha em branco; usamos só a linha "data:".
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      try {
        onEvent(JSON.parse(dataLine.slice(5).trim()) as SkillEvent);
      } catch {
        // ignora frames malformados
      }
    }
  }
}
```

- [ ] **Step 2: Configurar a URL do backend**

Create `/home/luan/teste/lbcode-ad-pilot/.env.local` (se ainda não existir) com:

```
VITE_BACKEND_URL=http://localhost:8787
```

- [ ] **Step 3: Verificação de tipos**

Run: `cd /home/luan/teste/lbcode-ad-pilot && npx tsc --noEmit`
Expected: sem erro novo introduzido por `skill-client.ts`.

- [ ] **Step 4: Commit**

```bash
cd /home/luan/teste/lbcode-ad-pilot
git add src/lib/skill-client.ts .env.local
git commit -m "feat(front): cliente de streaming p/ backend de skills"
```

> Nota: confirmar se `.env.local` está no `.gitignore` do front. Se estiver (padrão Vite), versionar `.env.local.example` no lugar e deixar `.env.local` local.

---

## Task 7: Ligar a tela /gerador-copy ao stream

**Files:**
- Modify: `lbcode-ad-pilot/src/routes/gerador-copy.tsx`

- [ ] **Step 1: Reescrever gerador-copy.tsx**

Replace todo o conteúdo de `/home/luan/teste/lbcode-ad-pilot/src/routes/gerador-copy.tsx` por:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta } from "@/lib/skill-client";
import { Copy, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/gerador-copy")({
  head: () => ({ meta: [{ title: "Gerador de Copy — LBCode Ads" }, { name: "description", content: "Gere copys a partir dos criativos top performers." }] }),
  component: GeradorCopy,
});

function GeradorCopy() {
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
      .then((cs) => {
        setContas(cs);
        if (cs[0]) setCliente(cs[0].cliente);
      })
      .catch(() => setErro("Não consegui carregar as contas (backend no ar?)."));
  }, []);

  const gerar = async () => {
    setRunning(true);
    setOutput("");
    setStatus("Iniciando…");
    setErro("");
    await runSkill({ skill: "lb-meta-copy", cliente, input: briefing }, (ev) => {
      if (ev.type === "status") setStatus(ev.text);
      else if (ev.type === "chunk") setOutput((o) => o + ev.text);
      else if (ev.type === "error") setErro(ev.text);
      else if (ev.type === "done") setStatus("");
    });
    setRunning(false);
  };

  const copiar = () => {
    navigator.clipboard?.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PageHeader title="Gerador de Copy" subtitle="A partir dos seus anúncios que mais convertem, gere novas variações." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Cliente</label>
            <select
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
            <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Briefing</label>
            <textarea
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              rows={5}
              placeholder="Ex: anúncio de tênis de corrida, foco em conforto"
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
            />
          </div>
          <Button onClick={gerar} disabled={running || !cliente}>
            {running ? "Gerando…" : "Gerar copy"}
          </Button>
          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles size={16} className="text-primary" /> Copy gerada</h3>
            {output && (
              <button onClick={copiar} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Copy size={12} /> {copied ? "Copiado" : "Copiar tudo"}
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
            !status && <p className="text-[13px] text-muted-foreground">Escolha o cliente, escreva o briefing e clique em Gerar.</p>
          )}
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verificação de tipos**

Run: `cd /home/luan/teste/lbcode-ad-pilot && npx tsc --noEmit`
Expected: sem erro. Se `Button` não aceitar `onClick`/`disabled`, conferir a assinatura em `src/components/app-shell.tsx:230` e ajustar (passar via props nativas de `<button>`).

- [ ] **Step 3: E2E manual (o teste de aceitação do MVP)**

1. Terminal 1: `cd /home/luan/teste/lbcodeia.os/server && ANTHROPIC_API_KEY=<chave> npm run dev`
2. Terminal 2: `cd /home/luan/teste/lbcode-ad-pilot && npm run dev`
3. Abrir a tela `/gerador-copy` no browser.
4. Conferir: dropdown lista "Dordrian Store".
5. Escrever um briefing, clicar "Gerar copy".
6. Observar status ("Puxando top performers…") e a copy aparecendo em stream.
7. Botão "Copiar tudo" copia o texto.

Expected: copy real gerada pela skill via Claude, baseada no fixture, renderizada na tela.

- [ ] **Step 4: Commit**

```bash
cd /home/luan/teste/lbcode-ad-pilot
git add src/routes/gerador-copy.tsx
git commit -m "feat(front): liga /gerador-copy ao backend de skills (stream real)"
```

---

## Self-Review (preenchido na escrita do plano)

- **Cobertura do spec:** Arquitetura (Tasks 2,4,5), fronteira front↔backend (Tasks 5,6), fluxo MVP lb-meta-copy (Tasks 1,4,7), fixture/stub (Task 1), parser contas-ads (Task 3), tratamento de erros (runner try/catch + validação no server + erro na UI), testes (unit Python/vitest + e2e manual). Coberto.
- **Segurança:** `ANTHROPIC_API_KEY` só em env do backend, nunca no front nem em log; token Meta nunca tocado (fixture). `permissionMode: bypassPermissions` é aceitável pois `allowedTools` é restrito e o cwd é o repo controlado.
- **Riscos conhecidos:** (1) shape exato de `SDKMessage` do SDK instalado — mitigado pelo Step 5 da Task 4 (checar `.d.ts`). (2) versão `@anthropic-ai/claude-agent-sdk` — mitigado no Step 4 da Task 2. (3) front sem test runner — mitigado por e2e manual explícito.

## Fora de escopo (YAGNI)

Multi-tenant/auth, conexão Meta ao vivo, persistência de histórico, as outras 41 skills, editor de sites, `/assistente`.
