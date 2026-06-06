import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { Sparkline } from "@/components/charts";
import { overviewKpis, platformSummary, alerts, fmtBRL, fmtInt } from "@/lib/mock";
import { ArrowDownRight, ArrowUpRight, AlertTriangle, AlertCircle, CheckCircle2, BarChart3, Stethoscope, Sparkles, Film } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — LBCode Ads" },
      { name: "description", content: "KPIs cross-platform, resumo Meta e Google, alertas e ações rápidas." },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <>
      <PageHeader title="Visão Geral" subtitle="Resumo cross-platform — Meta Ads + Google Ads · Dordrian Store" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overviewKpis.map((k) => {
          const good = k.deltaGood ?? k.deltaUp;
          return (
            <Card key={k.label}>
              <div className="text-[12px] text-muted-foreground uppercase tracking-wide">{k.label}</div>
              <div className="text-3xl font-bold mt-2">{k.value}</div>
              <div className={`mt-2 inline-flex items-center gap-1 text-[12px] ${good ? "text-[color:var(--success)]" : "text-destructive"}`}>
                {k.deltaUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(k.delta)}% vs período anterior
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {(["meta", "google"] as const).map((p) => {
          const d = platformSummary[p];
          const label = p === "meta" ? "Meta Ads" : "Google Ads";
          return (
            <Card key={p}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[12px] text-muted-foreground uppercase tracking-wide">Plataforma</div>
                  <h3 className="text-lg font-semibold mt-1">{label}</h3>
                </div>
                <Sparkline data={d.spark} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <div className="text-[11px] text-muted-foreground">Gasto</div>
                  <div className="font-semibold mt-1">{fmtBRL(d.gasto)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Conversões</div>
                  <div className="font-semibold mt-1">{fmtInt(d.conversoes)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">CTR</div>
                  <div className="font-semibold mt-1">{d.ctr.toLocaleString("pt-BR")}%</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Alertas e atividade recente</h3>
            <Badge tone="primary">{alerts.length} novos</Badge>
          </div>
          <ul className="divide-y divide-border">
            {alerts.map((a, i) => {
              const Icon = a.sev === "error" ? AlertCircle : a.sev === "warning" ? AlertTriangle : CheckCircle2;
              const color =
                a.sev === "error" ? "text-destructive" :
                a.sev === "warning" ? "text-[color:var(--warning)]" : "text-[color:var(--success)]";
              return (
                <li key={i} className="py-3 flex gap-3">
                  <Icon size={18} className={`mt-0.5 ${color} shrink-0`} />
                  <div>
                    <div className="text-[14px] font-medium">{a.title}</div>
                    <div className="text-[13px] text-muted-foreground">{a.desc}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Ações rápidas</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: "/dashboard-meta", label: "Dashboard Meta", icon: BarChart3 },
              { to: "/diagnostico-meta", label: "Diagnóstico", icon: Stethoscope },
              { to: "/gerador-copy", label: "Gerar Copy", icon: Sparkles },
              { to: "/reels", label: "Reels", icon: Film },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex flex-col items-start gap-2 p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
              >
                <q.icon size={18} />
                <span className="text-[13px] font-medium">{q.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
