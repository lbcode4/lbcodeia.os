import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { PageHeader, Card } from "@/components/app-shell";

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
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/sites`)
      .then((r) => r.json())
      .then(setSites)
      .catch(() => setErro("Backend offline ou sem sites"));
  }, []);

  return (
    <>
      <PageHeader
        title="Meus Sites"
        subtitle="Sites criados no LBCode. Selecione um para editar com a IA."
      />

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
