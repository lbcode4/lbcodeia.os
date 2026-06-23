import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Check, X, Plus, Loader2 } from "lucide-react";
import { sugerirCoresRelacionadas, type CorMarca } from "@/lib/cor-sugestoes";
import { FONTES_GOOGLE } from "@/lib/fontes-google";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type IdentidadeArquivo = { nome: string; label: string };
type Tipografia = { titulo: string | null; corpo: string | null };
type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
  paleta: CorMarca[];
  tipografia: Tipografia;
};

function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}

const fontesCarregadas = new Set<string>();

export const Route = createFileRoute("/identidade")({
  component: IdentidadePage,
});

function IdentidadePage() {
  const [data, setData] = useState<IdentidadeData | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [paleta, setPaleta] = useState<CorMarca[]>([]);
  const [mostrarAddCor, setMostrarAddCor] = useState(false);
  const [novaCor, setNovaCor] = useState({ hex: "#000000", label: "" });
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade`)
      .then((r) => r.json() as Promise<IdentidadeData>)
      .then((d) => {
        setData(d);
        setPaleta(d.paleta);
      })
      .catch(() => {});
  }, []);

  async function persistirPaleta(nova: CorMarca[]) {
    setPaleta(nova);
    setSugestoes((s) => s.filter((hex) => !nova.some((c) => c.hex.toUpperCase() === hex.toUpperCase())));
    try {
      await fetch(`${BACKEND}/api/identidade/paleta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paleta: nova }),
      });
    } catch { /* mantém em memória; próxima ação do usuário tenta salvar de novo */ }
  }

  function removerCor(hex: string) {
    persistirPaleta(paleta.filter((c) => c.hex !== hex));
  }

  function confirmarAddCor() {
    if (!novaCor.label.trim()) return;
    if (paleta.some((c) => c.hex.toUpperCase() === novaCor.hex.toUpperCase())) {
      setMostrarAddCor(false);
      return;
    }
    persistirPaleta([...paleta, { hex: novaCor.hex, label: novaCor.label.trim() }]);
    setNovaCor({ hex: "#000000", label: "" });
    setMostrarAddCor(false);
  }

  function gerarSugestoes() {
    setSugestoes(sugerirCoresRelacionadas(paleta));
  }

  function adicionarSugestao(hex: string) {
    if (paleta.some((c) => c.hex.toUpperCase() === hex.toUpperCase())) return;
    persistirPaleta([...paleta, { hex, label: "Sugestão" }]);
  }

  const [tipografia, setTipografia] = useState<Tipografia>({ titulo: null, corpo: null });

  useEffect(() => {
    if (data) setTipografia(data.tipografia);
  }, [data]);

  useEffect(() => {
    [tipografia.titulo, tipografia.corpo].forEach((fonte) => {
      if (!fonte || fontesCarregadas.has(fonte)) return;
      fontesCarregadas.add(fonte);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fonte)}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [tipografia.titulo, tipografia.corpo]);

  async function salvarTipografia(next: Tipografia) {
    setTipografia(next);
    try {
      await fetch(`${BACKEND}/api/identidade/tipografia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch { /* mantém em memória; próxima troca tenta salvar de novo */ }
  }

  type TomStatus = "loading" | "idle" | "saving" | "saved" | "error";
  const [tomDeVoz, setTomDeVoz] = useState("");
  const [evitar, setEvitar] = useState("");
  const [tomStatus, setTomStatus] = useState<TomStatus>("loading");
  const [tomErro, setTomErro] = useState("");
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade/tom-de-voz`)
      .then((r) => r.json() as Promise<{ tomDeVoz: string; evitar: string }>)
      .then((d) => {
        setTomDeVoz(d.tomDeVoz);
        setEvitar(d.evitar);
        setTomStatus("idle");
        setCarregou(true);
      })
      .catch(() => {
        setTomStatus("error");
        setTomErro("Não foi possível carregar.");
      });
  }, []);

  async function salvarTomDeVoz() {
    setTomStatus("saving");
    setTomErro("");
    try {
      const res = await fetch(`${BACKEND}/api/identidade/tom-de-voz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tomDeVoz, evitar }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setTomStatus("saved");
      setTimeout(() => setTomStatus("idle"), 2000);
    } catch (e) {
      setTomStatus("error");
      setTomErro(e instanceof Error ? e.message : "Erro desconhecido");
    }
  }

  const copiarHex = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopiado(hex);
    setTimeout(() => setCopiado(null), 1500);
  };

  return (
    <>
      <PageHeader
        title="Identidade da Marca"
        subtitle="Logo, paleta, tipografia e tom de voz que guiam todo o conteúdo."
      />

      <div className="space-y-8">
        {data?.logo && (
          <section>
            <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Logo</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-xl bg-muted/20 border border-border flex items-center justify-center overflow-hidden">
                <img
                  src={identidadeUrl(data.logo.nome)}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain p-2"
                />
              </div>
              <a
                href={identidadeUrl(data.logo.nome)}
                download={data.logo.nome}
                className="text-[12px] text-primary hover:underline"
              >
                Baixar PNG
              </a>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Paleta de cores
          </h3>
          <div className="flex flex-wrap gap-3">
            {paleta.map((cor) => (
              <div key={cor.hex} className="relative flex flex-col items-center gap-1.5 group">
                <button
                  onClick={() => copiarHex(cor.hex)}
                  className="flex flex-col items-center gap-1.5"
                  title={`Copiar ${cor.hex}`}
                >
                  <div
                    className="w-14 h-14 rounded-lg border border-border shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: cor.hex }}
                  />
                  <span className="text-[11px] text-muted-foreground">{cor.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-0.5">
                    {copiado === cor.hex ? <Check size={9} className="text-green-500" /> : null}
                    {copiado === cor.hex ? "Copiado" : cor.hex}
                  </span>
                </button>
                <button
                  onClick={() => removerCor(cor.hex)}
                  title="Remover cor"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            {mostrarAddCor ? (
              <div className="flex flex-col items-center gap-1.5">
                <input
                  type="color"
                  value={novaCor.hex}
                  onChange={(e) => setNovaCor((c) => ({ ...c, hex: e.target.value }))}
                  className="w-14 h-14 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Nome da cor"
                  value={novaCor.label}
                  onChange={(e) => setNovaCor((c) => ({ ...c, label: e.target.value }))}
                  className="w-20 text-[11px] text-center bg-background border border-border rounded px-1"
                />
                <div className="flex gap-2">
                  <button onClick={confirmarAddCor} className="text-[10px] text-primary">Add</button>
                  <button onClick={() => setMostrarAddCor(false)} className="text-[10px] text-muted-foreground">Cancelar</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setMostrarAddCor(true)}
                className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                title="Adicionar cor"
              >
                <Plus size={18} />
              </button>
            )}
          </div>

          <div className="mt-3">
            <button onClick={gerarSugestoes} className="text-[12px] text-primary hover:underline">
              Sugerir cores relacionadas
            </button>
            {sugestoes.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {sugestoes.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => adicionarSugestao(hex)}
                    className="flex flex-col items-center gap-1 group"
                    title={`Adicionar ${hex} à paleta`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center"
                      style={{ backgroundColor: hex }}
                    >
                      <Plus size={14} className="opacity-0 group-hover:opacity-90 text-white drop-shadow" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/70">{hex}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tipografia
          </h3>
          <div className="flex flex-wrap gap-8">
            {([["titulo", "Título"], ["corpo", "Corpo"]] as const).map(([campo, rotulo]) => (
              <div key={campo}>
                <label className="text-[11px] text-muted-foreground block mb-1">{rotulo}</label>
                <select
                  value={tipografia[campo] ?? ""}
                  onChange={(e) => salvarTipografia({ ...tipografia, [campo]: e.target.value || null })}
                  className="text-[13px] bg-background border border-border rounded-md px-2 py-1.5"
                >
                  <option value="">Escolher fonte…</option>
                  {FONTES_GOOGLE.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {tipografia[campo] && (
                  <p className="text-xl mt-2" style={{ fontFamily: tipografia[campo] as string }}>
                    Aa Bb Cc 123
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tom de voz
          </h3>
          <div className="flex flex-col gap-3 max-w-2xl">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Tom de voz</label>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] font-mono resize-y min-h-[140px]"
                value={tomDeVoz}
                onChange={(e) => setTomDeVoz(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">O que evitar</label>
              <textarea
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] font-mono resize-y min-h-[100px]"
                value={evitar}
                onChange={(e) => setEvitar(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={salvarTomDeVoz}
                disabled={tomStatus === "saving" || !carregou}
                className="text-[13px] font-semibold px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {tomStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
              {tomStatus === "saved" && (
                <span className="text-[12px] text-green-600 inline-flex items-center gap-1">
                  <Check size={13} /> Salvo
                </span>
              )}
              {tomStatus === "error" && <span className="text-[12px] text-destructive">{tomErro}</span>}
            </div>
          </div>
        </section>

        {data && data.refs.length > 0 && (
          <section>
            <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Referências de design
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.refs.map((r) => (
                <button
                  key={r.nome}
                  onClick={() => setLightbox(identidadeUrl(r.nome))}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/20 hover:border-primary/50 transition-colors"
                >
                  <img
                    src={identidadeUrl(r.nome)}
                    alt={r.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                    <span className="w-full px-2 py-1.5 text-[11px] text-white font-medium translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/60">
                      {r.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </div>
    </>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
      >
        <X size={16} />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
