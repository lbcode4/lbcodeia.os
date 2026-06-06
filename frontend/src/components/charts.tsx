import { fmtBRL } from "@/lib/mock";

export function Sparkline({ data, color = "var(--primary)", className = "" }: { data: number[]; color?: string; className?: string }) {
  const w = 120, h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full max-w-[120px] h-8 ${className}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function AreaChart({
  data, color = "var(--primary)", yFormat = (v: number) => String(v),
}: { data: { d: string; v: number }[]; color?: string; yFormat?: (v: number) => string }) {
  const w = 600, h = 200, pad = 32;
  const max = Math.max(...data.map((d) => d.v));
  const min = 0;
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const pts = data.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const area = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="var(--border)" strokeWidth="0.5" />
      ))}
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.v)} r="3" fill={color} />
          <text x={x(i)} y={h - 10} fontSize="10" textAnchor="middle" fill="var(--muted-foreground)">{d.d}</text>
        </g>
      ))}
      <text x={pad - 6} y={pad + 4} fontSize="10" textAnchor="end" fill="var(--muted-foreground)">{yFormat(max)}</text>
      <text x={pad - 6} y={h - pad} fontSize="10" textAnchor="end" fill="var(--muted-foreground)">0</text>
    </svg>
  );
}

export function BarChartH({ data, format = (v: number) => String(v) }: { data: { label: string; value: number }[]; format?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-[12px] mb-1">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium">{format(d.value)}</span>
          </div>
          <div className="h-2 bg-muted rounded">
            <div className="h-2 rounded bg-primary" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export { fmtBRL };
