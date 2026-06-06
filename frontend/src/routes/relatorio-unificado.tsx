import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/app-shell";
import { unifiedKpis, platformSummary, fmtBRL } from "@/lib/mock";
import { Facebook, Search } from "lucide-react";

export const Route = createFileRoute("/relatorio-unificado")({
  head: () => ({ meta: [{ title: "Relatório Unificado — LBCode Ads" }, { name: "description", content: "Comparativo Google × Meta e KPIs combinados." }] }),
  component: RelatorioUnificado,
});

function RelatorioUnificado() {
  const totalSpend = platformSummary.meta.gasto + platformSummary.google.gasto;
  const metaPct = (platformSummary.meta.gasto / totalSpend) * 100;
  const googlePct = 100 - metaPct;

  return (
    <>
      <PageHeader title="Relatório Unificado" subtitle="Google e Meta lado a lado — visão consolidada do investimento." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {unifiedKpis.map((k) => (
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
            <Stat label="Gasto" value={fmtBRL(platformSummary.meta.gasto)} />
            <Stat label="Conversões" value={String(platformSummary.meta.conversoes)} />
            <Stat label="CTR" value={`${platformSummary.meta.ctr}%`} />
            <Stat label="CPA" value={fmtBRL(platformSummary.meta.gasto / platformSummary.meta.conversoes)} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-primary" />
            <h3 className="font-semibold">Google Ads</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Custo" value={fmtBRL(platformSummary.google.gasto)} />
            <Stat label="Conversões" value={String(platformSummary.google.conversoes)} />
            <Stat label="CTR" value={`${platformSummary.google.ctr}%`} />
            <Stat label="CPA" value={fmtBRL(platformSummary.google.gasto / platformSummary.google.conversoes)} />
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
            <span className="text-muted-foreground">({fmtBRL(platformSummary.meta.gasto)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-foreground" />
            <span>Google</span>
            <span className="font-semibold tabular-nums">{googlePct.toFixed(1)}%</span>
            <span className="text-muted-foreground">({fmtBRL(platformSummary.google.gasto)})</span>
          </div>
        </div>
      </Card>

      <div className="bg-card border border-border border-l-4 border-l-primary rounded-lg p-5">
        <div className="text-[12px] uppercase tracking-wide text-primary font-semibold mb-1">Insight</div>
        <h3 className="font-semibold text-[15px] mb-1">Onde o orçamento rende mais</h3>
        <p className="text-[14px] text-muted-foreground">
          Meta Ads está com CPA <span className="font-semibold text-foreground">31% menor</span> que Google Ads no período.
          Considere realocar <span className="font-semibold text-foreground">R$ 500/mês</span> de PMax → Retargeting Meta para escalar conversões mantendo o ROAS.
        </p>
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
