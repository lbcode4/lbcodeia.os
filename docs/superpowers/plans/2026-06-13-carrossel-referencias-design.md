# Carrossel — Referências de Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir upload de imagens de referência na UI do carrossel para que a skill imite o estilo visual delas ao gerar slides.

**Architecture:** Abordagem A — pasta temp com auto-delete. Imagens vão para `_referencias-temp/<uuid>/` no repo root. Paths injetados no briefing antes de executar. DELETE automático após execução (sucesso ou falha). Skill lê arquivos via `Read` tool normalmente.

**Tech Stack:** Node.js (fs/promises, rm), Hono, Vitest, React (state + drag-and-drop nativo), lucide-react

---

## File Map

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| Create | `server/src/referencias-temp.ts` | save / read / delete de arquivos temp |
| Modify | `server/src/server.ts` | 3 novas rotas REST |
| Modify | `server/src/server.test.ts` | testes de validação das 3 rotas |
| Modify | `frontend/src/routes/skill.$skillId.tsx` | state + handlers + UI dropzone + injeção |
| Modify | `.gitignore` | ignorar `_referencias-temp/` |

---

## Task 1: Módulo `referencias-temp.ts`

**Files:**
- Create: `server/src/referencias-temp.ts`
- Create: `server/src/referencias-temp.test.ts`

- [ ] **Step 1: Escrever testes unitários (falharão — módulo não existe)**

Criar `server/src/referencias-temp.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  rm: vi.fn(),
}));

import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);
const mockReadFile = vi.mocked(readFile);
const mockRm = vi.mocked(rm);

beforeEach(() => vi.clearAllMocks());

import { saveReferencia, readReferencia, deleteReferencias } from "./referencias-temp.js";

describe("saveReferencia", () => {
  it("cria diretório e salva arquivo com nome timestamp", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const buf = Buffer.from("fake-image");
    const filename = await saveReferencia("550e8400-e29b-41d4-a716-446655440000", ".png", buf);

    expect(filename).toMatch(/^\d+\.png$/);
    expect(mockMkdir).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile.mock.calls[0][1]).toBe(buf);
  });

  it("rejeita sessionId inválido", async () => {
    await expect(saveReferencia("../../etc", ".png", Buffer.from(""))).rejects.toThrow("sessionId inválido");
  });

  it("rejeita extensão não-imagem", async () => {
    await expect(saveReferencia("550e8400-e29b-41d4-a716-446655440000", ".exe", Buffer.from(""))).rejects.toThrow("Tipo inválido");
  });
});

describe("readReferencia", () => {
  it("lê arquivo e retorna buffer + mime correto", async () => {
    const fakeBuf = Buffer.from("img");
    mockReadFile.mockResolvedValue(fakeBuf as unknown as string);

    const { buf, mime } = await readReferencia("550e8400-e29b-41d4-a716-446655440000", "1234.jpg");

    expect(buf).toBe(fakeBuf);
    expect(mime).toBe("image/jpeg");
  });

  it("rejeita sessionId inválido", async () => {
    await expect(readReferencia("../etc", "f.png")).rejects.toThrow("sessionId inválido");
  });

  it("rejeita extensão não-imagem", async () => {
    await expect(readReferencia("550e8400-e29b-41d4-a716-446655440000", "f.exe")).rejects.toThrow("Tipo inválido");
  });
});

describe("deleteReferencias", () => {
  it("chama rm com recursive: true, force: true", async () => {
    mockRm.mockResolvedValue(undefined);

    await deleteReferencias("550e8400-e29b-41d4-a716-446655440000");

    expect(mockRm).toHaveBeenCalledTimes(1);
    expect(mockRm.mock.calls[0][1]).toEqual({ recursive: true, force: true });
  });

  it("rejeita sessionId inválido", async () => {
    await expect(deleteReferencias("nao-e-uuid")).rejects.toThrow("sessionId inválido");
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar falha**

```bash
cd server && npx vitest run src/referencias-temp.test.ts
```

Esperado: FAIL com "Cannot find module './referencias-temp.js'"

- [ ] **Step 3: Implementar `referencias-temp.ts`**

Criar `server/src/referencias-temp.ts`:

```typescript
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const TEMP_ROOT = join(REPO_ROOT, "_referencias-temp");

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function resolveSession(sessionId: string): string {
  if (!UUID_RE.test(sessionId)) throw new Error("sessionId inválido");
  const dir = resolve(join(TEMP_ROOT, sessionId));
  if (!dir.startsWith(resolve(TEMP_ROOT))) throw new Error("Caminho inválido");
  return dir;
}

export async function saveReferencia(sessionId: string, ext: string, data: Buffer): Promise<string> {
  const mime = MIME_MAP[ext.toLowerCase()];
  if (!mime) throw new Error("Tipo inválido");
  const dir = resolveSession(sessionId);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}${ext.toLowerCase()}`;
  await writeFile(join(dir, filename), data);
  return filename;
}

export async function readReferencia(sessionId: string, filename: string): Promise<{ buf: Buffer; mime: string }> {
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  const dir = resolveSession(sessionId);
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(TEMP_ROOT))) throw new Error("Caminho inválido");
  return { buf: (await readFile(safe)) as Buffer, mime };
}

export async function deleteReferencias(sessionId: string): Promise<void> {
  const dir = resolveSession(sessionId);
  await rm(dir, { recursive: true, force: true });
}
```

- [ ] **Step 4: Rodar testes para confirmar passagem**

```bash
cd server && npx vitest run src/referencias-temp.test.ts
```

Esperado: PASS (todos os 8 testes)

- [ ] **Step 5: Commit**

```bash
git add server/src/referencias-temp.ts server/src/referencias-temp.test.ts
git commit -m "feat(backend): add referencias-temp module for carrossel design refs"
```

---

## Task 2: 3 rotas API em `server.ts` + testes

**Files:**
- Modify: `server/src/server.ts`
- Modify: `server/src/server.test.ts`

- [ ] **Step 1: Adicionar testes de validação em `server.test.ts`**

Adicionar no final do arquivo `server/src/server.test.ts`:

```typescript
describe("POST /api/carrosseis/referencias", () => {
  it("retorna 400 quando sessionId não informado", async () => {
    const res = await app.request("/api/carrosseis/referencias", { method: "POST" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para sessionId inválido (não-UUID)", async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["x"], { type: "image/png" }), "x.png");
    const res = await app.request("/api/carrosseis/referencias?sessionId=nao-e-uuid", {
      method: "POST",
      body: fd,
    });
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando campo 'file' ausente", async () => {
    const fd = new FormData();
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "POST", body: fd },
    );
    expect(res.status).toBe(400);
  });

  it("retorna 400 para tipo de arquivo inválido", async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["x"], { type: "text/plain" }), "x.txt");
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "POST", body: fd },
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/carrosseis/referencia", () => {
  it("retorna 400 quando sessionId ou file ausentes", async () => {
    const res = await app.request("/api/carrosseis/referencia?sessionId=550e8400-e29b-41d4-a716-446655440000");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para arquivo inexistente", async () => {
    const res = await app.request(
      "/api/carrosseis/referencia?sessionId=550e8400-e29b-41d4-a716-446655440000&file=naoexiste.png",
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/carrosseis/referencias", () => {
  it("retorna 400 quando sessionId não informado", async () => {
    const res = await app.request("/api/carrosseis/referencias", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para sessionId inválido", async () => {
    const res = await app.request("/api/carrosseis/referencias?sessionId=nao-e-uuid", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("retorna 200 para sessionId UUID válido (mesmo que pasta não exista — rm force)", async () => {
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "DELETE" },
    );
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar falha**

```bash
cd server && npx vitest run src/server.test.ts
```

Esperado: FAIL — rotas novas retornam 404

- [ ] **Step 3: Adicionar import + 3 rotas em `server.ts`**

Adicionar o import no topo de `server/src/server.ts`, junto aos outros imports:

```typescript
import { saveReferencia, readReferencia, deleteReferencias } from "./referencias-temp.js";
```

Adicionar as 3 rotas em `server/src/server.ts` logo após o bloco `app.get("/api/carrosseis/inspiracao", ...)` (por volta da linha 200, antes de `app.get("/api/dashboard/data", ...)`):

```typescript
app.post("/api/carrosseis/referencias", async (c) => {
  const sessionId = c.req.query("sessionId");
  if (!sessionId) return c.json({ error: "sessionId obrigatório" }, 400);
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
  if (file.size > 10 * 1024 * 1024) return c.json({ error: "Arquivo muito grande. Máximo 10MB." }, 400);
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const ext = `.${rawExt}`;
  try {
    const filename = await saveReferencia(sessionId, ext, Buffer.from(await file.arrayBuffer()));
    return c.json({ ok: true, filename });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido" || msg === "Caminho inválido") return c.json({ error: "sessionId inválido" }, 400);
    if (msg === "Tipo inválido") return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
    return c.json({ error: "Erro ao salvar" }, 500);
  }
});

app.get("/api/carrosseis/referencia", async (c) => {
  const sessionId = c.req.query("sessionId");
  const file = c.req.query("file");
  if (!sessionId || !file) return c.json({ error: "sessionId e file obrigatórios" }, 400);
  try {
    const { buf, mime } = await readReferencia(sessionId, file);
    return new Response(buf.buffer as ArrayBuffer, { headers: { "Content-Type": mime } });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido" || msg === "Caminho inválido" || msg === "Tipo inválido") {
      return c.json({ error: "Não encontrado" }, 404);
    }
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Não encontrado" }, 404);
    return c.json({ error: "Erro ao ler" }, 500);
  }
});

app.delete("/api/carrosseis/referencias", async (c) => {
  const sessionId = c.req.query("sessionId");
  if (!sessionId) return c.json({ error: "sessionId obrigatório" }, 400);
  try {
    await deleteReferencias(sessionId);
    return c.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido") return c.json({ error: "sessionId inválido" }, 400);
    return c.json({ error: "Erro ao deletar" }, 500);
  }
});
```

- [ ] **Step 4: Rodar todos os testes do servidor**

```bash
cd server && npx vitest run
```

Esperado: PASS em todos (incluindo os novos). O teste DELETE com UUID válido passa porque `rm` com `force: true` não falha quando a pasta não existe.

- [ ] **Step 5: Commit**

```bash
git add server/src/server.ts server/src/server.test.ts
git commit -m "feat(backend): add POST/GET/DELETE routes for carrossel design references"
```

---

## Task 3: Frontend — state, handlers e wiring lógico

**Files:**
- Modify: `frontend/src/routes/skill.$skillId.tsx`

- [ ] **Step 1: Adicionar imports de ícones**

No topo de `frontend/src/routes/skill.$skillId.tsx`, alterar a linha de import do lucide-react para incluir `X` e `ImageIcon`:

```typescript
import { Sparkles, Loader2, Copy, Check, RotateCcw, Send, User, ChevronLeft, ChevronRight, ExternalLink, X, ImageIcon } from "lucide-react";
```

- [ ] **Step 2: Adicionar state vars de referências**

Dentro de `function SkillPanel()`, após a linha `const scrollRef = useRef...`, adicionar:

```typescript
const [refSessionId, setRefSessionId] = useState<string | null>(null);
const [refs, setRefs] = useState<{ filename: string; previewUrl: string }[]>([]);
const [uploading, setUploading] = useState(false);
const [uploadErro, setUploadErro] = useState("");
```

- [ ] **Step 3: Adicionar handler `uploadReferencia`**

Após a função `reset`, adicionar:

```typescript
const uploadReferencia = async (file: File) => {
  if (refs.length >= 4) return;
  const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
  if (!ALLOWED.includes(file.type)) {
    setUploadErro("Tipo inválido. Use PNG, JPG ou WebP.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setUploadErro("Arquivo muito grande. Máximo 10MB.");
    return;
  }
  setUploading(true);
  setUploadErro("");
  let sessionId = refSessionId;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setRefSessionId(sessionId);
  }
  const previewUrl = URL.createObjectURL(file);
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(
      `${BACKEND}/api/carrosseis/referencias?sessionId=${encodeURIComponent(sessionId)}`,
      { method: "POST", body: fd },
    );
    if (!res.ok) {
      const err = await res.json() as { error: string };
      setUploadErro(err.error ?? "Falha no upload");
      URL.revokeObjectURL(previewUrl);
      return;
    }
    const { filename } = await res.json() as { filename: string };
    setRefs((r) => [...r, { filename, previewUrl }]);
  } catch {
    setUploadErro("Falha no upload");
    URL.revokeObjectURL(previewUrl);
  } finally {
    setUploading(false);
  }
};

const removerReferencia = (filename: string) => {
  setRefs((r) => {
    const item = r.find((x) => x.filename === filename);
    if (item) URL.revokeObjectURL(item.previewUrl);
    return r.filter((x) => x.filename !== filename);
  });
};
```

- [ ] **Step 4: Modificar `iniciar()` para injetar paths das refs**

Substituir a função `iniciar` existente por:

```typescript
const iniciar = () => {
  if (!cliente || running) return;
  const parts: string[] = [];
  if (isCarrossel && retinaType) {
    const opt = RETINA_OPTIONS.find((o) => o.id === retinaType);
    parts.push(`Tipo RETINA: ${retinaType} — ${opt?.label}`);
  }
  if (isCarrossel && tipoConteudo) {
    const opt = TIPO_OPTIONS.find((o) => o.id === tipoConteudo);
    parts.push(`Tipo de conteúdo: ${tipoConteudo} — ${opt?.label}`);
  }
  if (isCarrossel && refs.length > 0 && refSessionId) {
    const paths = refs
      .map((r) => `- _referencias-temp/${refSessionId}/${r.filename}`)
      .join("\n");
    parts.push(
      `Referências de design — imitar estilo visual dessas imagens (carregar via Read antes de criar slides):\n${paths}`,
    );
  }
  if (briefing.trim()) parts.push(briefing.trim());
  executar(parts.join("\n") || "(sem briefing)");
};
```

- [ ] **Step 5: Modificar `executar()` para fazer DELETE + limpar state no finally**

Dentro da função `executar`, localizar o bloco `finally` e substituir por:

```typescript
    } finally {
      setRunning(false);
      if (isCarrossel && refSessionId) {
        const sid = refSessionId;
        fetch(`${BACKEND}/api/carrosseis/referencias?sessionId=${encodeURIComponent(sid)}`, {
          method: "DELETE",
        }).catch(() => {});
        refs.forEach((r) => URL.revokeObjectURL(r.previewUrl));
        setRefs([]);
        setRefSessionId(null);
        setUploadErro("");
      }
    }
```

- [ ] **Step 6: Modificar `reset()` para limpar refs**

Substituir a função `reset` existente por:

```typescript
const reset = () => {
  setTurns([]);
  setBriefing("");
  setFollowUp("");
  setStatus("");
  setErro("");
  setCarrosselResult(null);
  setCarrosselSlideIdx(0);
  refs.forEach((r) => URL.revokeObjectURL(r.previewUrl));
  setRefs([]);
  setRefSessionId(null);
  setUploadErro("");
};
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/routes/skill.\$skillId.tsx
git commit -m "feat(frontend): add carrossel design refs state, handlers, briefing injection"
```

---

## Task 4: Frontend — UI dropzone

**Files:**
- Modify: `frontend/src/routes/skill.$skillId.tsx`

- [ ] **Step 1: Adicionar dropzone no JSX**

No JSX, dentro do bloco `{!hasTurns ? ( <> ... </> ) : ...}`, dentro do bloco `{isCarrossel && ( <> ... </> )}`, inserir a seção de referências **após o bloco de Tipo de Conteúdo e antes do bloco de Tema/briefing**.

Localizar este comentário/trecho no JSX:
```tsx
                </>
              )}

              <div>
                <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                  {isCarrossel ? "Tema / briefing" : "Briefing (opcional)"}
```

Inserir antes dele, ainda dentro do `{isCarrossel && ( <> ... </> )}`:

```tsx
                  <div>
                    <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                      Referências de Design
                    </label>
                    <label
                      className={`mt-2 flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border-2 border-dashed border-border text-center cursor-pointer hover:border-primary/40 transition-colors ${
                        refs.length >= 4 || uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        Array.from(e.dataTransfer.files)
                          .slice(0, 4 - refs.length)
                          .forEach(uploadReferencia);
                      }}
                    >
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        disabled={refs.length >= 4 || uploading}
                        onChange={(e) => {
                          Array.from(e.target.files ?? [])
                            .slice(0, 4 - refs.length)
                            .forEach(uploadReferencia);
                          e.currentTarget.value = "";
                        }}
                      />
                      {uploading ? (
                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                      ) : (
                        <ImageIcon size={14} className="text-muted-foreground" />
                      )}
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        {refs.length >= 4
                          ? "Máximo atingido (4)"
                          : "Arraste ou clique · PNG, JPG, WebP · máx 4"}
                      </span>
                    </label>
                    {refs.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {refs.map((r) => (
                          <div
                            key={r.filename}
                            className="relative w-14 h-14 rounded-md overflow-hidden border border-border group"
                          >
                            <img
                              src={r.previewUrl}
                              alt="referência"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removerReferencia(r.filename)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadErro && (
                      <p className="text-[11px] text-red-500 mt-1">{uploadErro}</p>
                    )}
                  </div>
```

- [ ] **Step 2: Verificar type check**

```bash
cd frontend && npx tsc --noEmit
```

Esperado: 0 erros

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/skill.\$skillId.tsx
git commit -m "feat(frontend): add carrossel design references dropzone UI"
```

---

## Task 5: .gitignore + limpeza

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Adicionar `_referencias-temp/` ao .gitignore**

Adicionar no final da seção "Arquivos temporários" do `.gitignore`:

```
_referencias-temp/
```

- [ ] **Step 2: Rodar todos os testes do servidor para confirmar nada quebrou**

```bash
cd server && npx vitest run
```

Esperado: PASS em todos os testes

- [ ] **Step 3: Commit final**

```bash
git add .gitignore
git commit -m "chore: ignore _referencias-temp/ uploads directory"
```

---

## Verificação manual

Após todas as tasks:

1. Subir backend: `cd server && npm run dev`
2. Subir frontend: `cd frontend && npm run dev`
3. Navegar para Conteúdo Orgânico → Carrosséis no menu
4. Confirmar que a seção "Referências de Design" aparece entre "Tipo de Conteúdo" e "Tema / Briefing"
5. Arrastar uma imagem PNG → deve aparecer thumbnail com botão X no hover
6. Tentar arrastar arquivo `.pdf` → deve mostrar erro "Tipo inválido"
7. Clicar Executar com 1+ referências → verificar no terminal do backend que pasta `_referencias-temp/<uuid>/` é criada
8. Aguardar execução terminar → verificar que pasta foi deletada
