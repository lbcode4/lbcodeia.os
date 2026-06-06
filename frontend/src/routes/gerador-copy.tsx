import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta } from "@/lib/skill-client";
import { Copy, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/gerador-copy")({
  head: () => ({ meta: [{ title: "Gerador de Copy — LBCode Ads" }, { name: "description", content: "Gere copys a partir dos criativos top performers." }] }),
  component: GeradorCopy,
});

function GeradorCopy() {
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
      .then((cs) => {
        setContas(cs);
        if (cs[0]) setCliente(cs[0].cliente);
      })
      .catch(() => setErro("Não consegui carregar as contas (backend no ar?)."));
  }, []);

  const gerar = async () => {
    setRunning(true);
    setOutput("");
    setStatus("Iniciando…");
    setErro("");
    try {
      await runSkill({ skill: "lb-meta-copy", cliente, input: briefing }, (ev) => {
        if (ev.type === "status") setStatus(ev.text);
        else if (ev.type === "chunk") setOutput((o) => o + ev.text);
        else if (ev.type === "error") setErro(ev.text);
        else if (ev.type === "done") setStatus("");
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar copy");
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
      <PageHeader title="Gerador de Copy" subtitle="A partir dos seus anúncios que mais convertem, gere novas variações." />

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
            <label htmlFor="briefing" className="text-[12px] uppercase tracking-wide text-muted-foreground">Briefing</label>
            <textarea
              id="briefing"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              rows={5}
              placeholder="Ex: anúncio de tênis de corrida, foco em conforto"
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
            />
          </div>
          <Button onClick={gerar} disabled={running || !cliente}>
            {running ? "Gerando…" : "Gerar copy"}
          </Button>
          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles size={16} className="text-primary" /> Copy gerada</h3>
            {output && (
              <button onClick={copiar} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                <Copy size={12} /> {copied ? "Copiado" : "Copiar tudo"}
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
            !status && <p className="text-[13px] text-muted-foreground">Escolha o cliente, escreva o briefing e clique em Gerar.</p>
          )}
        </Card>
      </div>
    </>
  );
}
