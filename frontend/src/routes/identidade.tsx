import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell";
import { Check, X } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type IdentidadeArquivo = { nome: string; label: string };
type IdentidadeData = { logo: IdentidadeArquivo | null; refs: IdentidadeArquivo[] };

const BRAND_COLORS = [
  { hex: "#07070F", label: "Fundo" },
  { hex: "#A24BFF", label: "Roxo neon" },
  { hex: "#29C5FF", label: "Ciano neon" },
  { hex: "#FFFFFF", label: "Texto principal" },
  { hex: "#C9C9D6", label: "Texto secundário" },
];

function identidadeUrl(file: string) {
  return `${BACKEND}/api/identidade/arquivo?file=${encodeURIComponent(file)}`;
}

export const Route = createFileRoute("/identidade")({
  component: IdentidadePage,
});

function IdentidadePage() {
  const [data, setData] = useState<IdentidadeData | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/identidade`)
      .then((r) => r.json() as Promise<IdentidadeData>)
      .then(setData)
      .catch(() => {});
  }, []);

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
            {BRAND_COLORS.map((cor) => (
              <button
                key={cor.hex}
                onClick={() => copiarHex(cor.hex)}
                className="flex flex-col items-center gap-1.5 group"
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
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tipografia
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Em breve — defina aqui as fontes da marca (título, corpo, destaque).
          </p>
        </section>

        <section>
          <h3 className="text-[13px] font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Tom de voz
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Em breve — descreva aqui o tom de voz, palavras-chave e o que evitar.
          </p>
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
