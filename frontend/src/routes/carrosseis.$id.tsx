import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Send, Sparkles, User, RotateCcw, CheckCircle2, ImagePlus, X as XIcon, Plus, ArrowUp, ArrowDown, Copy, Trash2, Download } from "lucide-react";
import { Button, Card } from "@/components/app-shell";
import { FONTES_GOOGLE } from "@/lib/fontes-google";

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
  </style>
  <script id="__lbcode-active-slide">window.__lbcodeActiveSlide = ${activeIndex};</script>`;
  const idx = html.indexOf("</head>");
  return idx !== -1 ? html.slice(0, idx) + style + html.slice(idx) : style + html;
}

function makeBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

function extrairCoresMarca(html: string): string[] {
  const matches = html.match(/--[\w-]+:\s*(#[0-9a-fA-F]{3,8})/g) ?? [];
  return [...new Set(matches.map((m) => m.split(":")[1].trim()))].slice(0, 6);
}

type SlideInfo = { text: string };

function parseSlides(html: string): SlideInfo[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  return nodes.map((node, i) => {
    const heading = node.querySelector("h1, h2, h3, h4, p");
    const text = heading?.textContent?.trim();
    return { text: text ? text.slice(0, 60) : `Slide ${i + 1}` };
  });
}

function serializeDoc(doc: Document): string {
  return "<!doctype html>" + doc.documentElement.outerHTML;
}

function duplicateSlideAt(html: string, idx: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const target = nodes[idx];
  if (!target) return html;
  const clone = target.cloneNode(true) as Element;
  target.after(clone);
  return serializeDoc(doc);
}

function removeSlideAt(html: string, idx: number): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  if (nodes.length <= 1) return html;
  const target = nodes[idx];
  if (!target) return html;
  target.remove();
  return serializeDoc(doc);
}

function moveSlideAt(html: string, idx: number, dir: -1 | 1): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll(".slide"));
  const j = idx + dir;
  if (j < 0 || j >= nodes.length) return html;
  const a = nodes[idx];
  const b = nodes[j];
  if (!a || !b) return html;
  if (dir === 1) b.after(a);
  else b.before(a);
  return serializeDoc(doc);
}

function addSlideAtEnd(html: string): string {
  const count = parseSlides(html).length;
  if (count === 0) return html;
  return duplicateSlideAt(html, count - 1);
}

const SUGESTOES_IA = [
  "Reescrever capa com gancho de curiosidade",
  "Gerar 3 variações de CTA",
  "Encurtar textos (regra 20 palavras)",
  "Traduzir carrossel pra inglês",
  "Sugerir hashtags pro tema",
];

const HASHTAGS_SUGERIDAS = ["#carrossel", "#conteudo", "#dicas", "#marketingdigital", "#instagram"];

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
  style.textContent = '.__lbcode-editable:hover{outline:2px dashed rgba(41,197,255,.6);outline-offset:2px;cursor:text}.__lbcode-editable:focus{outline:2px solid #29C5FF}.frame{pointer-events:none}';
  document.head.appendChild(style);

  function serializeAndNotify(){
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('#__lbcode-pagination-style,#__lbcode-active-slide,#__lbcode-editor-style,#__lbcode-editor-script,#__lbcode-toolbar').forEach(function(el){ el.remove(); });
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
  toolbar.style.cssText = 'position:fixed;display:none;gap:14px;align-items:center;background:#1f1f1f;border-radius:20px;padding:18px;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:999999;';

  brandColors.slice(0, 6).forEach(function(hex){
    var sw = document.createElement('button');
    sw.style.cssText = 'width:56px;height:56px;border-radius:12px;border:1px solid rgba(255,255,255,.3);cursor:pointer;background:' + hex;
    sw.addEventListener('mousedown', function(e){ e.preventDefault(); });
    sw.addEventListener('click', function(){ document.execCommand('foreColor', false, hex); serializeAndNotify(); });
    toolbar.appendChild(sw);
  });

  var customColor = document.createElement('input');
  customColor.type = 'color';
  customColor.style.cssText = 'width:60px;height:60px;border:none;cursor:pointer;background:none;padding:0;';
  customColor.addEventListener('mousedown', function(e){ e.preventDefault(); });
  customColor.addEventListener('input', function(){ document.execCommand('foreColor', false, customColor.value); serializeAndNotify(); });
  toolbar.appendChild(customColor);

  [['B','bold'],['I','italic'],['U','underline']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:64px;height:64px;border-radius:12px;border:none;background:#3a3a3a;color:#fff;font-size:32px;font-weight:600;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand(pair[1]); serializeAndNotify(); });
    toolbar.appendChild(btn);
  });

  [['P','2'],['M','4'],['G','6']].forEach(function(pair){
    var btn = document.createElement('button');
    btn.textContent = pair[0];
    btn.style.cssText = 'width:64px;height:64px;border-radius:12px;border:none;background:#3a3a3a;color:#fff;font-size:24px;font-weight:600;cursor:pointer;';
    btn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    btn.addEventListener('click', function(){ document.execCommand('fontSize', false, pair[1]); serializeAndNotify(); });
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
    // mede a toolbar antes de posicionar, pra poder grudar nas bordas do slide
    // (a iframe corta qualquer coisa fora de 0..1080 / 0..1350, "sair pra fora" não existe aqui)
    toolbar.style.left = '0px';
    toolbar.style.top = '0px';
    toolbar.style.display = 'flex';
    var tw = toolbar.offsetWidth;
    var th = toolbar.offsetHeight;
    var left = Math.min(Math.max(4, rect.left), document.documentElement.clientWidth - tw - 4);
    var top = rect.top - th - 10;
    if (top < 4) top = rect.bottom + 10;
    toolbar.style.left = Math.max(4, left) + 'px';
    toolbar.style.top = top + 'px';
  });

  window.addEventListener('message', function(e){
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'lbcode-set-background') {
      var slides = document.querySelectorAll('.slide');
      var ativo = slides[window.__lbcodeActiveSlide || 0];
      if (ativo) { ativo.style.background = e.data.hex; serializeAndNotify(); }
    }
    if (e.data.type === 'lbcode-set-font') {
      var fonte = e.data.fonte;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fonte) + ':wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);

      var override = document.getElementById('__lbcode-font-override');
      if (!override) {
        override = document.createElement('style');
        override.id = '__lbcode-font-override';
        document.head.appendChild(override);
      }
      override.textContent = ".slide{font-family:'" + fonte + "','Inter',Arial,sans-serif}";

      serializeAndNotify();
    }
    if (e.data.type === 'lbcode-set-slide-image') {
      var slidesImg = document.querySelectorAll('.slide');
      var ativoImg = slidesImg[window.__lbcodeActiveSlide || 0];
      if (ativoImg) { ativoImg.style.background = "url('" + e.data.url + "') center/cover no-repeat"; serializeAndNotify(); }
    }
  });
})();
</script>`;

function injectEditor(html: string): string {
  const idx = html.indexOf("</body>");
  return idx !== -1 ? html.slice(0, idx) + EDITOR_SCRIPT + html.slice(idx) : html + EDITOR_SCRIPT;
}

const MAIN_SCALE = 0.5;
const THUMB_SCALE = 56 / 1080;

type CarrosselImage = { dataUrl: string; mediaType: string; data: string };
type Msg = { role: "user" | "assistant"; content: string; images?: CarrosselImage[] };

async function fileToCarrosselImage(file: File): Promise<CarrosselImage | null> {
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

function CarrosselEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [html, setHtml] = useState("");
  const [htmlSalvo, setHtmlSalvo] = useState("");
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
  const [images, setImages] = useState<CarrosselImage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [mostrarFundo, setMostrarFundo] = useState(false);

  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showFeedCrop, setShowFeedCrop] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [legenda, setLegenda] = useState("");
  const [legendaSalva, setLegendaSalva] = useState("");
  const [legendaLoading, setLegendaLoading] = useState(true);
  const [legendaSaving, setLegendaSaving] = useState(false);
  const [legendaSaved, setLegendaSaved] = useState(false);
  const [legendaError, setLegendaError] = useState<string | null>(null);
  const [legendaLoadFailed, setLegendaLoadFailed] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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

  useEffect(() => {
    setLegendaLoading(true);
    setLegendaLoadFailed(false);
    fetch(`${BACKEND}/api/carrosseis/legenda?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((body: { legenda: string }) => {
        setLegenda(body.legenda);
        setLegendaSalva(body.legenda);
        setLegendaLoading(false);
      })
      .catch((e) => {
        setLegendaError(e instanceof Error ? e.message : "Erro ao carregar legenda");
        setLegendaLoadFailed(true);
        setLegendaLoading(false);
      });
  }, [id]);

  const slides = html ? parseSlides(html) : [];

  useEffect(() => {
    if (!html) return;
    const fields = getSlideFields(html, activeSlide);
    setTituloSlide(fields.title);
    setTextoSlide(fields.body);
    setSlideHasBody(fields.hasBody);
  }, [html, activeSlide]);

  function aplicarFundo(hex: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-background", hex }, "*");
    setMostrarFundo(false);
  }

  function aplicarFonte(fonte: string) {
    mainIframeRef.current?.contentWindow?.postMessage({ type: "lbcode-set-font", fonte }, "*");
  }

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

  useEffect(() => {
    setLoadingHtml(true);
    fetch(`${BACKEND}/api/carrosseis/html?id=${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((h) => {
        setHtml(h);
        setHtmlSalvo(h);
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

  function handleAddSlide() {
    const next = addSlideAtEnd(html);
    if (next === html) return;
    applyHtml(next);
    setActiveSlide(slideCount(next) - 1);
  }

  function handleDuplicateSlide(idx: number) {
    const next = duplicateSlideAt(html, idx);
    if (next === html) return;
    applyHtml(next);
  }

  function handleRemoveSlide(idx: number) {
    const next = removeSlideAt(html, idx);
    if (next === html) return;
    applyHtml(next);
    setActiveSlide((i) => Math.min(i, Math.max(0, slideCount(next) - 1)));
  }

  function handleMoveSlide(idx: number, dir: -1 | 1) {
    const next = moveSlideAt(html, idx, dir);
    if (next === html) return;
    applyHtml(next);
    if (activeSlide === idx) setActiveSlide(idx + dir);
    else if (activeSlide === idx + dir) setActiveSlide(idx);
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((i) => i.type.startsWith("image/"));
    if (!imageItems.length) return;
    e.preventDefault();
    const results = await Promise.all(
      imageItems.map((item) => {
        const file = item.getAsFile();
        return file ? fileToCarrosselImage(file) : Promise.resolve(null);
      }),
    );
    setImages((prev) => [...prev, ...results.filter((r): r is CarrosselImage => r !== null)]);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const results = await Promise.all(Array.from(files).map(fileToCarrosselImage));
    setImages((prev) => [...prev, ...results.filter((r): r is CarrosselImage => r !== null)]);
  }

  async function send(overrideText?: string) {
    const t = (overrideText ?? input).trim();
    if ((!t && !images.length) || chatLoading) return;
    setChatError(null);
    const sentImages = [...images];
    setMessages((m) => [
      ...m,
      { role: "user", content: t, images: sentImages.length ? sentImages : undefined },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setImages([]);
    setChatLoading(true);

    try {
      const resp = await fetch(`${BACKEND}/api/carrosseis/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          instruction: t,
          images: sentImages.map((img) => ({ mediaType: img.mediaType, data: img.data })),
          activeSlide,
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

  async function salvar(): Promise<boolean> {
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
      setHtmlSalvo(html);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro desconhecido");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function cancelar() {
    if (html !== htmlSalvo && !window.confirm("Descartar alterações não salvas?")) return;
    navigate({ to: "/carrosseis" });
  }

  async function salvarLegenda() {
    setLegendaSaving(true);
    setLegendaError(null);
    try {
      const res = await fetch(`${BACKEND}/api/carrosseis/legenda?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legenda }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setLegendaSalva(legenda);
      setLegendaSaved(true);
      setTimeout(() => setLegendaSaved(false), 2000);
    } catch (e) {
      setLegendaError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLegendaSaving(false);
    }
  }

  async function exportarPng() {
    setExporting(true);
    setExportError(null);
    try {
      if (html !== htmlSalvo) {
        const salvouOk = await salvar();
        if (!salvouOk) throw new Error("Falha ao salvar antes de exportar — PNGs podem estar desatualizados");
      }
      const totalSlides = slideCount(html);
      for (let i = 0; i < totalSlides; i++) {
        const filename = `slide-${String(i + 1).padStart(2, "0")}.png`;
        const res = await fetch(`${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${filename}`);
        if (!res.ok) throw new Error(`Falha ao baixar ${filename}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setExporting(false);
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
          {exportError && <span className="text-[12px] text-destructive max-w-[240px] truncate" title={exportError}>{exportError}</span>}
          <button
            onClick={cancelar}
            className="text-[14px] font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            onClick={exportarPng}
            disabled={exporting || loadingHtml}
            className="text-[14px] font-medium px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
            <span className="hidden sm:inline">Exportar PNG</span>
          </button>
          <Button onClick={salvar} disabled={saving} className="!px-4 !py-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col xl:grid xl:grid-cols-[320px_260px_1fr_300px] min-h-0">
        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"}`}>
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
                    <div className={`rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {m.content}
                    </div>
                  )}
                </div>
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

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {SUGESTOES_IA.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={chatLoading}
                  className="text-[11px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                onClick={undo}
                disabled={htmlHistory.length === 0}
                title="Desfazer"
                className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar imagem"
                className="h-9 w-9 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
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
                rows={3}
                placeholder="Peça uma alteração… ou cole uma imagem de referência"
                disabled={chatLoading}
                className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-48"
              />
              <Button onClick={() => send()} disabled={chatLoading || (!input.trim() && !images.length)} className="!px-3 !py-2 shrink-0">
                {chatLoading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-b xl:border-b-0 xl:border-r border-border bg-card flex flex-col gap-4 overflow-y-auto p-4">
          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Aparência</h3>
            <div className="relative mb-3">
              <button
                onClick={() => setMostrarFundo((v) => !v)}
                className="w-full text-left text-[12px] font-medium px-3 py-2 rounded-md border border-border bg-card hover:bg-accent"
              >
                Fundo
              </button>
              {mostrarFundo && (
                <div className="mt-2 flex flex-wrap items-center gap-2 p-2 rounded-md border border-border bg-card shadow-lg">
                  {extrairCoresMarca(html).map((hex) => (
                    <button
                      key={hex}
                      onClick={() => aplicarFundo(hex)}
                      title={hex}
                      className="w-7 h-7 rounded-md border border-border"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    onChange={(e) => aplicarFundo(e.target.value)}
                    className="w-7 h-7 rounded-md border border-border cursor-pointer"
                  />
                </div>
              )}
            </div>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) aplicarFonte(e.target.value); }}
              className="w-full text-[12px] px-2 py-2 rounded-md border border-border bg-card"
            >
              <option value="">Fonte…</option>
              {FONTES_GOOGLE.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Card>

          <Card className="!p-4">
            <h3 className="font-semibold text-[13px] mb-3">Guias do Instagram</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowSafeZone((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showSafeZone ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Safe zone
              </button>
              <button
                onClick={() => setShowFeedCrop((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showFeedCrop ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Crop do perfil (1:1)
              </button>
              <button
                onClick={() => setShowGrid((v) => !v)}
                className={`text-[11px] px-2 py-1.5 rounded border text-left transition-colors ${showGrid ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                Regra dos terços
              </button>
            </div>
          </Card>
        </div>

        <div
          ref={previewRef}
          tabIndex={0}
          className="border-b xl:border-b-0 xl:border-r border-border flex flex-col items-center justify-center overflow-auto min-h-[400px] bg-muted/40 outline-none gap-3 py-6"
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
                {showSafeZone && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute border-2 border-dashed"
                      style={{ top: "5%", bottom: "5%", left: "5%", right: "5%", borderColor: "rgba(34,197,94,0.85)" }}
                    />
                    <div
                      className="absolute top-[5%] left-[5%] text-[8px] font-semibold px-1 rounded-sm"
                      style={{ background: "rgba(34,197,94,0.95)", color: "#fff", transform: "translateY(-100%)" }}
                    >
                      SAFE ZONE
                    </div>
                  </div>
                )}
                {showFeedCrop && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div
                      className="absolute left-0 right-0 top-0"
                      style={{
                        height: "10%",
                        background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.18) 0 6px, transparent 6px 12px)",
                        borderBottom: "1.5px dashed rgba(239,68,68,0.9)",
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 bottom-0"
                      style={{
                        height: "10%",
                        background: "repeating-linear-gradient(45deg, rgba(239,68,68,0.18) 0 6px, transparent 6px 12px)",
                        borderTop: "1.5px dashed rgba(239,68,68,0.9)",
                      }}
                    />
                    <div
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-semibold px-1.5 py-0.5 rounded-sm"
                      style={{ background: "rgba(239,68,68,0.95)", color: "#fff" }}
                    >
                      1:1 perfil
                    </div>
                  </div>
                )}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-white/40 mix-blend-difference" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-white/40 mix-blend-difference" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/40 mix-blend-difference" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/40 mix-blend-difference" />
                  </div>
                )}
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

        <div className="bg-card flex flex-col gap-4 min-h-0 overflow-y-auto p-4">
          <Card className="!p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="font-semibold text-[13px]">Slides ({slides.length})</h3>
              <button
                onClick={handleAddSlide}
                disabled={loadingHtml}
                className="text-[12px] inline-flex items-center gap-1 text-primary hover:opacity-80 disabled:opacity-40"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {slides.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`group rounded-md border p-2 cursor-pointer transition-colors ${i === activeSlide ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="shrink-0 rounded overflow-hidden border border-border bg-white"
                      style={{ width: 1080 * THUMB_SCALE, height: 1350 * THUMB_SCALE }}
                    >
                      {thumbBlobUrls[i] && (
                        <iframe
                          src={thumbBlobUrls[i]}
                          title={`thumb ${i + 1}`}
                          tabIndex={-1}
                          sandbox="allow-same-origin"
                          style={{ width: 1080, height: 1350, transform: `scale(${THUMB_SCALE})`, transformOrigin: "top left", border: 0, pointerEvents: "none" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted-foreground">Slide {i + 1}</div>
                      <div className="text-[12px] font-medium truncate mt-0.5">{s.text}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(i, -1); }}
                      disabled={i === 0}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(i, 1); }}
                      disabled={i === slides.length - 1}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(i); }}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-accent"
                    >
                      <Copy size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSlide(i); }}
                      disabled={slides.length <= 1}
                      className="h-6 w-6 rounded border border-border flex items-center justify-center hover:bg-destructive/10 text-destructive ml-auto disabled:opacity-30"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[13px]">Legenda do post</h3>
              {legendaSaved && <span className="text-[11px] text-[color:var(--success)]">Salvo</span>}
            </div>
            {legendaLoading ? (
              <p className="text-[12px] text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <textarea
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] resize-none"
                />
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
                  <span>{legenda.length} / 2.200 caracteres</span>
                  <span>{(legenda.match(/#\w+/g) ?? []).length} hashtags</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {HASHTAGS_SUGERIDAS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setLegenda((c) => (c ? `${c} ${h}` : h))}
                      className="text-[11px] px-2 py-1 rounded-full border border-border hover:border-primary hover:text-primary"
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {legendaError && <p className="text-[11px] text-destructive mt-2">{legendaError}</p>}
                <button
                  onClick={salvarLegenda}
                  disabled={legendaSaving || legenda === legendaSalva || legendaLoadFailed}
                  className="mt-3 w-full text-[12px] font-medium px-3 py-2 rounded-md border border-border bg-card hover:bg-accent disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {legendaSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                  Salvar legenda
                </button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
