import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { CheckCircle2, Circle, FileText, X } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Lead = {
  prioridade: number;
  slug: string;
  nome: string;
  instagram: string;
  canal: string;
  hasDossie: boolean;
  hasRoteiro: boolean;
};

type Campaign = {
  id: string;
  leads: Lead[];
};

async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${BACKEND}/api/prospeccao`);
  if (!res.ok) throw new Error("Falha ao carregar prospecções");
  return res.json();
}

async function fetchArquivo(campaign: string, file: string): Promise<string> {
  const url = `${BACKEND}/api/prospeccao/arquivo?campaign=${encodeURIComponent(campaign)}&file=${encodeURIComponent(file)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Arquivo não encontrado");
  return res.text();
}

export const Route = createFileRoute("/prospeccao")({
  component: ProspeccaoPage,
});

function ProspeccaoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [erro, setErro] = useState("");
  const [painel, setPainel] = useState<{ titulo: string; conteudo: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    fetchCampaigns()
      .then((cs) => {
        setCampaigns(cs);
        if (cs[0]) setSelected(cs[0].id);
      })
      .catch(() => setErro("Backend offline ou sem prospecções"));
  }, []);

  const campaign = campaigns.find((c) => c.id === selected);

  const abrirArquivo = async (titulo: string, file: string) => {
    setLoadingFile(true);
    setPainel(null);
    try {
      const conteudo = await fetchArquivo(selected, file);
      setPainel({ titulo, conteudo });
    } catch {
      setErro(`Arquivo não encontrado: ${file}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const labelCampaign = (id: string) => {
    const parts = id.split("-");
    const date = parts.slice(-3).join("-");
    const nicho = parts.slice(0, -3).join(" ");
    return `${nicho} · ${date}`;
  };

  return (
    <>
      <PageHeader
        title="Prospecção Ativa"
        subtitle="Dossiês e roteiros gerados pelo lb-venda-prospectar."
      />

      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}

      {campaigns.length > 1 && (
        <div className="mb-4">
          <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Campanha</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-1 bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px]"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{labelCampaign(c.id)}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        {/* Tabela de leads */}
        <div className={`${painel ? "flex-1" : "w-full"} transition-all`}>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Instagram</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Canal</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Dossiê</th>
                  <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Roteiro</th>
                </tr>
              </thead>
              <tbody>
                {campaign?.leads.map((lead) => (
                  <tr key={lead.slug} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{lead.prioridade}</td>
                    <td className="px-4 py-3 font-medium">{lead.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <a
                        href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {lead.instagram}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.canal}</td>
                    <td className="px-4 py-3 text-center">
                      {lead.hasDossie ? (
                        <button
                          onClick={() => abrirArquivo(`Dossiê · ${lead.nome}`, `dossies/${lead.slug}.md`)}
                          className="inline-flex items-center gap-1 text-green-500 hover:text-green-400"
                          title="Ver dossiê"
                        >
                          <CheckCircle2 size={16} />
                          <FileText size={13} />
                        </button>
                      ) : (
                        <Circle size={16} className="text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {lead.hasRoteiro ? (
                        <button
                          onClick={() => abrirArquivo(`Roteiro · ${lead.nome}`, `03-roteiros/${lead.slug}-whatsapp.md`)}
                          className="inline-flex items-center gap-1 text-green-500 hover:text-green-400"
                          title="Ver roteiro"
                        >
                          <CheckCircle2 size={16} />
                          <FileText size={13} />
                        </button>
                      ) : (
                        <Circle size={16} className="text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
                {!campaign?.leads.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-[13px]">
                      Nenhum lead encontrado nessa campanha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {campaign && (
            <div className="mt-3 flex gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> = arquivo pronto — clique pra ver</span>
              <span className="flex items-center gap-1"><Circle size={12} /> = pendente</span>
            </div>
          )}
        </div>

        {/* Painel lateral de visualização */}
        {(painel || loadingFile) && (
          <div className="w-[480px] shrink-0">
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-[14px] truncate">{painel?.titulo ?? "Carregando…"}</h3>
                <button
                  onClick={() => setPainel(null)}
                  className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              {loadingFile ? (
                <p className="text-[13px] text-muted-foreground">Carregando arquivo…</p>
              ) : (
                <pre className="text-[12.5px] leading-relaxed whitespace-pre-wrap overflow-auto flex-1 max-h-[70vh]">
                  {painel?.conteudo}
                </pre>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
