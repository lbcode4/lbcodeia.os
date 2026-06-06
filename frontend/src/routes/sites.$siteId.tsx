import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Send, Sparkles, User, Loader2, Globe, Monitor, Smartphone,
  Rocket, CheckCircle2, RotateCcw,
} from "lucide-react";
import { Card, Button, Badge } from "@/components/app-shell";
import { sites } from "@/lib/mock";

export const Route = createFileRoute("/sites/$siteId")({
  loader: ({ params }) => {
    const site = sites.find((s) => s.id === params.siteId);
    if (!site) throw notFound();
    return { site };
  },
  component: SiteEditor,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Mude a cor principal para azul marinho",
  "Adicione uma seção de depoimentos",
  "Troque o título da página por algo mais impactante",
  "Adicione um formulário de contato no final",
];

function SiteEditor() {
  const { site } = Route.useLoaderData();
  const [html, setHtml] = useState(site.html);
  const [history, setHistory] = useState<string[]>([site.html]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Olá! Estou editando **${site.name}**. Me diga o que você quer mudar — posso alterar textos, cores, seções, layout, e mais.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(site.status === "publicado");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/public/site-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, instruction: t }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Falha ao editar");
      setHistory((h) => [...h, data.html]);
      setHtml(data.html);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Pronto! Apliquei a alteração. Olhe o preview ao lado — se quiser ajustar, é só pedir.` },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", content: `Não consegui aplicar a mudança: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function undo() {
    if (history.length <= 1) return;
    const next = history.slice(0, -1);
    setHistory(next);
    setHtml(next[next.length - 1]);
  }

  async function publish() {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPublishing(false);
    setPublished(true);
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
          <div className="min-w-0">
            <div className="font-semibold text-[14px] truncate">{site.name}</div>
            <div className="text-[11px] text-muted-foreground font-mono truncate">{site.domain}</div>
          </div>
          {published && <Badge tone="success"><CheckCircle2 size={11} className="mr-1" />Publicado</Badge>}
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
            <span className="hidden sm:inline">{published ? "Republicar" : "Publicar"}</span>
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"
                }`}>
                  {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Sparkles size={13} />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-[13px] flex items-center gap-2">
                  <Loader2 className="animate-spin" size={13} /> Aplicando mudança no site...
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
                    onClick={() => send(s)}
                    className="block w-full text-left text-[12px] p-2.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border p-3 flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
              rows={1}
              placeholder="Peça uma alteração no site..."
              disabled={loading}
              className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="!px-3 !py-2">
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            </Button>
          </form>
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
            <iframe
              key={html.length}
              srcDoc={html}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
