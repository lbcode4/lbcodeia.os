import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { auditRows, quickWins, fmtBRL } from "@/lib/mock";
import { Check, AlertTriangle, TrendingDown, Loader2 } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/auditoria-meta")({
  head: () => ({ meta: [{ title: "Auditoria Meta — LBCode Ads" }, { name: "description", content: "Auditoria de conjuntos, posicionamentos e quick wins." }] }),
  component: AuditoriaMeta,
});

function AuditoriaMeta() {
  const total = quickWins.reduce((s, q) => s + q.economy, 0);
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    estrutura: { campanhas: number; conjuntos: number; anuncios: number };
    copys: Array<{ anuncio: string; problema: string; sugestao: string }>;
    segmentacoes: Array<{ conjunto: string; problema: string }>;
    itensCriticos: string[];
  }>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<typeof liveData>("lb-meta-auditoria", cs[0].cliente);
        }
      })
      .then((last) => { if (last) setLiveData(last.payload); })
      .catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Analisando conta…");
    try {
      await runSkill({ skill: "lb-meta-auditoria", cliente, input: "" }, (ev) => {
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
      <PageHeader title="Auditoria Meta" subtitle="Análise por conjunto e posicionamento — economia rápida sugerida." />

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

      {liveData && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <Card className="!p-4 text-center">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Campanhas</div>
              <div className="text-2xl font-bold mt-1">{liveData.estrutura.campanhas}</div>
            </Card>
            <Card className="!p-4 text-center">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Conjuntos</div>
              <div className="text-2xl font-bold mt-1">{liveData.estrutura.conjuntos}</div>
            </Card>
            <Card className="!p-4 text-center">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Anúncios</div>
              <div className="text-2xl font-bold mt-1">{liveData.estrutura.anuncios}</div>
            </Card>
          </div>
          {liveData.itensCriticos.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-3 text-destructive">Itens Críticos</h3>
              <ul className="space-y-2">
                {liveData.itensCriticos.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px]">
                    <AlertTriangle size={14} className="text-[color:var(--warning)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {liveData.copys.length > 0 && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Auditoria de Copys</h3>
              </div>
              <div className="divide-y divide-border">
                {liveData.copys.map((c, i) => (
                  <div key={i} className="p-4">
                    <div className="font-medium text-[13px]">{c.anuncio}</div>
                    <div className="text-[12px] text-destructive mt-1">{c.problema}</div>
                    <div className="text-[12px] text-[color:var(--success)] mt-0.5">{c.sugestao}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Conjuntos × Posicionamentos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium py-2 px-3">Conjunto</th>
                  <th className="text-left font-medium py-2 px-3">Posicionamento</th>
                  <th className="text-right font-medium py-2 px-3">Gasto</th>
                  <th className="text-right font-medium py-2 px-3">Resultados</th>
                  <th className="text-right font-medium py-2 px-3">CPA</th>
                  <th className="text-center font-medium py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2.5 px-3">{r.conjunto}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.pos}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmtBRL(r.gasto)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{r.resultados}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmtBRL(r.cpa)}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ok
                        ? <Check size={16} className="inline text-[color:var(--success)]" />
                        : <AlertTriangle size={16} className="inline text-[color:var(--warning)]" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={18} className="text-primary" />
              <h3 className="font-semibold">Quick wins</h3>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4">Onde você está perdendo dinheiro agora.</p>
            <ul className="space-y-3">
              {quickWins.map((q, i) => (
                <li key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0">
                  <div className="text-[13px]">{q.title}</div>
                  <div className="text-[12px] font-semibold text-[color:var(--success)] whitespace-nowrap">
                    ~{fmtBRL(q.economy)}/mês
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="text-[12px] text-muted-foreground">Economia total estimada</div>
              <div className="font-bold">{fmtBRL(total)}</div>
            </div>
            <Button className="w-full mt-4">Aplicar tudo</Button>
          </Card>
        </div>
      </div>
    </>
  );
}
