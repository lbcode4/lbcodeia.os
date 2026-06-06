import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { auditRows, quickWins, fmtBRL } from "@/lib/mock";
import { Check, AlertTriangle, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/auditoria-meta")({
  head: () => ({ meta: [{ title: "Auditoria Meta — LBCode Ads" }, { name: "description", content: "Auditoria de conjuntos, posicionamentos e quick wins." }] }),
  component: AuditoriaMeta,
});

function AuditoriaMeta() {
  const total = quickWins.reduce((s, q) => s + q.economy, 0);
  return (
    <>
      <PageHeader title="Auditoria Meta" subtitle="Análise por conjunto e posicionamento — economia rápida sugerida." />

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
