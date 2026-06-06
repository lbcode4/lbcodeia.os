import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart,
} from "recharts";
import { Loader2, ExternalLink } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

// ─── tipos ────────────────────────────────────────────────────────────────────

type KpiEntry = {
  value: number;
  delta: { pct: number | null; direction: string; label: string };
  sub: string;
  new_followers?: number;
};

type DailyEntry = {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  link_clicks: number;
  video_views: number;
  saves: number;
  dms: number;
  leads: number;
  reactions: number;
  comments_count: number;
  landing_page_views: number;
};

type ConversaoEntry = { value: number; label: string; cost: string; emoji: string };

type Campanha = {
  funnel: string;
  funnelClass: string;
  name: string;
  spend: number;
  spendPct: string;
  alcance: number;
  ctr: string;
  cpc: string;
  frequencia: string;
  satBadge: string;
  satClass: string;
  actions: Array<{ val: string; name: string }>;
};

type Alerta = { type: string; icon: string; title: string; desc: string };

type DashboardData = {
  client: string;
  period: { since: string; until: string; days?: number; dias?: number };
  kpis: Record<string, KpiEntry>;
  daily: {
    days: string[];
    campaigns: Record<string, { spend: number[]; reach: number[]; clicks: number[]; saves: number[] }>;
  };
  dailyData?: DailyEntry[];
  comparativo: Array<{
    type: string; thumb: string; hierarchy: string;
    alcance: number; saves: number; comentarios: number; shares: number;
    ctr_eng: number; badge: string; link?: string;
  }>;
  reels: Array<{
    rank: number; is_viral: boolean; short_title: string;
    permalink: string; thumb: string; eng_rate: number;
    metrics: { reach: number; interactions: number; comments: number; shares: number; saves: number; plays: number };
  }>;
  followers: {
    current_total: number;
    daily: { days: string[]; values: number[] };
  };
  optimizations: Array<{
    priority: string; type: string; title: string; description: string;
  }>;
  resumo: string;
  conversao?: Record<string, ConversaoEntry>;
  campanhas?: Campanha[];
  alertas?: Alerta[];
};

// ─── formatters ───────────────────────────────────────────────────────────────

const fBRL = (v: number) => "R$" + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fNum = (v: number) => v.toLocaleString("pt-BR");
const fPct = (v: number) => v.toFixed(2).replace(".", ",") + "%";

// ─── helpers ──────────────────────────────────────────────────────────────────

function aggregate(camps: DashboardData["daily"]["campaigns"]) {
  const keys = Object.keys(camps);
  if (!keys.length) return { spend: [], reach: [], clicks: [], saves: [] };
  const len = camps[keys[0]].spend.length;
  const sum = (field: "spend" | "reach" | "clicks" | "saves") =>
    Array.from({ length: len }, (_, i) => keys.reduce((s, k) => s + (camps[k][field][i] ?? 0), 0));
  return { spend: sum("spend"), reach: sum("reach"), clicks: sum("clicks"), saves: sum("saves") };
}

function movingAvg(arr: number[], window = 7): number[] {
  return arr.map((_, i) => {
    const slice = arr.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function useDailyChartData(data: DashboardData) {
  if (data.dailyData?.length) {
    const days = data.dailyData.map((d) => {
      const [, m, day] = d.date.split("-");
      return `${day}/${m}`;
    });
    return {
      days,
      agg: {
        spend: data.dailyData.map((d) => d.spend),
        reach: data.dailyData.map((d) => d.reach),
        clicks: data.dailyData.map((d) => d.clicks),
        saves: data.dailyData.map((d) => d.saves),
      },
    };
  }
  return { days: data.daily.days, agg: aggregate(data.daily.campaigns) };
}

const DONUT_COLORS = ["#6c5ce7", "#0984e3", "#e84393", "#22c55e", "#f59e0b"];
const BADGE_COLORS: Record<string, string> = {
  viral: "text-amber-400 bg-amber-400/15",
  performando: "text-green-400 bg-green-400/15",
  mediano: "text-blue-400 bg-blue-400/15",
  ruim: "text-red-400 bg-red-400/15",
};
const ALERT_COLORS: Record<string, string> = {
  success: "border-green-500/50 bg-green-500/5",
  warning: "border-amber-500/50 bg-amber-500/5",
  danger: "border-red-500/50 bg-red-500/5",
  info: "border-blue-500/50 bg-blue-500/5",
};
const FUNNEL_COLORS: Record<string, string> = {
  tofu: "bg-blue-500/15 text-blue-400",
  mofu: "bg-purple-500/15 text-purple-400",
  bofu: "bg-green-500/15 text-green-400",
};
const SAT_COLORS: Record<string, string> = {
  ok: "text-green-400",
  atencao: "text-amber-400",
  critica: "text-red-400",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[17px] font-bold mt-8 mb-4">
      {children}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── gráficos ─────────────────────────────────────────────────────────────────

function GastoAlcanceChart({ days, agg }: { days: string[]; agg: ReturnType<typeof aggregate> }) {
  const data = days.map((d, i) => ({ d, gasto: agg.spend[i], alcance: agg.reach[i] }))
    .filter((r) => r.gasto > 0 || r.alcance > 0);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 4, right: 30, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
        <YAxis yAxisId="l" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickFormatter={(v) => "R$" + v} />
        <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9, fill: "#22c55e" }} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
          formatter={(v: number, name: string) => [name === "gasto" ? fBRL(v) : fNum(v), name === "gasto" ? "Gasto (R$)" : "Alcance"]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => v === "gasto" ? "Gasto (R$)" : "Alcance"} />
        <Bar yAxisId="r" dataKey="alcance" fill="#22c55e" opacity={0.7} name="alcance" />
        <Line yAxisId="l" type="monotone" dataKey="gasto" stroke="#6c5ce7" strokeWidth={2} dot={false} name="gasto" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function EngajamentoChart({ days, agg }: { days: string[]; agg: ReturnType<typeof aggregate> }) {
  const data = days.map((d, i) => ({ d, saves: agg.saves[i], cliques: agg.clicks[i] }))
    .filter((r) => r.saves > 0 || r.cliques > 0);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="saves" fill="#f59e0b" name="Saves" stackId="a" />
        <Bar dataKey="cliques" fill="#0984e3" name="Cliques" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutChart({ camps }: { camps: DashboardData["daily"]["campaigns"] }) {
  const totals = Object.entries(camps)
    .map(([name, d]) => ({ name: name.slice(0, 20), value: d.spend.reduce((a, b) => a + b, 0) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={totals} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={false}>
          {totals.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }}
          formatter={(v: number, _: unknown, props: { payload?: { name: string } }) =>
            [fBRL(v), props.payload?.name ?? ""]} />
        <Legend wrapperStyle={{ fontSize: 10 }}
          formatter={(_, e) => `${(e as { payload?: { name: string } }).payload?.name ?? ""} (${fBRL(totals.find((t) => t.name === (e as { payload?: { name: string } }).payload?.name)?.value ?? 0)})`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ReelsChart({ reels }: { reels: DashboardData["reels"] }) {
  const data = reels.map((r) => ({
    nome: r.short_title.slice(0, 18) + (r.short_title.length > 18 ? "…" : ""),
    alcance: r.metrics.reach,
    interacoes: r.metrics.interactions,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 30, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="nome" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="alcance" fill="#22c55e" name="Alcance" />
        <Bar dataKey="interacoes" fill="#f59e0b" name="Interações" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SeguidoresChart({ followers }: { followers: DashboardData["followers"] }) {
  const { days, values } = followers.daily;
  const avg = movingAvg(values, 7);
  const data = days.map((d, i) => ({ d, novos: values[i], media: parseFloat(avg[i].toFixed(2)) }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="novos" fill="#22c55e" opacity={0.8} name="Novos/dia" />
        <Line type="monotone" dataKey="media" stroke="#6c5ce7" strokeWidth={2} dot={{ r: 2 }} name="Média 7 dias" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── seções extras ────────────────────────────────────────────────────────────

const CONVERSAO_ORDER = ["link-clicks", "dms", "saves", "video-views", "reactions", "comments", "leads", "lpv"];

function ConversaoSection({ conversao }: { conversao: Record<string, ConversaoEntry> }) {
  return (
    <>
      <SectionTitle>Métricas de Conversão</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {CONVERSAO_ORDER.filter((k) => conversao[k]).map((key) => {
          const c = conversao[key];
          return (
            <Card key={key} className="py-3 px-4 text-center">
              <div className="text-2xl mb-1">{c.emoji}</div>
              <div className="text-2xl font-bold leading-none">{fNum(c.value)}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-1">{c.label}</div>
              {c.cost !== "—" && (
                <div className="text-[10px] text-primary font-semibold mt-1">{c.cost}</div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function CampanhasSection({ campanhas }: { campanhas: Campanha[] }) {
  const sorted = [...campanhas].sort((a, b) => b.spend - a.spend);
  return (
    <>
      <SectionTitle>Performance por Campanha · {campanhas.length} campanhas</SectionTitle>
      <Card className="p-0 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Funil</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Campanha</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Gasto</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Alcance</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">CTR</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">CPC</th>
                <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Freq.</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Sat.</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${FUNNEL_COLORS[c.funnelClass] ?? "bg-muted/20 text-muted-foreground"}`}>
                      {c.funnelClass.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[220px]">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.spendPct}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-bold">{fBRL(c.spend)}</td>
                  <td className="px-3 py-2 text-right">{fNum(c.alcance)}</td>
                  <td className="px-3 py-2 text-right">{c.ctr}</td>
                  <td className="px-3 py-2 text-right">{c.cpc}</td>
                  <td className="px-3 py-2 text-right">{c.frequencia}</td>
                  <td className="px-3 py-2">
                    {c.satBadge && (
                      <span className={`font-bold text-[11px] ${SAT_COLORS[c.satClass] ?? "text-muted-foreground"}`}>
                        {c.satBadge}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function AlertasSection({ alertas }: { alertas: Alerta[] }) {
  return (
    <>
      <SectionTitle>Alertas e Insights</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {alertas.map((a, i) => (
          <Card key={i} className={`border ${ALERT_COLORS[a.type] ?? "border-border"} flex gap-3`}>
            <div className="text-2xl flex-shrink-0">{a.icon}</div>
            <div>
              <div className="font-semibold text-[13px] mb-1">{a.title}</div>
              <div className="text-[12px] text-muted-foreground leading-relaxed">{a.desc}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Visão Geral — LBCode Ads" }] }),
  component: Overview,
});

// ─── componente principal ─────────────────────────────────────────────────────

function Overview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/dashboard/data`)
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => setData(d as DashboardData))
      .catch(() => setErro("Backend offline ou relatório não encontrado"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground text-[13px] mt-8">
      <Loader2 size={14} className="animate-spin" /> Carregando dados do relatório…
    </div>
  );

  if (!data) return (
    <div className="mt-8">
      <PageHeader title="Visão Geral" subtitle="Sem dados" />
      {erro && <p className="text-[13px] text-red-500">{erro}</p>}
    </div>
  );

  const { days, agg } = useDailyChartData(data);
  const dias = data.period.dias ?? data.period.days ?? 0;
  const kpiOrder = ["spend", "reach", "clicks", "ctr", "dms", "saves", "video_views", "followers"] as const;
  const kpiLabels: Record<string, string> = {
    spend: "Investimento", reach: "Alcance", clicks: "Cliques", ctr: "CTR",
    saves: "Saves", dms: "Conversas DM", video_views: "Video Views", followers: "Seguidores",
  };

  return (
    <>
      <PageHeader
        title={`Dashboard — ${data.client}`}
        subtitle={`${data.period.since} → ${data.period.until} · ${fNum(dias)} dias`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {kpiOrder.filter((k) => data.kpis[k]).map((key) => {
          const k = data.kpis[key];
          const dirUp = k.delta.direction === "up";
          const isSpend = key === "spend";
          const good = isSpend ? !dirUp : dirUp;
          const val = key === "spend" ? fBRL(k.value) : key === "ctr" ? fPct(k.value) : fNum(k.value);
          return (
            <Card key={key} className="py-3 px-4">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{kpiLabels[key]}</div>
              <div className="text-2xl font-bold mt-1 leading-none">{val}</div>
              {key === "followers" && k.new_followers ? (
                <div className="text-[11px] text-green-500 mt-1">+{fNum(k.new_followers)} novos</div>
              ) : (
                <div className={`mt-1 text-[11px] font-semibold ${good ? "text-green-500" : "text-red-500"}`}>
                  {dirUp ? "▲" : "▼"} {k.delta.label}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
            </Card>
          );
        })}
      </div>

      {/* Resumo */}
      {data.resumo && (
        <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-4 mb-2 px-1">{data.resumo}</p>
      )}

      {/* Métricas de Conversão */}
      {data.conversao && Object.keys(data.conversao).length > 0 && (
        <ConversaoSection conversao={data.conversao} />
      )}

      {/* Evolução Diária */}
      <SectionTitle>Evolução Diária</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-[13px] font-semibold text-muted-foreground mb-2">Gasto vs Alcance</h3>
          <GastoAlcanceChart days={days} agg={agg} />
        </Card>
        <Card>
          <h3 className="text-[13px] font-semibold text-muted-foreground mb-2">Engajamento Diário</h3>
          <EngajamentoChart days={days} agg={agg} />
        </Card>
        {data.daily?.campaigns && (
          <Card>
            <h3 className="text-[13px] font-semibold text-muted-foreground mb-2">Distribuição de Gasto</h3>
            <DonutChart camps={data.daily.campaigns} />
          </Card>
        )}
        {data.reels?.length > 0 && (
          <Card>
            <h3 className="text-[13px] font-semibold text-muted-foreground mb-2">Top Reels — Alcance vs Interações</h3>
            <ReelsChart reels={data.reels} />
          </Card>
        )}
      </div>

      {/* Evolução de Seguidores */}
      {data.followers?.daily && (
        <>
          <SectionTitle>Evolução de Seguidores (30 dias)</SectionTitle>
          <Card className="mb-4">
            <p className="text-[12px] text-muted-foreground mb-3">
              Total atual: <strong>{fNum(data.followers.current_total)} seguidores</strong>
              {" "}|{" "}
              +{fNum(data.followers.daily.values.reduce((a, b) => a + b, 0))} no período
            </p>
            <SeguidoresChart followers={data.followers} />
          </Card>
        </>
      )}

      {/* Comparativo Pago vs Orgânico */}
      {data.comparativo?.length > 0 && (
        <>
          <SectionTitle>Comparativo: Pago vs Orgânico</SectionTitle>
          <Card className="p-0 overflow-hidden mb-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Thumb</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Hierarquia</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Alcance</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Saves</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Coment.</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Shares</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">CTR/Eng.</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.comparativo.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-3 py-2">
                      {row.thumb ? (
                        <img src={row.thumb} alt="" className="w-10 h-10 rounded-md object-cover bg-muted" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted" />
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{row.hierarchy}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.type === "organico" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                        {row.type === "organico" ? "Orgânico" : "Pago"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{fNum(row.alcance)}</td>
                    <td className="px-3 py-2 text-right">{fNum(row.saves)}</td>
                    <td className="px-3 py-2 text-right">{fNum(row.comentarios)}</td>
                    <td className="px-3 py-2 text-right">{fNum(row.shares)}</td>
                    <td className="px-3 py-2 text-right font-bold text-green-400">{row.ctr_eng.toFixed(1)} %</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${BADGE_COLORS[row.badge] ?? "text-muted-foreground bg-muted/30"}`}>
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Performance por Campanha */}
      {data.campanhas && data.campanhas.length > 0 && (
        <CampanhasSection campanhas={data.campanhas} />
      )}

      {/* Top Reels */}
      {data.reels?.length > 0 && (
        <>
          <SectionTitle>Top {data.reels.length} Reels Orgânicos (Período)</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {data.reels.map((r) => (
              <Card key={r.rank} className={`p-0 overflow-hidden ${r.is_viral ? "border-amber-500/50" : ""}`}>
                {r.thumb && (
                  <img src={r.thumb} alt={r.short_title} className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                  <div className="text-[11px] text-muted-foreground mb-1">#{r.rank} {r.short_title}</div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center">
                      <div className="text-[15px] font-bold">{fNum(r.metrics.reach)}</div>
                      <div className="text-[9px] uppercase text-muted-foreground">Alcance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[15px] font-bold">{fNum(r.metrics.interactions)}</div>
                      <div className="text-[9px] uppercase text-muted-foreground">Interações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[15px] font-bold text-green-400">{r.eng_rate.toFixed(1)}%</div>
                      <div className="text-[9px] uppercase text-muted-foreground">Eng. Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-2">
                    {[["Saves", r.metrics.saves], ["Comments", r.metrics.comments], ["Shares", r.metrics.shares]].map(([label, val]) => (
                      <div key={label as string}>
                        <div className="text-[13px] font-semibold">{fNum(val as number)}</div>
                        <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>
                  {r.permalink && (
                    <a href={r.permalink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 mt-2 text-[11px] text-primary hover:underline">
                      Ver no Instagram <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Alertas e Insights */}
      {data.alertas && data.alertas.length > 0 && (
        <AlertasSection alertas={data.alertas} />
      )}

      {/* Otimizações Prioritárias (legado) */}
      {data.optimizations?.length > 0 && (
        <>
          <SectionTitle>Otimizações Prioritárias</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
            {data.optimizations.map((o, i) => {
              const priColor = o.priority === "HIGH" ? "border-red-500/50 bg-red-500/5"
                : o.priority === "MEDIUM" ? "border-amber-500/50 bg-amber-500/5"
                : "border-blue-500/50 bg-blue-500/5";
              return (
                <Card key={i} className={`border ${priColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      o.priority === "HIGH" ? "bg-red-500 text-white"
                        : o.priority === "MEDIUM" ? "bg-amber-500 text-black"
                        : "bg-blue-500 text-white"
                    }`}>{o.priority}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{o.type}</span>
                  </div>
                  <div className="font-semibold text-[13px] mb-1">{o.title}</div>
                  <div className="text-[12px] text-muted-foreground leading-relaxed">{o.description}</div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
