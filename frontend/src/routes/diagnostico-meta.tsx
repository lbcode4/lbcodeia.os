import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { metaKpis, diagnosticAlerts, recommendations } from "@/lib/mock";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/diagnostico-meta")({
  head: () => ({ meta: [{ title: "Diagnóstico Meta — LBCode Ads" }, { name: "description", content: "Alertas e recomendações priorizadas para Meta Ads." }] }),
  component: DiagnosticoMeta,
});

function DiagnosticoMeta() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    score: number;
    alertas: Array<{ nivel: "critico" | "atencao" | "ok"; mensagem: string }>;
    recomendacoes: string[];
    metricas: Record<string, number>;
  }>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<typeof liveData>("lb-meta-diagnostico", cs[0].cliente);
        }
      })
      .then((last) => { if (last) setLiveData(last.payload); })
      .catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Analisando conta…");
    try {
      await runSkill({ skill: "lb-meta-diagnostico", cliente, input: "" }, (ev) => {
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
      <PageHeader title="Diagnóstico Meta" subtitle="Onde sua conta está perdendo dinheiro — e o que fazer agora." />

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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {liveData ? (() => {
          const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          const fmtInt = (n: number) => n.toLocaleString("pt-BR");
          const m = liveData.metricas;
          const kpis = [
            { label: "Gasto 7d", value: fmtBRL(m.gasto_total_7d ?? 0) },
            { label: "Impressões", value: fmtInt(m.impressoes_7d ?? 0) },
            { label: "Cliques", value: fmtInt(m.cliques_7d ?? 0) },
            { label: "CTR", value: `${(m.ctr ?? 0).toFixed(2)}%` },
            { label: "Campanhas", value: fmtInt(m.total_campanhas ?? 0) },
            { label: "Ativas", value: fmtInt(m.campanhas_ativas ?? 0) },
            { label: "Score", value: `${m.score ?? liveData.score}/100` },
          ];
          return kpis.map((k) => (
            <Card key={k.label} className="!p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
              <div className="text-[15px] font-semibold mt-1">{k.value}</div>
            </Card>
          ));
        })() : metaKpis.map((k) => (
          <Card key={k.label} className="!p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
            <div className="text-[15px] font-semibold mt-1">{k.value}</div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Alertas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {liveData ? liveData.alertas.map((a, i) => {
          const Icon = a.nivel === "critico" ? AlertCircle : a.nivel === "atencao" ? AlertTriangle : CheckCircle2;
          const borderColor =
            a.nivel === "critico" ? "border-l-destructive" :
            a.nivel === "atencao" ? "border-l-[color:var(--warning)]" : "border-l-[color:var(--success)]";
          const iconColor =
            a.nivel === "critico" ? "text-destructive" :
            a.nivel === "atencao" ? "text-[color:var(--warning)]" : "text-[color:var(--success)]";
          return (
            <Card key={i} className={`border-l-4 ${borderColor}`}>
              <div className="flex items-start gap-3">
                <Icon size={20} className={iconColor} />
                <div className="flex-1">
                  <p className="text-[13px]">{a.mensagem}</p>
                </div>
              </div>
            </Card>
          );
        }) : diagnosticAlerts.map((a, i) => {
          const Icon = a.sev === "error" ? AlertCircle : a.sev === "warning" ? AlertTriangle : CheckCircle2;
          const borderColor =
            a.sev === "error" ? "border-l-destructive" :
            a.sev === "warning" ? "border-l-[color:var(--warning)]" : "border-l-[color:var(--success)]";
          const iconColor =
            a.sev === "error" ? "text-destructive" :
            a.sev === "warning" ? "text-[color:var(--warning)]" : "text-[color:var(--success)]";
          return (
            <Card key={i} className={`border-l-4 ${borderColor}`}>
              <div className="flex items-start gap-3">
                <Icon size={20} className={iconColor} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-[14px]">{a.title}</h4>
                    <span className="text-[13px] font-semibold tabular-nums">{a.value}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">{a.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3">Recomendações priorizadas</h2>
      <Card className="!p-0 overflow-hidden">
        <ul className="divide-y divide-border">
          {liveData ? liveData.recomendacoes.map((rec, i) => (
            <li key={i} className="p-5 flex items-start gap-4">
              <div className="text-2xl font-bold text-muted-foreground w-8 shrink-0 tabular-nums">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px]">{rec}</p>
              </div>
            </li>
          )) : recommendations.map((r, i) => (
            <li key={i} className="p-5 flex items-start gap-4">
              <div className="text-2xl font-bold text-muted-foreground w-8 shrink-0 tabular-nums">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-[14px]">{r.title}</h4>
                  <Badge tone={r.prio === "Alta" ? "error" : r.prio === "Média" ? "warning" : "neutral"}>
                    {r.prio}
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <Button variant="secondary" className="shrink-0">Detalhes</Button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
