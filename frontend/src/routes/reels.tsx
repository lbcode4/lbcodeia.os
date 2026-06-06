import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Badge } from "@/components/app-shell";
import { reels, fmtInt } from "@/lib/mock";
import { Play, TrendingUp, Eye, Users, Loader2 } from "lucide-react";
import { fetchContas, runSkill, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels — LBCode Ads" }, { name: "description", content: "Ranking de Reels por desempenho e sugestões para impulsionar." }] }),
  component: Reels,
});

function Reels() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    reels: Array<{
      id: string;
      views: number;
      retencao: number;
      ctaRate: number;
      sugestao: string;
    }>;
  }>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas().then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); }).catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Analisando conta…");
    try {
      await runSkill({ skill: "lb-meta-analise-reels", cliente, input: "" }, (ev) => {
        if (ev.type === "status") setStatusMsg(ev.text);
        else if (ev.type === "data") setLiveData(ev.payload as typeof liveData);
        else if (ev.type === "done") setStatusMsg("");
        else if (ev.type === "error") { setStatusMsg(""); console.error(ev.text); }
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reels"
        subtitle="Ranking de Reels da Dordrian Store por desempenho."
        actions={
          <select className="h-9 px-3 rounded-md border border-border bg-card text-[13px]">
            <option>Últimos 7 dias</option>
            <option>Últimos 14 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        }
      />

      <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border flex-wrap">
        <select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-card text-[13px]"
        >
          {contas.map((c) => <option key={c.cliente} value={c.cliente}>{c.cliente}</option>)}
        </select>
        <button
          onClick={executarAnalise}
          disabled={running || !cliente}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          {running && <Loader2 size={13} className="animate-spin" />}
          {running ? statusMsg || "Analisando…" : "Executar análise real"}
        </button>
        {liveData && <span className="text-[12px] text-muted-foreground ml-auto">Dados ao vivo</span>}
      </div>

      {liveData ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {liveData.reels.map((r, i) => (
            <Card key={r.id} className="!p-0 overflow-hidden">
              <div className="relative aspect-[9/16] bg-gradient-to-b from-muted to-accent flex items-center justify-center">
                <Play size={32} className="text-muted-foreground" />
                <div className="absolute top-2 left-2 bg-background/90 text-foreground text-[11px] font-bold px-1.5 py-0.5 rounded">
                  #{i + 1}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[12px] font-medium leading-snug line-clamp-2 mb-2 min-h-[2.4em]">{r.id}</div>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> Visualizações</span>
                    <span className="font-semibold text-foreground tabular-nums">{fmtInt(r.views)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Retenção</span>
                    <span className="font-semibold text-foreground tabular-nums">{r.retencao.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><Users size={11} /> CTA Rate</span>
                    <span className="font-semibold text-foreground tabular-nums">{r.ctaRate.toFixed(1)}%</span>
                  </div>
                </div>
                {r.sugestao && (
                  <div className="mt-2 text-[11px] text-[color:var(--success)] border-t border-border pt-2">{r.sugestao}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {reels.map((r) => {
            const top3 = r.rank <= 3;
            return (
              <Card key={r.id} className="!p-0 overflow-hidden">
                <div className="relative aspect-[9/16] bg-gradient-to-b from-muted to-accent flex items-center justify-center">
                  <Play size={32} className="text-muted-foreground" />
                  <div className="absolute top-2 left-2 bg-background/90 text-foreground text-[11px] font-bold px-1.5 py-0.5 rounded">
                    #{r.rank}
                  </div>
                  {top3 && (
                    <div className="absolute top-2 right-2">
                      <Badge tone="primary">
                        <TrendingUp size={10} className="mr-0.5" /> Impulsionar
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[12px] font-medium leading-snug line-clamp-2 mb-2 min-h-[2.4em]">{r.title}</div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1"><Eye size={11} /> Visualizações</span>
                      <span className="font-semibold text-foreground tabular-nums">{fmtInt(r.views)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Engajamento</span>
                      <span className="font-semibold text-foreground tabular-nums">{r.eng.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1"><Users size={11} /> Alcance</span>
                      <span className="font-semibold text-foreground tabular-nums">{fmtInt(r.reach)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
