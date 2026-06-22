import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { ChevronLeft, ChevronRight, Copy, Check, Sparkles } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type CarrosselMeta = {
  id: string;
  titulo: string;
  slides: string[];
  legenda: string;
};

async function fetchCarrosseis(): Promise<CarrosselMeta[]> {
  const res = await fetch(`${BACKEND}/api/carrosseis`);
  if (!res.ok) throw new Error("Falha ao carregar");
  return res.json();
}

function slideUrl(id: string, slide: string, v: number) {
  return `${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${encodeURIComponent(slide)}&v=${v}`;
}

export const Route = createFileRoute("/carrosseis/")({
  component: CarrosseisPagina,
});

function CarrosseisPagina() {
  const navigate = useNavigate();
  const [carrosseis, setCarrosseis] = useState<CarrosselMeta[]>([]);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState<CarrosselMeta | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  useEffect(() => {
    fetchCarrosseis()
      .then((list) => {
        setCarrosseis(list);
        setLoadedAt(Date.now());
      })
      .catch(() => setErro("Backend offline ou sem carrosseis"));
  }, []);

  const abrir = (c: CarrosselMeta) => { setAberto(c); setSlideIdx(0); };
  const fechar = () => setAberto(null);
  const prev = () => setSlideIdx((i) => Math.max(0, i - 1));
  const next = () => setSlideIdx((i) => Math.min((aberto?.slides.length ?? 1) - 1, i + 1));

  const copiarLegenda = () => {
    if (!aberto) return;
    navigator.clipboard?.writeText(aberto.legenda).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <>
      <PageHeader
        title="Carrosseis"
        subtitle="Conteúdos gerados pelo lb-conteudo-carrossel."
      />

      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}

      {/* Grade de carrosseis */}
      {!aberto && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carrosseis.map((c) => (
            <button
              key={c.id}
              onClick={() => abrir(c)}
              className="text-left group"
            >
              <Card className="hover:border-primary/50 hover:shadow-md transition-all p-0 overflow-hidden">
                {/* Preview primeiro slide */}
                {c.slides[0] ? (
                  <img
                    src={slideUrl(c.id, c.slides[0], loadedAt)}
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
            <p className="text-[13px] text-muted-foreground col-span-3">Nenhum carrossel encontrado.</p>
          )}
        </div>
      )}

      {/* Viewer de carrossel aberto */}
      {aberto && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={fechar} className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
              <ChevronLeft size={14} /> Voltar à galeria
            </button>
            <button
              onClick={() => navigate({ to: "/carrosseis/$id", params: { id: aberto.id } })}
              className="flex items-center gap-1.5 text-[13px] bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90"
            >
              <Sparkles size={14} /> Editar com IA
            </button>
          </div>

          <h2 className="text-lg font-semibold capitalize mb-4">{aberto.titulo}</h2>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Slide viewer */}
            <div className="flex-1 max-w-lg">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/20 border border-border">
                <img
                  src={slideUrl(aberto.id, aberto.slides[slideIdx], loadedAt)}
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

              {/* Miniaturas */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {aberto.slides.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSlideIdx(i)}
                    className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                      i === slideIdx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={slideUrl(aberto.id, s, loadedAt)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Legenda */}
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
      )}
    </>
  );
}
