import { createFileRoute } from "@tanstack/react-router";
import { Trophy, AlertTriangle, TrendingDown, Lightbulb, Target, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/organico-instagram")({
  head: () => ({
    meta: [
      { title: "Orgânico Instagram — LBCode Ads" },
      { name: "description", content: "Análise de Reels orgânicos do Instagram com IA." },
    ],
  }),
  component: OrganicoInstagram,
});

type Reel = {
  rank: number; titulo: string; data: string; engRate: number; alcance: number;
  likes: number; cmts: number; shares: number; saves: number; watch: number;
  classe: "TOP" | "ALTO" | "MÉDIO" | "BAIXO";
  caption: string[]; insight: string; insightTone: "success" | "info" | "warning" | "error";
  thumbColor: string; thumbLabel: string;
};

const reels: Reel[] = [
  { rank: 1, titulo: "Porta-Relógio 6 Divisórias", data: "11/07/25", engRate: 4.79, alcance: 188, likes: 7, cmts: 0, shares: 0, saves: 2, watch: 4.4, classe: "TOP",
    caption: ["Porta-relógio com 6 divisórias, disponível a pronta entrega.", "Ideal pra vc guardar todos os seus relógio em um único lugar."],
    insight: "Melhor eng rate do período. Proposta de valor clara (R$150, pronta entrega) + produto visual. Caption direta com 3 frases. Apesar do alcance modesto (188), converteu bem em saves — público qualificado.",
    insightTone: "success", thumbColor: "from-amber-700 to-amber-900", thumbLabel: "PORTA RELÓGIO" },
  { rank: 2, titulo: "Unboxing Amazfit Active Edge", data: "06/03/25", engRate: 4.75, alcance: 316, likes: 10, cmts: 4, shares: 0, saves: 1, watch: 6.1, classe: "ALTO",
    caption: ["Vídeo de unboxing pra vocês do AMAZFIT ACTIVE EDGE", "Gostou desse modelo?"],
    insight: "Maior número de comentários do período (4). Formato unboxing cria curiosidade e aproximação. Caption ultra-curta + pergunta direta gera interação. Watch time 6.1s indica boa retenção para 59s de vídeo.",
    insightTone: "success", thumbColor: "from-orange-500 to-orange-700", thumbLabel: "ACTIVE EDGE" },
  { rank: 3, titulo: "2 Anos de Loja Beta", data: "30/09/25", engRate: 4.69, alcance: 64, likes: 3, cmts: 0, shares: 0, saves: 0, watch: 3.3, classe: "ALTO",
    caption: ["Esse mês celebramos mais um ano de companhia, aprendizado e sucesso.", "Agradecemos a todos que fazem parte."],
    insight: "Conteúdo institucional. Alcance baixo (9× menor que a média) — público não engaja com aniversário da loja sem oferta atrelada.",
    insightTone: "warning", thumbColor: "from-blue-700 to-blue-900", thumbLabel: "2 ANOS" },
  { rank: 4, titulo: "Funcionalidades Amazfit Active Edge", data: "07/03/25", engRate: 3.95, alcance: 709, likes: 18, cmts: 1, shares: 6, saves: 3, watch: 8.5, classe: "MÉDIO",
    caption: ["Conheça as principais funcionalidades do Amazfit Active Edge.", "Bateria, GPS, esporte e muito mais."],
    insight: "Maior alcance orgânico do período (709). Watch time 8.5s — público realmente assistiu. Shares (6) indicam que o conteúdo foi útil. Candidato natural para impulsionamento.",
    insightTone: "success", thumbColor: "from-zinc-700 to-zinc-900", thumbLabel: "FUNÇÕES" },
  { rank: 5, titulo: "Zeblaze Stratos 2 — Reposição", data: "04/08/25", engRate: 3.34, alcance: 389, likes: 7, cmts: 2, shares: 1, saves: 3, watch: 5.3, classe: "MÉDIO",
    caption: ["ALERTA DE REPOSIÇÃO✨", "Chegou reposição do Zeblaze Stratos 2"],
    insight: "Bom alcance (389) e 3 saves — público guardando para comprar depois. Gancho \"ALERTA DE REPOSIÇÃO\" cria urgência. Caption média em tamanho. Oportunidade: mostrar o produto mais em ação.",
    insightTone: "info", thumbColor: "from-orange-600 to-red-700", thumbLabel: "ZEBLAZE" },
  { rank: 6, titulo: "Xiaomi Band 7 Pro — Funcionalidades", data: "27/03/25", engRate: 3.25, alcance: 308, likes: 7, cmts: 2, shares: 1, saves: 0, watch: 5.8, classe: "MÉDIO",
    caption: ["✨Melhore o seu estilo com a Xiaomi Band Inteligente 7 Pro✨", "✅ AMOLED 1.64''"],
    insight: "Lista de specs com muitos bullets torna a leitura cansativa. Eng rate abaixo da média. Watch time decente (5.8s) mas zero saves — público não percebeu valor para guardar. Reformatar como demo ao invés de spec sheet.",
    insightTone: "warning", thumbColor: "from-slate-700 to-slate-900", thumbLabel: "BAND 7 PRO" },
  { rank: 7, titulo: "Amazfit Active Edge — Apresentação", data: "26/02/25", engRate: 2.44, alcance: 246, likes: 5, cmts: 0, shares: 1, saves: 0, watch: 4.2, classe: "BAIXO",
    caption: ["Esse modelo você ainda não tem né? 🤔", "Você vai se surpreender com esse novo modelo de Watch!"],
    insight: "Eng rate mais baixo do período (2.44%). Gancho \"Esse modelo você ainda não tem né?\" é fraco — sem tensão ou curiosidade real. Zero saves e comments. Contrasta com o Reel de funcionalidades (mesmo produto, 2 dias depois) que teve 3× mais alcance.",
    insightTone: "error", thumbColor: "from-red-700 to-orange-800", thumbLabel: "AMAZFIT" },
];

const totals = {
  alcance: reels.reduce((s, r) => s + r.alcance, 0),
  interacoes: reels.reduce((s, r) => s + r.likes + r.cmts + r.shares + r.saves, 0),
  engMedio: reels.reduce((s, r) => s + r.engRate, 0) / reels.length,
  watchMedio: reels.reduce((s, r) => s + r.watch, 0) / reels.length,
  saves: reels.reduce((s, r) => s + r.saves, 0),
  shares: reels.reduce((s, r) => s + r.shares, 0),
};

const classeTone = (c: Reel["classe"]) => ({
  TOP: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALTO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  MÉDIO: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  BAIXO: "bg-red-500/20 text-red-400 border-red-500/40",
}[c]);

const insightTone = (t: Reel["insightTone"]) => ({
  success: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-sky-500 bg-sky-500/5",
  warning: "border-l-amber-500 bg-amber-500/5",
  error: "border-l-red-500 bg-red-500/5",
}[t]);

const insightTextTone = (t: Reel["insightTone"]) => ({
  success: "text-emerald-400",
  info: "text-sky-400",
  warning: "text-amber-400",
  error: "text-red-400",
}[t]);

// === Chart helpers ===
function AlcanceVsEngChart() {
  const w = 560, h = 240, pad = { l: 40, r: 40, t: 20, b: 50 };
  const maxA = 800, maxE = 5;
  const bw = (w - pad.l - pad.r) / reels.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 200, 400, 600, 800].map((v) => {
        const y = pad.t + (1 - v / maxA) * (h - pad.t - pad.b);
        return (<g key={v}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text></g>);
      })}
      {[2, 3, 4, 5].map((v) => {
        const y = pad.t + (1 - (v - 2) / 3) * (h - pad.t - pad.b);
        return (<text key={v} x={w - pad.r + 6} y={y + 3} fontSize="9" fill="#f59e0b">{v.toFixed(1)}</text>);
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw * 0.2;
        const bh = (r.alcance / maxA) * (h - pad.t - pad.b);
        return <rect key={r.rank} x={x} y={h - pad.b - bh} width={bw * 0.6} height={bh} fill="#7A5CFF" opacity="0.85" rx="2" />;
      })}
      <polyline fill="none" stroke="#f59e0b" strokeWidth="2"
        points={reels.map((r, i) => {
          const x = pad.l + i * bw + bw / 2;
          const y = pad.t + (1 - (r.engRate - 2) / 3) * (h - pad.t - pad.b);
          return `${x},${y}`;
        }).join(" ")} />
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        const y = pad.t + (1 - (r.engRate - 2) / 3) * (h - pad.t - pad.b);
        return <circle key={r.rank} cx={x} cy={y} r="3" fill="#f59e0b" />;
      })}
      {reels.map((r, i) => {
        const x = pad.l + i * bw + bw / 2;
        return <text key={r.rank} x={x} y={h - pad.b + 14} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))" transform={`rotate(-35 ${x} ${h - pad.b + 14})`}>{r.titulo.split(" ")[0]}</text>;
      })}
    </svg>
  );
}

function StackedInteracoesChart() {
  const w = 560, h = 240, pad = { l: 30, r: 20, t: 20, b: 50 };
  const max = 30;
  const bw = (w - pad.l - pad.r) / reels.length;
  const segs: Array<[keyof Reel, string]> = [["likes", "#ec4899"], ["cmts", "#0ea5e9"], ["shares", "#10b981"], ["saves", "#f59e0b"]];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 5, 10, 15, 20, 25, 30].map((v) => {
        const y = pad.t + (1 - v / max) * (h - pad.t - pad.b);
        return (<g key={v}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text></g>);
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

function SharesSavesChart() {
  const w = 560, h = 240, pad = { l: 110, r: 20, t: 20, b: 30 };
  const max = 6;
  const rh = (h - pad.t - pad.b) / reels.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 1, 2, 3, 4, 5, 6].map((v) => {
        const x = pad.l + (v / max) * (w - pad.l - pad.r);
        return (<g key={v}><line x1={x} x2={x} y1={pad.t} y2={h - pad.b} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={x} y={h - pad.b + 12} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text></g>);
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

function WatchTimeChart() {
  const w = 560, h = 240, pad = { l: 30, r: 20, t: 20, b: 50 };
  const max = 10;
  const bw = (w - pad.l - pad.r) / reels.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {[0, 2, 4, 6, 8, 10].map((v) => {
        const y = pad.t + (1 - v / max) * (h - pad.t - pad.b);
        return (<g key={v}><line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="2 3" /><text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text></g>);
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
  return (
    <div className={`${dims} rounded-md bg-gradient-to-br ${r.thumbColor} flex items-center justify-center text-white font-bold tracking-wide shadow-inner relative overflow-hidden`}>
      <span className="px-1 text-center leading-tight">{r.thumbLabel}</span>
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

function OrganicoInstagram() {
  return (
    <div className="-m-4 md:-m-8">
      {/* Hero gradient */}
      <div
        className="px-8 md:px-14 py-12 text-white relative"
        style={{ background: "linear-gradient(120deg,#E04C8A 0%,#B14BD1 55%,#7A5CFF 100%)" }}
      >
        <button className="absolute top-6 right-6 text-[12px] bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
          ☀ Tema
        </button>
        <h1 className="text-3xl md:text-[34px] font-bold tracking-tight mb-2">
          Análise de Reels Orgânicos — Loja Beta
        </h1>
        <p className="text-white/85 text-[14px] mb-5">
          @lojabeta · Instagram · Últimos 7 Reels · Objetivo: Crescimento de seguidores
        </p>
        <div className="flex flex-wrap gap-2">
          {["FEV–SET 2025", "7 REELS ANALISADOS", "GERADO EM 04/06/2026"].map((t) => (
            <span key={t} className="text-[10.5px] font-semibold tracking-wider bg-white/15 border border-white/25 px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="bg-background px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        {/* Visão Geral */}
        <SectionTitle>Visão Geral</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Alcance Total", val: totals.alcance.toLocaleString("pt-BR"), sub: "soma dos 7 Reels", color: "text-sky-400" },
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
                        <a className="text-[10.5px] text-sky-400 inline-flex items-center gap-1" href="#">Ver no IG <ExternalLink size={10} /></a>
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
            { title: "Alcance vs. Engagement Rate", legend: [["#7A5CFF", "Alcance"], ["#f59e0b", "Eng Rate %"]], chart: <AlcanceVsEngChart /> },
            { title: "Distribuição de Interações", legend: [["#ec4899", "Likes"], ["#0ea5e9", "Comentários"], ["#10b981", "Shares"], ["#f59e0b", "Saves"]], chart: <StackedInteracoesChart /> },
            { title: "Shares + Saves (Viralização)", legend: [["#10b981", "Shares"], ["#f59e0b", "Saves"]], chart: <SharesSavesChart /> },
            { title: "Watch Time Médio (segundos)", legend: [["#0ea5e9", "Watch Time (s)"]], chart: <WatchTimeChart /> },
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
                  <div className="bg-muted/20 rounded-md p-3 mb-3 space-y-1.5">
                    {r.caption.map((c, i) => <div key={i} className="text-[12.5px] text-muted-foreground">{c}</div>)}
                  </div>
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
              {[
                ["📦 Unboxing e demonstração", "conteúdo autêntico com o produto em mãos gera mais comentários e watch time (6.1s de média)"],
                ["⚡ Captions curtas e diretas", "Porta-relógio (3 frases) alcançou maior eng rate (4.79%) vs. spec-list longa"],
                ["🏃 Foco em nicho esportivo", "Amazfit Active Edge (esporte) concentrou 7× mais shares que outros modelos"],
                ["👁 Produtos com proposta visual clara", "porta-relógio e unboxing geram curiosidade imediata nos primeiros segundos"],
                ["🎬 Reels de 15–60s", "maior diversidade de formatos; os mais curtos têm eng rate alto, os mais longos têm maior alcance orgânico"],
              ].map(([t, d]) => (
                <li key={t}><span className="font-semibold">{t}</span> — <span className="text-muted-foreground">{d}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-red-500/30 rounded-lg p-5">
            <div className="font-semibold mb-4 text-red-400 inline-flex items-center gap-2">❌ O que NÃO funciona</div>
            <ul className="space-y-3 text-[12.5px]">
              {[
                ["🏢 Conteúdo institucional", "Aniversário da loja alcançou apenas 64 pessoas (9× menor que a média), zero shares e zero saves"],
                ["📋 Lista de specs com bullets", "Xiaomi Band 7 Pro com 11 checkmarks teve eng rate 3.25% (abaixo da média)"],
                ["🔗 CTA direto para WhatsApp/link na bio", "sensação comercial que reduz engajamento orgânico"],
                ["🌫 Reels \"teaser\" sem contexto", "Introdução do Amazfit sem gancho claro resultou em menor eng rate (2.44%)"],
                ["📅 Gaps longos entre publicações", "de março a julho sem conteúdo = algoritmo penaliza distribuição orgânica"],
              ].map(([t, d]) => (
                <li key={t}><span className="font-semibold">{t}</span> — <span className="text-muted-foreground">{d}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recomendações de Impulsionamento */}
        <SectionTitle>Recomendações de Impulsionamento</SectionTitle>
        <div className="space-y-3">
          {[
            { prio: "PRIORIDADE 1 — IMPULSIONAR AGORA", chip: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40", reel: reels[3],
              desc: "Maior alcance orgânico (709) e único com coef. viral positivo (0.85%). Já provou capacidade de distribuição. Objetivo: gerar seguidores via alcance expandido.",
              meta: [["Público", "Homens 18–35 / Interesses: esportes, fitness, tecnologia, smartwatches"], ["Objetivo", "Reconhecimento de marca / Seguidores"], ["Orçamento", "R$ 15–20/dia × 7 dias = R$ 105–140"], ["Duração", "7 dias"]] },
            { prio: "PRIORIDADE 2 — SEGUNDA ONDA", chip: "bg-sky-500/15 text-sky-400 border-sky-500/40", reel: reels[1],
              desc: "Maior número de comentários (4) e watch time alto (6.1s). Formato unboxing gera confiança e aproximação. Ideal após Prioridade 1 aquecer o público.",
              meta: [["Público", "Lookalike dos interagentes do Reel anterior + interesses: tecnologia, gadgets"], ["Objetivo", "Engajamento → Seguidores"], ["Orçamento", "R$ 10–15/dia × 5 dias = R$ 50–75"], ["Duração", "5 dias"]] },
            { prio: "PRIORIDADE 3 — MONITORAR", chip: "bg-amber-500/15 text-amber-400 border-amber-500/40", reel: reels[0],
              desc: "Eng rate altíssimo (4.79%) com público qualificado (2 saves). Validar com pequeno teste antes de escalar.",
              meta: [["Público", "Retargeting: quem interagiu com Prioridade 1 e 2 + lookalike"], ["Objetivo", "Tráfego / Conversão"], ["Orçamento", "R$ 10/dia × 5 dias = R$ 50"], ["Duração", "5 dias"]] },
          ].map((p) => (
            <div key={p.prio} className="bg-card border border-border rounded-lg p-5">
              <span className={`inline-block text-[10px] font-bold tracking-wider px-3 py-1 rounded border mb-4 ${p.chip}`}>{p.prio}</span>
              <div className="flex gap-4">
                <div className="w-20 shrink-0"><ReelThumb r={p.reel} /></div>
                <div className="flex-1">
                  <div className="font-semibold text-[14px] mb-1">{p.reel.titulo}</div>
                  <div className="text-[12.5px] text-muted-foreground mb-3">{p.desc}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {p.meta.map(([k, v]) => (
                      <div key={k} className="text-[12px] bg-muted/30 rounded px-3 py-2">
                        <span className="font-semibold">{k}:</span> <span className="text-muted-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Não impulsionar */}
        <SectionTitle>Reels para NÃO Impulsionar</SectionTitle>
        <div className="space-y-2">
          {[
            { title: "Aniversário da Loja", desc: "alcance orgânico mínimo (64), sem engajamento fora da base existente. Impulsionar não gerará novos seguidores relevantes." },
            { title: "Introdução Amazfit (fev/26)", desc: "eng rate BAIXO (2.44%), sem salvamentos ou shares. Conteúdo fraco para amplificação paga." },
          ].map((x) => (
            <div key={x.title} className="bg-card border border-border border-l-4 border-l-red-500 rounded-lg p-4">
              <div className="text-red-400 font-semibold text-[13px]">🚫 {x.title}</div>
              <div className="text-[12.5px] text-muted-foreground mt-1">{x.desc}</div>
            </div>
          ))}
        </div>

        {/* Roteiros sugeridos */}
        <SectionTitle>3 Novos Roteiros Sugeridos</SectionTitle>
        <div className="space-y-4">
          {[
            {
              n: "01", titulo: "\"Você usa smartwatch mas provavelmente não sabe dessa função…\"",
              tema: "Curiosidade/função oculta de smartwatch", formato: "Educativo — revelação surpresa", duracao: "30–40 segundos",
              gancho: "\"Você usa smartwatch todo dia mas nunca ativou isso…\" [mostrar função na tela]",
              estrutura: ["1. Gancho visual com função na tela", "2. \"A maioria das pessoas nunca ativa o [nome]\"", "3. Demonstração rápida da função", "4. Resultado prático: economia de bateria / treino melhor / etc.", "5. CTA"],
              cta: "\"Salva esse vídeo e ativa agora! Qual smartwatch você usa? Comenta aqui 👇\"",
              porque: "Replica padrão do Reel de funcionalidades (maior alcance). Salvamentos geram boost orgânico + pergunta de comentário aumenta interações.",
              copy: ["Você usa smartwatch há meses mas nunca ativou isso… 🤯", "A maioria dos modelos tem uma função que a galera esquece de configurar: o monitoramento de SpO2 contínuo.", "Com ele ativo, o relógio monitora sua saturação de oxigênio durante o sono — e te avisa se algo estiver fora do normal.", "Simples de ativar. Pode fazer diferença de verdade.", "👇 Comenta qual smartwatch você usa e eu te mando como ativar no seu modelo!"],
              tags: ["#smartwatch", "#dicasdesaude", "#tecnologiawearable", "#lojabeta", "#smartwatchbrasil"],
            },
            {
              n: "02", titulo: "\"R$XXX vs R$XXX: Qual smartwatch vale mais o dinheiro?\"",
              tema: "Comparativo de dois modelos — battle format", formato: "Comparativo / antes vs. depois", duracao: "45–60 segundos",
              gancho: "\"Dois smartwatches, preços parecidos. Qual escolher?\" [mostrar os dois na mão]",
              estrutura: ["1. Apresentar os dois modelos lado a lado", "2. Comparar 3 pontos: design, bateria, funcionalidades esportivas", "3. Veredicto com recomendação clara por perfil", "4. CTA de votação"],
              cta: "\"Comenta A ou B: qual você levaria? Respondo nos comentários!\"",
              porque: "Pergunta de A ou B dispara comentários (padrão de maior interação do período). Formato comparativo retém atenção por mais tempo = watch time maior = mais alcance.",
              copy: ["Dois smartwatches, preços parecidos. Qual vai pro seu pulso? 👀", "Comparamos o Amazfit Active Edge vs. Zeblaze Stratos 2 nos 3 critérios que mais importam:", "🏃 Esporte & GPS", "🔋 Duração de bateria", "📱 Integração com apps", "Resultado surpreendeu até a gente.", "💬 Comenta A (Amazfit) ou B (Zeblaze) — qual você escolheria?"],
              tags: ["#smartwatch", "#comparativo", "#amazfit", "#zeblaze", "#lojabeta"],
            },
            {
              n: "03", titulo: "Unboxing surpresa: \"Vocês pediram, finalmente chegou!\"",
              tema: "Unboxing de novo produto com elemento de antecipação", formato: "Unboxing + interação de votação", duracao: "30–45 segundos",
              gancho: "\"Muita gente pediu esse modelo e finalmente chegou!\" [caixa fechada na câmera]",
              estrutura: ["1. Gancho com a caixa fechada + antecipação", "2. Abertura lenta (satisfatório)", "3. Mostrar o produto na mão — detalhes visuais", "4. Revelar 1 funcionalidade impressionante", "5. Pergunta de votação"],
              cta: "\"A função que mais te surpreendeu foi qual? Comenta aqui — a mais votada vira o próximo review!\"",
              porque: "Unboxing teve maior quantidade de comentários (4 — melhor do período). Elemento de antecipação aumenta retenção. Votação gera comentários E dados reais sobre interesse do público.",
              copy: ["Vocês pediram nos comentários e finalmente chegou! 📦 ✨", "Unboxing do [nome do produto] — o modelo que a galera tem pedido há semanas.", "Spoiler: a função de [X] deixou a gente sem palavras 🤯", "Qual funcionalidade mais te surpreendeu?", "Comenta aqui — a mais votada vira o próximo review detalhado!", "🔔 Segue pra não perder os próximos unboxings"],
              tags: ["#unboxing", "#smartwatch", "#lojabeta", "#novidade", "#techmobile"],
            },
          ].map((r) => (
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

        {/* Alertas & próximos passos */}
        <SectionTitle>Alertas e Próximos Passos</SectionTitle>
        <div className="space-y-2">
          {[
            { icon: <Trophy size={16} className="text-emerald-400" />, border: "border-l-emerald-500", title: "Ponto forte: conteúdo de produto funciona",
              desc: "Os 3 melhores Reels são todos baseados em produtos físicos mostrados em ação. Manter esse formato como base do calendário editorial." },
            { icon: <AlertTriangle size={16} className="text-amber-400" />, border: "border-l-amber-500", title: "Frequência de publicação crítica",
              desc: "Gap de 4 meses (março → julho 2025) e outro de ~9 meses (set/25 → jun/26) reduz drasticamente o alcance orgânico. Meta mínima: 2 Reels/semana." },
            { icon: <TrendingDown size={16} className="text-sky-400" />, border: "border-l-sky-500", title: "Alcance geral baixo",
              desc: "Média de 317 por Reel indica conta em fase inicial. Foco em conteúdo compartilhável (unboxing, comparativos, curiosidades) para crescimento orgânico acelerado." },
            { icon: <Lightbulb size={16} className="text-yellow-400" />, border: "border-l-yellow-500", title: "Potencial no nicho esportivo",
              desc: "Amazfit Active Edge concentrou 67% de todos os shares do período. Explorar mais produtos fitness/esporte para ampliar o alcance orgânico via compartilhamentos." },
            { icon: <Target size={16} className="text-pink-400" />, border: "border-l-pink-500", title: "Próximos passos",
              desc: "1. Gravar 1 comparativo de smartwatches esta semana · 2. Impulsionar \"Funcionalidades Amazfit\" por R$15/dia · 3. Publicar 2× por semana durante 30 dias · 4. Criar série \"Você sabia?\" com smartwatches" },
          ].map((a) => (
            <div key={a.title} className={`bg-card border border-border border-l-4 rounded-lg p-4 flex gap-3 ${a.border}`}>
              <div className="shrink-0 mt-0.5">{a.icon}</div>
              <div>
                <div className="font-semibold text-[13px]">{a.title}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 mb-4 text-center text-[11px] text-muted-foreground">
          Gerado por <span className="text-foreground font-medium">Claude Code</span> — LBCode_ADS · Loja Beta · @lojabeta · 04/06/2026
        </div>
      </div>
    </div>
  );
}
