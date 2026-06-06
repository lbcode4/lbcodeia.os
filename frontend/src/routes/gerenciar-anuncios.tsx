import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, Badge, Button } from "@/components/app-shell";
import { ads as seedAds, adLog, fmtBRL } from "@/lib/mock";
import { Search, History } from "lucide-react";

export const Route = createFileRoute("/gerenciar-anuncios")({
  head: () => ({ meta: [{ title: "Gerenciar Anúncios — LBCode Ads" }, { name: "description", content: "Ative ou pause anúncios com log de auditoria." }] }),
  component: GerenciarAnuncios,
});

function GerenciarAnuncios() {
  const [ads, setAds] = useState(seedAds);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<{ id: string; next: "ACTIVE" | "PAUSED" } | null>(null);
  const [log, setLog] = useState(adLog);

  const filtered = ads.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  const confirm = () => {
    if (!modal) return;
    const ad = ads.find((a) => a.id === modal.id)!;
    setAds((prev) => prev.map((a) => (a.id === modal.id ? { ...a, status: modal.next } : a)));
    const now = new Date();
    const ts = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setLog((p) => [{ ts, action: modal.next === "ACTIVE" ? "Ativou" : "Pausou", target: ad.name }, ...p]);
    setModal(null);
  };

  return (
    <>
      <PageHeader title="Gerenciar Anúncios" subtitle="Ative ou pause anúncios. Toda ação fica registrada no log." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar anúncio por nome…"
              className="w-full pl-9 h-10 rounded-md border border-border bg-card text-[14px] px-3"
            />
          </div>
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium py-2 px-3">Anúncio</th>
                    <th className="text-left font-medium py-2 px-3">Campanha</th>
                    <th className="text-center font-medium py-2 px-3">Status</th>
                    <th className="text-right font-medium py-2 px-3">Gasto</th>
                    <th className="text-right font-medium py-2 px-3">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const on = a.status === "ACTIVE";
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-3 font-medium">{a.name}</td>
                        <td className="py-3 px-3 text-muted-foreground">{a.campanha}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setModal({ id: a.id, next: on ? "PAUSED" : "ACTIVE" })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[color:var(--success)]" : "bg-muted"}`}
                            aria-label="Alternar status"
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                          <div className="text-[10px] text-muted-foreground mt-1">{a.status}</div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">{fmtBRL(a.gasto)}</td>
                        <td className="py-3 px-3 text-right tabular-nums">{a.ctr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <History size={16} />
            <h3 className="font-semibold">Log de ações</h3>
          </div>
          <ul className="space-y-3 text-[13px]">
            {log.map((l, i) => (
              <li key={i} className="pb-3 border-b border-border last:border-0">
                <div className="text-[11px] text-muted-foreground">{l.ts}</div>
                <div className="mt-0.5">
                  <span className="font-medium">{l.action}</span> <span className="text-muted-foreground">'{l.target}'</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <Card className="max-w-md w-full" >
            <div onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-lg mb-2">
                {modal.next === "PAUSED" ? "Pausar anúncio?" : "Ativar anúncio?"}
              </h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                {modal.next === "PAUSED" ? "Pausar" : "Ativar"} o anúncio <span className="font-medium text-foreground">'{ads.find((a) => a.id === modal.id)?.name}'</span>? Status atual:{" "}
                <Badge tone={ads.find((a) => a.id === modal.id)?.status === "ACTIVE" ? "success" : "neutral"}>
                  {ads.find((a) => a.id === modal.id)?.status === "ACTIVE" ? "Ativo" : "Pausado"}
                </Badge>
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
                <Button onClick={confirm}>Confirmar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
