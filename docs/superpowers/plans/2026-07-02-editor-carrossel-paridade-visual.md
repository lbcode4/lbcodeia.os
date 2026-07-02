# Editor de Carrossel — Paridade Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Formato, Template, tamanho de fonte, Banco de imagens e Conteúdo do slide (título/texto) ao editor de carrossel — todos funcionais de verdade, fechando a paridade visual com o protótipo de referência sem reintroduzir botões mortos.

**Architecture:** Tudo em cima da mesma base real já existente (HTML editado via `DOMParser`/`applyHtml`, postMessage pro iframe pra mudanças visuais). Formato é simulação de crop no preview (sem regenerar arquivo). Template reusa `aplicarFundo`+`aplicarFonte` já existentes. Tamanho de fonte entra na barra flutuante de seleção de texto já existente no `EDITOR_SCRIPT`. Banco de imagens reusa rotas de backend já existentes e testadas (`GET/POST /api/carrosseis/inspiracoes`, `GET /api/carrosseis/inspiracao`) que nunca tinham UI. Conteúdo do slide é extração/gravação de `h1`/`p` via `DOMParser`, mesmo padrão das funções puras de slide já existentes.

**Tech Stack:** React + TanStack Router (frontend only — nenhuma mudança de backend nesta leva).

## Global Constraints

- Nenhuma rota de backend nova — `GET/POST /api/carrosseis/inspiracoes` e `GET /api/carrosseis/inspiracao` já existem (`server/src/server.ts:280-331`, implementação em `server/src/identidade.ts:174-204`) e já têm teste.
- Nenhuma dependência npm nova.
- Formato 9:16 fica visível mas desabilitado (tooltip explicando) — não implementar crop/preview falso pra ele.
- Sem chips de tipo de slide (Capa/Conteúdo/Lista/Citação/Cta) no painel "Conteúdo do slide" — não existe taxonomia equivalente no HTML real.
- Sem campo de imagem dentro de "Conteúdo do slide" — imagem só entra via "Banco de imagens" (evita dois mecanismos concorrentes).
- Frontend sem harness de teste — verificação via `npx tsc --noEmit` + `npm run build`, mesmo padrão de todo o resto do projeto.
- Spec: `docs/superpowers/specs/2026-07-02-editor-carrossel-paridade-visual-design.md`.

---

### Task 1: Funções puras e constantes (Template, campos de slide)

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Produces: `const TEMPLATES: { nome: string; bg: string; fonte: string }[]`, `getSlideFields(html: string, idx: number): { title: string; body: string; hasBody: boolean }`, `setSlideFields(html: string, idx: number, fields: { title: string; body: string }): string` (retorna `html` inalterado se o slide não existir ou não tiver nem título nem corpo).

- [ ] **Step 1: Adicionar TEMPLATES e as duas funções**

Modify `frontend/src/routes/carrosseis.$id.tsx` — insira logo depois da linha `const HASHTAGS_SUGERIDAS = ["#carrossel", "#conteudo", "#dicas", "#marketingdigital", "#instagram"];` (e antes de `const EDITOR_SCRIPT = ...`):

```ts

const TEMPLATES = [
  { nome: "Minimal", bg: "#FAFAF7", fonte: "Inter" },
  { nome: "Dark Bold", bg: "#0F0F1A", fonte: "Poppins" },
  { nome: "Pastel", bg: "#FFE8DC", fonte: "Poppins" },
  { nome: "Corporate", bg: "#0F3460", fonte: "Inter" },
  { nome: "Warm Sand", bg: "#F5E6D3", fonte: "Playfair Display" },
  { nome: "Contraste", bg: "#1A1A2E", fonte: "Space Grotesk" },
];

function getSlideFields(html: string, idx: number): { title: string; body: string; hasBody: boolean } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const node = nodes[idx];
  if (!node) return { title: "", body: "", hasBody: false };
  const titleEl = node.querySelector("h1, h2, h3, h4");
  const bodyEl = node.querySelector("p");
  return {
    title: titleEl?.textContent?.trim() ?? "",
    body: bodyEl?.textContent?.trim() ?? "",
    hasBody: !!bodyEl,
  };
}

function setSlideFields(html: string, idx: number, fields: { title: string; body: string }): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const node = nodes[idx];
  if (!node) return html;
  const titleEl = node.querySelector("h1, h2, h3, h4");
  const bodyEl = node.querySelector("p");
  if (!titleEl && !bodyEl) return html;
  if (titleEl) titleEl.textContent = fields.title;
  if (bodyEl) bodyEl.textContent = fields.body;
  return serializeDoc(doc);
}
```

Note: `setSlideFields` substitui o `textContent` inteiro do elemento — se o título tiver um `<span class="grad">destaque</span>` aninhado, essa formatação se perde ao editar pelo campo Título (documentado na UI no Task 4, não é bug).

- [ ] **Step 2: Verificar que compila**

Run: `cd frontend && npx tsc --noEmit`
Expected: sem erros (funções/consts ainda não usadas em nenhum lugar — `noUnusedLocals`/`noUnusedParameters` são `false` em `frontend/tsconfig.json`, então isso não é erro nesse ponto do plano).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): funções puras pra template e campos de título/texto do slide"
```

---

### Task 2: Estado e handlers (Formato, Template, Banco de imagens, Conteúdo do slide)

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: `getSlideFields`, `setSlideFields`, `TEMPLATES` (Task 1); `aplicarFundo`, `aplicarFonte`, `applyHtml`, `html`, `activeSlide`, `id`, `mainIframeRef` (já existentes no arquivo).
- Produces: estado `previewFormat: "4:5" | "1:1"` + setter; `inspiracoes: string[]`, `inspiracoesLoading`, `inspiracoesError`, `inspiracaoUploading` + setters; `tituloSlide`, `textoSlide`, `slideHasBody` + setters; handlers `aplicarTemplate(bg: string, fonte: string)`, `commitSlideFields()`, `handleUploadInspiracao(file: File)`, `aplicarInspiracao(filename: string)`.

- [ ] **Step 1: Adicionar estado novo**

Modify `frontend/src/routes/carrosseis.$id.tsx` — logo depois da linha `const [exportError, setExportError] = useState<string | null>(null);`, adicione:

```ts

  const [previewFormat, setPreviewFormat] = useState<"4:5" | "1:1">("4:5");

  const [inspiracoes, setInspiracoes] = useState<string[]>([]);
  const [inspiracoesLoading, setInspiracoesLoading] = useState(true);
  const [inspiracoesError, setInspiracoesError] = useState<string | null>(null);
  const [inspiracaoUploading, setInspiracaoUploading] = useState(false);

  const [tituloSlide, setTituloSlide] = useState("");
  const [textoSlide, setTextoSlide] = useState("");
  const [slideHasBody, setSlideHasBody] = useState(true);

  useEffect(() => {
    setInspiracoesLoading(true);
    setInspiracoesError(null);
    fetch(`${BACKEND}/api/carrosseis/inspiracoes?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((files: string[]) => {
        setInspiracoes(files);
        setInspiracoesLoading(false);
      })
      .catch((e) => {
        setInspiracoesError(e instanceof Error ? e.message : "Erro ao carregar imagens");
        setInspiracoesLoading(false);
      });
  }, [id]);
```

- [ ] **Step 2: Adicionar effect de sincronização dos campos do slide ativo**

Logo depois da linha `const slides = html ? parseSlides(html) : [];`, adicione:

```ts

  useEffect(() => {
    if (!html) return;
    const fields = getSlideFields(html, activeSlide);
    setTituloSlide(fields.title);
    setTextoSlide(fields.body);
    setSlideHasBody(fields.hasBody);
  }, [html, activeSlide]);
```

- [ ] **Step 3: Adicionar handlers**

Logo depois da função `aplicarFonte` (que termina com `mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-font", fonte }, "*");\n  }`), adicione:

```ts

  function aplicarTemplate(bg: string, fonte: string) {
    aplicarFundo(bg);
    aplicarFonte(fonte);
  }

  function commitSlideFields() {
    const next = setSlideFields(html, activeSlide, { title: tituloSlide, body: textoSlide });
    if (next === html) return;
    applyHtml(next);
  }

  async function handleUploadInspiracao(file: File) {
    setInspiracaoUploading(true);
    setInspiracoesError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BACKEND}/api/carrosseis/inspiracoes?id=${encodeURIComponent(id)}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const body = (await res.json()) as { filename: string };
      setInspiracoes((prev) => [...prev, body.filename]);
    } catch (e) {
      setInspiracoesError(e instanceof Error ? e.message : "Erro ao enviar imagem");
    } finally {
      setInspiracaoUploading(false);
    }
  }

  function aplicarInspiracao(filename: string) {
    const url = `${BACKEND}/api/carrosseis/inspiracao?id=${encodeURIComponent(id)}&file=${encodeURIComponent(filename)}`;
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-slide-image", url }, "*");
  }
```

Nota: `aplicarInspiracao` manda o `type: "lbcode-set-slide-image"` — o handler desse tipo de mensagem dentro do iframe é adicionado na Task 3. Sem a Task 3, clicar numa imagem do banco não vai visivelmente fazer nada (mensagem enviada, ninguém escutando) — isso é esperado nesse ponto do plano, não é bug desta task.

- [ ] **Step 4: Verificar que compila**

Run: `cd frontend && npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): estado e handlers pra formato, template, banco de imagens e conteúdo do slide"
```

---

### Task 3: `EDITOR_SCRIPT` — tamanho de fonte e aplicar imagem no slide

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores diretamente (é uma string de template JS injetada no iframe) — mas o postMessage `lbcode-set-slide-image` que este task escuta é enviado por `aplicarInspiracao` (Task 2).
- Produces: 3 botões (P/M/G) na barra flutuante de seleção de texto do iframe; handler de `postMessage` tipo `lbcode-set-slide-image` que troca o fundo do slide ativo por uma imagem.

- [ ] **Step 1: Adicionar botões de tamanho de fonte na barra flutuante**

Modify `frontend/src/routes/carrosseis.$id.tsx` — dentro da string `EDITOR_SCRIPT`, logo depois do bloco:

```
  [['B','bold'],['I','italic'],['U','underline']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:64px;height:64px;border-radius:12px;border:none;background:#3a3a3a;color:#fff;font-size:32px;font-weight:600;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand(pair[1]); serializeAndNotify(); });
    toolbar.appendChild(btn);
  });
```

(e antes de `document.body.appendChild(toolbar);`), adicione:

```
  [['P','2'],['M','4'],['G','6']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:64px;height:64px;border-radius:12px;border:none;background:#3a3a3a;color:#fff;font-size:24px;font-weight:600;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand('fontSize', false, pair[1]); serializeAndNotify(); });
    toolbar.appendChild(btn);
  });
```

- [ ] **Step 2: Adicionar handler de aplicar imagem no slide**

Ainda dentro de `EDITOR_SCRIPT`, dentro do bloco `window.addEventListener('message', function(e){ ... })`, logo depois do bloco `if (e.data.type === 'lbcode-set-font') { ... }` (que termina com `serializeAndNotify();\n    }`), adicione, ainda dentro da mesma função (antes do `});` que fecha o `addEventListener`):

```
    if (e.data.type === 'lbcode-set-slide-image') {
      var slidesImg = document.querySelectorAll('.slide');
      var ativoImg = slidesImg[window.__lbcodeActiveSlide || 0];
      if (ativoImg) { ativoImg.style.background = "url('" + e.data.url + "') center/cover no-repeat"; serializeAndNotify(); }
    }
```

- [ ] **Step 3: Verificar que compila**

Run: `cd frontend && npx tsc --noEmit`
Expected: sem erros (`EDITOR_SCRIPT` é uma string de template — tsc não valida o JS dentro dela, só a sintaxe TypeScript ao redor; confirme visualmente que os backticks/aspas da string não quebraram).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): tamanho de fonte na barra flutuante e aplicar imagem do banco no slide"
```

---

### Task 4: JSX — Formato, Template, crop 1:1, Conteúdo do slide, Banco de imagens, Dica da IA

**Files:**
- Modify: `frontend/src/routes/carrosseis.$id.tsx`

**Interfaces:**
- Consumes: tudo de Tasks 1-3 (`TEMPLATES`, `previewFormat`/`setPreviewFormat`, `inspiracoes`/`inspiracoesLoading`/`inspiracoesError`/`inspiracaoUploading`, `tituloSlide`/`setTituloSlide`, `textoSlide`/`setTextoSlide`, `slideHasBody`, `aplicarTemplate`, `commitSlideFields`, `handleUploadInspiracao`, `aplicarInspiracao`) + tudo que já existia no componente (`MAIN_SCALE`, `mainBlobUrl`, `mainIframeRef`, `activeSlide`, `total`, `id`, `Card`, ícones já importados).

- [ ] **Step 1: Atualizar import de ícones**

Modify a linha 3 do arquivo, de:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon, Plus, ArrowUp, ArrowDown, Copy, Trash2, Download } from "lucide-react";
```

para:

```ts
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon, Plus, ArrowUp, ArrowDown, Copy, Trash2, Download, Upload } from "lucide-react";
```

- [ ] **Step 2: Adicionar Formato e Template no início da coluna de Aparência+Guias**

Encontre, dentro do `return (...)`, a abertura da segunda coluna do grid principal:

```tsx
        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col gap-4 overflow-y-auto p-4">
          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Aparência</h3>
```

Substitua por (adiciona 2 cards novos antes de "Aparência", mantém "Aparência" intacto):

```tsx
        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col gap-4 overflow-y-auto p-4">
          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Formato</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPreviewFormat("4:5")}
                className={`text-[11px] py-2 rounded border ${previewFormat === "4:5" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
              >
                4:5 Feed
              </button>
              <button
                onClick={() => setPreviewFormat("1:1")}
                className={`text-[11px] py-2 rounded border ${previewFormat === "1:1" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
              >
                1:1 Quadrado
              </button>
              <button
                disabled
                title="Carrossel é gerado em 4:5 — 9:16 fora de escopo"
                className="text-[11px] py-2 rounded border border-border text-muted-foreground/40 cursor-not-allowed"
              >
                9:16 Story
              </button>
            </div>
          </Card>

          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Template</h3>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.nome}
                  onClick={() => aplicarTemplate(t.bg, t.fonte)}
                  title={t.nome}
                  className="rounded border border-border overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="aspect-square" style={{ background: t.bg }} />
                  <div className="text-[9px] py-1 text-center text-muted-foreground truncate px-1">{t.nome}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Aparência</h3>
```

- [ ] **Step 3: Aplicar crop de 1:1 no preview**

Encontre:

```tsx
            <>
              <div className="relative bg-white shadow-lg overflow-hidden" style={{ width: 1080 * MAIN_SCALE, height: 1350 * MAIN_SCALE }}>
                <iframe
                  ref={mainIframeRef}
                  key={mainBlobUrl}
                  src={mainBlobUrl || undefined}
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: 1080, height: 1350, transform: `scale(${MAIN_SCALE})`, transformOrigin: "top left", border: 0 }}
                />
```

Substitua por:

```tsx
            <>
              <div className="relative bg-white shadow-lg overflow-hidden" style={{ width: 1080 * MAIN_SCALE, height: previewFormat === "1:1" ? 1080 * MAIN_SCALE : 1350 * MAIN_SCALE }}>
                <iframe
                  ref={mainIframeRef}
                  key={mainBlobUrl}
                  src={mainBlobUrl || undefined}
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ width: 1080, height: 1350, transform: `scale(${MAIN_SCALE})`, transformOrigin: "top left", marginTop: previewFormat === "1:1" ? -(1350 - 1080) / 2 : 0, border: 0 }}
                />
```

Em seguida, encontre a condição do guia de crop de perfil (para não mostrar a faixa de crop quando já se está vendo o recorte 1:1):

```tsx
                {showFeedCrop && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute left-0 right-0 top-0"
```

Troque só o `{showFeedCrop && (` (as duas ocorrências desse padrão exato: a do overlay dentro do preview E a da legenda logo abaixo, veja Step 4) por `{showFeedCrop && previewFormat === "4:5" && (` — **só na primeira ocorrência** (a do overlay dentro do container do iframe, não a da legenda abaixo do preview, que trata separadamente no próximo step). O trecho fica:

```tsx
                {showFeedCrop && previewFormat === "4:5" && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute left-0 right-0 top-0"
```

- [ ] **Step 4: Ajustar a legenda dos guias e adicionar o card "Conteúdo do slide"**

Encontre:

```tsx
              <p className="text-center text-[12px] text-muted-foreground">{activeSlide + 1} / {total}</p>
              {(showSafeZone || showFeedCrop || showGrid) && (
                <div className="flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground max-w-md">
                  {showSafeZone && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgb(34,197,94)" }} />
                      Margem segura
                    </span>
                  )}
                  {showFeedCrop && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm" style={{ background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.6) 0 3px, transparent 3px 6px)" }} />
                      Área cortada no grid do perfil
                    </span>
                  )}
                  {showGrid && <span>Regra dos terços</span>}
                </div>
              )}
            </>
          )}
        </div>
```

Substitua por (troca a segunda ocorrência de `{showFeedCrop &&` por `{showFeedCrop && previewFormat === "4:5" &&` e adiciona o card "Conteúdo do slide" antes do fechamento do fragment):

```tsx
              <p className="text-center text-[12px] text-muted-foreground">{activeSlide + 1} / {total}</p>
              {(showSafeZone || (showFeedCrop && previewFormat === "4:5") || showGrid) && (
                <div className="flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground max-w-md">
                  {showSafeZone && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgb(34,197,94)" }} />
                      Margem segura
                    </span>
                  )}
                  {showFeedCrop && previewFormat === "4:5" && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm" style={{ background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.6) 0 3px, transparent 3px 6px)" }} />
                      Área cortada no grid do perfil
                    </span>
                  )}
                  {showGrid && <span>Regra dos terços</span>}
                </div>
              )}
              <Card className="!p-4 w-full max-w-md text-left">
                <h3 className="font-semibold text-[13px] mb-3">Conteúdo do slide {activeSlide + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Título</label>
                    <input
                      value={tituloSlide}
                      onChange={(e) => setTituloSlide(e.target.value)}
                      onBlur={commitSlideFields}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Texto</label>
                    <textarea
                      value={textoSlide}
                      onChange={(e) => setTextoSlide(e.target.value)}
                      onBlur={commitSlideFields}
                      disabled={!slideHasBody}
                      placeholder={slideHasBody ? undefined : "Esse slide não tem parágrafo de corpo"}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-[13px] resize-none disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-snug">
                    Editar aqui substitui o texto por texto simples — pra manter destaque (gradiente) ou negrito, edite direto no preview acima.
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>
```

- [ ] **Step 5: Adicionar Banco de imagens e Dica da IA na coluna direita**

Encontre a transição entre o card "Slides" e o card "Legenda do post":

```tsx
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[13px]">Legenda do post</h3>
```

Substitua por (adiciona "Banco de imagens" entre os dois cards):

```tsx
            </div>
          </Card>

          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-2">Banco de imagens</h3>
            <p className="text-[11.5px] text-muted-foreground mb-3">Clique pra aplicar no slide selecionado.</p>
            {inspiracoesError && <p className="text-[11px] text-destructive mb-2">{inspiracoesError}</p>}
            {inspiracoesLoading ? (
              <p className="text-[12px] text-muted-foreground">Carregando…</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {inspiracoes.map((filename) => (
                  <button
                    key={filename}
                    onClick={() => aplicarInspiracao(filename)}
                    className="aspect-square rounded overflow-hidden border border-border hover:border-primary transition-colors"
                    title="Aplicar imagem ao slide"
                  >
                    <img
                      src={`${BACKEND}/api/carrosseis/inspiracao?id=${encodeURIComponent(id)}&file=${encodeURIComponent(filename)}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <label className="mt-2 w-full border border-dashed border-border rounded-md py-2 text-[11.5px] text-muted-foreground hover:text-primary hover:border-primary flex items-center justify-center gap-1.5 cursor-pointer">
              {inspiracaoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Enviar imagem
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={inspiracaoUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadInspiracao(file);
                  e.target.value = "";
                }}
              />
            </label>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[13px]">Legenda do post</h3>
```

Agora encontre o final da coluna direita:

```tsx
                </button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
```

Substitua por (adiciona "Dica da IA" depois de "Legenda do post", ainda dentro da mesma coluna):

```tsx
                </button>
              </>
            )}
          </Card>

          <Card className="!p-4 bg-primary/5 border-primary/30">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-semibold">Dica da IA</div>
                <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                  Carrosséis com 7 a 10 slides têm 35% mais salvamentos. Considere adicionar 2 slides de exemplos práticos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verificar que compila e builda**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: ambos sucesso, sem erros.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/routes/carrosseis.\$id.tsx
git commit -m "feat(frontend): painéis de formato, template, conteúdo do slide, banco de imagens e dica da IA"
```

---

### Task 5: Verificação final

**Files:** nenhum (só verificação)

- [ ] **Step 1: Frontend — typecheck + build**

Run: `cd frontend && npx tsc --noEmit && npm run build`
Expected: ambos sucesso.

- [ ] **Step 2: Backend — suite completa (garantir que nada quebrou, mesmo sem mudança de backend)**

Run: `cd server && npx vitest run`
Expected: mesma contagem de passes da baseline anterior (177/178, 1 falha pré-existente documentada — `contas-ads.md` drift), nenhuma falha nova.

- [ ] **Step 3: Nota de verificação manual**

Sem ferramenta de automação de navegador nesta sessão. Deixar nota pro usuário: abrir um carrossel real (não `teste`, que não tem `carrossel.html`), testar — alternar Formato 4:5/1:1 (crop deve mostrar o centro do slide), clicar um Template (fundo + fonte mudam), selecionar texto no preview e clicar P/M/G na barra flutuante (tamanho muda), enviar uma imagem no Banco de imagens e clicar pra aplicar no slide ativo, editar Título/Texto do card "Conteúdo do slide" e clicar fora (deve refletir no preview).

- [ ] **Step 4: Commit (só se Steps 1-2 exigirem correções)**

```bash
git add -A
git commit -m "fix: ajustes pós-verificação da paridade visual do editor"
```

---

## Self-Review Notes

- **Spec coverage:** Formato (Task 4 Step 3) ✓, Template (Task 1 + Task 4 Step 2) ✓, tamanho de fonte (Task 3 Step 1) ✓, Banco de imagens (Task 2 Step 3 + Task 3 Step 2 + Task 4 Step 5) ✓, Conteúdo do slide (Task 1 + Task 2 Steps 2-3 + Task 4 Step 4) ✓, reorganização de layout (Task 4 Steps 2, 4, 5) ✓, Dica da IA (Task 4 Step 5) ✓. Itens fora de escopo (9:16 real, chips de tipo, campo de imagem duplicado, agendar publicação) corretamente ausentes de toda task.
- **Placeholder scan:** sem TBD/TODO; todo step tem código literal ou comando exato com resultado esperado.
- **Type consistency:** `getSlideFields`/`setSlideFields` (Task 1) usadas com a mesma assinatura em `commitSlideFields`/no `useEffect` de sincronização (Task 2). `aplicarTemplate`, `commitSlideFields`, `handleUploadInspiracao`, `aplicarInspiracao` (Task 2) usados com os mesmos nomes exatos na JSX (Task 4). `previewFormat`/`setPreviewFormat`, `inspiracoes`/`inspiracoesLoading`/`inspiracoesError`/`inspiracaoUploading`, `tituloSlide`/`textoSlide`/`slideHasBody` (Task 2) usados sem divergência de nome na JSX (Task 4). O postMessage `lbcode-set-slide-image` enviado em Task 2 e escutado em Task 3 usa o mesmo `type` e mesmo campo `url` nos dois lados.
