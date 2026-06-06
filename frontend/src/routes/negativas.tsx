import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { searchTerms, negativeGroups, fmtBRL } from "@/lib/mock";
import { ChevronDown, ChevronRight, Download, PiggyBank } from "lucide-react";

export const Route = createFileRoute("/negativas")({
  head: () => ({ meta: [{ title: "Negativas — LBCode Ads" }, { name: "description", content: "Termos de busca e palavras-chave negativas sugeridas para Google Ads." }] }),
  component: Negativas,
});

function Negativas() {
  const [open, setOpen] = useState<Record<string, boolean>>({ Irrelevante: true });
  const monthly = 412 + 318 + 215 + 142;
  const yearly = monthly * 12;

  return (
    <>
      <PageHeader title="Negativas (Google)" subtitle="Termos que estão drenando orçamento — e a lista negativa sugerida." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Termos de busca</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Ordenado por custo (maior → menor).</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium py-2 px-3">Termo</th>
                  <th className="text-right font-medium py-2 px-3">Cliques</th>
                  <th className="text-right font-medium py-2 px-3">Custo</th>
                  <th className="text-right font-medium py-2 px-3">Conv.</th>
                  <th className="text-left font-medium py-2 px-3">Tema</th>
                </tr>
              </thead>
              <tbody>
                {searchTerms.map((t) => (
                  <tr key={t.term} className="border-b border-border last:border-0">
                    <td className="py-2.5 px-3 font-medium">{t.term}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{t.cliques}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{fmtBRL(t.custo)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{t.conv}</td>
                    <td className="py-2.5 px-3"><Badge tone="neutral">{t.tema}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank size={18} className="text-primary" />
              <h3 className="font-semibold">Economia projetada</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Por mês</div>
                <div className="text-xl font-bold text-[color:var(--success)] mt-1">{fmtBRL(monthly)}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Por ano</div>
                <div className="text-xl font-bold text-[color:var(--success)] mt-1">{fmtBRL(yearly)}</div>
              </div>
            </div>
            <Button className="w-full mt-4"><Download size={14} /> Exportar lista</Button>
          </Card>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Negativas sugeridas por tema</h2>
      <div className="space-y-3">
        {negativeGroups.map((g) => {
          const isOpen = !!open[g.tema];
          return (
            <Card key={g.tema} className="!p-0 overflow-hidden">
              <button
                onClick={() => setOpen((p) => ({ ...p, [g.tema]: !isOpen }))}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/40"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-medium">{g.tema}</span>
                  <Badge tone="neutral">{g.terms.length}</Badge>
                </div>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  {g.terms.map((t) => (
                    <span key={t.t} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-muted/40 text-[13px]">
                      <span className="font-medium">{t.t}</span>
                      <Badge tone={t.match === "exata" ? "primary" : "neutral"}>{t.match}</Badge>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
