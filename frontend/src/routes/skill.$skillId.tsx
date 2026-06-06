import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta, type SkillEvent } from "@/lib/skill-client";
import { findSkillById } from "@/lib/skills";
import { Sparkles, Loader2, Copy } from "lucide-react";

export const Route = createFileRoute("/skill/$skillId")({
  component: SkillPanel,
});

function SkillPanel() {
  const { skillId } = Route.useParams();
  const meta = findSkillById(skillId);

  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [briefing, setBriefing] = useState("");
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContas()
      .then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); })
      .catch(() => setErro("Backend offline?"));
  }, []);

  const executar = async () => {
    setRunning(true);
    setOutput("");
    setStatus("Iniciando…");
    setErro("");
    try {
      await runSkill({ skill: skillId, cliente, input: briefing }, (ev: SkillEvent) => {
        if (ev.type === "status") setStatus(ev.text);
        else if (ev.type === "chunk") setOutput((o) => o + ev.text);
        else if (ev.type === "error") setErro(ev.text);
        else if (ev.type === "done") setStatus("");
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao executar");
      setStatus("");
    } finally {
      setRunning(false);
    }
  };

  const copiar = () => {
    navigator.clipboard?.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PageHeader
        title={meta?.name ?? skillId}
        subtitle={meta?.description ?? "Execute esta skill com IA"}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <label htmlFor="cliente" className="text-[12px] uppercase tracking-wide text-muted-foreground">Cliente</label>
            <select
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px]"
            >
              {contas.map((c) => (
                <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="briefing" className="text-[12px] uppercase tracking-wide text-muted-foreground">Briefing (opcional)</label>
            <textarea
              id="briefing"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              rows={5}
              placeholder="Contexto adicional para a skill…"
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
            />
          </div>
          <Button onClick={executar} disabled={running || !cliente}>
            {running ? "Executando…" : "Executar"}
          </Button>
          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Resultado
            </h3>
            {output && (
              <button onClick={copiar} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Copy size={12} /> {copied ? "Copiado" : "Copiar"}
              </button>
            )}
          </div>
          {status && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-3">
              <Loader2 size={14} className="animate-spin" /> {status}
            </div>
          )}
          {output ? (
            <div className="whitespace-pre-wrap text-[14px] leading-relaxed">{output}</div>
          ) : (
            !status && <p className="text-[13px] text-muted-foreground">Escolha o cliente e clique em Executar.</p>
          )}
        </Card>
      </div>
    </>
  );
}
