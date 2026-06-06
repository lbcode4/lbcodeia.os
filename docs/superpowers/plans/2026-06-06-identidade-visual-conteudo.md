# Identidade Visual no Hub de Conteúdo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar tab Identidade Visual ao hub de conteúdo com logo, swatches de cores copiáveis, grade de referências com lightbox, e seção de inspirações por carrossel com upload drag & drop — mais atualização da skill lb-conteudo-carrossel para carregar inspirações automaticamente.

**Architecture:** Novo módulo `identidade.ts` no backend expõe funções para listar/servir `identidade/` e gerenciar `inspiracoes/` por carrossel. `carrosseis.ts` é atualizado para incluir contagem de inspirações. Frontend (`conteudo.tsx`) ganha a tab Identidade + componentes Lightbox, InspiracaoSection e badge nos cards.

**Tech Stack:** Hono (backend), React + TypeScript (frontend), Vitest (testes), Lucide React (ícones)

---

## File Map

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| CREATE | `server/src/identidade.ts` | listar/servir `identidade/`, listar/salvar/servir `inspiracoes/` por carrossel |
| MODIFY | `server/src/carrosseis.ts` | adicionar campo `inspiracoes: number` ao tipo e contagem na listagem |
| MODIFY | `server/src/server.ts` | registrar 5 novas rotas |
| MODIFY | `server/src/server.test.ts` | testes para as novas rotas |
| MODIFY | `frontend/src/routes/conteudo.tsx` | TabIdentidade, Lightbox, InspiracaoSection, badge nos cards |
| MODIFY | `.claude/skills/lb-conteudo-carrossel/SKILL.md` | bloco condicional de inspirações no Passo 0 |

---

## Task 1: Criar server/src/identidade.ts

**Files:**
- Create: `server/src/identidade.ts`

- [ ] **Step 1: Escrever o arquivo**

```typescript
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve, extname, basename } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const IDENTIDADE_ROOT = join(REPO_ROOT, "identidade");
const CARROSSEIS_ROOT = join(REPO_ROOT, "marketing", "conteudo", "carrossel");

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export type IdentidadeArquivo = { nome: string; label: string };

export type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
};

function labelFromFilename(nome: string): string {
  return basename(nome, extname(nome))
    .replace(/^ref-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveInspiracoes(carrosselId: string): string {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "inspiracoes"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  return safe;
}

export async function listIdentidade(): Promise<IdentidadeData> {
  let files: string[];
  try {
    files = await readdir(IDENTIDADE_ROOT);
  } catch {
    return { logo: null, refs: [] };
  }
  const imageFiles = files.filter((f) => IMAGE_EXTS.includes(extname(f).toLowerCase()));
  const logo = imageFiles.find((f) => /^logo/i.test(f));
  const refs = imageFiles.filter((f) => !/^logo/i.test(f));
  return {
    logo: logo ? { nome: logo, label: "Logo" } : null,
    refs: refs.map((f) => ({ nome: f, label: labelFromFilename(f) })),
  };
}

export async function readIdentidadeArquivo(filename: string): Promise<{ buf: Buffer; mime: string }> {
  const safe = resolve(join(IDENTIDADE_ROOT, filename));
  if (!safe.startsWith(resolve(IDENTIDADE_ROOT))) throw new Error("Caminho inválido");
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  return { buf: await readFile(safe) as Buffer, mime };
}

export async function listInspiracoes(carrosselId: string): Promise<string[]> {
  const dir = resolveInspiracoes(carrosselId);
  try {
    const files = await readdir(dir);
    return files.filter((f) => IMAGE_EXTS.includes(extname(f).toLowerCase())).sort();
  } catch {
    return [];
  }
}

export async function saveInspiracao(carrosselId: string, filename: string, data: Buffer): Promise<void> {
  const dir = resolveInspiracoes(carrosselId);
  await mkdir(dir, { recursive: true });
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  await writeFile(safe, data);
}

export async function readInspiracao(carrosselId: string, filename: string): Promise<{ buf: Buffer; mime: string }> {
  const dir = resolveInspiracoes(carrosselId);
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  return { buf: await readFile(safe) as Buffer, mime };
}
```

- [ ] **Step 2: Verificar TypeScript compila sem erros**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

---

## Task 2: Atualizar server/src/carrosseis.ts — adicionar campo inspiracoes

**Files:**
- Modify: `server/src/carrosseis.ts`

- [ ] **Step 1: Adicionar `inspiracoes: number` ao tipo `CarrosselMeta`**

Localizar:
```typescript
export type CarrosselMeta = {
  id: string;
  slides: string[]; // filenames inside instagram/
  legenda: string;
  titulo: string;
};
```

Substituir por:
```typescript
export type CarrosselMeta = {
  id: string;
  slides: string[]; // filenames inside instagram/
  legenda: string;
  titulo: string;
  inspiracoes: number;
};
```

- [ ] **Step 2: Adicionar import de `readdir` extra e contagem na função `listCarrosseis`**

No topo do arquivo, `readdir` já está importado. Adicionar `existsSync` não é necessário — usar try/catch.

Localizar o bloco dentro do loop `for (const d of dirs...)` onde `slides` é montado, APÓS o bloco `let legenda = ""`:

```typescript
    result.push({ id: d.name, slides, legenda, titulo: labelFromId(d.name) });
```

Substituir por:
```typescript
    let inspiracoes = 0;
    try {
      const inspiFiles = await readdir(join(campDir, "inspiracoes"));
      inspiracoes = inspiFiles.filter((f) =>
        [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase())
      ).length;
    } catch { /* sem pasta */ }

    result.push({ id: d.name, slides, legenda, titulo: labelFromId(d.name), inspiracoes });
```

O `extname` já está importado no topo do arquivo.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

---

## Task 3: Registrar novas rotas em server/src/server.ts

**Files:**
- Modify: `server/src/server.ts`

- [ ] **Step 1: Adicionar import de identidade.ts**

Após a linha de import de `carrosseis.js`, adicionar:
```typescript
import { listIdentidade, readIdentidadeArquivo, listInspiracoes, saveInspiracao, readInspiracao } from "./identidade.js";
```

- [ ] **Step 2: Adicionar 5 novas rotas após o bloco de rotas de carrosseis (após linha do `app.get("/api/carrosseis/slide"...)`)**

```typescript
app.get("/api/identidade", async (c) => {
  try {
    return c.json(await listIdentidade());
  } catch {
    return c.json({ error: "Falha ao carregar identidade" }, 500);
  }
});

app.get("/api/identidade/arquivo", async (c) => {
  const file = c.req.query("file");
  if (!file) return c.json({ error: "file obrigatório" }, 400);
  try {
    const { buf, mime } = await readIdentidadeArquivo(file);
    return new Response(buf.buffer as ArrayBuffer, {
      headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Caminho inválido" || msg === "Tipo inválido") return c.json({ error: "Arquivo não encontrado" }, 404);
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Arquivo não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.get("/api/carrosseis/inspiracoes", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    return c.json(await listInspiracoes(id));
  } catch {
    return c.json({ error: "Falha ao listar inspirações" }, 500);
  }
});

app.post("/api/carrosseis/inspiracoes", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Multipart inválido" }, 400);
  }
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "Campo 'file' obrigatório" }, 400);
  const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
  if (!ALLOWED.includes(file.type)) return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeName = `${Date.now()}.${ext}`;
  try {
    await saveInspiracao(id, safeName, Buffer.from(await file.arrayBuffer()));
    return c.json({ ok: true, filename: safeName });
  } catch (e) {
    if ((e as Error).message === "Caminho inválido") return c.json({ error: "id inválido" }, 400);
    return c.json({ error: "Erro ao salvar" }, 500);
  }
});

app.get("/api/carrosseis/inspiracao", async (c) => {
  const id = c.req.query("id");
  const file = c.req.query("file");
  if (!id || !file) return c.json({ error: "id e file obrigatórios" }, 400);
  try {
    const { buf, mime } = await readInspiracao(id, file);
    return new Response(buf.buffer as ArrayBuffer, {
      headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Caminho inválido" || msg === "Tipo inválido") return c.json({ error: "Não encontrado" }, 404);
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});
```

**IMPORTANTE:** As rotas `/api/carrosseis/inspiracoes` e `/api/carrosseis/inspiracao` devem ficar ANTES de qualquer rota com parâmetro dinâmico como `/api/carrosseis/:id` para não haver conflito de matching. Como o projeto usa query params (não path params) para os carrosseis, não há conflito — mas posicionar após `/api/carrosseis/slide` garante consistência.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd server && npx tsc --noEmit
```

Expected: sem erros.

---

## Task 4: Adicionar testes para as novas rotas em server.test.ts

**Files:**
- Modify: `server/src/server.test.ts`

- [ ] **Step 1: Escrever os testes**

Adicionar ao final do arquivo:

```typescript
describe("GET /api/identidade", () => {
  it("retorna logo e refs", async () => {
    const res = await app.request("/api/identidade");
    expect(res.status).toBe(200);
    const body = await res.json() as { logo: unknown; refs: unknown[] };
    expect(body).toHaveProperty("logo");
    expect(Array.isArray(body.refs)).toBe(true);
  });
});

describe("GET /api/identidade/arquivo", () => {
  it("retorna 400 quando file não informado", async () => {
    const res = await app.request("/api/identidade/arquivo");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para arquivo inexistente", async () => {
    const res = await app.request("/api/identidade/arquivo?file=naoexiste.png");
    expect(res.status).toBe(404);
  });

  it("retorna 404 para extensão não-imagem", async () => {
    const res = await app.request("/api/identidade/arquivo?file=design-guide.md");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/carrosseis/inspiracoes", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/inspiracoes");
    expect(res.status).toBe(400);
  });

  it("retorna array vazio para carrossel sem inspirações", async () => {
    const res = await app.request("/api/carrosseis/inspiracoes?id=carrossel-que-nao-existe");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });
});

describe("GET /api/carrosseis/inspiracao", () => {
  it("retorna 400 quando id ou file não informados", async () => {
    const res = await app.request("/api/carrosseis/inspiracao?id=foo");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para inspiração inexistente", async () => {
    const res = await app.request("/api/carrosseis/inspiracao?id=naoexiste&file=naoexiste.png");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/carrosseis inclui campo inspiracoes", () => {
  it("cada item tem campo inspiracoes numérico", async () => {
    const res = await app.request("/api/carrosseis");
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ inspiracoes: unknown }>;
    if (body.length > 0) {
      expect(typeof body[0]!.inspiracoes).toBe("number");
    }
  });
});
```

- [ ] **Step 2: Rodar testes**

```bash
cd server && npm test
```

Expected: todos os testes passam. Se algum falhar, investigar antes de continuar.

---

## Task 5: Atualizar frontend/src/routes/conteudo.tsx

**Files:**
- Modify: `frontend/src/routes/conteudo.tsx`

### 5a — Adicionar imports e tipos novos

- [ ] **Step 1: Atualizar imports de ícones**

Localizar a linha de import de lucide-react:
```typescript
import {
  Calendar, LayoutTemplate, Video, Images,
  ChevronLeft, ChevronRight, Copy, Check, X, Sparkles,
} from "lucide-react";
```

Substituir por:
```typescript
import {
  Calendar, LayoutTemplate, Video, Images, Palette,
  ChevronLeft, ChevronRight, Copy, Check, X, Upload,
} from "lucide-react";
```

- [ ] **Step 2: Adicionar tipos de identidade e função helper**

Após as declarações de tipo existentes (`CarrosselMeta`, `ConteudoItem`, `CalendarioItem`), adicionar:

```typescript
type IdentidadeArquivo = { nome: string; label: string };
type IdentidadeData = { logo: IdentidadeArquivo | null; refs: IdentidadeArquivo[] };

const BRAND_COLORS = [
  { hex: "#07070F", label: "Fundo" },
  { hex: "#A24BFF", label: "Roxo neon" },
  { hex: "#29C5FF", label: "Ciano neon" },
  { hex: "#FFFFFF", label: "Texto principal" },
  { hex: "#C9C9D6", label: "Texto secundário" },
];

function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}

function inspiUrl(carrosselId: string, file: string) {
  return `${BACKEND}/api/carrosseis/inspiracao?id=${encodeURIComponent(carrosselId)}&file=${encodeURIComponent(file)}`;
}
```

- [ ] **Step 3: Atualizar `CarrosselMeta` para incluir `inspiracoes`**

Localizar:
```typescript
type CarrosselMeta = { id: string; titulo: string; slides: string[]; legenda: string };
```

Substituir por:
```typescript
type CarrosselMeta = { id: string; titulo: string; slides: string[]; legenda: string; inspiracoes: number };
```

### 5b — Adicionar tab Identidade à barra de tabs

- [ ] **Step 4: Adicionar "Identidade" ao array TABS**

Localizar:
```typescript
type Tab = "calendario" | "carrossel" | "reels" | "stories";
```

Substituir por:
```typescript
type Tab = "calendario" | "carrossel" | "reels" | "stories" | "identidade";
```

Localizar:
```typescript
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "carrossel", label: "Carrossel", icon: LayoutTemplate },
  { id: "reels", label: "Reels", icon: Video },
  { id: "stories", label: "Stories", icon: Images },
];
```

Substituir por:
```typescript
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "carrossel", label: "Carrossel", icon: LayoutTemplate },
  { id: "reels", label: "Reels", icon: Video },
  { id: "stories", label: "Stories", icon: Images },
  { id: "identidade", label: "Identidade", icon: Palette },
];
```

- [ ] **Step 5: Adicionar render da tab Identidade em `ConteudoPage`**

Localizar:
```typescript
      {tab === "stories" && <TabMarkdown tipo="stories" arquivo="sequencia.md" emptyMsg="Nenhuma sequência de stories encontrada." />}
```

Adicionar após essa linha:
```typescript
      {tab === "identidade" && <TabIdentidade />}
```

### 5c — Adicionar componente Lightbox

- [ ] **Step 6: Adicionar o componente `Lightbox` antes do `EmptyState`**

Localizar `// ── Empty state ─────...` e inserir antes:

```typescript
// ── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
      >
        <X size={16} />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
```

### 5d — Adicionar componente TabIdentidade

- [ ] **Step 7: Adicionar `TabIdentidade` antes do `Lightbox`**

Inserir antes do bloco `// ── Lightbox ─────...`:

```typescript
// ── Identidade ──────────────────────────────────────────────────────────────

function TabIdentidade() {
  const [data, setData] = useState<IdentidadeData | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade`)
      .then((r) => r.json() as Promise<IdentidadeData>)
      .then(setData)
      .catch(() => {});
  }, []);

  const copiarHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiado(hex);
    setTimeout(() => setCopiado(null), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Logo */}
      {data?.logo && (
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Logo</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-xl bg-muted/20 border border-border flex items-center justify-center overflow-hidden">
              <img
                src={identidadeUrl(data.logo.nome)}
                alt="Logo"
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            <a
              href={identidadeUrl(data.logo.nome)}
              download="logo.png"
              className="text-[12px] text-primary hover:underline"
            >
              Baixar PNG
            </a>
          </div>
        </section>
      )}

      {/* Paleta de cores */}
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

      {/* Referências de design */}
      {data && data.refs.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Referências de design
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.refs.map((r) => (
              <button
                key={r.nome}
                onClick={() => setLightbox(identidadeUrl(r.nome))}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/20 hover:border-primary/50 transition-colors"
              >
                <img
                  src={identidadeUrl(r.nome)}
                  alt={r.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <span className="w-full px-2 py-1.5 text-[11px] text-white font-medium translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/60">
                    {r.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
```

### 5e — Badge no card de carrossel + InspiracaoSection

- [ ] **Step 8: Adicionar badge de inspirações no card da grade de carrosseis**

Em `TabCarrossel`, dentro do card da grade, localizar:
```typescript
              <div className="p-3">
                <p className="font-medium text-[13px] capitalize truncate">{c.titulo}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.slides.length} slides</p>
              </div>
```

Substituir por:
```typescript
              <div className="p-3">
                <p className="font-medium text-[13px] capitalize truncate">{c.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground">{c.slides.length} slides</p>
                  {c.inspiracoes > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {c.inspiracoes} ref{c.inspiracoes > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
```

- [ ] **Step 9: Adicionar `InspiracaoSection` na view do carrossel aberto**

Em `TabCarrossel`, na view do carrossel aberto, localizar o fechamento da `div` que contém o viewer de slides (logo após o bloco das miniaturas `{aberto.slides.map(...)}`) e adicionar o componente antes do fechamento da `div className="flex-1 max-w-lg"`:

Localizar:
```typescript
            <p className="text-center text-[12px] text-muted-foreground mt-2">
              {slideIdx + 1} / {aberto.slides.length}
            </p>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {aberto.slides.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSlideIdx(i)}
                  className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                    i === slideIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={slideUrl(aberto.id, s)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
```

Substituir por:
```typescript
            <p className="text-center text-[12px] text-muted-foreground mt-2">
              {slideIdx + 1} / {aberto.slides.length}
            </p>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {aberto.slides.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSlideIdx(i)}
                  className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                    i === slideIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={slideUrl(aberto.id, s)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <InspiracaoSection carrosselId={aberto.id} />
          </div>
```

- [ ] **Step 10: Adicionar componente `InspiracaoSection` antes do bloco `// ── Identidade`**

```typescript
// ── InspiracaoSection ────────────────────────────────────────────────────────

function InspiracaoSection({ carrosselId }: { carrosselId: string }) {
  const [files, setFiles] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/carrosseis/inspiracoes?id=${encodeURIComponent(carrosselId)}`)
      .then((r) => r.json() as Promise<string[]>)
      .then(setFiles)
      .catch(() => {});
  }, [carrosselId]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(
        `${BACKEND}/api/carrosseis/inspiracoes?id=${encodeURIComponent(carrosselId)}`,
        { method: "POST", body: fd },
      );
      if (r.ok) {
        const { filename } = await r.json() as { filename: string };
        setFiles((prev) => [...prev, filename]);
      }
    } catch { /* silently ignore */ }
    setUploading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="mt-5">
      <h3 className="font-semibold text-[13px] mb-2">Inspirações de design</h3>

      {files.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {files.map((f) => (
            <button
              key={f}
              onClick={() => setLightbox(inspiUrl(carrosselId, f))}
              className="shrink-0 w-20 h-20 rounded-md overflow-hidden border border-border hover:border-primary/50 transition-colors"
            >
              <img src={inspiUrl(carrosselId, f)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <label
        className={`flex flex-col items-center justify-center gap-2 h-16 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/10"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleFileInput}
        />
        {uploading ? (
          <p className="text-[12px] text-muted-foreground">Salvando…</p>
        ) : (
          <>
            <Upload size={14} className="text-muted-foreground" />
            <p className="text-[12px] text-muted-foreground">Arrasta ou clica pra adicionar inspiração</p>
          </>
        )}
      </label>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
```

- [ ] **Step 11: Verificar TypeScript do frontend**

```bash
cd frontend && npx tsc --noEmit
```

Expected: sem erros.

---

## Task 6: Atualizar skill lb-conteudo-carrossel

**Files:**
- Modify: `.claude/skills/lb-conteudo-carrossel/SKILL.md`

- [ ] **Step 1: Adicionar bloco de inspirações no Passo 0**

Localizar o início de `## Workflow` → `### Passo 0 — Classificar tipo RETINA + buscar referências` e o sub-bloco `**Buscar referências (2 fontes):**`.

Após a lista de 2 fontes existentes (terminando com a frase sobre `_memoria/framework-trafego.md`), adicionar:

```markdown
3. **Inspirações do carrossel** — verificar se existe `marketing/conteudo/carrossel/{id-do-tema}/inspiracoes/`. Se tiver imagens, carregar via `Read` e incluir no contexto: "O usuário quer imitar o layout/estilo das imagens de inspiração nessa pasta. Adapte a composição, hierarquia tipográfica e uso de espaço ao que você vê nelas, mantendo a paleta e identidade da marca."
```

- [ ] **Step 2: Confirmar que o arquivo salvo está correto**

```bash
grep -n "inspiracoes" .claude/skills/lb-conteudo-carrossel/SKILL.md
```

Expected: linha com o novo bloco de inspirações.

---

## Task 7: Commit

- [ ] **Step 1: Rodar todos os testes**

```bash
cd server && npm test
```

Expected: todos passam.

- [ ] **Step 2: Commit**

```bash
git add server/src/identidade.ts server/src/carrosseis.ts server/src/server.ts server/src/server.test.ts frontend/src/routes/conteudo.tsx .claude/skills/lb-conteudo-carrossel/SKILL.md
git commit -m "feat(conteudo): tab identidade visual, inspirações por carrossel com drag & drop"
```

---

## Self-Review

**Spec coverage:**
- Tab Identidade com logo ✓ (Task 5d)
- Paleta de cores com swatches copiáveis ✓ (Task 5d)
- Referências de design em grade com lightbox ✓ (Task 5c + 5d)
- Badge de inspirações no card ✓ (Task 5e Step 8)
- Inspirações por carrossel na view aberta ✓ (Task 5e Step 9)
- Upload drag & drop ✓ (Task 5e Step 10)
- 5 novas rotas backend ✓ (Tasks 1 + 3)
- Skill atualizada ✓ (Task 6)
- Segurança path traversal ✓ (identidade.ts resolve() checks)

**Tipos consistentes:**
- `IdentidadeArquivo` definido em `identidade.ts` e redeclarado no frontend (padrão do projeto — sem shared types)
- `CarrosselMeta.inspiracoes: number` adicionado em `carrosseis.ts` e no tipo local de `conteudo.tsx`
- `inspiUrl()` e `identidadeUrl()` usados consistentemente em `InspiracaoSection` e `TabIdentidade`
- `BACKEND` já declarado no topo de `conteudo.tsx`, acessível a todos os novos componentes no mesmo arquivo

**Sem placeholders:** confirmado.
