import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { metaKpis, diagnosticAlerts, recommendations } from "@/lib/mock";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/diagnostico-meta")({
  head: () => ({ meta: [{ title: "Diagnóstico Meta — LBCode Ads" }, { name: "description", content: "Alertas e recomendações priorizadas para Meta Ads." }] }),
  component: DiagnosticoMeta,
});

function DiagnosticoMeta() {
  return (
    <>
      <PageHeader title="Diagnóstico Meta" subtitle="Onde sua conta está perdendo dinheiro — e o que fazer agora." />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {metaKpis.map((k) => (
          <Card key={k.label} className="!p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
            <div className="text-[15px] font-semibold mt-1">{k.value}</div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Alertas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {diagnosticAlerts.map((a, i) => {
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
          {recommendations.map((r, i) => (
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
