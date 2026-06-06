import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta, type SkillEvent } from "@/lib/skill-client";
import { Sparkles, Loader2, Copy, Check, RotateCcw, Send, User } from "lucide-react";

export const Route = createFileRoute("/gerador-copy")({
  head: () => ({
    meta: [
      { title: "Gerador de Copy — LBCode Ads" },
      { name: "description", content: "Gere copys a partir dos criativos top performers." },
    ],
  }),
  component: GeradorCopy,
});

type Turn = { role: "user" | "assistant"; text: string };

function GeradorCopy() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [briefing, setBriefing] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [status, setStatus] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [running, setRunning] = useState(false);
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContas()
      .then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); })
      .catch(() => setErro("Não consegui carregar as contas (backend no ar?)."));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, status]);

  const hasTurns = turns.length > 0;

  function buildInput(userText: string): string {
    if (!hasTurns) return userText;
    const history = turns
      .map((t) => (t.role === "user" ? `[Usuário]: ${t.text}` : `[Assistente]: ${t.text}`))
      .join("\n\n");
    return `${history}\n\n[Usuário]: ${userText}`;
  }

  const executar = async (inputText: string) => {
    setRunning(true);
    setStatus("Iniciando…");
    setErro("");
    setTurns((t) => [...t, { role: "user", text: inputText }, { role: "assistant", text: "" }]);

    const appendChunk = (chunk: string) =>
      setTurns((t) => {
        const copy = [...t];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: copy[copy.length - 1].text + chunk };
        return copy;
      });

    try {
      await runSkill({ skill: "lb-meta-copy", cliente, input: buildInput(inputText) }, (ev: SkillEvent) => {
        if (ev.type === "status") setStatus(ev.text);
        else if (ev.type === "chunk") appendChunk(ev.text);
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

  const iniciar = () => { if (!cliente || running) return; executar(briefing || "(sem briefing)"); };

  const continuar = () => {
    const t = followUp.trim();
    if (!t || running) return;
    setFollowUp("");
    executar(t);
  };

  const reset = () => {
    setTurns([]); setBriefing(""); setFollowUp(""); setStatus(""); setErro("");
  };

  const copiarTudo = () => {
    const txt = turns.filter((t) => t.role === "assistant").map((t) => t.text).join("\n\n---\n\n");
    navigator.clipboard?.writeText(txt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PageHeader title="Gerador de Copy" subtitle="A partir dos seus anúncios que mais convertem, gere novas variações." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 space-y-4 self-start">
          <div>
            <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Cliente</label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              disabled={hasTurns}
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] disabled:opacity-60"
            >
              {contas.map((c) => <option key={c.cliente} value={c.cliente}>{c.cliente}</option>)}
            </select>
          </div>

          {!hasTurns ? (
            <>
              <div>
                <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Briefing</label>
                <textarea
                  value={briefing}
                  onChange={(e) => setBriefing(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) iniciar(); }}
                  rows={5}
                  placeholder="Ex: anúncio de tênis de corrida, foco em conforto"
                  className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
                />
              </div>
              <Button onClick={iniciar} disabled={running || !cliente}>
                {running ? <><Loader2 size={14} className="animate-spin" /> Gerando…</> : "Gerar copy"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Ajuste / Continuação</label>
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); continuar(); } }}
                  rows={4}
                  placeholder="Ex: muda o tom pra mais urgente, adiciona prova social… (Enter envia)"
                  disabled={running}
                  className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={continuar} disabled={running || !followUp.trim()} className="flex-1">
                  {running ? <><Loader2 size={14} className="animate-spin" /> Gerando…</> : <><Send size={13} /> Enviar</>}
                </Button>
                <button onClick={reset} title="Nova execução" className="px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                  <RotateCcw size={13} />
                </button>
              </div>
            </>
          )}

          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        <Card className="lg:col-span-3 flex flex-col min-h-[400px] max-h-[80vh]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Copy gerada
            </h3>
            {turns.some((t) => t.role === "assistant" && t.text) && (
              <button onClick={copiarTudo} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copiado" : "Copiar tudo"}
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {turns.length === 0 && !status && (
              <p className="text-[13px] text-muted-foreground">Escolha o cliente, escreva o briefing e clique em Gerar.</p>
            )}

            {turns.map((turn, i) => (
              <div key={i} className={`flex gap-2 ${turn.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${turn.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"}`}>
                  {turn.role === "user" ? <User size={11} /> : <Sparkles size={11} />}
                </div>
                <div className={`max-w-[90%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${turn.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {turn.text || (running && i === turns.length - 1 ? <span className="opacity-50">…</span> : "")}
                </div>
              </div>
            ))}

            {status && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 size={12} className="animate-spin" /> {status}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
