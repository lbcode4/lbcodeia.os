import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, AlertTriangle, TrendingDown, Lightbulb, Target, ExternalLink, Play, Loader2 } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, BACKEND, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/organico-instagram")({
  head: () => ({
    meta: [
      { title: "Orgânico Instagram — LBCode Ads" },
      { name: "description", content: "Análise de Reels orgânicos do Instagram com IA." },
    ],
  }),
  component: OrganicoInstagram,
});

const SKILL_ID = "lb-meta-analise-reels-organico";

type Tone = "success" | "info" | "warning" | "error";
type Classe = "TOP" | "ALTO" | "MÉDIO" | "BAIXO";

type Reel = {
  rank: number; titulo: string; data: string; permalink: string; thumb?: string;
  alcance: number; likes: number; cmts: number; shares: number; saves: number; watch: number;
  engRate: number; classe: Classe;
  caption: string[]; insight: string; insightTone: Tone;
};

type Padrao = { titulo: string; desc: string };
type Boost = { prioridade: string; reelRank: number; desc: string; publico: string; objetivo: string; orcamento: string; duracao: string };
type Roteiro = { n: string; titulo: string; tema: string; formato: string; duracao: string; gancho: string; estrutura: string[]; cta: string; porque: string; copy: string[]; tags: string[] };
type Alerta = { tipo: Tone; titulo: string; desc: string };

type LiveData = {
  cliente: string; handle: string; periodo: string; geradoEm: string; objetivo: string;
  reelsAnalisados: number;
  reels: Reel[];
  padroesVencedores: Padrao[];
  padroesPerdedores: Padrao[];
  impulsionar: Boost[];
  naoImpulsionar: { titulo: string; motivo: string }[];
  roteiros: Roteiro[];
  alertas: Alerta[];
  leituraRetina: string;
};

// === Visual helpers ===
const THUMB_PALETTE = [
  "from-amber-700 to-amber-900", "from-orange-500 to-orange-700", "from-blue-700 to-blue-900",
  "from-zinc-700 to-zinc-900", "from-orange-600 to-red-700", "from-slate-700 to-slate-900",
  "from-red-700 to-orange-800", "from-violet-700 to-violet-900", "from-emerald-700 to-emerald-900",
  "from-pink-600 to-rose-800",
];
const thumbColor = (rank: number) => THUMB_PALETTE[(rank - 1) % THUMB_PALETTE.length];
const thumbLabel = (titulo: string) => titulo.split(" ").slice(0, 2).join(" ").toUpperCase();

const classeTone = (c: Classe) => ({
  TOP: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALTO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  MÉDIO: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  BAIXO: "bg-red-500/20 text-red-400 border-red-500/40",
}[c] ?? "bg-muted text-muted-foreground border-border");

const insightTone = (t: Tone) => ({
  success: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-sky-500 bg-sky-500/5",
  warning: "border-l-amber-500 bg-amber-500/5",
  error: "border-l-red-500 bg-red-500/5",
}[t] ?? "border-l-border");

const insightTextTone = (t: Tone) => ({
  success: "text-emerald-400",
  info: "text-sky-400",
  warning: "text-amber-400",
  error: "text-red-400",
}[t] ?? "text-muted-foreground");

function niceMax(v: number, floor = 1) {
  const x = Math.max(v, floor);
  const mag = Math.pow(10, Math.floor(Math.log10(x)));
  return Math.ceil(x / mag) * mag;
}

// === Charts (data-driven) ===
function AlcanceVsEngChart({ reels }: { reels: Reel[] }) {
  const w = 560, h = 240, pad = { l: 40, r: 40, t: 20, b: 50 };
  const maxA = niceMax(Math.max(...reels.map((r) => r.alcance), 1));
  const maxE = niceMax(Math.max(...reels.map((r) => r.engRate), 1));
  const bw = (w - pad.l - pad.r) / Math.max(reels.length, 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {ticks.map((f) => {
        const y = pad.t + (1 - f) * (h - pad.t - pad.b);
        return (<g key={f}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{Math.round(maxA * f)}</text><text x={w - pad.r + 6} y={y + 3} fontSize="9" fill="#f59e0b">{(maxE * f).toFixed(1)}</text></g>);
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw * 0.2;
        const bh = (r.alcance / maxA) * (h - pad.t - pad.b);
        return <rect key={r.rank} x={x} y={h - pad.b - bh} width={bw * 0.6} height={bh} fill="#7A5CFF" opacity="0.85" rx="2" />;
      })}
      <polyline fill="none" stroke="#f59e0b" strokeWidth="2"
        points={reels.map((r, i) => {
          const x = pad.l + i * bw + bw / 2;
          const y = pad.t + (1 - r.engRate / maxE) * (h - pad.t - pad.b);
          return `${x},${y}`;
        }).join(" ")} />
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        const y = pad.t + (1 - r.engRate / maxE) * (h - pad.t - pad.b);
        return <circle key={r.rank} cx={x} cy={y} r="3" fill="#f59e0b" />;
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        return <text key={r.rank} x={x} y={h - pad.b + 14} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))" transform={`rotate(-35 ${x} ${h - pad.b + 14})`}>{r.titulo.split(" ")[0]}</text>;
      })}
    </svg>
  );
}

function StackedInteracoesChart({ reels }: { reels: Reel[] }) {
  const w = 560, h = 240, pad = { l: 30, r: 20, t: 20, b: 50 };
  const max = niceMax(Math.max(...reels.map((r) => r.likes + r.cmts + r.shares + r.saves), 1));
  const bw = (w - pad.l - pad.r) / Math.max(reels.length, 1);
  const segs: Array<[keyof Reel, string]> = [["likes", "#ec4899"], ["cmts", "#0ea5e9"], ["shares", "#10b981"], ["saves", "#f59e0b"]];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pad.t + (1 - f) * (h - pad.t - pad.b);
        return (<g key={f}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{Math.round(max * f)}</text></g>);
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw * 0.2;
        let cum = 0;
        return (
          <g key={r.rank}>
            {segs.map(([k, color]) => {
              const v = r[k] as number;
              const sh = (v / max) * (h - pad.t - pad.b);
              const y = h - pad.b - cum - sh;
              cum += sh;
              return <rect key={k as string} x={x} y={y} width={bw * 0.6} height={sh} fill={color} />;
            })}
          </g>
        );
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        return <text key={r.rank} x={x} y={h - pad.b + 14} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))" transform={`rotate(-35 ${x} ${h - pad.b + 14})`}>{r.titulo.split(" ")[0]}</text>;
      })}
    </svg>
  );
}

function SharesSavesChart({ reels }: { reels: Reel[] }) {
  const w = 560, h = 240, pad = { l: 110, r: 20, t: 20, b: 30 };
  const max = niceMax(Math.max(...reels.map((r) => Math.max(r.shares, r.saves)), 1));
  const rh = (h - pad.t - pad.b) / Math.max(reels.length, 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const x = pad.l + f * (w - pad.l - pad.r);
        return (<g key={f}><line x1={x} x2={x} y1={pad.t} y2={h - pad.b} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={x} y={h - pad.b + 12} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{Math.round(max * f)}</text></g>);
      })}
      {reels.map((r, i) => {
        const y = pad.t + i * rh + rh * 0.15;
        const bh = rh * 0.35;
        const sw = (r.shares / max) * (w - pad.l - pad.r);
        const svw = (r.saves / max) * (w - pad.l - pad.r);
        return (
          <g key={r.rank}>
            <text x={pad.l - 6} y={y + bh} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{r.titulo.split(" ").slice(0, 2).join(" ")}</text>
            <rect x={pad.l} y={y} width={sw} height={bh} fill="#10b981" />
            <rect x={pad.l} y={y + bh + 2} width={svw} height={bh} fill="#f59e0b" />
          </g>
        );
      })}
    </svg>
  );
}

function WatchTimeChart({ reels }: { reels: Reel[] }) {
  const w = 560, h = 240, pad = { l: 30, r: 20, t: 20, b: 50 };
  const max = niceMax(Math.max(...reels.map((r) => r.watch), 1));
  const bw = (w - pad.l - pad.r) / Math.max(reels.length, 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pad.t + (1 - f) * (h - pad.t - pad.b);
        return (<g key={f}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{(max * f).toFixed(0)}</text></g>);
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw * 0.2;
        const bh = (r.watch / max) * (h - pad.t - pad.b);
        const isLow = r.watch < 4;
        const isHigh = r.watch > 7;
        const color = isHigh ? "#10b981" : isLow ? "#ef4444" : "#0ea5e9";
        return <rect key={r.rank} x={x} y={h - pad.b - bh} width={bw * 0.6} height={bh} fill={color} rx="2" />;
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        return <text key={r.rank} x={x} y={h - pad.b + 14} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))" transform={`rotate(-35 ${x} ${h - pad.b + 14})`}>{r.titulo.split(" ")[0]}</text>;
      })}
    </svg>
  );
}

function ReelThumb({ r, size = "lg" }: { r: Reel; size?: "sm" | "lg" }) {
  const dims = size === "sm" ? "w-10 h-10 text-[7px]" : "w-full aspect-[9/16] text-xs";
  // thumb pode ser caminho local (/ig-thumbs/... servido pelo backend) ou URL
  // remota do IG (fallback). Se falhar, cai no gradiente com label.
  const [imgOk, setImgOk] = useState(true);
  const src = r.thumb?.startsWith("/") ? `${BACKEND}${r.thumb}` : r.thumb;
  return (
    <div className={`${dims} rounded-md bg-gradient-to-br ${thumbColor(r.rank)} flex items-center justify-center text-white font-bold tracking-wide shadow-inner relative overflow-hidden`}>
      {src && imgOk ? (
        <img
          src={src}
          alt={r.titulo}
          loading="lazy"
          // IG scontent CDN rejeita (403) requests com Referer de outra origem
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span className="px-1 text-center leading-tight">{thumbLabel(r.titulo)}</span>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-10 first:mt-0">
      <h2 className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">{children}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

const alertaIcon = (t: Tone) => ({
  success: <Trophy size={16} className="text-emerald-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  info: <TrendingDown size={16} className="text-sky-400" />,
  error: <Lightbulb size={16} className="text-yellow-400" />,
}[t] ?? <Target size={16} className="text-pink-400" />);

const alertaBorder = (t: Tone) => ({
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  info: "border-l-sky-500",
  error: "border-l-yellow-500",
}[t] ?? "border-l-pink-500");

function OrganicoInstagram() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState<LiveData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<LiveData>(SKILL_ID, cs[0].cliente);
        }
      })
      .then((last) => {
        if (last) { setData(last.payload); setSavedAt(last.savedAt); }
      })
      .catch(() => setErro("Backend offline?"));
  }, []);

  const carregarUltimo = async (c: string) => {
    setData(null);
    setSavedAt(null);
    const last = await fetchLastResult<LiveData>(SKILL_ID, c);
    if (last) { setData(last.payload); setSavedAt(last.savedAt); }
  };

  const executar = async () => {
    if (!cliente || running) return;
    setRunning(true);
    setData(null);
    setErro("");
    setStatusMsg("Puxando Reels orgânicos…");
    try {
      await runSkill({ skill: SKILL_ID, cliente, input: "" }, (ev) => {
        if (ev.type === "status") setStatusMsg(ev.text);
        else if (ev.type === "data") { setData(ev.payload as LiveData); setSavedAt(new Date().toISOString()); }
        else if (ev.type === "done") setStatusMsg("");
        else if (ev.type === "error") { setStatusMsg(""); setErro(ev.text); }
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao executar");
    } finally {
      setRunning(false);
      setStatusMsg("");
    }
  };

  const reels = data?.reels ?? [];
  const totals = reels.length ? {
    alcance: reels.reduce((s, r) => s + r.alcance, 0),
    interacoes: reels.reduce((s, r) => s + r.likes + r.cmts + r.shares + r.saves, 0),
    engMedio: reels.reduce((s, r) => s + r.engRate, 0) / reels.length,
    watchMedio: reels.reduce((s, r) => s + r.watch, 0) / reels.length,
    saves: reels.reduce((s, r) => s + r.saves, 0),
    shares: reels.reduce((s, r) => s + r.shares, 0),
  } : null;

  const reelByRank = (rank: number) => reels.find((r) => r.rank === rank);

  return (
    <div className="-m-4 md:-m-8">
      {/* Hero gradient */}
      <div
        className="px-8 md:px-14 py-10 text-white relative"
        style={{ background: "linear-gradient(120deg,#E04C8A 0%,#B14BD1 55%,#7A5CFF 100%)" }}
      >
        <h1 className="text-3xl md:text-[34px] font-bold tracking-tight mb-2">
          Análise de Reels Orgânicos{data ? ` — ${data.cliente}` : ""}
        </h1>
        <p className="text-white/85 text-[14px] mb-5">
          {data
            ? `${data.handle} · Instagram · ${data.periodo}${data.objetivo ? ` · Objetivo: ${data.objetivo}` : ""}`
            : "Puxa os Reels orgânicos do perfil via IA e devolve padrões, impulsionamento e roteiros."}
        </p>

        {/* Run controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cliente}
            onChange={(e) => { setCliente(e.target.value); carregarUltimo(e.target.value); }}
            disabled={running}
            className="h-9 px-3 rounded-md bg-white/15 border border-white/25 text-white text-[13px] backdrop-blur disabled:opacity-60 [&>option]:text-black"
          >
            {contas.map((c) => <option key={c.cliente} value={c.cliente}>{c.cliente}</option>)}
          </select>
          <button
            onClick={executar}
            disabled={running || !cliente}
            className="h-9 px-4 rounded-md bg-white text-[#B14BD1] text-[13px] font-semibold disabled:opacity-60 inline-flex items-center gap-2"
          >
            {running && <Loader2 size={13} className="animate-spin" />}
            {running ? statusMsg || "Analisando…" : data ? "Reexecutar análise" : "Executar análise"}
          </button>
          {data && (
            <span className="text-[11px] text-white/80">
              {data.reelsAnalisados} Reels
              {savedAt && <span className="ml-2 opacity-70">· salvo {new Date(savedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
            </span>
          )}
        </div>
        {erro && <p className="mt-3 text-[12px] bg-red-500/20 border border-red-300/30 rounded px-3 py-1.5 inline-block">{erro}</p>}
      </div>

      {/* Empty / loading state */}
      {!data && (
        <div className="bg-background px-4 md:px-8 py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
          {running ? <Loader2 size={40} className="animate-spin opacity-40" /> : <Play size={40} className="opacity-20" />}
          <p className="text-[14px]">{running ? statusMsg || "Analisando…" : "Selecione o cliente e execute a análise para ver os padrões orgânicos."}</p>
        </div>
      )}

      {data && totals && (
      <div className="bg-background px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        {/* Visão Geral */}
        <SectionTitle>Visão Geral</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Alcance Total", val: totals.alcance.toLocaleString("pt-BR"), sub: `soma dos ${reels.length} Reels`, color: "text-sky-400" },
            { label: "Interações Totais", val: totals.interacoes.toString(), sub: "likes + cmts + shares + saves", color: "text-violet-400" },
            { label: "Eng. Rate Médio", val: `${totals.engMedio.toFixed(2)}%`, sub: "benchmark: >3% bom", color: "text-emerald-400" },
            { label: "Watch Time Médio", val: `${totals.watchMedio.toFixed(1)}s`, sub: "tempo médio assistido", color: "text-sky-400" },
            { label: "Total de Saves", val: totals.saves.toString(), sub: "intenção de compra", color: "text-emerald-400" },
            { label: "Total de Shares", val: totals.shares.toString(), sub: "potencial viral", color: "text-pink-400" },
          ].map((k) => (
            <div key={k.label} className="bg-card border border-border rounded-lg p-4">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">{k.label}</div>
              <div className={`text-[26px] font-bold tabular-nums ${k.color} leading-none mb-2`}>{k.val}</div>
              <div className="text-[10.5px] text-muted-foreground">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Top 3 */}
        {reels.length >= 3 && (
          <>
            <SectionTitle>Top 3 Reels por Engagement Rate</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reels.slice(0, 3).map((r) => (
                <div key={r.rank} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-24 relative shrink-0">
                      <div className="absolute -top-1 -left-1 z-10 bg-background/90 border border-border text-[10px] font-bold px-1.5 py-0.5 rounded">#{r.rank}</div>
                      <ReelThumb r={r} />
                      <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${classeTone(r.classe)}`}>{r.classe}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px] leading-snug">{r.titulo}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{r.data}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {[
                      { l: "ENG RATE", v: `${r.engRate.toFixed(2)}%` },
                      { l: "ALCANCE", v: r.alcance },
                      { l: "WATCH", v: `${r.watch.toFixed(1)}s` },
                      { l: "INTERAÇÕES", v: r.likes + r.cmts + r.shares + r.saves },
                    ].map((m) => (
                      <div key={m.l} className="bg-muted/30 rounded-md py-2">
                        <div className="font-bold tabular-nums text-[15px]">{m.v}</div>
                        <div className="text-[9px] tracking-wider text-muted-foreground">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Ranking */}
        <SectionTitle>Ranking Completo</SectionTitle>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
              <tr>
                {["Reel", "Data", "Alcance", "Likes", "Cmts", "Shares", "Saves", "Eng%", "Watch", "Class."].map((h) => (
                  <th key={h} className="text-left px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reels.map((r) => (
                <tr key={r.rank} className="border-t border-border hover:bg-muted/20">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <ReelThumb r={r} size="sm" />
                      <div>
                        <div className="font-medium">{r.titulo}</div>
                        {r.permalink && (
                          <a className="text-[10.5px] text-sky-400 inline-flex items-center gap-1" href={r.permalink} target="_blank" rel="noreferrer">Ver no IG <ExternalLink size={10} /></a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{r.data}</td>
                  <td className="px-3 py-3 tabular-nums">{r.alcance}</td>
                  <td className="px-3 py-3 tabular-nums">{r.likes}</td>
                  <td className="px-3 py-3 tabular-nums">{r.cmts}</td>
                  <td className="px-3 py-3 tabular-nums">{r.shares}</td>
                  <td className="px-3 py-3 tabular-nums">{r.saves}</td>
                  <td className={`px-3 py-3 tabular-nums font-semibold ${r.engRate >= 4 ? "text-emerald-400" : r.engRate >= 3 ? "text-sky-400" : "text-red-400"}`}>{r.engRate.toFixed(2)}%</td>
                  <td className="px-3 py-3 tabular-nums">{r.watch.toFixed(1)}s</td>
                  <td className="px-3 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${classeTone(r.classe)}`}>{r.classe}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráficos */}
        <SectionTitle>Gráficos de Performance</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: "Alcance vs. Engagement Rate", legend: [["#7A5CFF", "Alcance"], ["#f59e0b", "Eng Rate %"]], chart: <AlcanceVsEngChart reels={reels} /> },
            { title: "Distribuição de Interações", legend: [["#ec4899", "Likes"], ["#0ea5e9", "Comentários"], ["#10b981", "Shares"], ["#f59e0b", "Saves"]], chart: <StackedInteracoesChart reels={reels} /> },
            { title: "Shares + Saves (Viralização)", legend: [["#10b981", "Shares"], ["#f59e0b", "Saves"]], chart: <SharesSavesChart reels={reels} /> },
            { title: "Watch Time Médio (segundos)", legend: [["#0ea5e9", "Watch Time (s)"]], chart: <WatchTimeChart reels={reels} /> },
          ].map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-lg p-5">
              <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">{c.title}</div>
              <div className="flex gap-3 flex-wrap mb-2">
                {c.legend.map(([color, label]) => (
                  <div key={label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="w-3 h-3 rounded-sm" style={{ background: color }} />{label}
                  </div>
                ))}
              </div>
              <div className="h-60">{c.chart}</div>
            </div>
          ))}
        </div>

        {/* Análise detalhada */}
        <SectionTitle>Análise Detalhada por Reel</SectionTitle>
        <div className="space-y-4">
          {reels.map((r) => (
            <div key={r.rank} className={`bg-card border border-border rounded-lg overflow-hidden border-l-4 ${insightTone(r.insightTone)}`}>
              <div className="grid grid-cols-[110px_1fr] md:grid-cols-[140px_1fr]">
                <div className="bg-muted/20 p-3 flex flex-col gap-2">
                  <ReelThumb r={r} />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div>
                      <div className="font-semibold text-[14px]">#{r.rank} — {r.titulo}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.data}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${classeTone(r.classe)}`}>{r.classe}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {[
                      { l: "ENG RATE", v: `${r.engRate.toFixed(2)}%` },
                      { l: "ALCANCE", v: r.alcance },
                      { l: "WATCH", v: `${r.watch.toFixed(1)}s` },
                      { l: "VIEW TOTAL", v: `${((r.alcance * r.watch) / 3600).toFixed(2)}h` },
                    ].map((m) => (
                      <div key={m.l} className="bg-muted/30 rounded-md py-2 text-center">
                        <div className="font-bold tabular-nums text-[15px]">{m.v}</div>
                        <div className="text-[9px] tracking-wider text-muted-foreground">{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {[
                      { l: "LIKES", v: r.likes }, { l: "COMENTÁRIOS", v: r.cmts },
                      { l: "SHARES", v: r.shares }, { l: "SAVES", v: r.saves },
                    ].map((m) => (
                      <div key={m.l} className="bg-muted/20 rounded-md py-2 text-center">
                        <div className="font-bold tabular-nums text-[15px]">{m.v}</div>
                        <div className="text-[9px] tracking-wider text-muted-foreground">{m.l}</div>
                      </div>
                    ))}
                  </div>
                  {r.caption.length > 0 && (
                    <div className="bg-muted/20 rounded-md p-3 mb-3 space-y-1.5">
                      {r.caption.map((c, i) => <div key={i} className="text-[12.5px] text-muted-foreground">{c}</div>)}
                    </div>
                  )}
                  <div className={`rounded-md p-3 text-[12.5px] ${insightTextTone(r.insightTone)}`} style={{ background: "color-mix(in oklab, currentColor 8%, transparent)" }}>
                    💡 {r.insight}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Padrões */}
        <SectionTitle>Padrões Identificados</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-emerald-500/30 rounded-lg p-5">
            <div className="font-semibold mb-4 text-emerald-400 inline-flex items-center gap-2">✅ O que FUNCIONA</div>
            <ul className="space-y-3 text-[12.5px]">
              {data.padroesVencedores.map((p) => (
                <li key={p.titulo}><span className="font-semibold">{p.titulo}</span> — <span className="text-muted-foreground">{p.desc}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-red-500/30 rounded-lg p-5">
            <div className="font-semibold mb-4 text-red-400 inline-flex items-center gap-2">❌ O que NÃO funciona</div>
            <ul className="space-y-3 text-[12.5px]">
              {data.padroesPerdedores.map((p) => (
                <li key={p.titulo}><span className="font-semibold">{p.titulo}</span> — <span className="text-muted-foreground">{p.desc}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Leitura RETINA */}
        {data.leituraRetina && (
          <>
            <SectionTitle>Leitura RETINA</SectionTitle>
            <div className="bg-card border border-border border-l-4 border-l-violet-500 rounded-lg p-4 text-[12.5px] text-muted-foreground">
              {data.leituraRetina}
            </div>
          </>
        )}

        {/* Recomendações de Impulsionamento */}
        {data.impulsionar.length > 0 && (
          <>
            <SectionTitle>Recomendações de Impulsionamento</SectionTitle>
            <div className="space-y-3">
              {data.impulsionar.map((p) => {
                const reel = reelByRank(p.reelRank);
                const meta: [string, string][] = [["Público", p.publico], ["Objetivo", p.objetivo], ["Orçamento", p.orcamento], ["Duração", p.duracao]];
                return (
                  <div key={p.prioridade} className="bg-card border border-border rounded-lg p-5">
                    <span className="inline-block text-[10px] font-bold tracking-wider px-3 py-1 rounded border mb-4 bg-emerald-500/15 text-emerald-400 border-emerald-500/40">{p.prioridade}</span>
                    <div className="flex gap-4">
                      {reel && <div className="w-20 shrink-0"><ReelThumb r={reel} /></div>}
                      <div className="flex-1">
                        <div className="font-semibold text-[14px] mb-1">{reel?.titulo ?? `Reel #${p.reelRank}`}</div>
                        <div className="text-[12.5px] text-muted-foreground mb-3">{p.desc}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {meta.filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="text-[12px] bg-muted/30 rounded px-3 py-2">
                              <span className="font-semibold">{k}:</span> <span className="text-muted-foreground">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Não impulsionar */}
        {data.naoImpulsionar.length > 0 && (
          <>
            <SectionTitle>Reels para NÃO Impulsionar</SectionTitle>
            <div className="space-y-2">
              {data.naoImpulsionar.map((x) => (
                <div key={x.titulo} className="bg-card border border-border border-l-4 border-l-red-500 rounded-lg p-4">
                  <div className="text-red-400 font-semibold text-[13px]">🚫 {x.titulo}</div>
                  <div className="text-[12.5px] text-muted-foreground mt-1">{x.motivo}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Roteiros sugeridos */}
        {data.roteiros.length > 0 && (
          <>
            <SectionTitle>{data.roteiros.length} Novos Roteiros Sugeridos</SectionTitle>
            <div className="space-y-4">
              {data.roteiros.map((r) => (
                <div key={r.n} className="bg-card border border-border rounded-lg p-5">
                  <div className="text-[11px] font-bold tracking-wider text-violet-400 mb-1">ROTEIRO {r.n}</div>
                  <div className="font-bold text-[16px] mb-4">{r.titulo}</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    {[
                      ["TEMA", r.tema], ["FORMATO", r.formato], ["DURAÇÃO", r.duracao],
                      ["GANCHO (0–3S)", r.gancho], ["ESTRUTURA", r.estrutura.join("\n")],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-muted/20 rounded-md p-3">
                        <div className="text-[9px] tracking-wider text-muted-foreground font-semibold mb-1.5">{k}</div>
                        <div className="text-[11.5px] whitespace-pre-line leading-snug">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {[["CTA FINAL", r.cta], ["POR QUE FUNCIONA", r.porque]].map(([k, v]) => (
                      <div key={k} className="bg-muted/20 rounded-md p-3">
                        <div className="text-[9px] tracking-wider text-muted-foreground font-semibold mb-1.5">{k}</div>
                        <div className="text-[11.5px] leading-snug">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-pink-500/5 border border-pink-500/20 rounded-md p-4">
                    <div className="text-[11px] font-bold tracking-wider text-pink-400 mb-2 inline-flex items-center gap-1.5">📄 COPY SUGERIDA</div>
                    {r.copy.map((line, i) => (<div key={i} className="text-[12.5px] mb-1.5">{line}</div>))}
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                      {r.tags.map((t) => <span key={t} className="text-[11.5px] text-violet-400">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Alertas & próximos passos */}
        {data.alertas.length > 0 && (
          <>
            <SectionTitle>Alertas e Próximos Passos</SectionTitle>
            <div className="space-y-2">
              {data.alertas.map((a) => (
                <div key={a.titulo} className={`bg-card border border-border border-l-4 rounded-lg p-4 flex gap-3 ${alertaBorder(a.tipo)}`}>
                  <div className="shrink-0 mt-0.5">{alertaIcon(a.tipo)}</div>
                  <div>
                    <div className="font-semibold text-[13px]">{a.titulo}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 mb-4 text-center text-[11px] text-muted-foreground">
          Gerado por <span className="text-foreground font-medium">Claude Code</span> — LBCode Ads · {data.cliente} · {data.handle} · {data.geradoEm}
        </div>
      </div>
      )}
    </div>
  );
}
