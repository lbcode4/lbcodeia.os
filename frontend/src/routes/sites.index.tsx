import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, Plus, X, Loader2 } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type SiteInfo = {
  id: string;
  name: string;
  updatedAt: string;
  thumbColor: string;
};

export const Route = createFileRoute("/sites/")({
  component: SitesIndex,
});

function SitesIndex() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [erro, setErro] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/sites`)
      .then((r) => r.json())
      .then(setSites)
      .catch(() => setErro("Backend offline ou sem sites"));
  }, []);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function cancelCreate() {
    setCreating(false);
    setNewName("");
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${BACKEND}/api/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Erro ao criar site");
      const { id } = await res.json() as { id: string };
      navigate({ to: "/sites/$siteId", params: { siteId: id } });
    } catch {
      setIsCreating(false);
      setErro("Erro ao criar site. Tente novamente.");
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <PageHeader
          title="Meus Sites"
          subtitle="Sites criados no LBCode. Selecione um para editar com a IA."
        />
        {!creating && (
          <Button onClick={() => setCreating(true)} className="shrink-0 mt-1">
            <Plus size={15} className="mr-1.5" />
            Novo Site
          </Button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-2 mb-6">
          <input
            ref={inputRef}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-xs"
            placeholder="Nome do site"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") cancelCreate();
            }}
            disabled={isCreating}
          />
          <Button onClick={handleCreate} disabled={!newName.trim() || isCreating}>
            {isCreating ? <Loader2 size={15} className="animate-spin" /> : "Criar"}
          </Button>
          <button
            onClick={cancelCreate}
            className="p-1.5 text-muted-foreground hover:text-foreground"
            disabled={isCreating}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {erro && <p className="text-[13px] text-red-500 mb-4">{erro}</p>}

      {sites.length === 0 && !erro && (
        <p className="text-[13px] text-muted-foreground">Nenhum site encontrado em marketing/sites/.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((s) => (
          <Card key={s.id} className="!p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <Link
              to="/sites/$siteId"
              params={{ siteId: s.id }}
              className="aspect-video relative block group"
              style={{ background: s.thumbColor }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Globe size={36} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center">
                <span className="bg-white text-foreground text-[12px] font-semibold px-3 py-1.5 rounded-md">
                  Abrir editor
                </span>
              </div>
            </Link>

            <div className="p-4 flex flex-col gap-1">
              <h3 className="font-semibold text-[14px] capitalize">{s.name}</h3>
              <p className="text-[12px] text-muted-foreground">Atualizado {s.updatedAt}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
