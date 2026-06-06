import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge } from "@/components/app-shell";
import { reels, fmtInt } from "@/lib/mock";
import { Play, TrendingUp, Eye, Users } from "lucide-react";

export const Route = createFileRoute("/reels")({
  head: () => ({ meta: [{ title: "Reels — LBCode Ads" }, { name: "description", content: "Ranking de Reels por desempenho e sugestões para impulsionar." }] }),
  component: Reels,
});

function Reels() {
  return (
    <>
      <PageHeader
        title="Reels"
        subtitle="Ranking de Reels da Dordrian Store por desempenho."
        actions={
          <select className="h-9 px-3 rounded-md border border-border bg-card text-[13px]">
            <option>Últimos 7 dias</option>
            <option>Últimos 14 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {reels.map((r) => {
          const top3 = r.rank <= 3;
          return (
            <Card key={r.id} className="!p-0 overflow-hidden">
              <div className="relative aspect-[9/16] bg-gradient-to-b from-muted to-accent flex items-center justify-center">
                <Play size={32} className="text-muted-foreground" />
                <div className="absolute top-2 left-2 bg-background/90 text-foreground text-[11px] font-bold px-1.5 py-0.5 rounded">
                  #{r.rank}
                </div>
                {top3 && (
                  <div className="absolute top-2 right-2">
                    <Badge tone="primary">
                      <TrendingUp size={10} className="mr-0.5" /> Impulsionar
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-[12px] font-medium leading-snug line-clamp-2 mb-2 min-h-[2.4em]">{r.title}</div>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> Visualizações</span>
                    <span className="font-semibold text-foreground tabular-nums">{fmtInt(r.views)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Engajamento</span>
                    <span className="font-semibold text-foreground tabular-nums">{r.eng.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1"><Users size={11} /> Alcance</span>
                    <span className="font-semibold text-foreground tabular-nums">{fmtInt(r.reach)}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
