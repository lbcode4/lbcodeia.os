# Carrossel — Criação Profissional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `carrosseis.tsx` em tela split-panel profissional com criação (form + identidade visual + upload de imagens) e galeria/resultado no mesmo lugar.

**Architecture:** Single-file overhaul de `frontend/src/routes/carrosseis.tsx`. Layout split-panel fixo: painel esquerdo (360px) com form de criação incluindo seção de Identidade Visual e upload de imagens para copiar; painel direito (flex-1) alternando entre galeria de carrosseis anteriores e resultado de execução. Toda lógica de execução do skill migrada do `skill.$skillId.tsx` para cá. Backend não muda — todos os endpoints necessários já existem.

**Tech Stack:** React, TypeScript, TanStack Router, Tailwind CSS, Hono (backend — somente leitura), SSE streaming via `runSkill` helper existente.

---

## Contexto para o implementador

### Endpoints backend existentes (nenhuma mudança necessária)

```
GET  /api/identidade
  → { logo: { nome, label } | null, refs: { nome, label }[] }

GET  /api/identidade/arquivo?file=<nome>
  → binário da imagem

GET  /api/carrosseis
  → { id, titulo, slides, legenda, inspiracoes }[]

GET  /api/carrosseis/slide?id=<id>&slide=<filename>
  → binário do slide

POST /api/carrosseis/inspiracoes?id=<id>
  body: multipart/form-data com campo "file"
  → { ok: true, filename: string }

GET  /api/carrosseis/inspiracoes?id=<id>
  → string[] (filenames)

GET  /api/carrosseis/inspiracao?id=<id>&file=<filename>
  → binário da imagem
```

### Helper `runSkill` existente

Importado de `@/lib/skills` (verificar caminho exato). Aceita:
```ts
runSkill(
  { skill: string; cliente: string; input: string; model?: string },
  callback: (ev: SkillEvent) => void
): Promise<void>

type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown }
```

### Como buscar carrossel novo após execução

O `skill.$skillId.tsx` atual faz:
1. Salva todos os IDs antes de executar: `existingIds = new Set(list.map(c => c.id))`
2. Após execução, faz polling de `GET /api/carrosseis` até aparecer ID novo
3. Função: `fetchNovoCarrossel(existingIds)` com retries

### Formato do input para o skill

```ts
const parts: string[] = [];
if (retinaType) {
  const opt = RETINA_OPTIONS.find(o => o.id === retinaType);
  parts.push(`Tipo RETINA: ${retinaType} — ${opt?.label}`);
}
if (tipoConteudo) {
  const opt = TIPO_OPTIONS.find(o => o.id === tipoConteudo);
  parts.push(`Tipo de conteúdo: ${tipoConteudo} — ${opt?.label}`);
}
if (briefing.trim()) parts.push(briefing.trim());
if (temaSlug && uploadedFiles.length > 0) {
  parts.push(`Imagens para copiar disponíveis em: marketing/conteudo/carrossel/${temaSlug}/inspiracoes/`);
}
const input = parts.join("\n") || "(sem briefing)";
```

### Constantes RETINA e TIPO

```ts
const RETINA_OPTIONS = [
  { id: "R", label: "Relacionamento" },
  { id: "E", label: "Engajamento" },
  { id: "T", label: "Transformação" },
  { id: "I", label: "Interação" },
  { id: "N", label: "Níveis de consciência" },
  { id: "A", label: "Autoridade" },
];

const TIPO_OPTIONS = [
  { id: "1", label: "Texto puro", desc: "Educacional, dicas, listas" },
  { id: "2", label: "Com foto IA", desc: "Aspiracional, capa com personagem" },
  { id: "3", label: "Post único", desc: "Frase de impacto, dado, depoimento" },
];
```

### temaSlug — como derivar

```ts
function toSlug(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
```

Usado como `id` nos endpoints de inspiracoes.

### Modelos IA disponíveis

```ts
const MODEL_OPTIONS = [
  { value: "claude-sonnet-4-6", label: "Sonnet 4.6 — Padrão" },
  { value: "claude-opus-4-8", label: "Opus 4.8 — Melhor qualidade" },
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — Mais rápido" },
];
```

---

## Estrutura de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `frontend/src/routes/carrosseis.tsx` | Modificar | Tela completa: split-panel, form, identidade, upload, galeria, resultado |

Nenhum outro arquivo muda.

---

## Task 1: Esqueleto split-panel + estado global da tela

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Substituir o conteúdo atual pelo esqueleto split-panel**

Substituir todo o conteúdo de `carrosseis.tsx` (manter somente imports e Route export):

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import {
  ChevronLeft, ChevronRight, Copy, Check,
  Upload, X, Loader2,
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

// ---------- Types ----------

type CarrosselMeta = {
  id: string;
  titulo: string;
  slides: string[];
  legenda: string;
  inspiracoes: number;
};

type IdentidadeArquivo = { nome: string; label: string };

type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
};

type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown };

type PainelDireito = "galeria" | "executando" | "concluido";

// ---------- Constantes ----------

const RETINA_OPTIONS = [
  { id: "R", label: "Relacionamento" },
  { id: "E", label: "Engajamento" },
  { id: "T", label: "Transformação" },
  { id: "I", label: "Interação" },
  { id: "N", label: "Níveis de consciência" },
  { id: "A", label: "Autoridade" },
];

const TIPO_OPTIONS = [
  { id: "1", label: "Texto puro", desc: "Educacional, dicas, listas" },
  { id: "2", label: "Com foto IA", desc: "Aspiracional, capa com personagem" },
  { id: "3", label: "Post único", desc: "Frase de impacto, dado, depoimento" },
];

const MODEL_OPTIONS = [
  { value: "claude-sonnet-4-6", label: "Sonnet 4.6 — Padrão" },
  { value: "claude-opus-4-8", label: "Opus 4.8 — Melhor qualidade" },
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — Mais rápido" },
];

// ---------- Helpers ----------

function toSlug(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function slideUrl(id: string, slide: string) {
  return `${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${encodeURIComponent(slide)}`;
}

function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}

function inspiracaoUrl(id: string, file: string) {
  return `${BACKEND}/api/carrosseis/inspiracao?id=${encodeURIComponent(id)}&file=${encodeURIComponent(file)}`;
}

async function fetchCarrosseis(): Promise<CarrosselMeta[]> {
  const res = await fetch(`${BACKEND}/api/carrosseis`);
  if (!res.ok) throw new Error("Falha ao carregar");
  return res.json();
}

async function fetchIdentidade(): Promise<IdentidadeData> {
  const res = await fetch(`${BACKEND}/api/identidade`);
  if (!res.ok) return { logo: null, refs: [] };
  return res.json();
}

async function runSkill(
  params: { skill: string; cliente: string; input: string; model?: string },
  onEvent: (ev: SkillEvent) => void,
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/skills/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          onEvent(JSON.parse(line.slice(5).trim()) as SkillEvent);
        } catch { /* skip malformed */ }
      }
    }
  }
}

async function fetchNovoCarrossel(existingIds: Set<string>): Promise<CarrosselMeta | null> {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const list = await fetchCarrosseis();
      const novo = list.find((c) => !existingIds.has(c.id));
      if (novo) return novo;
    } catch { /* retry */ }
  }
  return null;
}

// ---------- Route ----------

export const Route = createFileRoute("/carrosseis")({
  component: CarrosseisPagina,
});

function CarrosseisPagina() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <PageHeader
        title="Carrosséis"
        subtitle="Crie e gerencie carrosséis com IA."
      />
      <div className="flex flex-1 gap-4 min-h-0">
        <PainelEsquerdo />
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-sm">Painel direito — em breve</p>
        </div>
      </div>
    </div>
  );
}

function PainelEsquerdo() {
  return (
    <div className="w-[360px] shrink-0 overflow-y-auto">
      <Card className="space-y-5">
        <p className="text-muted-foreground text-sm">Form — em breve</p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Abrir o app e confirmar que a página carrega sem erro**

```bash
# Verificar se o frontend dev server está rodando
curl -s http://localhost:3000/carrosseis -o /dev/null -w "%{http_code}"
```

Esperado: `200` (ou navegar manualmente em http://localhost:3000/carrosseis)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "refactor(carrosseis): skeleton split-panel layout"
```

---

## Task 2: Seção Identidade Visual

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Adicionar componente `IdentidadeVisual`**

Adicionar antes da função `CarrosseisPagina`:

```tsx
function IdentidadeVisual() {
  const [data, setData] = useState<IdentidadeData>({ logo: null, refs: [] });

  useEffect(() => {
    fetchIdentidade().then(setData).catch(() => {});
  }, []);

  const hasAssets = data.logo || data.refs.length > 0;

  if (!hasAssets) {
    return (
      <div>
        <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Identidade Visual
        </label>
        <p className="text-[12px] text-muted-foreground mt-1">
          Nenhuma referência em <code className="text-[11px]">identidade/</code>
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
        Identidade Visual
      </label>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {data.logo && (
          <div className="shrink-0 flex flex-col items-center gap-1">
            <img
              src={identidadeUrl(data.logo.nome)}
              alt="Logo"
              className="w-14 h-14 rounded-md object-cover border border-border bg-muted/30"
            />
            <span className="text-[10px] text-muted-foreground">Logo</span>
          </div>
        )}
        {data.refs.map((r) => (
          <div key={r.nome} className="shrink-0 flex flex-col items-center gap-1">
            <img
              src={identidadeUrl(r.nome)}
              alt={r.label}
              className="w-14 h-14 rounded-md object-cover border border-border"
            />
            <span className="text-[10px] text-muted-foreground truncate max-w-[56px]">
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Usar `IdentidadeVisual` em `PainelEsquerdo`**

Substituir o conteúdo do `Card` dentro de `PainelEsquerdo`:

```tsx
function PainelEsquerdo() {
  return (
    <div className="w-[360px] shrink-0 overflow-y-auto">
      <Card className="space-y-5">
        <IdentidadeVisual />
        <p className="text-muted-foreground text-sm">Restante do form — em breve</p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verificar visualmente — logo e refs aparecem como thumbnails 56×56px**

Navegar em http://localhost:3000/carrosseis e confirmar as imagens de `identidade/` aparecem.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "feat(carrosseis): add IdentidadeVisual section with logo and refs"
```

---

## Task 3: Upload de Imagens para Copiar

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Adicionar helper de upload**

Adicionar após `fetchNovoCarrossel`:

```tsx
async function uploadInspiracao(temaSlug: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${BACKEND}/api/carrosseis/inspiracoes?id=${encodeURIComponent(temaSlug)}`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro ao fazer upload" }));
    throw new Error((err as { error: string }).error ?? "Erro ao fazer upload");
  }
  const data = await res.json() as { ok: boolean; filename: string };
  return data.filename;
}
```

- [ ] **Step 2: Adicionar componente `UploadInspirações`**

Adicionar antes de `CarrosseisPagina`:

```tsx
type UploadedFile = { filename: string; objectUrl: string };

function UploadInspiracoes({
  temaSlug,
  files,
  onAdd,
  onRemove,
  uploadError,
  onUploadError,
}: {
  temaSlug: string;
  files: UploadedFile[];
  onAdd: (f: UploadedFile) => void;
  onRemove: (filename: string) => void;
  uploadError: string;
  onUploadError: (msg: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

  async function handleFiles(fileList: FileList) {
    if (!temaSlug) {
      onUploadError("Preencha o Tema antes de fazer upload");
      return;
    }
    onUploadError("");
    const toUpload = Array.from(fileList).filter((f) => ALLOWED_TYPES.includes(f.type));
    if (toUpload.length === 0) {
      onUploadError("Formato inválido. Use PNG, JPG ou WebP.");
      return;
    }
    if (files.length + toUpload.length > 10) {
      onUploadError("Máximo 10 imagens.");
      return;
    }
    setUploading(true);
    for (const file of toUpload) {
      try {
        const filename = await uploadInspiracao(temaSlug, file);
        onAdd({ filename, objectUrl: URL.createObjectURL(file) });
      } catch (e) {
        onUploadError((e as Error).message);
      }
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
        Imagens para Copiar
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-2 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        ) : (
          <>
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-[12px] text-muted-foreground">
              Arraste ou clique para selecionar
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
        />
      </div>

      {uploadError && (
        <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>
      )}

      {files.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {files.map((f) => (
            <div key={f.filename} className="relative group">
              <img
                src={f.objectUrl}
                alt={f.filename}
                className="w-16 h-16 rounded-md object-cover border border-border"
              />
              <button
                onClick={() => onRemove(f.filename)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Ligar `UploadInspiracoes` ao estado do form em `PainelEsquerdo`**

Atualizar `PainelEsquerdo` para ter estado compartilhado com o form (preparar para Task 4):

```tsx
function PainelEsquerdo({
  temaSlug,
  uploadedFiles,
  onAddFile,
  onRemoveFile,
}: {
  temaSlug: string;
  uploadedFiles: UploadedFile[];
  onAddFile: (f: UploadedFile) => void;
  onRemoveFile: (filename: string) => void;
}) {
  const [uploadError, setUploadError] = useState("");

  return (
    <div className="w-[360px] shrink-0 overflow-y-auto">
      <Card className="space-y-5">
        <IdentidadeVisual />
        <UploadInspiracoes
          temaSlug={temaSlug}
          files={uploadedFiles}
          onAdd={onAddFile}
          onRemove={onRemoveFile}
          uploadError={uploadError}
          onUploadError={setUploadError}
        />
        <p className="text-muted-foreground text-sm">Restante do form — em breve</p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Atualizar `CarrosseisPagina` para passar props ao `PainelEsquerdo`**

```tsx
function CarrosseisPagina() {
  const [briefing, setBriefing] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const temaSlug = toSlug(briefing);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <PageHeader
        title="Carrosséis"
        subtitle="Crie e gerencie carrosséis com IA."
      />
      <div className="flex flex-1 gap-4 min-h-0">
        <PainelEsquerdo
          temaSlug={temaSlug}
          uploadedFiles={uploadedFiles}
          onAddFile={(f) => setUploadedFiles((prev) => [...prev, f])}
          onRemoveFile={(name) => setUploadedFiles((prev) => prev.filter((f) => f.filename !== name))}
        />
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-sm">Painel direito — em breve</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Testar upload — arrastar uma imagem, confirmar thumbnail aparece**

Navegar em http://localhost:3000/carrosseis. Preencher Tema (ainda não existe — mas o estado `briefing` existe agora), arrastar uma imagem. Verificar que aparece thumbnail.

Nota: o campo Tema ainda não está no form. O test real de upload vem após Task 4. Por ora, verificar que o componente renderiza sem erro.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "feat(carrosseis): add UploadInspiracoes component with drag-drop"
```

---

## Task 4: Form de criação completo

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Adicionar tipo `Conta` e fetch**

Adicionar após os types existentes:

```tsx
type Conta = { cliente: string; nome?: string };

async function fetchContas(): Promise<Conta[]> {
  const res = await fetch(`${BACKEND}/api/contas`);
  if (!res.ok) return [];
  return res.json();
}
```

- [ ] **Step 2: Refatorar `PainelEsquerdo` com form completo**

Substituir `PainelEsquerdo` por versão completa com todos os campos:

```tsx
function PainelEsquerdo({
  onExecutar,
  executando,
  temaSlug,
  uploadedFiles,
  onAddFile,
  onRemoveFile,
}: {
  onExecutar: (params: {
    cliente: string;
    retinaType: string;
    tipoConteudo: string;
    briefing: string;
    model: string;
    temaSlug: string;
    uploadedFiles: UploadedFile[];
  }) => void;
  executando: boolean;
  temaSlug: string;
  uploadedFiles: UploadedFile[];
  onAddFile: (f: UploadedFile) => void;
  onRemoveFile: (filename: string) => void;
}) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [retinaType, setRetinaType] = useState("");
  const [tipoConteudo, setTipoConteudo] = useState("");
  const [briefing, setBriefing] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [uploadError, setUploadError] = useState("");

  const localTemaSlug = toSlug(briefing);

  useEffect(() => {
    fetchContas().then((cs) => {
      setContas(cs);
      if (cs[0]) setCliente(cs[0].cliente);
    }).catch(() => {});

    fetch(`${BACKEND}/api/ai-config`)
      .then((r) => r.json())
      .then((cfg: unknown) => {
        const c = cfg as { carrosselModel?: string };
        if (typeof c.carrosselModel === "string") setModel(c.carrosselModel);
      })
      .catch(() => {});
  }, []);

  const handleModelChange = async (value: string) => {
    setModel(value);
    await fetch(`${BACKEND}/api/ai-config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrosselModel: value }),
    }).catch(() => {});
  };

  const podeExecutar = !executando && briefing.trim().length > 0 && cliente.length > 0;

  return (
    <div className="w-[360px] shrink-0 overflow-y-auto pb-4">
      <Card className="space-y-5">
        <IdentidadeVisual />

        <UploadInspiracoes
          temaSlug={localTemaSlug}
          files={uploadedFiles}
          onAdd={onAddFile}
          onRemove={onRemoveFile}
          uploadError={uploadError}
          onUploadError={setUploadError}
        />

        {/* Cliente */}
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Cliente
          </label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            disabled={executando}
            className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[13px] disabled:opacity-60"
          >
            {contas.map((c) => (
              <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
            ))}
            {contas.length === 0 && <option value="">Nenhuma conta</option>}
          </select>
        </div>

        {/* Tipo RETINA */}
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Tipo RETINA
          </label>
          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
            {RETINA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={executando}
                onClick={() => setRetinaType(retinaType === opt.id ? "" : opt.id)}
                className={`border rounded-md px-2 py-2 text-left transition-colors disabled:opacity-60 ${
                  retinaType === opt.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-[13px] font-medium">{opt.id}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Conteúdo */}
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Tipo de Conteúdo
          </label>
          <div className="space-y-1.5 mt-1.5">
            {TIPO_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={executando}
                onClick={() => setTipoConteudo(tipoConteudo === opt.id ? "" : opt.id)}
                className={`w-full border rounded-md px-3 py-2 text-left transition-colors disabled:opacity-60 flex gap-3 items-start ${
                  tipoConteudo === opt.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className={`text-[12px] font-semibold mt-0.5 ${tipoConteudo === opt.id ? "text-primary" : "text-muted-foreground"}`}>
                  {opt.id}
                </span>
                <div>
                  <div className="text-[13px] font-medium">{opt.label}</div>
                  <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tema / Briefing */}
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Tema / Briefing
          </label>
          <textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            disabled={executando}
            rows={4}
            placeholder="Ex: dicas de agendamento, antes/depois de cliente, benefícios do produto..."
            className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[13px] resize-none placeholder:text-muted-foreground/60 disabled:opacity-60"
          />
        </div>

        {/* Modelo IA */}
        <div>
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Modelo IA
          </label>
          <select
            value={model}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={executando}
            className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[13px] disabled:opacity-60"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Botão */}
        <button
          type="button"
          disabled={!podeExecutar}
          onClick={() =>
            onExecutar({ cliente, retinaType, tipoConteudo, briefing, model, temaSlug: localTemaSlug, uploadedFiles })
          }
          className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-[14px] font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {executando ? "Executando…" : "Executar"}
        </button>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Atualizar `CarrosseisPagina` para novo shape de `PainelEsquerdo`**

```tsx
function CarrosseisPagina() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [executando, setExecutando] = useState(false);
  const [painelDireito, setPainelDireito] = useState<PainelDireito>("galeria");

  const handleExecutar = async (params: {
    cliente: string;
    retinaType: string;
    tipoConteudo: string;
    briefing: string;
    model: string;
    temaSlug: string;
    uploadedFiles: UploadedFile[];
  }) => {
    setExecutando(true);
    setPainelDireito("executando");
    // Implementação completa na Task 5
    await new Promise((r) => setTimeout(r, 1000));
    setExecutando(false);
    setPainelDireito("galeria");
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <PageHeader
        title="Carrosséis"
        subtitle="Crie e gerencie carrosséis com IA."
      />
      <div className="flex flex-1 gap-4 min-h-0">
        <PainelEsquerdo
          onExecutar={handleExecutar}
          executando={executando}
          temaSlug=""
          uploadedFiles={uploadedFiles}
          onAddFile={(f) => setUploadedFiles((prev) => [...prev, f])}
          onRemoveFile={(name) => setUploadedFiles((prev) => prev.filter((f) => f.filename !== name))}
        />
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-sm">Painel direito — em breve</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar form completo renderiza corretamente**

Navegar em http://localhost:3000/carrosseis. Confirmar:
- Seção Identidade Visual com thumbnails
- Drop zone de upload
- Dropdown de cliente
- Grid 3×2 de botões RETINA
- 3 opções de tipo de conteúdo
- Textarea de briefing
- Dropdown de modelo
- Botão "Executar" disabled quando briefing vazio

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "feat(carrosseis): complete creation form with all fields"
```

---

## Task 5: Painel direito — Galeria

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Adicionar componente `GaleriaCarrosseis`**

Adicionar antes de `CarrosseisPagina`:

```tsx
function GaleriaCarrosseis({ onAbrir }: { onAbrir: (c: CarrosselMeta) => void }) {
  const [carrosseis, setCarrosseis] = useState<CarrosselMeta[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetchCarrosseis().then(setCarrosseis).catch(() => setErro("Backend offline"));
  }, []);

  if (erro) return <p className="text-[13px] text-red-500">{erro}</p>;

  if (carrosseis.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-[13px]">
        Nenhum carrossel gerado ainda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 content-start overflow-y-auto h-full pb-4">
      {carrosseis.map((c) => (
        <button
          key={c.id}
          onClick={() => onAbrir(c)}
          className="text-left group"
        >
          <Card className="hover:border-primary/50 hover:shadow-md transition-all p-0 overflow-hidden">
            {c.slides[0] ? (
              <img
                src={slideUrl(c.id, c.slides[0])}
                alt={c.titulo}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-square bg-muted/40 flex items-center justify-center text-muted-foreground text-[11px]">
                Sem slides
              </div>
            )}
            <div className="p-2.5">
              <p className="font-medium text-[12px] capitalize truncate">{c.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-muted-foreground">{c.slides.length} slides</p>
                {c.inspiracoes > 0 && (
                  <p className="text-[10px] text-muted-foreground">· {c.inspiracoes} ref</p>
                )}
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Adicionar componente `ViewerCarrossel`**

Adicionar após `GaleriaCarrosseis`:

```tsx
function ViewerCarrossel({
  carrossel,
  onVoltar,
}: {
  carrossel: CarrosselMeta;
  onVoltar: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [copiado, setCopiado] = useState(false);

  const prev = () => setSlideIdx((i) => Math.max(0, i - 1));
  const next = () => setSlideIdx((i) => Math.min(carrossel.slides.length - 1, i + 1));

  const copiarLegenda = () => {
    navigator.clipboard?.writeText(carrossel.legenda).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <button
        onClick={onVoltar}
        className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-3"
      >
        <ChevronLeft size={14} /> Galeria
      </button>

      <h2 className="text-[15px] font-semibold capitalize mb-3">{carrossel.titulo}</h2>

      <div className="flex gap-4 flex-col xl:flex-row flex-1 min-h-0">
        {/* Slide viewer */}
        <div className="xl:w-72 shrink-0">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border">
            <img
              src={slideUrl(carrossel.id, carrossel.slides[slideIdx])}
              alt={`Slide ${slideIdx + 1}`}
              className="w-full h-full object-contain"
            />
            {carrossel.slides.length > 1 && (
              <>
                <button
                  onClick={prev}
                  disabled={slideIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={next}
                  disabled={slideIdx === carrossel.slides.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {carrossel.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slideIdx ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-1.5">
            {slideIdx + 1} / {carrossel.slides.length}
          </p>
          {/* Miniaturas */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
            {carrossel.slides.map((s, i) => (
              <button
                key={s}
                onClick={() => setSlideIdx(i)}
                className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                  i === slideIdx ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={slideUrl(carrossel.id, s)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Legenda */}
        {carrossel.legenda && (
          <div className="flex-1 min-w-0">
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[12px]">Legenda</h3>
                <button
                  onClick={copiarLegenda}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
                >
                  {copiado ? <Check size={12} /> : <Copy size={12} />}
                  {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="text-[12px] leading-relaxed whitespace-pre-wrap text-muted-foreground flex-1 overflow-y-auto">
                {carrossel.legenda}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Adicionar componente `PainelDireitoConteudo`**

Adicionar antes de `CarrosseisPagina`:

```tsx
function PainelDireitoConteudo({
  estado,
  carrosselAberto,
  onAbrirCarrossel,
  onVoltarGaleria,
  streamingText,
  statusText,
  onNovoCarrossel,
}: {
  estado: PainelDireito;
  carrosselAberto: CarrosselMeta | null;
  onAbrirCarrossel: (c: CarrosselMeta) => void;
  onVoltarGaleria: () => void;
  streamingText: string;
  statusText: string;
  onNovoCarrossel: () => void;
}) {
  if (estado === "executando") {
    return (
      <div className="flex-1 min-w-0 overflow-hidden">
        <Card className="h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 size={14} className="animate-spin text-primary" />
            <span className="text-[13px] font-medium text-primary">
              {statusText || "Gerando carrossel…"}
            </span>
          </div>
          <pre className="text-[12px] leading-relaxed whitespace-pre-wrap text-muted-foreground flex-1 overflow-y-auto font-mono">
            {streamingText || "Aguardando output…"}
          </pre>
        </Card>
      </div>
    );
  }

  if (estado === "concluido" && carrosselAberto) {
    return (
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="flex justify-end mb-2">
          <button
            onClick={onNovoCarrossel}
            className="text-[12px] text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1 transition-colors"
          >
            + Novo carrossel
          </button>
        </div>
        <ViewerCarrossel carrossel={carrosselAberto} onVoltar={onVoltarGaleria} />
      </div>
    );
  }

  // Galeria (ou carrossel aberto via clique na galeria)
  if (carrosselAberto) {
    return (
      <div className="flex-1 min-w-0 overflow-hidden">
        <ViewerCarrossel carrossel={carrosselAberto} onVoltar={onVoltarGaleria} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 overflow-hidden">
      <GaleriaCarrosseis onAbrir={onAbrirCarrossel} />
    </div>
  );
}
```

- [ ] **Step 4: Atualizar `CarrosseisPagina` para usar `PainelDireitoConteudo`**

```tsx
function CarrosseisPagina() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [executando, setExecutando] = useState(false);
  const [painelEstado, setPainelEstado] = useState<PainelDireito>("galeria");
  const [carrosselAberto, setCarrosselAberto] = useState<CarrosselMeta | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [statusText, setStatusText] = useState("");

  const handleExecutar = async (params: {
    cliente: string;
    retinaType: string;
    tipoConteudo: string;
    briefing: string;
    model: string;
    temaSlug: string;
    uploadedFiles: UploadedFile[];
  }) => {
    setExecutando(true);
    setPainelEstado("executando");
    setStreamingText("");
    setStatusText("Iniciando…");
    setCarrosselAberto(null);
    // Implementação do skill run na Task 6
    await new Promise((r) => setTimeout(r, 2000));
    setExecutando(false);
    setPainelEstado("galeria");
  };

  const voltarGaleria = () => {
    setCarrosselAberto(null);
    setPainelEstado("galeria");
  };

  const novoCarrossel = () => {
    setCarrosselAberto(null);
    setStreamingText("");
    setStatusText("");
    setPainelEstado("galeria");
    setUploadedFiles([]);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <PageHeader
        title="Carrosséis"
        subtitle="Crie e gerencie carrosséis com IA."
      />
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
        <PainelEsquerdo
          onExecutar={handleExecutar}
          executando={executando}
          temaSlug=""
          uploadedFiles={uploadedFiles}
          onAddFile={(f) => setUploadedFiles((prev) => [...prev, f])}
          onRemoveFile={(name) => setUploadedFiles((prev) => prev.filter((f) => f.filename !== name))}
        />
        <PainelDireitoConteudo
          estado={painelEstado}
          carrosselAberto={carrosselAberto}
          onAbrirCarrossel={setCarrosselAberto}
          onVoltarGaleria={voltarGaleria}
          streamingText={streamingText}
          statusText={statusText}
          onNovoCarrossel={novoCarrossel}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verificar galeria aparece no painel direito**

Navegar em http://localhost:3000/carrosseis. Confirmar:
- Painel esquerdo: form completo
- Painel direito: grade de carrosseis existentes
- Clicar num carrossel: abre viewer no mesmo painel direito
- Botão "Galeria" no viewer: volta para a grade

- [ ] **Step 6: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "feat(carrosseis): add gallery and viewer in right panel"
```

---

## Task 6: Execução do skill com streaming

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

- [ ] **Step 1: Substituir `handleExecutar` por implementação real**

Dentro de `CarrosseisPagina`, substituir `handleExecutar` por:

```tsx
const handleExecutar = async (params: {
  cliente: string;
  retinaType: string;
  tipoConteudo: string;
  briefing: string;
  model: string;
  temaSlug: string;
  uploadedFiles: UploadedFile[];
}) => {
  setExecutando(true);
  setPainelEstado("executando");
  setStreamingText("");
  setStatusText("Iniciando…");
  setCarrosselAberto(null);

  // Salvar IDs existentes antes de executar
  let existingIds = new Set<string>();
  try {
    const list = await fetchCarrosseis();
    existingIds = new Set(list.map((c) => c.id));
  } catch { /* ignore */ }

  // Montar input do skill
  const parts: string[] = [];
  if (params.retinaType) {
    const opt = RETINA_OPTIONS.find((o) => o.id === params.retinaType);
    parts.push(`Tipo RETINA: ${params.retinaType} — ${opt?.label}`);
  }
  if (params.tipoConteudo) {
    const opt = TIPO_OPTIONS.find((o) => o.id === params.tipoConteudo);
    parts.push(`Tipo de conteúdo: ${params.tipoConteudo} — ${opt?.label}`);
  }
  if (params.briefing.trim()) parts.push(params.briefing.trim());
  if (params.temaSlug && params.uploadedFiles.length > 0) {
    parts.push(
      `Imagens para copiar disponíveis em: marketing/conteudo/carrossel/${params.temaSlug}/inspiracoes/`,
    );
  }
  const input = parts.join("\n") || "(sem briefing)";

  try {
    await runSkill(
      { skill: "lb-conteudo-carrossel", cliente: params.cliente, input, model: params.model },
      (ev: SkillEvent) => {
        if (ev.type === "status") setStatusText(ev.text);
        else if (ev.type === "chunk") setStreamingText((prev) => prev + ev.text);
        else if (ev.type === "error") setStatusText(`Erro: ${ev.text}`);
        else if (ev.type === "done") setStatusText("Carregando imagens…");
      },
    );

    const novo = await fetchNovoCarrossel(existingIds);
    if (novo) {
      setCarrosselAberto(novo);
      setPainelEstado("concluido");
    } else {
      setPainelEstado("galeria");
    }
    setStatusText("");
  } catch (e) {
    setStatusText(`Erro: ${e instanceof Error ? e.message : "desconhecido"}`);
    setPainelEstado("galeria");
  } finally {
    setExecutando(false);
  }
};
```

- [ ] **Step 2: Testar fluxo completo**

1. Navegar em http://localhost:3000/carrosseis
2. Preencher Tema: "teste-carrossel"
3. Selecionar tipo RETINA (ex: A — Autoridade)
4. Selecionar tipo Conteúdo (ex: 1 — Texto puro)
5. Clicar Executar
6. Confirmar painel direito mostra streaming de texto em tempo real
7. Após conclusão: viewer do novo carrossel aparece no painel direito
8. Botão "Novo carrossel" limpa e volta para galeria

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "feat(carrosseis): wire skill execution with SSE streaming"
```

---

## Task 7: Upload integrado ao form — sincronizar temaSlug

**Files:**
- Modify: `frontend/src/routes/carrosseis.tsx`

O `temaSlug` para upload precisa vir do estado `briefing` do `PainelEsquerdo`, mas `UploadInspiracoes` está dentro do mesmo componente — já tem acesso via `localTemaSlug`. Confirmar que o fluxo funciona end-to-end.

- [ ] **Step 1: Testar upload com temaSlug real**

1. Navegar em http://localhost:3000/carrosseis
2. Preencher Tema: "notebook-profissional"
3. Arrastar uma imagem JPG/PNG para a drop zone
4. Confirmar thumbnail aparece
5. Verificar no filesystem: `marketing/conteudo/carrossel/notebook-profissional/inspiracoes/<timestamp>.png` existe

```bash
ls /home/luan/LBCodeOS/LBCodeOS/marketing/conteudo/carrossel/notebook-profissional/inspiracoes/ 2>/dev/null || echo "pasta não encontrada"
```

- [ ] **Step 2: Testar upload sem tema preenchido**

1. Limpar o campo Tema (deixar vazio)
2. Arrastar uma imagem
3. Confirmar mensagem de erro: "Preencha o Tema antes de fazer upload"

- [ ] **Step 3: Commit se tudo funcionar**

```bash
git add frontend/src/routes/carrosseis.tsx
git commit -m "test(carrosseis): verify upload flow with temaSlug"
```

---

## Self-Review

### Cobertura da spec

| Requisito | Task |
|-----------|------|
| Split-panel layout (esquerdo fixo 360px, direito flex-1) | Task 1, 4, 5 |
| Seção Identidade Visual com logo + refs de `identidade/` | Task 2 |
| Upload de imagens para copiar (drag-drop, thumbnails, remoção) | Task 3 |
| Upload salva em `inspiracoes/<temaSlug>/` | Task 3 |
| Erro se Tema vazio no upload | Task 3 |
| Form completo: cliente, RETINA, tipo, briefing, modelo | Task 4 |
| Executar disabled quando briefing vazio | Task 4 |
| Painel direito: galeria quando idle | Task 5 |
| Painel direito: viewer inline (sem sair da tela) | Task 5 |
| Painel direito: streaming quando executando | Task 5, 6 |
| Painel direito: viewer do novo carrossel após conclusão | Task 6 |
| Botão "Novo carrossel" reset | Task 5, 6 |
| Input do skill inclui path das imagens para copiar | Task 6 |
| Backend: sem mudanças | — (todos endpoints já existem) |

### Gaps identificados

- `GaleriaCarrosseis` não recarrega após gerar novo carrossel. Mitigado: `fetchNovoCarrossel` retorna o novo carrossel direto após execução, sem precisar recarregar a galeria. Galeria recarrega na próxima vez que o estado voltar a "galeria". Aceitável para MVP.

### Tipos consistentes

- `UploadedFile` definido na Task 3, usado em Tasks 4, 5, 6 — consistente.
- `PainelDireito` type definido no Task 1, usado em Tasks 5, 6 — consistente.
- `CarrosselMeta` definido no Task 1, igual ao type do backend — consistente.
- `SkillEvent` definido no Task 1, usado no Task 6 — consistente.
- `runSkill` definido no Task 1, assinatura usada no Task 6 — consistente.
