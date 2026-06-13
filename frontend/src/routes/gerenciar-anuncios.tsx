import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { useCliente } from "@/lib/cliente-context";
import { ChevronDown, ChevronRight, History, RefreshCw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/gerenciar-anuncios")({
  head: () => ({
    meta: [
      { title: "Campanhas Meta — LBCode Ads" },
      { name: "description", content: "Veja e gerencie campanhas e conjuntos de anúncios do Meta Ads." },
    ],
  }),
  component: GerenciarCampanhas,
});

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

type LogEntry = { ts: string; nivel: string; nome: string; acao: string };

type ModalState = {
  id: string;
  nivel: "campanha" | "adset";
  next: "ACTIVE" | "PAUSED";
  nome: string;
};

function fmtBudget(c: Campanha | Adset): string {
  if (c.daily_budget) return `R$ ${(Number(c.daily_budget) / 100).toFixed(2)}/dia`;
  if (c.lifetime_budget) return `R$ ${(Number(c.lifetime_budget) / 100).toFixed(2)} total`;
  return "—";
}

function nowTs(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function StatusToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[color:var(--success)]" : "bg-muted"}`}
      aria-label="Alternar status"
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function GerenciarCampanhas() {
  const { contas, cliente, setCliente } = useCliente();
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [adsets, setAdsets] = useState<Record<string, Adset[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAdsets, setLoadingAdsets] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toggling, setToggling] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (cliente) carregarCampanhasComCliente(cliente);
  }, [cliente]);

  async function carregarCampanhasComCliente(c: string) {
    setLoading(true);
    setErro("");
    setCampanhas([]);
    setExpandedId(null);
    setAdsets({});
    try {
      const res = await fetch(`${BACKEND}/api/meta/campanhas?cliente=${encodeURIComponent(c)}`);
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status}`);
      }
      setCampanhas(await res.json() as Campanha[]);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function carregarCampanhas() {
    if (cliente) carregarCampanhasComCliente(cliente);
  }

  async function expandCampanha(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (adsets[id]) return;
    setLoadingAdsets(id);
    try {
      const res = await fetch(`${BACKEND}/api/meta/adsets?campanha_id=${id}&cliente=${encodeURIComponent(cliente)}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json() as Adset[];
      setAdsets((prev) => ({ ...prev, [id]: data }));
    } catch {
      setAdsets((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingAdsets(null);
    }
  }

  function requestToggle(id: string, nivel: "campanha" | "adset", current: "ACTIVE" | "PAUSED", nome: string) {
    setModal({ id, nivel, next: current === "ACTIVE" ? "PAUSED" : "ACTIVE", nome });
  }

  async function confirmarToggle() {
    if (!modal) return;
    setToggling(true);

    const prevCampanhas = campanhas;
    const prevAdsets = { ...adsets };

    if (modal.nivel === "campanha") {
      setCampanhas((prev) => prev.map((c) => c.id === modal.id ? { ...c, status: modal.next } : c));
    } else {
      setAdsets((prev) => {
        const updated = { ...prev };
        for (const [cId, as] of Object.entries(updated)) {
          if (as.some((a) => a.id === modal.id)) {
            updated[cId] = as.map((a) => a.id === modal.id ? { ...a, status: modal.next } : a);
          }
        }
        return updated;
      });
    }

    const endpoint = modal.nivel === "campanha"
      ? `/api/meta/campanhas/${modal.id}/status`
      : `/api/meta/adsets/${modal.id}/status`;

    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modal.next }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status}`);
      }
      const acao = modal.next === "ACTIVE" ? "Ativou" : "Pausou";
      const nivel = modal.nivel === "campanha" ? "Campanha" : "Conjunto";
      setLog((prev) => [{ ts: nowTs(), nivel, nome: modal.nome, acao }, ...prev]);
    } catch (e) {
      setCampanhas(prevCampanhas);
      setAdsets(prevAdsets);
      setLog((prev) => [{ ts: nowTs(), nivel: "Erro", nome: modal.nome, acao: (e as Error).message }, ...prev]);
    } finally {
      setToggling(false);
      setModal(null);
    }
  }

  const filtered = campanhas.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const isInsta = (name: string) => name.toLowerCase().includes("instagram") || name.toLowerCase().includes("insta");
  const filteredInsta = filtered.filter((c) => isInsta(c.name));
  const filteredOther = filtered.filter((c) => !isInsta(c.name));

  function renderCampRow(camp: Campanha) {
    const on = camp.status === "ACTIVE";
    const expanded = expandedId === camp.id;
    const campAdsets = adsets[camp.id] ?? [];
    return (
      <>
        <tr key={camp.id} className="border-b border-border hover:bg-muted/20 cursor-pointer" onClick={() => expandCampanha(camp.id)}>
          <td className="py-3 px-3 text-muted-foreground">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </td>
          <td className="py-3 px-3 font-medium">{camp.name}</td>
          <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell text-[11px]">{camp.objective}</td>
          <td className="py-3 px-3 text-right hidden sm:table-cell tabular-nums">{fmtBudget(camp)}</td>
          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
            <StatusToggle on={on} onClick={() => requestToggle(camp.id, "campanha", camp.status, camp.name)} />
            <div className="text-[10px] text-muted-foreground mt-1">{camp.status}</div>
          </td>
        </tr>
        {expanded && (
          loadingAdsets === camp.id ? (
            <tr key={`${camp.id}-loading`} className="border-b border-border bg-muted/10">
              <td colSpan={5} className="py-3 px-10 text-muted-foreground text-[12px]">
                <Loader2 size={12} className="animate-spin inline mr-1" /> Carregando conjuntos…
              </td>
            </tr>
          ) : campAdsets.length === 0 ? (
            <tr key={`${camp.id}-empty`} className="border-b border-border bg-muted/10">
              <td colSpan={5} className="py-3 px-10 text-muted-foreground text-[12px]">Nenhum conjunto ativo ou pausado.</td>
            </tr>
          ) : campAdsets.map((adset) => {
            const adOn = adset.status === "ACTIVE";
            return (
              <tr key={adset.id} className="border-b border-border last:border-0 bg-muted/10">
                <td className="py-2 px-3"></td>
                <td className="py-2 px-3 pl-8 text-muted-foreground">↳ {adset.name}</td>
                <td className="py-2 px-3 hidden sm:table-cell"></td>
                <td className="py-2 px-3 text-right hidden sm:table-cell tabular-nums text-[12px]">{fmtBudget(adset)}</td>
                <td className="py-2 px-3 text-center">
                  <StatusToggle on={adOn} onClick={() => requestToggle(adset.id, "adset", adset.status, adset.name)} />
                  <div className="text-[10px] text-muted-foreground mt-1">{adset.status}</div>
                </td>
              </tr>
            );
          })
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Campanhas Meta" subtitle="Ative ou pause campanhas e conjuntos. Toda ação fica registrada no log." />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={cliente}
          onChange={(e) => { setCliente(e.target.value); carregarCampanhasComCliente(e.target.value); }}
          className="h-9 rounded-md border border-border bg-card text-[13px] px-3 min-w-[160px]"
        >
          {contas.map((c) => (
            <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={carregarCampanhas} disabled={loading || !cliente}>
          {loading ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}
          Atualizar
        </Button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar campanhas…"
          className="h-9 rounded-md border border-border bg-card text-[13px] px-3 flex-1 min-w-[180px]"
        />
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-[13px] px-4 py-3">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="!p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-[13px] gap-2">
                <Loader2 size={16} className="animate-spin" /> Carregando campanhas…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-[13px]">
                {campanhas.length === 0 ? "Selecione um cliente para carregar as campanhas." : "Nenhuma campanha encontrada."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium py-2 px-3 w-6"></th>
                      <th className="text-left font-medium py-2 px-3">Campanha</th>
                      <th className="text-left font-medium py-2 px-3 hidden sm:table-cell">Objetivo</th>
                      <th className="text-right font-medium py-2 px-3 hidden sm:table-cell">Orçamento</th>
                      <th className="text-center font-medium py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOther.length > 0 && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="py-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Meta
                        </td>
                      </tr>
                    )}
                    {filteredOther.map((camp) => renderCampRow(camp))}
                    {filteredInsta.length > 0 && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="py-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Instagram
                        </td>
                      </tr>
                    )}
                    {filteredInsta.map((camp) => renderCampRow(camp))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <History size={16} />
            <h3 className="font-semibold text-[14px]">Log de ações</h3>
          </div>
          {log.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Nenhuma ação nesta sessão.</p>
          ) : (
            <ul className="space-y-3 text-[13px]">
              {log.map((l, i) => (
                <li key={i} className="pb-3 border-b border-border last:border-0">
                  <div className="text-[11px] text-muted-foreground">{l.ts}</div>
                  <div className="mt-0.5">
                    <span className={`font-medium ${l.nivel === "Erro" ? "text-destructive" : ""}`}>{l.acao}</span>{" "}
                    <span className="text-muted-foreground text-[11px]">[{l.nivel}]</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.nome}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !toggling && setModal(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
          <Card className="max-w-md w-full">
            <h3 className="font-semibold text-[16px] mb-2">
              {modal.next === "PAUSED" ? "Pausar" : "Ativar"}{" "}
              {modal.nivel === "campanha" ? "campanha" : "conjunto"}?
            </h3>
            <p className="text-[13px] text-muted-foreground mb-5">
              <span className="font-medium text-foreground">'{modal.nome}'</span> será{" "}
              {modal.next === "PAUSED" ? "pausado" : "ativado"} no Meta Ads.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModal(null)} disabled={toggling}>
                Cancelar
              </Button>
              <Button onClick={confirmarToggle} disabled={toggling}>
                {toggling ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Confirmar
              </Button>
            </div>
          </Card>
          </div>
        </div>
      )}
    </>
  );
}
