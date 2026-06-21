import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { platformSummary, unifiedKpis, fmtBRL } from "@/lib/mock";
import { Facebook, Search, Loader2 } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/relatorio-unificado")({
  head: () => ({ meta: [{ title: "Relatório Unificado — LBCode Ads" }, { name: "description", content: "Comparativo Google × Meta e KPIs combinados." }] }),
  component: RelatorioUnificado,
});

type Plataforma = { gasto: number; conversoes: number; ctr: number };
type UnifiedLive = {
  periodo?: string;
  meta: Plataforma;
  google: Plataforma;
  investimentoTotal: number;
  conversoesTotais: number;
  cpaBlended: number;
  roasBlended: number;
  insight: { titulo: string; texto: string };
};

function RelatorioUnificado() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<UnifiedLive | null>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<UnifiedLive>("lb-ads-unificado", cs[0].cliente);
        }
      })
      .then((last) => { if (last) setLiveData(last.payload); })
      .catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Cruzando Google + Meta…");
    try {
      await runSkill({ skill: "lb-ads-unificado", cliente, input: "" }, (ev) => {
        if (ev.type === "status") setStatusMsg(ev.text);
        else if (ev.type === "data") setLiveData(ev.payload as UnifiedLive);
        else if (ev.type === "done") setStatusMsg("");
        else if (ev.type === "error") { setStatusMsg(""); console.error(ev.text); }
      });
    } finally {
      setRunning(false);
    }
  };

  // Fonte de dados: live quando disponível, senão mock.
  const meta = liveData?.meta ?? platformSummary.meta;
  const google = liveData?.google ?? platformSummary.google;
  const totalSpend = meta.gasto + google.gasto;
  const metaPct = totalSpend > 0 ? (meta.gasto / totalSpend) * 100 : 0;
  const googlePct = 100 - metaPct;

  const kpis = liveData
    ? [
        { label: "Investimento total", value: fmtBRL(liveData.investimentoTotal) },
        { label: "Conversões totais", value: String(liveData.conversoesTotais) },
        { label: "CPA blended", value: fmtBRL(liveData.cpaBlended) },
        { label: "ROAS blended", value: `${liveData.roasBlended.toFixed(1).replace(".", ",")}x` },
      ]
    : unifiedKpis;

  return (
    <>
      <PageHeader title="Relatório Unificado" subtitle="Google e Meta lado a lado — visão consolidada do investimento." />

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
          {running ? statusMsg || "Cruzando…" : "Executar relatório real"}
        </button>
        <span className="text-[12px] text-muted-foreground ml-auto">
          {liveData ? `Dados ao vivo${liveData.periodo ? ` · ${liveData.periodo}` : ""}` : "Exibindo dados de exemplo"}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="text-[12px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
            <div className="text-2xl font-bold mt-2">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Facebook size={18} className="text-primary" />
            <h3 className="font-semibold">Meta Ads</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Gasto" value={fmtBRL(meta.gasto)} />
            <Stat label="Conversões" value={String(meta.conversoes)} />
            <Stat label="CTR" value={`${meta.ctr}%`} />
            <Stat label="CPA" value={fmtBRL(meta.conversoes > 0 ? meta.gasto / meta.conversoes : 0)} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-primary" />
            <h3 className="font-semibold">Google Ads</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Custo" value={fmtBRL(google.gasto)} />
            <Stat label="Conversões" value={String(google.conversoes)} />
            <Stat label="CTR" value={`${google.ctr}%`} />
            <Stat label="CPA" value={fmtBRL(google.conversoes > 0 ? google.gasto / google.conversoes : 0)} />
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-4">Distribuição de orçamento</h3>
        <div className="h-4 rounded-full overflow-hidden flex bg-muted">
          <div className="bg-primary h-full" style={{ width: `${metaPct}%` }} />
          <div className="bg-[color:var(--foreground)] h-full" style={{ width: `${googlePct}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-[13px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span>Meta</span>
            <span className="font-semibold tabular-nums">{metaPct.toFixed(1)}%</span>
            <span className="text-muted-foreground">({fmtBRL(meta.gasto)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-foreground" />
            <span>Google</span>
            <span className="font-semibold tabular-nums">{googlePct.toFixed(1)}%</span>
            <span className="text-muted-foreground">({fmtBRL(google.gasto)})</span>
          </div>
        </div>
      </Card>

      <div className="bg-card border border-border border-l-4 border-l-primary rounded-lg p-5">
        <div className="text-[12px] uppercase tracking-wide text-primary font-semibold mb-1">Insight</div>
        {liveData ? (
          <>
            <h3 className="font-semibold text-[15px] mb-1">{liveData.insight.titulo}</h3>
            <p className="text-[14px] text-muted-foreground">{liveData.insight.texto}</p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-[15px] mb-1">Onde o orçamento rende mais</h3>
            <p className="text-[14px] text-muted-foreground">
              Meta Ads está com CPA <span className="font-semibold text-foreground">31% menor</span> que Google Ads no período.
              Considere realocar <span className="font-semibold text-foreground">R$ 500/mês</span> de PMax → Retargeting Meta para escalar conversões mantendo o ROAS.
            </p>
          </>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
