# Identidade da Marca — Tipografia, Tom de Voz e Paleta Editável Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the "Em breve" Tipografia and Tom de voz sections on `/identidade` into working editors, and turn the hardcoded color palette into an editable, persisted one with color-math-based suggestions.

**Architecture:** Backend gains pure markdown-section helpers (`getSection`/`replaceSection`) used to read/write narrow slices of two existing files — `identidade/design-guide.md` (palette + typography) and `_memoria/preferencias.md` (tone of voice, mirrored not duplicated) — without touching the rest of either file. Frontend replaces the static array and placeholder copy with fetch/PUT-backed UI; color suggestions are computed client-side with HSL math, no network/AI call.

**Tech Stack:** Hono (backend routes), Vitest (backend tests), React + TanStack Router (frontend), no frontend test runner configured (verify via `tsc --noEmit` + manual browser check).

## Global Constraints

- New routes have no path-traversal guard — `design-guide.md` and `preferencias.md` are fixed repo paths, never id/filename from the client (spec: "Backend" section).
- Tom de voz is **not** a new data store — it reads/writes the existing `## Tom de voz` / `## O que evitar` sections of `_memoria/preferencias.md` verbatim (raw markdown block, no field-splitting).
- Color suggestions are pure client-side HSL math — no AI call, no backend round-trip.
- Typography picker is a curated fixed list of 12 Google Fonts — no search, no arbitrary font name input.
- Out of scope (do not implement): logo upload/replace, reference gallery edits, auto-applying chosen font/color to already-generated carrosséis, renaming original (non-suggested) palette labels, full Google Fonts catalog/search.

---

## Task 1: Markdown section helpers (`getSection` / `replaceSection`)

**Files:**
- Modify: `server/src/identidade.ts`
- Test: `server/src/identidade.test.ts` (new file)

**Interfaces:**
- Produces: `getSection(md: string, heading: string): string` — throws `Error('Seção "X" não encontrada')` if heading absent, otherwise returns the trimmed body between `## {heading}` and the next `## ` (or EOF).
- Produces: `replaceSection(md: string, heading: string, newBody: string): string` — same lookup, replaces only that section's body, leaves heading line and the rest of the document (including the blank line separating sections) untouched. Throws the same error if heading absent.

- [ ] **Step 1: Write the failing tests**

Create `server/src/identidade.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getSection, replaceSection } from "./identidade.js";

const SAMPLE = `# Doc

## Cores
- Primária: Azul — confirmar hex exato
- Fundo: escuro ou branco clean (minimalista)
- Acento: a definir

## Tipografia
A definir — confirmar com material de identidade quando disponível.

## Elementos
- Minimalismo
`;

describe("getSection", () => {
  it("extrai o corpo de uma seção do meio do arquivo", () => {
    expect(getSection(SAMPLE, "Cores")).toBe(
      "- Primária: Azul — confirmar hex exato\n- Fundo: escuro ou branco clean (minimalista)\n- Acento: a definir",
    );
  });

  it("extrai o corpo de uma seção que não é a última", () => {
    expect(getSection(SAMPLE, "Tipografia")).toBe(
      "A definir — confirmar com material de identidade quando disponível.",
    );
  });

  it("lança erro quando a seção não existe", () => {
    expect(() => getSection(SAMPLE, "Não Existe")).toThrow('Seção "Não Existe" não encontrada');
  });
});

describe("replaceSection", () => {
  it("substitui só a seção alvo, preservando as vizinhas", () => {
    const updated = replaceSection(SAMPLE, "Cores", "- Fundo: #07070F\n- Roxo neon: #A24BFF");
    expect(getSection(updated, "Cores")).toBe("- Fundo: #07070F\n- Roxo neon: #A24BFF");
    expect(getSection(updated, "Tipografia")).toBe(
      "A definir — confirmar com material de identidade quando disponível.",
    );
    expect(getSection(updated, "Elementos")).toBe("- Minimalismo");
  });

  it("mantém exatamente uma linha em branco antes da próxima seção", () => {
    const updated = replaceSection(SAMPLE, "Cores", "- Fundo: #07070F");
    expect(updated).toContain("- Fundo: #07070F\n\n## Tipografia");
  });

  it("lança erro quando a seção não existe", () => {
    expect(() => replaceSection(SAMPLE, "Não Existe", "x")).toThrow('Seção "Não Existe" não encontrada');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: FAIL — `getSection`/`replaceSection` not exported from `./identidade.js`.

- [ ] **Step 3: Implement**

Add to `server/src/identidade.ts` (after the existing imports, before `export type IdentidadeArquivo`):

```ts
export function getSection(md: string, heading: string): string {
  const re = new RegExp(`^## ${heading}[ \\t]*\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  const match = md.match(re);
  if (!match) throw new Error(`Seção "${heading}" não encontrada`);
  return match[1].trim();
}

export function replaceSection(md: string, heading: string, newBody: string): string {
  const re = new RegExp(`(^## ${heading}[ \\t]*\\n)([\\s\\S]*?)(?=\\n## |$)`, "m");
  if (!re.test(md)) throw new Error(`Seção "${heading}" não encontrada`);
  return md.replace(re, (_m, headingLine: string) => `${headingLine}${newBody.trim()}\n`);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/identidade.ts server/src/identidade.test.ts
git commit -m "feat(server): helpers de leitura/escrita de seção markdown"
```

---

## Task 2: Paleta de cores (parse/serialize + read/write em design-guide.md)

**Files:**
- Modify: `server/src/identidade.ts`
- Test: `server/src/identidade.test.ts`

**Interfaces:**
- Consumes: `getSection`, `replaceSection` (Task 1).
- Produces: `type CorMarca = { hex: string; label: string }`; `parsePaleta(md: string): CorMarca[]`; `serializePaleta(paleta: CorMarca[]): string`; `readPaleta(): Promise<CorMarca[]>`; `writePaleta(paleta: CorMarca[]): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Add to `server/src/identidade.test.ts` (new `vi.mock` block at the top of the file, before the existing imports — Vitest hoists `vi.mock` calls, but keep it physically at the top for readability):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", async () => {
  const actual = await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises");
  return { ...actual, readFile: vi.fn(), writeFile: vi.fn() };
});

import { readFile, writeFile } from "node:fs/promises";
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => vi.clearAllMocks());
```

(This replaces the plain `import { describe, it, expect } from "vitest";` line from Task 1 — the rest of Task 1's tests keep working since `getSection`/`replaceSection` are pure and don't touch the filesystem.)

Then add:

```ts
import { parsePaleta, serializePaleta, readPaleta, writePaleta, type CorMarca } from "./identidade.js";

const DESIGN_GUIDE_COM_PALETA = `# Identidade Visual

## Cores
- Fundo: #07070F
- Roxo neon: #A24BFF
- Ciano neon: #29C5FF

## Tipografia
A definir.
`;

const DESIGN_GUIDE_SEM_PALETA = `# Identidade Visual

## Cores
- Primária: Azul — confirmar hex exato
- Fundo: escuro ou branco clean (minimalista)

## Tipografia
A definir.
`;

describe("parsePaleta", () => {
  it("lê linhas no formato '- Label: #hex'", () => {
    expect(parsePaleta(DESIGN_GUIDE_COM_PALETA)).toEqual([
      { label: "Fundo", hex: "#07070F" },
      { label: "Roxo neon", hex: "#A24BFF" },
      { label: "Ciano neon", hex: "#29C5FF" },
    ]);
  });

  it("ignora linhas fora do formato (texto legado)", () => {
    expect(parsePaleta(DESIGN_GUIDE_SEM_PALETA)).toEqual([]);
  });
});

describe("serializePaleta", () => {
  it("round-trip com parsePaleta", () => {
    const paleta: CorMarca[] = [{ label: "Fundo", hex: "#07070F" }, { label: "Acento", hex: "#FF00AA" }];
    expect(parsePaleta(`## Cores\n${serializePaleta(paleta)}\n\n## Tipografia\nx`)).toEqual(paleta);
  });
});

describe("readPaleta", () => {
  it("retorna a paleta parseada quando o arquivo já está no formato novo", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_PALETA as never);
    const paleta = await readPaleta();
    expect(paleta).toEqual([
      { label: "Fundo", hex: "#07070F" },
      { label: "Roxo neon", hex: "#A24BFF" },
      { label: "Ciano neon", hex: "#29C5FF" },
    ]);
  });

  it("retorna o fallback hardcoded quando a seção ainda está no formato legado", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_SEM_PALETA as never);
    const paleta = await readPaleta();
    expect(paleta.length).toBe(5);
    expect(paleta[0]).toEqual({ hex: "#07070F", label: "Fundo" });
  });
});

describe("writePaleta", () => {
  it("regrava a seção Cores preservando o resto do arquivo", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_PALETA as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writePaleta([{ label: "Nova", hex: "#112233" }]);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("- Nova: #112233");
    expect(written).toContain("## Tipografia\nA definir.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: FAIL — `parsePaleta`/`serializePaleta`/`readPaleta`/`writePaleta` not exported.

- [ ] **Step 3: Implement**

Add to `server/src/identidade.ts`, after the `getSection`/`replaceSection` functions from Task 1:

```ts
const DESIGN_GUIDE_PATH = join(IDENTIDADE_ROOT, "design-guide.md");

export type CorMarca = { hex: string; label: string };

const PALETA_LINE_RE = /^- (.+?): (#[0-9a-fA-F]{3,8})$/;

const PALETA_FALLBACK: CorMarca[] = [
  { hex: "#07070F", label: "Fundo" },
  { hex: "#A24BFF", label: "Roxo neon" },
  { hex: "#29C5FF", label: "Ciano neon" },
  { hex: "#FFFFFF", label: "Texto principal" },
  { hex: "#C9C9D6", label: "Texto secundário" },
];

export function parsePaleta(md: string): CorMarca[] {
  const body = getSection(md, "Cores");
  return body
    .split("\n")
    .map((line) => line.match(PALETA_LINE_RE))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ label: m[1].trim(), hex: m[2] }));
}

export function serializePaleta(paleta: CorMarca[]): string {
  return paleta.map((c) => `- ${c.label}: ${c.hex}`).join("\n");
}

export async function readPaleta(): Promise<CorMarca[]> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  const paleta = parsePaleta(md);
  return paleta.length > 0 ? paleta : PALETA_FALLBACK;
}

export async function writePaleta(paleta: CorMarca[]): Promise<void> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  await writeFile(DESIGN_GUIDE_PATH, replaceSection(md, "Cores", serializePaleta(paleta)), "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add server/src/identidade.ts server/src/identidade.test.ts
git commit -m "feat(server): paleta de cores editável persistida em design-guide.md"
```

---

## Task 3: Tipografia (parse/serialize + read/write em design-guide.md)

**Files:**
- Modify: `server/src/identidade.ts`
- Test: `server/src/identidade.test.ts`

**Interfaces:**
- Consumes: `getSection`, `replaceSection` (Task 1), `DESIGN_GUIDE_PATH` (Task 2).
- Produces: `type Tipografia = { titulo: string | null; corpo: string | null }`; `parseTipografia(md: string): Tipografia`; `serializeTipografia(t: Tipografia): string`; `readTipografia(): Promise<Tipografia>`; `writeTipografia(t: Tipografia): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Add to `server/src/identidade.test.ts`:

```ts
import { parseTipografia, serializeTipografia, readTipografia, writeTipografia, type Tipografia } from "./identidade.js";

const DESIGN_GUIDE_COM_FONTES = `## Cores
- Fundo: #07070F

## Tipografia
- Título: Poppins
- Corpo: Inter

## Elementos
- x
`;

describe("parseTipografia", () => {
  it("lê título e corpo quando ambos definidos", () => {
    expect(parseTipografia(DESIGN_GUIDE_COM_FONTES)).toEqual({ titulo: "Poppins", corpo: "Inter" });
  });

  it("retorna null pros dois quando a seção está em texto livre legado", () => {
    expect(parseTipografia(DESIGN_GUIDE_SEM_PALETA)).toEqual({ titulo: null, corpo: null });
  });
});

describe("serializeTipografia", () => {
  it("round-trip com parseTipografia quando ambos definidos", () => {
    const t: Tipografia = { titulo: "Sora", corpo: "Manrope" };
    expect(parseTipografia(`## Cores\nx\n\n## Tipografia\n${serializeTipografia(t)}\n\n## Y\nz`)).toEqual(t);
  });

  it("round-trip quando um campo é null (não inventa o outro de volta)", () => {
    const t: Tipografia = { titulo: "Sora", corpo: null };
    expect(parseTipografia(`## Cores\nx\n\n## Tipografia\n${serializeTipografia(t)}\n\n## Y\nz`)).toEqual(t);
  });
});

describe("readTipografia / writeTipografia", () => {
  it("readTipografia lê do design-guide.md", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    expect(await readTipografia()).toEqual({ titulo: "Poppins", corpo: "Inter" });
  });

  it("writeTipografia regrava só a seção Tipografia", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writeTipografia({ titulo: "Outfit", corpo: "Lexend" });

    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("- Título: Outfit");
    expect(written).toContain("- Corpo: Lexend");
    expect(written).toContain("- Fundo: #07070F");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: FAIL — new exports missing.

- [ ] **Step 3: Implement**

Add to `server/src/identidade.ts`, after the palette functions from Task 2:

```ts
export type Tipografia = { titulo: string | null; corpo: string | null };

export function parseTipografia(md: string): Tipografia {
  const body = getSection(md, "Tipografia");
  return {
    titulo: body.match(/^- Título: (.+)$/m)?.[1]?.trim() ?? null,
    corpo: body.match(/^- Corpo: (.+)$/m)?.[1]?.trim() ?? null,
  };
}

export function serializeTipografia(t: Tipografia): string {
  const lines: string[] = [];
  if (t.titulo) lines.push(`- Título: ${t.titulo}`);
  if (t.corpo) lines.push(`- Corpo: ${t.corpo}`);
  return lines.length > 0
    ? lines.join("\n")
    : "A definir — confirmar com material de identidade quando disponível.";
}

export async function readTipografia(): Promise<Tipografia> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  return parseTipografia(md);
}

export async function writeTipografia(t: Tipografia): Promise<void> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  await writeFile(DESIGN_GUIDE_PATH, replaceSection(md, "Tipografia", serializeTipografia(t)), "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add server/src/identidade.ts server/src/identidade.test.ts
git commit -m "feat(server): tipografia editável persistida em design-guide.md"
```

---

## Task 4: Tom de voz (read/write espelhado em preferencias.md)

**Files:**
- Modify: `server/src/identidade.ts`
- Test: `server/src/identidade.test.ts`

**Interfaces:**
- Consumes: `getSection`, `replaceSection` (Task 1).
- Produces: `type TomDeVoz = { tomDeVoz: string; evitar: string }`; `readTomDeVoz(): Promise<TomDeVoz>`; `writeTomDeVoz(data: TomDeVoz): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Add to `server/src/identidade.test.ts`:

```ts
import { readTomDeVoz, writeTomDeVoz } from "./identidade.js";

const PREFERENCIAS_SAMPLE = `# Preferências

## Tom de voz

Direto, objetivo, focado em ROI.

**Exemplo real (P11):**
> "Sua empresa não precisa trabalhar mais."

## O que evitar
- "vamos juntos"
- "sinergia"

## Frequência de conteúdo
- 3 posts/semana
`;

describe("readTomDeVoz / writeTomDeVoz", () => {
  it("lê as duas seções como markdown raw", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    const data = await readTomDeVoz();
    expect(data.tomDeVoz).toContain("Direto, objetivo, focado em ROI.");
    expect(data.tomDeVoz).toContain("Exemplo real (P11)");
    expect(data.evitar).toBe('- "vamos juntos"\n- "sinergia"');
  });

  it("escreve as duas seções preservando Frequência de conteúdo intacta", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writeTomDeVoz({ tomDeVoz: "Novo tom.", evitar: '- "buzzword"' });

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("## Tom de voz\n\nNovo tom.\n");
    expect(written).toContain('## O que evitar\n- "buzzword"\n');
    expect(written).toContain("## Frequência de conteúdo\n- 3 posts/semana");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: FAIL — `readTomDeVoz`/`writeTomDeVoz` not exported.

- [ ] **Step 3: Implement**

Add to `server/src/identidade.ts`, after the typography functions from Task 3:

```ts
const PREFERENCIAS_PATH = join(REPO_ROOT, "_memoria", "preferencias.md");

export type TomDeVoz = { tomDeVoz: string; evitar: string };

export async function readTomDeVoz(): Promise<TomDeVoz> {
  const md = await readFile(PREFERENCIAS_PATH, "utf-8");
  return { tomDeVoz: getSection(md, "Tom de voz"), evitar: getSection(md, "O que evitar") };
}

export async function writeTomDeVoz(data: TomDeVoz): Promise<void> {
  const md = await readFile(PREFERENCIAS_PATH, "utf-8");
  const withTom = replaceSection(md, "Tom de voz", data.tomDeVoz);
  const withEvitar = replaceSection(withTom, "O que evitar", data.evitar);
  await writeFile(PREFERENCIAS_PATH, withEvitar, "utf-8");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add server/src/identidade.ts server/src/identidade.test.ts
git commit -m "feat(server): tom de voz espelhado de preferencias.md"
```

---

## Task 5: Rotas — estender GET /api/identidade + 4 rotas novas

**Files:**
- Modify: `server/src/identidade.ts` (`listIdentidade` + `IdentidadeData` type)
- Modify: `server/src/server.ts`
- Test: `server/src/identidade.test.ts`

**Interfaces:**
- Consumes: `readPaleta`, `writePaleta`, `readTipografia`, `writeTipografia`, `readTomDeVoz`, `writeTomDeVoz` (Tasks 2-4).
- Produces: `GET /api/identidade` now also returns `paleta: CorMarca[]`, `tipografia: Tipografia`. New routes: `PUT /api/identidade/paleta`, `PUT /api/identidade/tipografia`, `GET /api/identidade/tom-de-voz`, `PUT /api/identidade/tom-de-voz`.

- [ ] **Step 1: Write the failing tests**

Add to `server/src/identidade.test.ts`:

```ts
import { app } from "./server.js";

describe("GET /api/identidade (estendido)", () => {
  it("inclui paleta e tipografia no payload", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    const res = await app.request("/api/identidade");
    expect(res.status).toBe(200);
    const body = await res.json() as { paleta: CorMarca[]; tipografia: Tipografia };
    expect(body.paleta).toEqual([{ label: "Fundo", hex: "#07070F" }]);
    expect(body.tipografia).toEqual({ titulo: "Poppins", corpo: "Inter" });
  });
});

describe("PUT /api/identidade/paleta", () => {
  it("salva e retorna ok", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    mockWriteFile.mockResolvedValue(undefined);

    const res = await app.request("/api/identidade/paleta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paleta: [{ label: "X", hex: "#000000" }] }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("500 quando a escrita falha", async () => {
    mockReadFile.mockRejectedValue(new Error("disco cheio"));

    const res = await app.request("/api/identidade/paleta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paleta: [] }),
    });

    expect(res.status).toBe(500);
  });
});

describe("PUT /api/identidade/tipografia", () => {
  it("salva e retorna ok", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    mockWriteFile.mockResolvedValue(undefined);

    const res = await app.request("/api/identidade/tipografia", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "Sora", corpo: null }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});

describe("GET/PUT /api/identidade/tom-de-voz", () => {
  it("GET retorna as duas seções", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    const res = await app.request("/api/identidade/tom-de-voz");
    expect(res.status).toBe(200);
    const body = await res.json() as { tomDeVoz: string; evitar: string };
    expect(body.evitar).toBe('- "vamos juntos"\n- "sinergia"');
  });

  it("PUT salva e retorna ok", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    mockWriteFile.mockResolvedValue(undefined);

    const res = await app.request("/api/identidade/tom-de-voz", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tomDeVoz: "Novo.", evitar: "- x" }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: FAIL — routes don't exist yet, `listIdentidade` doesn't return `paleta`/`tipografia`.

- [ ] **Step 3: Implement — extend `listIdentidade`**

In `server/src/identidade.ts`, change:

```ts
export type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
};
```

to:

```ts
export type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
  paleta: CorMarca[];
  tipografia: Tipografia;
};
```

And change the end of `listIdentidade`:

```ts
  return {
    logo: logo ? { nome: logo, label: "Logo" } : null,
    refs: refs.map((f) => ({ nome: f, label: labelFromFilename(f) })),
  };
}
```

to:

```ts
  let paleta = PALETA_FALLBACK;
  let tipografia: Tipografia = { titulo: null, corpo: null };
  try {
    const designGuide = await readFile(DESIGN_GUIDE_PATH, "utf-8");
    const parsedPaleta = parsePaleta(designGuide);
    paleta = parsedPaleta.length > 0 ? parsedPaleta : PALETA_FALLBACK;
    tipografia = parseTipografia(designGuide);
  } catch { /* design-guide.md ausente — usa defaults */ }

  return {
    logo: logo ? { nome: logo, label: "Logo" } : null,
    refs: refs.map((f) => ({ nome: f, label: labelFromFilename(f) })),
    paleta,
    tipografia,
  };
}
```

- [ ] **Step 4: Implement — rotas em `server.ts`**

In `server/src/server.ts`, update the import on line 13:

```ts
import { listIdentidade, readIdentidadeArquivo, listInspiracoes, saveInspiracao, readInspiracao } from "./identidade.js";
```

to:

```ts
import {
  listIdentidade, readIdentidadeArquivo, listInspiracoes, saveInspiracao, readInspiracao,
  writePaleta, writeTipografia, readTomDeVoz, writeTomDeVoz,
  type CorMarca, type Tipografia,
} from "./identidade.js";
```

(`writePaleta`/`writeTipografia`/`readTomDeVoz`/`writeTomDeVoz` are the only new functions `server.ts` calls directly — `listIdentidade` already does its own internal palette/typography parsing from Task 5 Step 3, so `readPaleta`/`readTipografia` don't need to be imported here.)

Then add, right after the existing `app.get("/api/identidade/arquivo", ...)` block:

```ts
app.put("/api/identidade/paleta", async (c) => {
  try {
    const { paleta } = await c.req.json<{ paleta: CorMarca[] }>();
    await writePaleta(paleta);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.put("/api/identidade/tipografia", async (c) => {
  try {
    const tipografia = await c.req.json<Tipografia>();
    await writeTipografia(tipografia);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.get("/api/identidade/tom-de-voz", async (c) => {
  try {
    return c.json(await readTomDeVoz());
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.put("/api/identidade/tom-de-voz", async (c) => {
  try {
    const data = await c.req.json<{ tomDeVoz: string; evitar: string }>();
    await writeTomDeVoz(data);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npx vitest run src/identidade.test.ts`
Expected: PASS (all tests).

Run full backend suite to check no regression: `cd server && npx vitest run`
Expected: PASS (all files, including pre-existing `server.test.ts` which hits the real filesystem for `GET /api/identidade` — its assertions only check `logo`/`refs` exist, unaffected by the new fields).

- [ ] **Step 6: Commit**

```bash
git add server/src/identidade.ts server/src/server.ts server/src/identidade.test.ts
git commit -m "feat(server): rotas de paleta, tipografia e tom de voz na Identidade"
```

---

## Task 6: Frontend — utilitário puro de sugestão de cores (HSL)

**Files:**
- Create: `frontend/src/lib/cor-sugestoes.ts`

**Interfaces:**
- Produces: `type CorMarca = { hex: string; label: string }`; `sugerirCoresRelacionadas(paleta: CorMarca[]): string[]` — returns up to 6 new hex strings (uppercase `#RRGGBB`), excluding any hex already present in `paleta`.

No automated test for this file — project has no frontend test runner configured (confirmed: no `vitest` in `frontend/package.json`, no `.test.` files under `frontend/src`). Verify manually via the browser in Task 7.

- [ ] **Step 1: Implement**

```ts
export type CorMarca = { hex: string; label: string };

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const cVal = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = cVal * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - cVal / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [cVal, x, 0];
  else if (h < 120) [r, g, b] = [x, cVal, 0];
  else if (h < 180) [r, g, b] = [0, cVal, x];
  else if (h < 240) [r, g, b] = [0, x, cVal];
  else if (h < 300) [r, g, b] = [x, 0, cVal];
  else [r, g, b] = [cVal, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function sugerirCoresRelacionadas(paleta: CorMarca[]): string[] {
  const existentes = new Set(paleta.map((c) => c.hex.toUpperCase()));
  const candidatas: string[] = [];
  for (const cor of paleta) {
    const [h, s, l] = hexToHsl(cor.hex);
    candidatas.push(hslToHex((h + 180) % 360, s, l));
    candidatas.push(hslToHex((h + 30) % 360, s, l));
    candidatas.push(hslToHex(h, s, Math.min(100, l + 20)));
  }
  return [...new Set(candidatas)].filter((hex) => !existentes.has(hex)).slice(0, 6);
}
```

- [ ] **Step 2: Sanity-check in isolation**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new type errors from this file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/cor-sugestoes.ts
git commit -m "feat(frontend): sugestão de cores relacionadas via matemática HSL"
```

---

## Task 7: Frontend — Paleta de cores editável

**Files:**
- Modify: `frontend/src/routes/identidade.tsx`

**Interfaces:**
- Consumes: `sugerirCoresRelacionadas`, `type CorMarca` (Task 6); `GET /api/identidade` (now returns `paleta`), `PUT /api/identidade/paleta` (Task 5).

- [ ] **Step 1: Update imports and remove the hardcoded array**

Old string:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Check, X } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type IdentidadeArquivo = { nome: string; label: string };
type IdentidadeData = { logo: IdentidadeArquivo | null; refs: IdentidadeArquivo[] };

const BRAND_COLORS = [
  { hex: "#07070F", label: "Fundo" },
  { hex: "#A24BFF", label: "Roxo neon" },
  { hex: "#29C5FF", label: "Ciano neon" },
  { hex: "#FFFFFF", label: "Texto principal" },
  { hex: "#C9C9D6", label: "Texto secundário" },
];
```

New string:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Check, X, Plus } from "lucide-react";
import { sugerirCoresRelacionadas, type CorMarca } from "@/lib/cor-sugestoes";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type IdentidadeArquivo = { nome: string; label: string };
type Tipografia = { titulo: string | null; corpo: string | null };
type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
  paleta: CorMarca[];
  tipografia: Tipografia;
};
```

- [ ] **Step 2: Add palette state and wire it from the existing fetch**

Old string:

```ts
function IdentidadePage() {
  const [data, setData] = useState<IdentidadeData | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade`)
      .then((r) => r.json() as Promise<IdentidadeData>)
      .then(setData)
      .catch(() => {});
  }, []);
```

New string:

```ts
function IdentidadePage() {
  const [data, setData] = useState<IdentidadeData | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [paleta, setPaleta] = useState<CorMarca[]>([]);
  const [mostrarAddCor, setMostrarAddCor] = useState(false);
  const [novaCor, setNovaCor] = useState({ hex: "#000000", label: "" });
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade`)
      .then((r) => r.json() as Promise<IdentidadeData>)
      .then((d) => {
        setData(d);
        setPaleta(d.paleta);
      })
      .catch(() => {});
  }, []);

  async function persistirPaleta(nova: CorMarca[]) {
    setPaleta(nova);
    setSugestoes((s) => s.filter((hex) => !nova.some((c) => c.hex.toUpperCase() === hex.toUpperCase())));
    try {
      await fetch(`${BACKEND}/api/identidade/paleta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paleta: nova }),
      });
    } catch { /* mantém em memória; próxima ação do usuário tenta salvar de novo */ }
  }

  function removerCor(hex: string) {
    persistirPaleta(paleta.filter((c) => c.hex !== hex));
  }

  function confirmarAddCor() {
    if (!novaCor.label.trim()) return;
    persistirPaleta([...paleta, { hex: novaCor.hex, label: novaCor.label.trim() }]);
    setNovaCor({ hex: "#000000", label: "" });
    setMostrarAddCor(false);
  }

  function gerarSugestoes() {
    setSugestoes(sugerirCoresRelacionadas(paleta));
  }

  function adicionarSugestao(hex: string) {
    persistirPaleta([...paleta, { hex, label: "Sugestão" }]);
  }
```

- [ ] **Step 3: Replace the read-only palette section with the editable one**

Old string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Paleta de cores
          </h3>
          <div className="flex flex-wrap gap-3">
            {BRAND_COLORS.map((cor) => (
              <button
                key={cor.hex}
                onClick={() => copiarHex(cor.hex)}
                className="flex flex-col items-center gap-1.5 group"
                title={`Copiar ${cor.hex}`}
              >
                <div
                  className="w-14 h-14 rounded-lg border border-border shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: cor.hex }}
                />
                <span className="text-[11px] text-muted-foreground">{cor.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-0.5">
                  {copiado === cor.hex ? <Check size={9} className="text-green-500" /> : null}
                  {copiado === cor.hex ? "Copiado" : cor.hex}
                </span>
              </button>
            ))}
          </div>
        </section>
```

New string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Paleta de cores
          </h3>
          <div className="flex flex-wrap gap-3">
            {paleta.map((cor) => (
              <div key={cor.hex} className="relative flex flex-col items-center gap-1.5 group">
                <button
                  onClick={() => copiarHex(cor.hex)}
                  className="flex flex-col items-center gap-1.5"
                  title={`Copiar ${cor.hex}`}
                >
                  <div
                    className="w-14 h-14 rounded-lg border border-border shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: cor.hex }}
                  />
                  <span className="text-[11px] text-muted-foreground">{cor.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-0.5">
                    {copiado === cor.hex ? <Check size={9} className="text-green-500" /> : null}
                    {copiado === cor.hex ? "Copiado" : cor.hex}
                  </span>
                </button>
                <button
                  onClick={() => removerCor(cor.hex)}
                  title="Remover cor"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            {mostrarAddCor ? (
              <div className="flex flex-col items-center gap-1.5">
                <input
                  type="color"
                  value={novaCor.hex}
                  onChange={(e) => setNovaCor((c) => ({ ...c, hex: e.target.value }))}
                  className="w-14 h-14 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Nome da cor"
                  value={novaCor.label}
                  onChange={(e) => setNovaCor((c) => ({ ...c, label: e.target.value }))}
                  className="w-20 text-[11px] text-center bg-background border border-border rounded px-1"
                />
                <div className="flex gap-2">
                  <button onClick={confirmarAddCor} className="text-[10px] text-primary">Add</button>
                  <button onClick={() => setMostrarAddCor(false)} className="text-[10px] text-muted-foreground">Cancelar</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setMostrarAddCor(true)}
                className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                title="Adicionar cor"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          <div className="mt-3">
            <button onClick={gerarSugestoes} className="text-[12px] text-primary hover:underline">
              Sugerir cores relacionadas
            </button>
            {sugestoes.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {sugestoes.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => adicionarSugestao(hex)}
                    className="flex flex-col items-center gap-1 group"
                    title={`Adicionar ${hex} à paleta`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                    >
                      <Plus size={14} className="opacity-0 group-hover:opacity-90 text-white drop-shadow" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/70">{hex}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no type errors.

Run: `cd frontend && npm run dev` (and `cd server && npm run dev` in another shell), open `/identidade` in the browser:
- Palette renders from the API (still showing the same 5 fallback colors, since `design-guide.md` hasn't been migrated yet).
- Hover a swatch → "×" appears → click → swatch disappears, refresh page → stays gone (persisted).
- "+ Cor" → pick a color + type a label → "Add" → new swatch appears, persists across refresh.
- "Sugerir cores relacionadas" → up to 6 dashed swatches appear → click one → it joins the palette, persists across refresh.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/identidade.tsx
git commit -m "feat(frontend): paleta de cores editável com sugestões"
```

---

## Task 8: Frontend — Tipografia (picker + preview)

**Files:**
- Modify: `frontend/src/routes/identidade.tsx`

**Interfaces:**
- Consumes: `PUT /api/identidade/tipografia` (Task 5); `data.tipografia` already loaded into `IdentidadeData` (Task 7's fetch).

- [ ] **Step 1: Add typography state, font list and loader**

Old string:

```ts
  function gerarSugestoes() {
    setSugestoes(sugerirCoresRelacionadas(paleta));
  }

  function adicionarSugestao(hex: string) {
    persistirPaleta([...paleta, { hex, label: "Sugestão" }]);
  }
```

New string:

```ts
  function gerarSugestoes() {
    setSugestoes(sugerirCoresRelacionadas(paleta));
  }

  function adicionarSugestao(hex: string) {
    persistirPaleta([...paleta, { hex, label: "Sugestão" }]);
  }

  const [tipografia, setTipografia] = useState<Tipografia>({ titulo: null, corpo: null });

  useEffect(() => {
    if (data) setTipografia(data.tipografia);
  }, [data]);

  useEffect(() => {
    [tipografia.titulo, tipografia.corpo].forEach((fonte) => {
      if (!fonte || fontesCarregadas.has(fonte)) return;
      fontesCarregadas.add(fonte);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fonte)}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [tipografia.titulo, tipografia.corpo]);

  async function salvarTipografia(next: Tipografia) {
    setTipografia(next);
    try {
      await fetch(`${BACKEND}/api/identidade/tipografia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch { /* mantém em memória; próxima troca tenta salvar de novo */ }
  }
```

- [ ] **Step 2: Add the font list and the loaded-fonts cache above the component**

Old string:

```ts
function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}
```

New string:

```ts
function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}

const FONTES_GOOGLE = [
  "Inter", "Poppins", "Montserrat", "Roboto", "Sora", "Manrope",
  "Work Sans", "Playfair Display", "Space Grotesk", "DM Sans", "Outfit", "Lexend",
];

const fontesCarregadas = new Set<string>();
```

- [ ] **Step 3: Replace the Tipografia placeholder section**

Old string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tipografia
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Em breve — defina aqui as fontes da marca (título, corpo, destaque).
          </p>
        </section>
```

New string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tipografia
          </h3>
          <div className="flex flex-wrap gap-8">
            {([["titulo", "Título"], ["corpo", "Corpo"]] as const).map(([campo, rotulo]) => (
              <div key={campo}>
                <label className="text-[11px] text-muted-foreground block mb-1">{rotulo}</label>
                <select
                  value={tipografia[campo] ?? ""}
                  onChange={(e) => salvarTipografia({ ...tipografia, [campo]: e.target.value || null })}
                  className="text-[13px] bg-background border border-border rounded-md px-2 py-1.5"
                >
                  <option value="">Escolher fonte…</option>
                  {FONTES_GOOGLE.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {tipografia[campo] && (
                  <p className="text-xl mt-2" style={{ fontFamily: tipografia[campo] as string }}>
                    Aa Bb Cc 123
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no type errors.

In the browser at `/identidade`:
- Both selects start on "Escolher fonte…" (current `design-guide.md` has no `- Título:`/`- Corpo:` lines yet).
- Pick "Poppins" for Título → preview "Aa Bb Cc 123" renders in Poppins within ~1s (Google Fonts loads) → refresh page → selection persists.
- Pick a font for Corpo too → refresh → both persist independently.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/identidade.tsx
git commit -m "feat(frontend): picker de tipografia com preview"
```

---

## Task 9: Frontend — Tom de voz (mirror de preferencias.md)

**Files:**
- Modify: `frontend/src/routes/identidade.tsx`

**Interfaces:**
- Consumes: `GET /api/identidade/tom-de-voz`, `PUT /api/identidade/tom-de-voz` (Task 5).

- [ ] **Step 1: Add state and load/save logic**

Old string:

```ts
  async function salvarTipografia(next: Tipografia) {
    setTipografia(next);
    try {
      await fetch(`${BACKEND}/api/identidade/tipografia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch { /* mantém em memória; próxima troca tenta salvar de novo */ }
  }
```

New string:

```ts
  async function salvarTipografia(next: Tipografia) {
    setTipografia(next);
    try {
      await fetch(`${BACKEND}/api/identidade/tipografia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch { /* mantém em memória; próxima troca tenta salvar de novo */ }
  }

  type TomStatus = "loading" | "idle" | "saving" | "saved" | "error";
  const [tomDeVoz, setTomDeVoz] = useState("");
  const [evitar, setEvitar] = useState("");
  const [tomStatus, setTomStatus] = useState<TomStatus>("loading");
  const [tomErro, setTomErro] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade/tom-de-voz`)
      .then((r) => r.json() as Promise<{ tomDeVoz: string; evitar: string }>)
      .then((d) => {
        setTomDeVoz(d.tomDeVoz);
        setEvitar(d.evitar);
        setTomStatus("idle");
      })
      .catch(() => {
        setTomStatus("error");
        setTomErro("Não foi possível carregar.");
      });
  }, []);

  async function salvarTomDeVoz() {
    setTomStatus("saving");
    setTomErro("");
    try {
      const res = await fetch(`${BACKEND}/api/identidade/tom-de-voz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tomDeVoz, evitar }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setTomStatus("saved");
      setTimeout(() => setTomStatus("idle"), 2000);
    } catch (e) {
      setTomStatus("error");
      setTomErro(e instanceof Error ? e.message : "Erro desconhecido");
    }
  }
```

- [ ] **Step 2: Add `Loader2` to the icon import**

Old string:

```ts
import { Check, X, Plus } from "lucide-react";
```

New string:

```ts
import { Check, X, Plus, Loader2 } from "lucide-react";
```

- [ ] **Step 3: Replace the Tom de voz placeholder section**

Old string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tom de voz
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Em breve — descreva aqui o tom de voz, palavras-chave e o que evitar.
          </p>
        </section>
```

New string:

```tsx
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tom de voz
          </h3>
          <div className="flex flex-col gap-3 max-w-2xl">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Tom de voz</label>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] font-mono resize-y min-h-[140px]"
                value={tomDeVoz}
                onChange={(e) => setTomDeVoz(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">O que evitar</label>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] font-mono resize-y min-h-[100px]"
                value={evitar}
                onChange={(e) => setEvitar(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={salvarTomDeVoz}
                disabled={tomStatus === "saving"}
                className="text-[13px] font-semibold px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {tomStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
              {tomStatus === "saved" && (
                <span className="text-[12px] text-green-600 inline-flex items-center gap-1">
                  <Check size={13} /> Salvo
                </span>
              )}
              {tomStatus === "error" && <span className="text-[12px] text-destructive">{tomErro}</span>}
            </div>
          </div>
        </section>
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: no type errors.

In the browser at `/identidade`:
- Tom de voz / O que evitar textareas load with the exact current content of those two sections in `_memoria/preferencias.md` (including the "Exemplo real (P11)" blockquote inside "Tom de voz").
- Edit either, click "Salvar" → "Salvo" badge appears.
- Open `_memoria/preferencias.md` directly → confirm only those two sections changed, "Frequência de conteúdo" and "Objetivo principal com tráfego pago" untouched.
- Refresh `/identidade` → edited content persists.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/identidade.tsx
git commit -m "feat(frontend): tom de voz espelhado de preferencias.md na Identidade"
```

---

## Task 10: Verificação end-to-end manual

**Files:** none (verification only).

- [ ] **Step 1: Run full backend test suite**

Run: `cd server && npx vitest run`
Expected: PASS, all files including `identidade.test.ts` and the pre-existing `server.test.ts`.

- [ ] **Step 2: Type-check frontend**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual browser walkthrough**

With both `server` and `frontend` dev servers running, open `/identidade` and exercise, in order:
1. Add a custom color, remove a different one, generate suggestions and accept one — refresh after each action to confirm persistence in `identidade/design-guide.md` (`## Cores` section now has bullet lines, not the old prose).
2. Pick a Título font and a Corpo font, confirm the live preview text changes typeface, refresh to confirm persistence (`## Tipografia` section now has `- Título:`/`- Corpo:` lines).
3. Edit Tom de voz and O que evitar, save, refresh to confirm persistence in `_memoria/preferencias.md`, and confirm `/configuracoes` page (which shows the raw `preferencias.md` content) reflects the same edited text — proving it's the same underlying file, not a duplicate.

- [ ] **Step 4: Final commit (if any manual fixups were needed)**

```bash
git add -A
git commit -m "fix: ajustes pós-verificação manual do editor de identidade"
```

(Skip this commit if no fixups were needed.)
