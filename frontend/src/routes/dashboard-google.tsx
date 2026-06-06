import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/app-shell";
import { AreaChart } from "@/components/charts";
import { googleKpis, googleCampaigns, spendOverTime, fmtBRL } from "@/lib/mock";

export const Route = createFileRoute("/dashboard-google")({
  head: () => ({ meta: [{ title: "Dashboard Google — LBCode Ads" }, { name: "description", content: "KPIs e campanhas Google Ads (Search e Performance Max)." }] }),
  component: DashboardGoogle,
});

function DashboardGoogle() {
  return (
    <>
      <PageHeader title="Dashboard Google" subtitle="Desempenho de campanhas Search e Performance Max." />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {googleKpis.map((k) => (
          <Card key={k.label} className="!p-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
            <div className="text-lg font-bold mt-1">{k.value}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold mb-2">Custo x tempo</h3>
        <AreaChart data={spendOverTime} yFormat={fmtBRL} />
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Campanhas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium py-2 px-3">Campanha</th>
                <th className="text-left font-medium py-2 px-3">Tipo</th>
                <th className="text-right font-medium py-2 px-3">Custo</th>
                <th className="text-right font-medium py-2 px-3">Cliques</th>
                <th className="text-right font-medium py-2 px-3">CTR</th>
                <th className="text-right font-medium py-2 px-3">Conv.</th>
                <th className="text-right font-medium py-2 px-3">CPA</th>
              </tr>
            </thead>
            <tbody>
              {googleCampaigns.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="py-3 px-3 font-medium">{c.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{c.tipo}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{fmtBRL(c.custo)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{c.cliques.toLocaleString("pt-BR")}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{c.ctr}%</td>
                  <td className="py-3 px-3 text-right tabular-nums">{c.conv}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{fmtBRL(c.cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
