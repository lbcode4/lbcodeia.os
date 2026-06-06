import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { AreaChart } from "@/components/charts";
import { googleKpis, googleCampaigns, spendOverTime, fmtBRL } from "@/lib/mock";
import { Loader2 } from "lucide-react";
import { fetchContas, runSkill, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/dashboard-google")({
  head: () => ({ meta: [{ title: "Dashboard Google — LBCode Ads" }, { name: "description", content: "KPIs e campanhas Google Ads (Search e Performance Max)." }] }),
  component: DashboardGoogle,
});

function DashboardGoogle() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    campanhas: Array<{ nome: string; gastos: number; conversoes: number; roas: number }>;
    cpc: number;
    conversoes: number;
    roas: number;
    alertas: string[];
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
      await runSkill({ skill: "lb-google-dashboard", cliente, input: "" }, (ev) => {
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
      <PageHeader title="Dashboard Google" subtitle="Desempenho de campanhas Search e Performance Max." />

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
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <Card className="!p-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">CPC Médio</div>
              <div className="text-lg font-bold mt-1">{fmtBRL(liveData.cpc)}</div>
            </Card>
            <Card className="!p-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Conversões</div>
              <div className="text-lg font-bold mt-1">{liveData.conversoes}</div>
            </Card>
            <Card className="!p-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">ROAS</div>
              <div className="text-lg font-bold mt-1">{liveData.roas.toFixed(2)}x</div>
            </Card>
          </div>
          {liveData.alertas.length > 0 && (
            <Card className="mb-6">
              <h3 className="font-semibold mb-3">Alertas</h3>
              <ul className="space-y-2">
                {liveData.alertas.map((a, i) => (
                  <li key={i} className="text-[13px] text-muted-foreground">{a}</li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold">Campanhas (ao vivo)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium py-2 px-3">Campanha</th>
                    <th className="text-right font-medium py-2 px-3">Gastos</th>
                    <th className="text-right font-medium py-2 px-3">Conversões</th>
                    <th className="text-right font-medium py-2 px-3">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {liveData.campanhas.map((c, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 px-3 font-medium">{c.nome}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{fmtBRL(c.gastos)}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{c.conversoes}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{c.roas.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
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
      )}
    </>
  );
}
