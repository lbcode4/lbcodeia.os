import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { CheckCircle2, Circle, FileText, X, ChevronLeft, Loader2, Sparkles, Users } from "lucide-react";
import { runSkill } from "@/lib/skill-client";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";

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

function labelCampaign(id: string) {
  const parts = id.split("-");
  const date = parts.slice(-3).join("-");
  const nicho = parts.slice(0, -3).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  return { nicho, date };
}

export const Route = createFileRoute("/prospeccao")({
  component: ProspeccaoPage,
});

function ProspeccaoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [painel, setPainel] = useState<{ titulo: string; conteudo: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // Skill generation state
  const [genTarget, setGenTarget] = useState<{ leadSlug: string; tipo: "dossie" | "roteiro" } | null>(null);
  const [genOutput, setGenOutput] = useState("");
  const [genStatus, setGenStatus] = useState("");
  const [genRunning, setGenRunning] = useState(false);
  const [genErro, setGenErro] = useState("");

  const carregarCampaigns = useCallback(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch(() => setErro("Backend offline ou sem prospecções"));
  }, []);

  useEffect(() => { carregarCampaigns(); }, [carregarCampaigns]);

  const campaign = campaigns.find((c) => c.id === activeCampaign);

  const abrirArquivo = async (titulo: string, file: string) => {
    setGenTarget(null);
    setGenOutput("");
    setLoadingFile(true);
    setPainel(null);
    try {
      const conteudo = await fetchArquivo(activeCampaign!, file);
      setPainel({ titulo, conteudo });
    } catch {
      setErro(`Arquivo não encontrado: ${file}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const gerarDocumento = async (lead: Lead, tipo: "dossie" | "roteiro") => {
    setPainel(null);
    setGenOutput("");
    setGenErro("");
    setGenStatus("Iniciando…");
    setGenRunning(true);
    setGenTarget({ leadSlug: lead.slug, tipo });

    const skill = tipo === "dossie" ? "lb-venda-dossie" : "lb-venda-prospectar";
    const { nicho, date } = labelCampaign(activeCampaign!);
    const campDir = `marketing/prospeccao/${activeCampaign}`;
    const outputPath = tipo === "dossie"
      ? `${campDir}/dossies/${lead.slug}.md`
      : `${campDir}/03-roteiros/${lead.slug}-whatsapp.md`;
    const input = [
      `Empresa a prospectar: ${lead.nome}`,
      `Instagram: ${lead.instagram}`,
      `Canal de abordagem: ${lead.canal}`,
      `Contexto da campanha: ${nicho} · ${date}`,
      `Salvar output em: ${outputPath}`,
      tipo === "dossie"
        ? "Gerar dossiê completo desta empresa."
        : "Gerar roteiro de abordagem WhatsApp para esta empresa.",
    ].join("\n");

    try {
      await runSkill({ skill, cliente: "LBCode.IA", input }, (ev) => {
        if (ev.type === "status") setGenStatus(ev.text);
        else if (ev.type === "chunk") setGenOutput((o) => o + ev.text);
        else if (ev.type === "error") setGenErro(ev.text);
        else if (ev.type === "done") { setGenStatus(""); carregarCampaigns(); }
      });
    } catch (e) {
      setGenErro(e instanceof Error ? e.message : "Falha ao executar");
    } finally {
      setGenRunning(false);
      setGenStatus("");
    }
  };

  const fecharPainel = () => {
    setPainel(null);
    setGenTarget(null);
    setGenOutput("");
    setGenErro("");
  };

  const painelAberto = painel !== null || loadingFile || genTarget !== null;

  // ── Tela inicial: lista de campanhas ────────────────────────────────────
  if (activeCampaign === null) {
    return (
      <>
        <PageHeader
          title="Prospecção Ativa"
          subtitle="Selecione uma campanha para ver os leads e gerar dossiês."
        />
        {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}
        {campaigns.length === 0 && !erro && (
          <p className="text-[13px] text-muted-foreground">Nenhuma campanha encontrada.</p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const { nicho, date } = labelCampaign(c.id);
            const done = c.leads.filter((l) => l.hasDossie && l.hasRoteiro).length;
            const total = c.leads.length;
            return (
              <button key={c.id} onClick={() => setActiveCampaign(c.id)} className="text-left">
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] capitalize">{nicho}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{date}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">{done}/{total}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{total} leads · {done} concluídos</p>
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // ── Tela de leads da campanha ────────────────────────────────────────────
  const { nicho, date } = labelCampaign(activeCampaign);

  return (
    <>
      <PageHeader
        title={`${nicho}`}
        subtitle={`Campanha ${date} · ${campaign?.leads.length ?? 0} leads`}
        actions={
          <button
            onClick={() => { setActiveCampaign(null); fecharPainel(); }}
            className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={14} /> Campanhas
          </button>
        }
      />

      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}

      <div className="flex gap-4">
        {/* Tabela de leads */}
        <div className={`${painelAberto ? "flex-1" : "w-full"} transition-all min-w-0`}>
          <Card className="p-0 overflow-hidden overflow-x-auto">
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
                {campaign?.leads.map((lead) => {
                  const gerandoDossie = genRunning && genTarget?.leadSlug === lead.slug && genTarget.tipo === "dossie";
                  const gerandoRoteiro = genRunning && genTarget?.leadSlug === lead.slug && genTarget.tipo === "roteiro";
                  return (
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
                          >
                            <CheckCircle2 size={16} />
                            <FileText size={13} />
                          </button>
                        ) : gerandoDossie ? (
                          <Loader2 size={15} className="animate-spin text-primary mx-auto" />
                        ) : (
                          <button
                            onClick={() => gerarDocumento(lead, "dossie")}
                            disabled={genRunning}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
                          >
                            <Sparkles size={11} /> Gerar
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lead.hasRoteiro ? (
                          <button
                            onClick={() => abrirArquivo(`Roteiro · ${lead.nome}`, `03-roteiros/${lead.slug}-whatsapp.md`)}
                            className="inline-flex items-center gap-1 text-green-500 hover:text-green-400"
                          >
                            <CheckCircle2 size={16} />
                            <FileText size={13} />
                          </button>
                        ) : gerandoRoteiro ? (
                          <Loader2 size={15} className="animate-spin text-primary mx-auto" />
                        ) : (
                          <button
                            onClick={() => gerarDocumento(lead, "roteiro")}
                            disabled={genRunning}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
                          >
                            <Sparkles size={11} /> Gerar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!campaign?.leads.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum lead encontrado nessa campanha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {campaign && (
            <div className="mt-3 flex gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> = pronto — clique pra ver</span>
              <span className="flex items-center gap-1"><Circle size={12} /> → <Sparkles size={11} className="text-primary" /> = clique pra gerar</span>
            </div>
          )}
        </div>

        {/* Painel lateral */}
        {painelAberto && (
          <div className="w-[480px] shrink-0">
            <Card className="flex flex-col min-h-[60vh]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-[14px] truncate">
                  {painel?.titulo ?? (genTarget ? `${genTarget.tipo === "dossie" ? "Dossiê" : "Roteiro"} · gerando…` : "Carregando…")}
                </h3>
                <button onClick={fecharPainel} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Viewer de arquivo existente */}
              {(painel || loadingFile) && (
                loadingFile ? (
                  <p className="text-[13px] text-muted-foreground">Carregando arquivo…</p>
                ) : (
                  <div className="flex-1 overflow-auto max-h-[70vh] p-2">
                    <MarkdownViewer content={painel?.conteudo || ""} />
                  </div>
                )
              )}

              {/* Output de geração */}
              {genTarget && !painel && (
                <div className="flex flex-col flex-1 min-h-0">
                  {genStatus && (
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2 shrink-0">
                      <Loader2 size={12} className="animate-spin" /> {genStatus}
                    </div>
                  )}
                  {genErro && <p className="text-[12px] text-red-500 mb-2">{genErro}</p>}
                  {genOutput ? (
                    <div className="flex-1 overflow-auto max-h-[70vh] p-2">
                      <MarkdownViewer content={genOutput} />
                    </div>
                  ) : (
                    !genStatus && !genErro && (
                      <p className="text-[13px] text-muted-foreground">Aguardando resposta da IA…</p>
                    )
                  )}
                  {!genRunning && genOutput && (
                    <p className="text-[11px] text-muted-foreground mt-3 shrink-0">
                      Arquivo salvo automaticamente pela skill. Atualize a tabela se necessário.
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
