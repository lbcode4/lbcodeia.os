import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { searchTerms, negativeGroups, fmtBRL } from "@/lib/mock";
import { ChevronDown, ChevronRight, Download, PiggyBank, Loader2 } from "lucide-react";
import { fetchContas, runSkill, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/negativas")({
  head: () => ({ meta: [{ title: "Negativas — LBCode Ads" }, { name: "description", content: "Termos de busca e palavras-chave negativas sugeridas para Google Ads." }] }),
  component: Negativas,
});

function Negativas() {
  const [open, setOpen] = useState<Record<string, boolean>>({ Irrelevante: true });
  const monthly = 412 + 318 + 215 + 142;
  const yearly = monthly * 12;
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    novasNegativas: Array<{ termo: string; motivo: string; campanha: string }>;
    existentes: string[];
    impactoEstimado: string;
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
      await runSkill({ skill: "lb-ads-negativas", cliente, input: "" }, (ev) => {
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
      <PageHeader title="Negativas (Google)" subtitle="Termos que estão drenando orçamento — e a lista negativa sugerida." />

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
          {liveData.impactoEstimado && (
            <Card className="!p-4">
              <div className="text-[13px] text-muted-foreground">Impacto estimado: <span className="font-semibold text-foreground">{liveData.impactoEstimado}</span></div>
            </Card>
          )}
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Novas negativas sugeridas (ao vivo)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium py-2 px-3">Termo</th>
                    <th className="text-left font-medium py-2 px-3">Motivo</th>
                    <th className="text-left font-medium py-2 px-3">Campanha</th>
                  </tr>
                </thead>
                <tbody>
                  {liveData.novasNegativas.map((n, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2.5 px-3 font-medium">{n.termo}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{n.motivo}</td>
                      <td className="py-2.5 px-3">{n.campanha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {liveData.existentes.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-3">Negativas existentes</h3>
              <div className="flex flex-wrap gap-2">
                {liveData.existentes.map((t, i) => (
                  <span key={i} className="inline-flex px-3 py-1.5 rounded border border-border bg-muted/40 text-[13px] font-medium">{t}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

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
