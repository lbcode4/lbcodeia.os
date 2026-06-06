import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  User,
  Loader2,
  Globe,
  Monitor,
  Smartphone,
  Rocket,
  CheckCircle2,
  RotateCcw,
  ImagePlus,
  X as XIcon,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

const PREVIEW_GUARD = `<script>
(function(){
  document.addEventListener('click', function(e){
    var t = e.target;
    while(t && t.tagName !== 'A') t = t.parentElement;
    if(!t) return;
    var h = t.getAttribute('href') || '';
    if(!h || h.startsWith('#') || h.startsWith('javascript:')) return;
    e.preventDefault();
    e.stopPropagation();
    if(h.startsWith('http://') || h.startsWith('https://')) window.open(h, '_blank', 'noopener');
  }, true);
  try { var n = function(){}; history.pushState = n; history.replaceState = n; } catch(e){}
})();
</script>`;

function injectGuard(rawHtml: string): string {
  const idx = rawHtml.indexOf("</head>");
  if (idx !== -1) return rawHtml.slice(0, idx) + PREVIEW_GUARD + rawHtml.slice(idx);
  return PREVIEW_GUARD + rawHtml;
}

function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

export const Route = createFileRoute("/sites/$siteId")({
  component: SiteEditor,
});

type SiteImage = { dataUrl: string; mediaType: string; data: string };
type Msg = { role: "user" | "assistant"; content: string; images?: SiteImage[] };

const SUGGESTIONS = [
  "Mude a cor principal para azul marinho",
  "Adicione uma seção de depoimentos",
  "Troque o título da página por algo mais impactante",
  "Adicione um formulário de contato no final",
];

async function fileToSiteImage(file: File): Promise<SiteImage | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const data = dataUrl.split(",")[1];
      resolve({ dataUrl, mediaType: file.type, data });
    };
    reader.readAsDataURL(file);
  });
}

function SiteEditor() {
  const { siteId } = Route.useParams();
  const [html, setHtml] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loadingHtml, setLoadingHtml] = useState(true);
  const [loadErro, setLoadErro] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Estou editando o site. Me diga o que quer mudar — textos, cores, seções, layout. Pode colar ou anexar imagens de referência.",
    },
  ]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingHtml(true);
    fetch(`${BACKEND}/api/sites/html?id=${encodeURIComponent(siteId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((h) => {
        const guarded = injectGuard(h);
        setHtml(guarded);
        setHistory([guarded]);
        setBlobUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return makeBlobUrl(guarded);
        });
        setLoadingHtml(false);
      })
      .catch((e) => {
        setLoadErro(e.message);
        setLoadingHtml(false);
      });
  }, [siteId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((i) => i.type.startsWith("image/"));
    if (!imageItems.length) return;
    e.preventDefault();
    const results = await Promise.all(
      imageItems.map((item) => {
        const file = item.getAsFile();
        return file ? fileToSiteImage(file) : Promise.resolve(null);
      }),
    );
    setImages((prev) => [...prev, ...results.filter((r): r is SiteImage => r !== null)]);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const results = await Promise.all(Array.from(files).map(fileToSiteImage));
    setImages((prev) => [...prev, ...results.filter((r): r is SiteImage => r !== null)]);
  }

  async function send() {
    const t = input.trim();
    if ((!t && !images.length) || loading) return;
    setError(null);
    const sentImages = [...images];
    setMessages((m) => [
      ...m,
      { role: "user", content: t, images: sentImages.length ? sentImages : undefined },
    ]);
    setInput("");
    setImages([]);
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND}/api/sites/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          html,
          instruction: t,
          images: sentImages.map((img) => ({ mediaType: img.mediaType, data: img.data })),
        }),
      });
      const data = (await resp.json()) as { html?: string; error?: string };
      if (!resp.ok) throw new Error(data.error ?? "Falha ao editar");
      const newHtml = injectGuard(data.html!);
      setHtml(newHtml);
      setHistory((h) => [...h, newHtml]);
      setBlobUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return makeBlobUrl(newHtml);
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Pronto! Alteração aplicada. Veja o preview ao lado." },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", content: `Não consegui aplicar: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function undo() {
    if (history.length <= 1) return;
    const next = history.slice(0, -1);
    setHistory(next);
    const prev = next[next.length - 1];
    setHtml(prev);
    setBlobUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return makeBlobUrl(prev);
    });
  }

  async function publish() {
    setPublishing(true);
    try {
      await fetch(`${BACKEND}/api/sites/html?id=${encodeURIComponent(siteId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      setPublished(true);
    } catch (_) {
      // ignore save errors silently
    }
    setPublishing(false);
  }

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/sites" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <Globe size={16} className="text-muted-foreground shrink-0" />
          <div className="font-semibold text-[14px] truncate capitalize">
            {siteId.replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-/g, " ")}
          </div>
          {published && (
            <Badge tone="success">
              <CheckCircle2 size={11} className="mr-1" />
              Salvo
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-muted rounded-md p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded ${device === "desktop" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              aria-label="Desktop"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded ${device === "mobile" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              aria-label="Mobile"
            >
              <Smartphone size={15} />
            </button>
          </div>
          <button
            onClick={undo}
            disabled={history.length <= 1}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-[13px] hover:bg-accent disabled:opacity-40"
          >
            <RotateCcw size={14} /> Desfazer
          </button>
          <Button onClick={publish} disabled={publishing} className="!px-4 !py-2">
            {publishing ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
            <span className="hidden sm:inline">{published ? "Salvo" : "Salvar"}</span>
          </Button>
        </div>
      </div>

      {/* Split: chat | preview */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Chat */}
        <div className="lg:w-[400px] lg:border-r border-b lg:border-b-0 border-border bg-card flex flex-col min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>
                <div className="max-w-[85%] space-y-1.5">
                  {m.images?.map((img, j) => (
                    <img
                      key={j}
                      src={img.dataUrl}
                      alt="referência"
                      className="rounded-md max-h-40 object-contain border border-border"
                    />
                  ))}
                  {m.content && (
                    <div
                      className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Sparkles size={13} />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-[13px] flex items-center gap-2">
                  <Loader2 className="animate-spin" size={13} /> Aplicando mudança…
                </div>
              </div>
            )}
            {error && (
              <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                {error}
              </div>
            )}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2">
                  Sugestões
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                    }}
                    className="block w-full text-left text-[12px] p-2.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 space-y-2">
            {/* Image previews */}
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt="anexo"
                      className="h-16 w-16 object-cover rounded-md border border-border"
                    />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Anexar imagem"
              >
                <ImagePlus size={15} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                onPaste={handlePaste}
                rows={1}
                placeholder="Peça uma alteração… ou cole uma imagem de referência"
                disabled={loading}
                className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
              />
              <Button
                type="button"
                onClick={send}
                disabled={loading || (!input.trim() && !images.length)}
                className="!px-3 !py-2 shrink-0"
              >
                {loading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-muted/40 p-4 md:p-6 flex items-start justify-center overflow-auto min-h-[400px]">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all"
            style={{
              width: device === "mobile" ? 390 : "100%",
              maxWidth: device === "desktop" ? 1200 : 390,
              height: "100%",
              minHeight: 600,
            }}
          >
            {loadingHtml ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="animate-spin" size={18} /> Carregando site…
              </div>
            ) : loadErro ? (
              <div className="w-full h-full flex items-center justify-center text-red-500 text-[13px]">
                Erro ao carregar: {loadErro}
              </div>
            ) : (
              <iframe
                key={blobUrl}
                src={blobUrl || undefined}
                title="Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
