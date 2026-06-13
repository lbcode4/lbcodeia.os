import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, Badge } from "@/components/app-shell";
import { fmtBRL, fmtInt } from "@/lib/mock";
import { Moon, Instagram, Heart, MessageCircle, Share2, Bookmark, Eye, Loader2 } from "lucide-react";
import { fetchContas, runSkill, fetchLastResult, type Conta } from "@/lib/skill-client";

export const Route = createFileRoute("/dashboard-meta")({
  head: () => ({
    meta: [{ title: "Dashboard Meta — LBCode Ads" }, { name: "description", content: "Dashboard completo Meta Ads + Orgânico." }],
  }),
  component: DashboardMeta,
});

// ---------- mock data específico desta tela ----------
const kpis = [
  { label: "Investimento", value: "R$ 1.145,75", foot: "~R$ 1,19/dia" },
  { label: "Alcance", value: fmtInt(65477), foot: "Freq. 2,1" },
  { label: "Cliques", value: fmtInt(5999), foot: "CPC R$ 0,19" },
  { label: "CTR", value: "4,31%", foot: "taxa de clique" },
  { label: "Saves", value: "64", foot: "salvamentos" },
  { label: "Conversas DM", value: "84", foot: "Custo R$ 13,64" },
  { label: "Video Views", value: fmtInt(24840), foot: "views de vídeo" },
];
const seguidoresCard = { atual: 1112, novos: 11 };

// Evolução diária (datas curtas)
const dias = ["03/05","10/06","18/06","23/07","30/07","08/08","18/08","25/08","02/09","12/09","22/09","02/10","16/10","26/10","07/11","18/11","25/11","10/12","21/12","02/02","10/05","08/06"];
const gastoSerie = [4,11,16,8,3,2,1,1,2,1,1,1,3,1,5,1,1,12,16,2,3,7];
const alcanceSerie = [200,800,1200,500,150,80,50,40,100,60,40,50,150,40,400,30,40,1600,1750,80,200,650];

const engajaSerie = [
  { d: "03/05", saves: 0, cliques: 50 },
  { d: "06/06", saves: 0, cliques: 62 },
  { d: "06/07", saves: 0, cliques: 63 },
  { d: "30/07", saves: 0, cliques: 4 },
  { d: "23/10", saves: 0, cliques: 11 },
  { d: "28/11", saves: 0, cliques: 14 },
  { d: "19/12", saves: 0, cliques: 8 },
  { d: "24/12", saves: 0, cliques: 4 },
  { d: "09/05", saves: 0, cliques: 23 },
  { d: "08/06", saves: 0, cliques: 18 },
];

const distGasto = [
  { label: "Instagram Post", value: 85, color: "#8B5CF6" },
  { label: "Post do Instagram: A", value: 24, color: "#06B6D4" },
  { label: "Publicação do Instag", value: 15, color: "#EC4899" },
];

const topReelsBar = [
  { name: "Novos modelos de relógios...", alcance: 299, inter: 18 },
  { name: "Porta-relógio com 6...", alcance: 188, inter: 9 },
  { name: "2 Anos de Loja Beta!", alcance: 64, inter: 3 },
  { name: "Vídeo de unboxing pra vocês...", alcance: 316, inter: 15 },
  { name: "Modelos de fones esportivos...", alcance: 227, inter: 9 },
  { name: "Mais um pouco das...", alcance: 709, inter: 28 },
];

// Seguidores 30 dias
const seguidoresDias = ["05/05","06/05","07/05","08/05","09/05","10/05","11/05","12/05","13/05","14/05","15/05","16/05","17/05","18/05","19/05","20/05","21/05","22/05","23/05","24/05","25/05","26/05","27/05","28/05","29/05","30/05","31/05","01/06","02/06","03/06"];
const novosDia    = [ 1,    0.5,  0.3,  1,    1,    0,    1,    0.4,  0.4,  0.4,  1,    0.3,  0.3,  0,    0,    0,    1,    2,    1,    0.6,  0.6,  1,    0.7,  0,    0.3,  0,    1,    0,    0,    0.1];
const media7      = [ 1,    0.5,  0.3,  0.5,  0.6,  0.5,  0.6,  0.4,  0.4,  0.4,  0.4,  0.3,  0.3,  0.3,  0.1,  0.1,  0.35, 0.4,  0.6,  0.6,  0.6,  0.7,  0.7,  0.6,  0.3,  0.1,  0.3,  0.3,  0.1,  0.1];

const comparativo = [
  { thumb: "#FF6B35", h: "Orgânico > Novos modelos de relógios...", tipo: "ORGÂNICO", alcance: 299, saves: 1, com: 6, shares: 1, ctr: "6,0 %", status: "Mediano" },
  { thumb: "#7A5CFF", h: "Orgânico > Porta-relogio com 6...",        tipo: "ORGÂNICO", alcance: 188, saves: 2, com: 0, shares: 0, ctr: "4,8 %", status: "Mediano" },
  { thumb: "#1A8FE3", h: "Orgânico > 2 Anos de Loja Beta!",     tipo: "ORGÂNICO", alcance: 64,  saves: 0, com: 0, shares: 0, ctr: "4,7 %", status: "Mediano" },
  { thumb: "#22C55E", h: "Pago > Carrossel Black Friday",            tipo: "PAGO",     alcance: 8200,saves: 4, com: 12,shares: 6, ctr: "1,9 %", status: "Bom" },
  { thumb: "#EC4899", h: "Pago > Vídeo Depoimento Cliente",          tipo: "PAGO",     alcance: 11400,saves: 7,com: 18,shares: 9, ctr: "2,4 %", status: "Excelente" },
];

const topReels = [
  { rank: 1, title: "Novos modelos de relógios...", alcance: 299,  inter: 18, eng: "6%",   saves: 1, com: 6, shares: 1, color: "#1A1A2E" },
  { rank: 2, title: "Porta-relógio com 6...",       alcance: 188,  inter: 9,  eng: "4.8%", saves: 2, com: 0, shares: 1, color: "#2E1A1A" },
  { rank: 3, title: "2 Anos de Loja Beta!",    alcance: 64,   inter: 3,  eng: "4.7%", saves: 0, com: 0, shares: 0, color: "#1E3A8A" },
  { rank: 4, title: "Vídeo de unboxing pra vocês...",alcance: 316, inter: 15, eng: "4.7%", saves: 1, com: 4, shares: 0, color: "#FF6B35" },
  { rank: 5, title: "Modelos de fones esportivos...",alcance: 227, inter: 9,  eng: "4%",   saves: 0, com: 0, shares: 1, color: "#7A5CFF" },
  { rank: 6, title: "Mais um pouco das...",         alcance: 709,  inter: 28, eng: "3.9%", saves: 3, com: 1, shares: 6, color: "#15803D" },
  { rank: 7, title: "ALERTA DE REPOSIÇÃO",          alcance: 389,  inter: 13, eng: "3.3%", saves: 3, com: 2, shares: 1, color: "#EA580C" },
];

// ---------- Sub-componentes ----------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4">
      <h2 className="text-[15px] font-semibold tracking-tight">{children}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function KpiCard({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <Card className="!p-4 text-center">
      <div className="text-[10.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase mb-2">{label}</div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-2 flex justify-center">
        <span className="inline-flex px-2 py-0.5 rounded text-[10.5px] font-semibold bg-[color:var(--success)]/15 text-[color:var(--success)]">Novo</span>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{foot}</div>
    </Card>
  );
}

// Combo line + bar (alcance linha verde, gasto barras roxas)
function GastoAlcanceChart() {
  const w = 720, h = 260, pad = { l: 36, r: 40, t: 24, b: 36 };
  const n = dias.length;
  const maxG = Math.max(...gastoSerie);
  const maxA = Math.max(...alcanceSerie);
  const x = (i: number) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
  const yG = (v: number) => h - pad.b - (v / maxG) * (h - pad.t - pad.b);
  const yA = (v: number) => h - pad.b - (v / maxA) * (h - pad.t - pad.b);
  const bw = Math.max(3, (w - pad.l - pad.r) / n - 4);
  const linePts = alcanceSerie.map((v, i) => `${x(i)},${yA(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + t * (h - pad.t - pad.b)} y2={pad.t + t * (h - pad.t - pad.b)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {/* eixo Y esquerdo (R$) */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={pad.l - 6} y={h - pad.b - t * (h - pad.t - pad.b) + 3} fontSize="9" textAnchor="end" fill="var(--muted-foreground)">
          R${Math.round(t * maxG)}
        </text>
      ))}
      {/* eixo Y direito (alcance) */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={w - pad.r + 6} y={h - pad.b - t * (h - pad.t - pad.b) + 3} fontSize="9" textAnchor="start" fill="var(--muted-foreground)">
          {Math.round(t * maxA)}
        </text>
      ))}
      {/* Barras roxas (gasto) */}
      {gastoSerie.map((v, i) => (
        <rect key={i} x={x(i) - bw / 2} y={yG(v)} width={bw} height={h - pad.b - yG(v)} fill="#8B5CF6" opacity="0.85" />
      ))}
      {/* Linha verde (alcance) */}
      <polyline points={linePts} fill="none" stroke="#22C55E" strokeWidth="2" />
      {alcanceSerie.map((v, i) => <circle key={i} cx={x(i)} cy={yA(v)} r="2" fill="#22C55E" />)}
      {dias.map((d, i) => i % 2 === 0 && (
        <text key={d + i} x={x(i)} y={h - 8} fontSize="9" textAnchor="middle" fill="var(--muted-foreground)" transform={`rotate(-35 ${x(i)} ${h - 8})`}>{d}</text>
      ))}
    </svg>
  );
}

function EngajamentoChart() {
  const w = 720, h = 260, pad = { l: 32, r: 16, t: 24, b: 36 };
  const max = Math.max(...engajaSerie.map((d) => Math.max(d.saves, d.cliques)));
  const n = engajaSerie.length;
  const groupW = (w - pad.l - pad.r) / n;
  const bw = groupW / 3;
  const y = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + t * (h - pad.t - pad.b)} y2={pad.t + t * (h - pad.t - pad.b)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={pad.l - 6} y={h - pad.b - t * (h - pad.t - pad.b) + 3} fontSize="9" textAnchor="end" fill="var(--muted-foreground)">{Math.round(t * max)}</text>
      ))}
      {engajaSerie.map((d, i) => {
        const cx = pad.l + i * groupW + groupW / 2;
        return (
          <g key={d.d}>
            <rect x={cx - bw} y={y(d.saves)} width={bw - 2} height={h - pad.b - y(d.saves)} fill="#F59E0B" />
            <rect x={cx} y={y(d.cliques)} width={bw - 2} height={h - pad.b - y(d.cliques)} fill="#0EA5E9" />
            <text x={cx} y={h - 8} fontSize="9" textAnchor="middle" fill="var(--muted-foreground)" transform={`rotate(-35 ${cx} ${h - 8})`}>{d.d}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut() {
  const total = distGasto.reduce((s, d) => s + d.value, 0);
  const r = 80, R = 110, cx = 140, cy = 140;
  let acc = 0;
  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
      {distGasto.map((d) => {
        const start = (acc / total) * 2 * Math.PI - Math.PI / 2;
        acc += d.value;
        const end = (acc / total) * 2 * Math.PI - Math.PI / 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
        const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
        const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
        const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
        return (
          <path key={d.label}
            d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`}
            fill={d.color} stroke="var(--card)" strokeWidth="2" />
        );
      })}
    </svg>
  );
}

function TopReelsBars() {
  const w = 720, h = 320, pad = { l: 32, r: 16, t: 36, b: 90 };
  const max = Math.max(...topReelsBar.map((d) => Math.max(d.alcance, d.inter)));
  const n = topReelsBar.length;
  const groupW = (w - pad.l - pad.r) / n;
  const bw = groupW / 3;
  const y = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-80">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + t * (h - pad.t - pad.b)} y2={pad.t + t * (h - pad.t - pad.b)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={pad.l - 6} y={h - pad.b - t * (h - pad.t - pad.b) + 3} fontSize="9" textAnchor="end" fill="var(--muted-foreground)">{Math.round(t * max)}</text>
      ))}
      {topReelsBar.map((d, i) => {
        const cx = pad.l + i * groupW + groupW / 2;
        return (
          <g key={d.name}>
            <rect x={cx - bw} y={y(d.alcance)} width={bw - 2} height={h - pad.b - y(d.alcance)} fill="#22C55E" />
            <rect x={cx} y={y(d.inter)} width={bw - 2} height={h - pad.b - y(d.inter)} fill="#F59E0B" />
            <text x={cx} y={h - pad.b + 12} fontSize="9" textAnchor="end" fill="var(--muted-foreground)" transform={`rotate(-25 ${cx} ${h - pad.b + 12})`}>{d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SeguidoresChart() {
  const w = 900, h = 280, pad = { l: 28, r: 16, t: 20, b: 30 };
  const n = seguidoresDias.length;
  const max = 2;
  const x = (i: number) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const bw = (w - pad.l - pad.r) / n - 6;
  const linePts = media7.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-72">
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + t * (h - pad.t - pad.b)} y2={pad.t + t * (h - pad.t - pad.b)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      {[0, 0.5, 1, 1.5, 2].map((t) => (
        <text key={t} x={pad.l - 6} y={y(t) + 3} fontSize="9" textAnchor="end" fill="var(--muted-foreground)">{t.toFixed(1).replace(".", ",")}</text>
      ))}
      {novosDia.map((v, i) => v > 0 && (
        <rect key={i} x={x(i) - bw / 2} y={y(v)} width={bw} height={h - pad.b - y(v)} fill="#22C55E" />
      ))}
      <polyline points={linePts} fill="none" stroke="#7A5CFF" strokeWidth="2" />
      {seguidoresDias.map((d, i) => i % 2 === 0 && (
        <text key={d} x={x(i)} y={h - 8} fontSize="9" textAnchor="middle" fill="var(--muted-foreground)">{d}</text>
      ))}
    </svg>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: i.color }} />
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Página ----------
function DashboardMeta() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [liveData, setLiveData] = useState<null | {
    periodo: string;
    gastos: number;
    impressoes: number;
    cliques: number;
    ctr: number;
    cpm: number;
    topCreativos: Array<{ id: string; nome: string; ctr: number; gastos: number }>;
  }>(null);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchContas()
      .then((cs) => {
        setContas(cs);
        if (cs[0]) {
          setCliente(cs[0].cliente);
          return fetchLastResult<typeof liveData>("lb-meta-dashboard", cs[0].cliente);
        }
      })
      .then((last) => { if (last) setLiveData(last.payload); })
      .catch(() => {});
  }, []);

  const executarAnalise = async () => {
    setRunning(true);
    setStatusMsg("Analisando conta…");
    try {
      await runSkill({ skill: "lb-meta-dashboard", cliente, input: "" }, (ev) => {
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
      {/* Header gradiente */}
      <div className="rounded-xl p-6 md:p-8 mb-6 text-white flex items-start justify-between gap-4"
           style={{ background: "linear-gradient(120deg,#7A5CFF 0%,#B14BD1 55%,#E04C8A 100%)" }}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Completo — Loja Beta</h1>
          <p className="text-white/90 mt-1 text-[13px]">@lojabeta | 13/10/2023 – 04/06/2026 | Pago + Orgânico</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 px-3 rounded-md bg-white/15 backdrop-blur flex items-center justify-center">
            <Moon size={16} />
          </div>
          <div className="text-[12px] opacity-90 hidden md:block">04/06/2026 08:37</div>
        </div>
      </div>

      {/* Control panel */}
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

      {/* Resumo Executivo */}
      <SectionTitle>Resumo Executivo</SectionTitle>
      <Card className="!p-5">
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          Investimento total de <strong className="text-foreground">R$ 1.145,75</strong> em 965 dias (R$ 1,19/dia).
          Alcance de <strong className="text-foreground">65.477</strong> pessoas únicas com frequência 2,1.
          <strong className="text-foreground"> 84 conversas no DM</strong> iniciadas (custo R$ 13,64/conversa).
          64 salvamentos — sinal forte de intenção de compra.
          Top Reel orgânico: <strong className="text-foreground">6,0% eng. rate</strong>, 299 alcance, 18 interações.
        </p>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
        {(liveData ? [
          { label: "Investimento", value: `R$ ${liveData.gastos.toFixed(2)}`, foot: "" },
          { label: "Impressões", value: fmtInt(liveData.impressoes), foot: "" },
          { label: "Cliques", value: fmtInt(liveData.cliques), foot: "" },
          { label: "CTR", value: `${liveData.ctr.toFixed(2)}%`, foot: "" },
          { label: "CPM", value: `R$ ${liveData.cpm.toFixed(2)}`, foot: "" },
        ] : kpis).map((k) => <KpiCard key={k.label} {...k} />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-3">
        <Card className="!p-4 text-center">
          <div className="text-[10.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase mb-2">Seguidores</div>
          <div className="text-2xl font-extrabold tracking-tight">{fmtInt(seguidoresCard.atual)}</div>
          <div className="mt-2 flex justify-center">
            <span className="inline-flex px-2 py-0.5 rounded text-[10.5px] font-medium bg-muted text-muted-foreground">{fmtInt(seguidoresCard.atual)}</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-[color:var(--success)]">+{seguidoresCard.novos} novos</div>
          <div className="text-[11px] text-muted-foreground">seguidores</div>
        </Card>
      </div>

      {/* Performance por Anúncio - legenda */}
      <SectionTitle>Performance por Anúncio (com alertas de mercado)</SectionTitle>
      <Legend items={[
        { label: "Excelente (acima da média)", color: "#22C55E" },
        { label: "Bom (dentro da média)",      color: "#0EA5E9" },
        { label: "Ruim (abaixo da média)",     color: "#EF4444" },
      ]} />

      {/* Evolução Diária */}
      <SectionTitle>Evolução Diária</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[14px]">Gasto vs Alcance</h3>
            <Legend items={[{ label: "Alcance", color: "#22C55E" }, { label: "Gasto (R$)", color: "#8B5CF6" }]} />
          </div>
          <GastoAlcanceChart />
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[14px]">Engajamento Diário</h3>
            <Legend items={[{ label: "Saves", color: "#F59E0B" }, { label: "Cliques", color: "#0EA5E9" }]} />
          </div>
          <EngajamentoChart />
        </Card>
      </div>

      {/* Distribuição + Top Reels barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="font-semibold text-[14px] mb-3">Distribuição de Gasto</h3>
          <Donut />
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {distGasto.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                <span>{d.label} (R${d.value})</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[14px]">Top Reels — Alcance vs Interações</h3>
            <Legend items={[{ label: "Alcance", color: "#22C55E" }, { label: "Interações", color: "#F59E0B" }]} />
          </div>
          <TopReelsBars />
        </Card>
      </div>

      {/* Evolução de seguidores */}
      <SectionTitle>Evolução de Seguidores (30 dias)</SectionTitle>
      <Card>
        <div className="text-[13px] text-muted-foreground mb-2">
          Total atual: <strong className="text-foreground">{fmtInt(seguidoresCard.atual)} seguidores</strong> | <strong className="text-foreground">+{seguidoresCard.novos}</strong> no período
        </div>
        <div className="flex justify-center mb-2">
          <Legend items={[{ label: "Média 7 dias", color: "#7A5CFF" }, { label: "Novos/dia", color: "#22C55E" }]} />
        </div>
        <SeguidoresChart />
      </Card>

      {/* Comparativo Pago vs Orgânico */}
      <SectionTitle>Comparativo: Pago vs Orgânico</SectionTitle>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-semibold py-3 px-4">Thumb</th>
                <th className="text-left font-semibold py-3 px-4">Hierarquia</th>
                <th className="text-left font-semibold py-3 px-4">Tipo</th>
                <th className="text-right font-semibold py-3 px-4">Alcance</th>
                <th className="text-right font-semibold py-3 px-4">Saves</th>
                <th className="text-right font-semibold py-3 px-4">Comentários</th>
                <th className="text-right font-semibold py-3 px-4">Shares</th>
                <th className="text-right font-semibold py-3 px-4">CTR / Eng.</th>
                <th className="text-left font-semibold py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {comparativo.map((r, i) => (
                <tr key={i} className="border-t border-border hover:bg-accent/40">
                  <td className="py-3 px-4">
                    <div className="w-9 h-9 rounded-md" style={{ background: r.thumb }} />
                  </td>
                  <td className="py-3 px-4">{r.h}</td>
                  <td className="py-3 px-4">
                    <Badge tone={r.tipo === "ORGÂNICO" ? "success" : "primary"}>{r.tipo}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">{fmtInt(r.alcance)}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{r.saves}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{r.com}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{r.shares}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-[color:var(--success)]">{r.ctr}</td>
                  <td className="py-3 px-4">
                    <Badge tone={r.status === "Excelente" ? "success" : r.status === "Bom" ? "primary" : "neutral"}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top 7 Reels Orgânicos */}
      <SectionTitle>Top 7 Reels Orgânicos (Período)</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topReels.map((r) => (
          <Card key={r.rank} className="!p-0 overflow-hidden">
            <div className="aspect-[9/12] relative flex items-center justify-center text-white" style={{ background: r.color }}>
              <Instagram size={36} className="opacity-30" />
              <div className="absolute top-2 left-2 text-[11px] font-semibold bg-black/35 px-1.5 py-0.5 rounded">#{r.rank}</div>
            </div>
            <div className="p-3">
              <div className="text-[12.5px] font-semibold leading-tight mb-2 line-clamp-2">#{r.rank} {r.title}</div>
              <div className="grid grid-cols-3 gap-1 text-center mb-2">
                <div>
                  <div className="text-[13px] font-bold">{r.alcance}</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Alcance</div>
                </div>
                <div>
                  <div className="text-[13px] font-bold">{r.inter}</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Interações</div>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[color:var(--success)]">{r.eng}</div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Eng. Rate</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center pt-2 border-t border-border">
                <div className="flex flex-col items-center gap-0.5">
                  <Bookmark size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold">{r.saves}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <MessageCircle size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold">{r.com}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Share2 size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold">{r.shares}</span>
                </div>
              </div>
              <a className="block text-center mt-3 text-[12px] text-primary hover:underline" href="#">Ver no Instagram →</a>
            </div>
          </Card>
        ))}
      </div>

      {/* unused icon suppressors */}
      <span className="hidden"><Heart /><Eye /></span>
    </>
  );
}
