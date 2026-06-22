import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

const MAIN_SCALE = 1 / 3;
const THUMB_SCALE = 56 / 1080;

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
      return makeBlobUrl(injectPagination(html, activeSlide));
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
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="lg:w-[400px] lg:border-r border-b lg:border-b-0 border-border bg-card flex items-center justify-center text-muted-foreground text-[13px] p-4">
          Chat chega na próxima task.
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
