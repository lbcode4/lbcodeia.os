import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { TrendingUp, TrendingDown, Play, Eye, Loader2, CheckCircle2, XCircle, Sparkles, FileText } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/reels-organico")({
  head: () => ({
    meta: [
      { title: "Análise Orgânica de Reels — LBCode Ads" },
      { name: "description", content: "Padrões vencedores dos Reels orgânicos e roteiro data-driven do próximo." },
    ],
  }),
  component: ReelsOrganico,
});

type LiveData = {
  periodo: string;
  reelsAnalisados: number;
  ranking: Array<{ id: string; engRate: number; plays: number; data: string }>;
  padroesVencedores: string[];
  padroesPerdedores: string[];
  leituraRetina: string;
  roteiro: { hook: string; desenvolvimento: string; cta: string; legenda: string };
};

function ReelsOrganico() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<LiveData>("lb-meta-analise-reels-organico", cs[0].cliente);
        }
      })
      .then((last) => {
        if (last) { setLiveData(last.payload); setSavedAt(last.savedAt); }
      })
      .catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setLiveData(null);
    setStatusMsg("Puxando Reels orgânicos…");
    try {
      await runSkill({ skill: "lb-meta-analise-reels-organico", cliente, input: "" }, (ev) => {
        if (ev.type === "status") setStatusMsg(ev.text);
        else if (ev.type === "data") { setLiveData(ev.payload as LiveData); setSavedAt(new Date().toISOString()); }
        else if (ev.type === "done") setStatusMsg("");
        else if (ev.type === "error") { setStatusMsg(""); console.error(ev.text); }
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Análise Orgânica de Reels"
        subtitle="Padrões vencedores do perfil → roteiro data-driven do próximo Reel."
      />

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
          {running ? statusMsg || "Analisando…" : "Executar análise orgânica"}
        </button>
        {liveData && (
          <span className="text-[12px] text-muted-foreground ml-auto">
            {liveData.reelsAnalisados} Reels · {liveData.periodo}
            {savedAt && (
              <span className="ml-2 opacity-60">· salvo {new Date(savedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </span>
        )}
      </div>

      {!liveData && !running && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Play size={40} className="opacity-20" />
          <p className="text-[14px]">Selecione o cliente e execute a análise para ver os padrões orgânicos.</p>
        </div>
      )}

      {liveData && (
        <div className="space-y-6">
          {/* Ranking */}
          <Card>
            <h2 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
              <Eye size={15} /> Ranking de Reels (últimos 90 dias)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Reel</th>
                    <th className="pb-2 pr-4 text-right">Eng. Rate</th>
                    <th className="pb-2 pr-4 text-right">Plays</th>
                    <th className="pb-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {liveData.ranking.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-bold text-muted-foreground">#{i + 1}</td>
                      <td className="py-2 pr-4 font-medium max-w-[200px] truncate">{r.id}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        <span className={i < Math.ceil(liveData.ranking.length * 0.2) ? "text-[color:var(--success)] font-semibold" : ""}>
                          {r.engRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.plays.toLocaleString("pt-BR")}</td>
                      <td className="py-2 text-right text-muted-foreground">{r.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Padrões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h2 className="text-[14px] font-semibold mb-3 flex items-center gap-2 text-[color:var(--success)]">
                <TrendingUp size={15} /> Padrões vencedores (top 20%)
              </h2>
              <ul className="space-y-1.5">
                {liveData.padroesVencedores.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px]">
                    <CheckCircle2 size={13} className="text-[color:var(--success)] mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-[14px] font-semibold mb-3 flex items-center gap-2 text-destructive">
                <TrendingDown size={15} /> Padrões perdedores (evitar)
              </h2>
              <ul className="space-y-1.5">
                {liveData.padroesPerdedores.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px]">
                    <XCircle size={13} className="text-destructive mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* RETINA */}
          <Card>
            <h2 className="text-[14px] font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={15} /> Leitura RETINA
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{liveData.leituraRetina}</p>
          </Card>

          {/* Roteiro */}
          <Card>
            <h2 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
              <FileText size={15} /> Roteiro do próximo Reel (data-driven)
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-muted/40 rounded-md">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1 font-medium">Hook (0–3s)</div>
                <p className="text-[13px] leading-relaxed">{liveData.roteiro.hook}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-md">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1 font-medium">Desenvolvimento</div>
                <p className="text-[13px] leading-relaxed">{liveData.roteiro.desenvolvimento}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-md">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1 font-medium">CTA</div>
                <p className="text-[13px] leading-relaxed">{liveData.roteiro.cta}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-md">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1 font-medium">Legenda + hashtags</div>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{liveData.roteiro.legenda}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
