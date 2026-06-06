import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import {
  Calendar, LayoutTemplate, Video, Images,
  ChevronLeft, ChevronRight, Copy, Check, X, Sparkles,
} from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Tab = "calendario" | "carrossel" | "reels" | "stories";

type CarrosselMeta = { id: string; titulo: string; slides: string[]; legenda: string };
type ConteudoItem = { id: string; titulo: string; tipo: "reels" | "stories"; data: string };
type CalendarioItem = { id: string; titulo: string };

function slideUrl(id: string, slide: string) {
  return `${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${encodeURIComponent(slide)}`;
}

async function fetchArquivo(tipo: string, id: string, arquivo: string) {
  const r = await fetch(
    `${BACKEND}/api/conteudo/arquivo?tipo=${encodeURIComponent(tipo)}&id=${encodeURIComponent(id)}&arquivo=${encodeURIComponent(arquivo)}`,
  );
  if (!r.ok) throw new Error("Não encontrado");
  return r.text();
}

export const Route = createFileRoute("/conteudo")({
  component: ConteudoPage,
});

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "carrossel", label: "Carrossel", icon: LayoutTemplate },
  { id: "reels", label: "Reels", icon: Video },
  { id: "stories", label: "Stories", icon: Images },
];

function ConteudoPage() {
  const [tab, setTab] = useState<Tab>("carrossel");

  return (
    <>
      <PageHeader
        title="Conteúdo Orgânico"
        subtitle="Calendário, carrosseis, reels e stories gerados pela IA."
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "calendario" && <TabCalendario />}
      {tab === "carrossel" && <TabCarrossel />}
      {tab === "reels" && <TabMarkdown tipo="reels" arquivo="roteiro.md" emptyMsg="Nenhum reel encontrado." />}
      {tab === "stories" && <TabMarkdown tipo="stories" arquivo="sequencia.md" emptyMsg="Nenhuma sequência de stories encontrada." />}
    </>
  );
}

// ── Calendário ──────────────────────────────────────────────────────────────

function TabCalendario() {
  const [items, setItems] = useState<CalendarioItem[]>([]);
  const [aberto, setAberto] = useState<CalendarioItem | null>(null);
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/conteudo`)
      .then((r) => r.json() as Promise<{ calendario: CalendarioItem[] }>)
      .then((d) => setItems(d.calendario));
  }, []);

  const abrir = async (item: CalendarioItem) => {
    setAberto(item);
    setLoading(true);
    setConteudo("");
    try {
      const txt = await fetchArquivo("calendario", item.id, "calendario.md");
      setConteudo(txt);
    } catch { setConteudo("Erro ao carregar."); }
    setLoading(false);
  };

  if (aberto) {
    return (
      <div>
        <button
          onClick={() => setAberto(null)}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft size={14} /> Voltar
        </button>
        <h2 className="text-lg font-semibold mb-4">{aberto.titulo}</h2>
        <Card>
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Carregando…</p>
          ) : (
            <pre className="text-[12.5px] leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
              {conteudo}
            </pre>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <button key={item.id} onClick={() => abrir(item)} className="text-left">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-semibold text-[14px]">{item.titulo}</p>
                <p className="text-[12px] text-muted-foreground mt-1">Calendário editorial</p>
              </div>
            </div>
          </Card>
        </button>
      ))}
      {items.length === 0 && (
        <EmptyState icon={Calendar} msg="Nenhum calendário encontrado." skill="lb-conteudo-calendario" />
      )}
    </div>
  );
}

// ── Carrossel ───────────────────────────────────────────────────────────────

function TabCarrossel() {
  const [carrosseis, setCarrosseis] = useState<CarrosselMeta[]>([]);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState<CarrosselMeta | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/carrosseis`)
      .then((r) => r.json() as Promise<CarrosselMeta[]>)
      .then(setCarrosseis)
      .catch(() => setErro("Backend offline ou sem carrosseis"));
  }, []);

  const abrir = (c: CarrosselMeta) => { setAberto(c); setSlideIdx(0); };
  const prev = () => setSlideIdx((i) => Math.max(0, i - 1));
  const next = () => setSlideIdx((i) => Math.min((aberto?.slides.length ?? 1) - 1, i + 1));

  const copiarLegenda = () => {
    if (!aberto) return;
    navigator.clipboard?.writeText(aberto.legenda).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  if (aberto) {
    return (
      <div>
        <button
          onClick={() => setAberto(null)}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft size={14} /> Voltar à galeria
        </button>
        <h2 className="text-lg font-semibold capitalize mb-4">{aberto.titulo}</h2>
        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="flex-1 max-w-lg">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border">
              <img
                src={slideUrl(aberto.id, aberto.slides[slideIdx])}
                alt={`Slide ${slideIdx + 1}`}
                className="w-full h-full object-contain"
              />
              {aberto.slides.length > 1 && (
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
                    disabled={slideIdx === aberto.slides.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {aberto.slides.map((_, i) => (
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
          {aberto.legenda && (
            <div className="flex-1">
              <Card className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[13px]">Legenda</h3>
                  <button
                    onClick={copiarLegenda}
                    className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
                  >
                    {copiado ? <Check size={13} /> : <Copy size={13} />}
                    {copiado ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-muted-foreground max-h-[60vh] overflow-y-auto">
                  {aberto.legenda}
                </pre>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {carrosseis.map((c) => (
          <button key={c.id} onClick={() => abrir(c)} className="text-left group">
            <Card className="hover:border-primary/50 hover:shadow-md transition-all p-0 overflow-hidden">
              {c.slides[0] ? (
                <img
                  src={slideUrl(c.id, c.slides[0])}
                  alt={c.titulo}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square bg-muted/40 flex items-center justify-center text-muted-foreground text-[12px]">
                  Sem slides
                </div>
              )}
              <div className="p-3">
                <p className="font-medium text-[13px] capitalize truncate">{c.titulo}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.slides.length} slides</p>
              </div>
            </Card>
          </button>
        ))}
        {carrosseis.length === 0 && !erro && (
          <EmptyState icon={LayoutTemplate} msg="Nenhum carrossel encontrado." skill="lb-conteudo-carrossel" />
        )}
      </div>
    </>
  );
}

// ── Reels / Stories (markdown) ───────────────────────────────────────────────

function TabMarkdown({
  tipo,
  arquivo,
  emptyMsg,
}: {
  tipo: "reels" | "stories";
  arquivo: string;
  emptyMsg: string;
}) {
  const [items, setItems] = useState<ConteudoItem[]>([]);
  const [aberto, setAberto] = useState<ConteudoItem | null>(null);
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/conteudo`)
      .then((r) => r.json() as Promise<{ reels: ConteudoItem[]; stories: ConteudoItem[] }>)
      .then((d) => setItems(d[tipo]));
  }, [tipo]);

  const abrir = async (item: ConteudoItem) => {
    setAberto(item);
    setLoading(true);
    setConteudo("");
    try {
      const txt = await fetchArquivo(tipo, item.id, arquivo);
      setConteudo(txt);
    } catch { setConteudo("Erro ao carregar."); }
    setLoading(false);
  };

  const copiar = () => {
    navigator.clipboard?.writeText(conteudo).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  const Icon = tipo === "reels" ? Video : Images;

  if (aberto) {
    return (
      <div>
        <button
          onClick={() => setAberto(null)}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft size={14} /> Voltar
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{aberto.titulo}</h2>
          <button
            onClick={copiar}
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
          >
            {copiado ? <Check size={13} /> : <Copy size={13} />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        <Card>
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Carregando…</p>
          ) : (
            <pre className="text-[12.5px] leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
              {conteudo}
            </pre>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <button key={item.id} onClick={() => abrir(item)} className="text-left">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[14px] truncate">{item.titulo}</p>
                <p className="text-[12px] text-muted-foreground mt-1">{item.data}</p>
              </div>
            </div>
          </Card>
        </button>
      ))}
      {items.length === 0 && (
        <EmptyState
          icon={Icon}
          msg={emptyMsg}
          skill={tipo === "reels" ? "lb-conteudo-reels" : "lb-conteudo-stories"}
        />
      )}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  msg,
  skill,
}: {
  icon: React.ElementType;
  msg: string;
  skill: string;
}) {
  return (
    <div className="col-span-3 flex flex-col items-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        <Icon size={22} />
      </div>
      <p className="text-[13px] text-muted-foreground">{msg}</p>
      <p className="text-[12px] text-muted-foreground/60">
        Use a skill <code className="font-mono bg-muted px-1 rounded">{skill}</code> no Assistente IA para gerar.
      </p>
    </div>
  );
}
