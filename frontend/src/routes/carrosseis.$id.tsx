import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

export const Route = createFileRoute("/carrosseis/$id")({
  component: CarrosselEditor,
});

function slideCount(html: string): number {
  return (html.match(/class="slide(["\s])/g) ?? []).length;
}

function injectPagination(html: string, activeIndex: number): string {
  const style = `<style id="__lbcode-pagination-style">
    .slide { display: none !important; }
    .slide:nth-child(${activeIndex + 1} of .slide) { display: flex !important; }
    html, body { margin: 0; height: 100%; display: flex; justify-content: center; align-items: center; background: #1a1a1a; }
  </style>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}

function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

const EDITOR_SCRIPT = `<script id="__lbcode-editor-script">
(function(){
  document.addEventListener('click', function(e){
    var t = e.target;
    while (t && t.tagName !== 'A') t = t.parentElement;
    if (!t) return;
    var h = t.getAttribute('href') || '';
    if (!h || h.startsWith('#') || h.startsWith('javascript:')) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  function markEditable(){
    var sel = '.slide h1,.slide h2,.slide h3,.slide h4,.slide p,.slide span,.slide li,.slide a,.slide strong,.slide em,.slide blockquote';
    document.querySelectorAll(sel).forEach(function(el){
      if (el.closest('[contenteditable="true"]')) return;
      if (!el.textContent || !el.textContent.trim()) return;
      var hasBlockChild = Array.prototype.some.call(el.children, function(c){
        return ['DIV','SECTION','UL','OL'].indexOf(c.tagName) !== -1;
      });
      if (hasBlockChild) return;
      el.setAttribute('contenteditable', 'true');
      el.classList.add('__lbcode-editable');
    });
  }
  markEditable();

  var style = document.createElement('style');
  style.id = '__lbcode-editor-style';
  style.textContent = '.__lbcode-editable:hover{outline:2px dashed rgba(41,197,255,.6);outline-offset:2px;cursor:text}.__lbcode-editable:focus{outline:2px solid #29C5FF}';
  document.head.appendChild(style);

  function serializeAndNotify(){
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('#__lbcode-pagination-style,#__lbcode-editor-style,#__lbcode-editor-script,#__lbcode-toolbar').forEach(function(el){ el.remove(); });
    clone.querySelectorAll('.__lbcode-editable').forEach(function(el){ el.classList.remove('__lbcode-editable'); el.removeAttribute('contenteditable'); });
    parent.postMessage({ type: 'lbcode-edit', html: '<!doctype html>' + clone.outerHTML }, '*');
  }

  document.addEventListener('blur', function(e){
    if (e.target && e.target.classList && e.target.classList.contains('__lbcode-editable')) serializeAndNotify();
  }, true);

  document.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('__lbcode-editable')) {
      e.preventDefault();
      e.target.blur();
    }
  }, true);

  var brandColors = [];
  document.querySelectorAll('style').forEach(function(styleEl){
    var matches = styleEl.textContent.match(/--[\\w-]+:\\s*#[0-9a-fA-F]{3,8}/g) || [];
    matches.forEach(function(m){
      var hex = m.split(':')[1].trim();
      if (brandColors.indexOf(hex) === -1) brandColors.push(hex);
    });
  });

  // execCommand is deprecated but remains the only API for inline formatting
  // inside contenteditable across browsers — intentional, not a TODO.
  var toolbar = document.createElement('div');
  toolbar.id = '__lbcode-toolbar';
  toolbar.style.cssText = 'position:fixed;display:none;gap:7px;align-items:center;background:#1f1f1f;border-radius:10px;padding:9px;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:999999;';

  brandColors.slice(0, 6).forEach(function(hex){
    var sw = document.createElement('button');
    sw.style.cssText = 'width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,.3);cursor:pointer;background:' + hex;
    sw.addEventListener('mousedown', function(e){ e.preventDefault(); });
    sw.addEventListener('click', function(){ document.execCommand('foreColor', false, hex); serializeAndNotify(); });
    toolbar.appendChild(sw);
  });

  var customColor = document.createElement('input');
  customColor.type = 'color';
  customColor.style.cssText = 'width:30px;height:30px;border:none;cursor:pointer;background:none;padding:0;';
  customColor.addEventListener('mousedown', function(e){ e.preventDefault(); });
  customColor.addEventListener('input', function(){ document.execCommand('foreColor', false, customColor.value); serializeAndNotify(); });
  toolbar.appendChild(customColor);

  [['B','bold'],['I','italic'],['U','underline']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:32px;height:32px;border-radius:6px;border:none;background:#3a3a3a;color:#fff;font-size:16px;font-weight:600;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand(pair[1]); serializeAndNotify(); });
    toolbar.appendChild(btn);
  });

  document.body.appendChild(toolbar);

  document.addEventListener('selectionchange', function(){
    var sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.anchorNode) { toolbar.style.display = 'none'; return; }
    var anchorEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    var editable = anchorEl ? anchorEl.closest('[contenteditable="true"]') : null;
    if (!editable) { toolbar.style.display = 'none'; return; }
    var rect = sel.getRangeAt(0).getBoundingClientRect();
    toolbar.style.left = Math.max(4, rect.left) + 'px';
    toolbar.style.top = Math.max(4, rect.top - 54) + 'px';
    toolbar.style.display = 'flex';
  });
})();
</script>`;

function injectEditor(html: string): string {
  const idx = html.indexOf("</body>");
  return idx !== -1 ? html.slice(0, idx) + EDITOR_SCRIPT + html.slice(idx) : html + EDITOR_SCRIPT;
}

const MAIN_SCALE = 0.5;
const THUMB_SCALE = 56 / 1080;

type Msg = { role: "user" | "assistant"; content: string };

function CarrosselEditor() {
  const { id } = Route.useParams();
  const [html, setHtml] = useState("");
  const [loadingHtml, setLoadingHtml] = useState(true);
  const [loadErro, setLoadErro] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [mainBlobUrl, setMainBlobUrl] = useState("");
  const [thumbBlobUrls, setThumbBlobUrls] = useState<string[]>([]);
  const mainIframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Olá! Me diga o que quer mudar nesse carrossel — texto, cor, slides. Ou clique direto no texto do preview pra editar sem IA." },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoadingHtml(true);
    fetch(`${BACKEND}/api/carrosseis/html?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((h) => {
        setHtml(h);
        setActiveSlide(0);
        setLoadingHtml(false);
      })
      .catch((e) => {
        setLoadErro(e.message);
        setLoadingHtml(false);
      });
  }, [id]);

  const total = html ? slideCount(html) : 0;

  useEffect(() => {
    if (!html) return;
    setMainBlobUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return makeBlobUrl(injectEditor(injectPagination(html, activeSlide)));
    });
  }, [html, activeSlide]);

  useEffect(() => {
    if (!html || total === 0) return;
    const urls = Array.from({ length: total }, (_, i) => makeBlobUrl(injectPagination(html, i)));
    setThumbBlobUrls((old) => {
      old.forEach((u) => URL.revokeObjectURL(u));
      return urls;
    });
  }, [html, total]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setActiveSlide((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setActiveSlide((i) => Math.min(total - 1, i + 1));
    }
    const node = previewRef.current;
    node?.addEventListener("keydown", onKeyDown);
    return () => node?.removeEventListener("keydown", onKeyDown);
  }, [total]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "lbcode-edit") return;
      if (e.source !== mainIframeRef.current?.contentWindow) return;
      applyHtml(e.data.html as string);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [html]);

  function applyHtml(newHtml: string) {
    setHtmlHistory((h) => [...h, html]);
    setHtml(newHtml);
    setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(newHtml) - 1)));
  }

  function undo() {
    setHtmlHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setHtml(prev);
      setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(prev) - 1)));
      return h.slice(0, -1);
    });
  }

  async function send() {
    const t = input.trim();
    if (!t || chatLoading) return;
    setChatError(null);
    setMessages((m) => [...m, { role: "user", content: t }, { role: "assistant", content: "" }]);
    setInput("");
    setChatLoading(true);

    try {
      const resp = await fetch(`${BACKEND}/api/carrosseis/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          instruction: t,
          history: messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendChunk = (text: string) =>
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + text };
          return copy;
        });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          try {
            const ev = JSON.parse(dataLine.slice(5).trim()) as { type: string; text?: string; html?: string };
            if (ev.type === "chunk" && ev.text) appendChunk(ev.text);
            else if (ev.type === "html" && ev.html) applyHtml(ev.html);
            else if (ev.type === "error" && ev.text) {
              setChatError(ev.text);
              appendChunk(`\n\n⚠️ ${ev.text}`);
            }
          } catch { /* ignora frame malformado */ }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setChatError(msg);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: `Erro: ${msg}` };
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function salvar() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${BACKEND}/api/carrosseis/html?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/carrosseis" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="font-semibold text-[14px] truncate capitalize">
            {id.replace(/-\d{4}-\d{2}-\d{2}$/, "").replace(/-/g, " ")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={saveError}>{saveError}</span>}
          <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="lg:w-[400px] lg:border-r border-b lg:border-b-0 border-border bg-card flex flex-col min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"}`}>
                  {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>
                {m.content && (
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {m.content}
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Sparkles size={13} />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-[13px] flex items-center gap-2">
                  <Loader2 className="animate-spin" size={13} /> Aplicando mudança…
                </div>
              </div>
            )}
            {chatError && (
              <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">{chatError}</div>
            )}
          </div>

          <div className="border-t border-border p-3 flex gap-2">
            <button
              onClick={undo}
              disabled={htmlHistory.length === 0}
              title="Desfazer"
              className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
            >
              <RotateCcw size={15} />
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
              rows={3}
              placeholder="Peça uma alteração…"
              disabled={chatLoading}
              className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-48"
            />
            <Button onClick={send} disabled={chatLoading || !input.trim()} className="!px-3 !py-2 shrink-0">
              {chatLoading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            </Button>
          </div>
        </div>

        <div
          ref={previewRef}
          tabIndex={0}
          className="flex-1 flex flex-col items-center justify-center overflow-auto min-h-[400px] bg-muted/40 outline-none gap-3 py-6"
        >
          {loadingHtml ? (
            <div className="flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="animate-spin" size={18} /> Carregando carrossel…
            </div>
          ) : loadErro ? (
            <div className="text-red-500 text-[13px]">Erro ao carregar: {loadErro}</div>
          ) : (
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
                {total > 1 && (
                  <>
                    <button
                      onClick={() => setActiveSlide((i) => Math.max(0, i - 1))}
                      disabled={activeSlide === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveSlide((i) => Math.min(total - 1, i + 1))}
                      disabled={activeSlide === total - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-center text-[12px] text-muted-foreground">{activeSlide + 1} / {total}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {thumbBlobUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`shrink-0 rounded-md overflow-hidden border-2 transition-colors bg-white ${i === activeSlide ? "border-primary" : "border-transparent"}`}
                    style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
                  >
                    <iframe
                      src={url}
                      title={`thumb ${i + 1}`}
                      tabIndex={-1}
                      sandbox="allow-same-origin"
                      style={{ width: 1080, height: 1350, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left", border: 0, pointerEvents: "none" }}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
