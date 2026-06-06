import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Plus, MoreVertical, ExternalLink } from "lucide-react";
import { PageHeader, Card, Button, Badge } from "@/components/app-shell";
import { sites, type Site } from "@/lib/mock";

export const Route = createFileRoute("/sites/")({
  component: SitesIndex,
});

const statusTone = (s: Site["status"]) =>
  s === "publicado" ? "success" : s === "em-desenvolvimento" ? "primary" : "neutral";
const statusLabel = (s: Site["status"]) =>
  s === "publicado" ? "Publicado" : s === "em-desenvolvimento" ? "Em desenvolvimento" : "Rascunho";

function SitesIndex() {
  return (
    <>
      <PageHeader
        title="Meus Sites"
        subtitle="Sites criados e em desenvolvimento no LBCode. Selecione um para editar com a IA."
        actions={
          <Button>
            <Plus size={16} /> Novo site
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((s) => (
          <Card key={s.id} className="!p-0 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <Link
              to="/sites/$siteId"
              params={{ siteId: s.id }}
              className="aspect-video relative block group"
              style={{ background: s.thumbColor }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Globe size={36} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                <span className="text-white text-[11px] font-mono opacity-90">{s.domain}</span>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center">
                <span className="bg-white text-foreground text-[12px] font-semibold px-3 py-1.5 rounded-md">
                  Abrir editor
                </span>
              </div>
            </Link>

            <div className="p-4 flex-1 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[14px] truncate">{s.name}</h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {s.pages} {s.pages === 1 ? "página" : "páginas"} · atualizado {s.updatedAt}
                  </p>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1" aria-label="Mais opções">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1">
                <Badge tone={statusTone(s.status)}>{statusLabel(s.status)}</Badge>
                {s.status === "publicado" && (
                  <a
                    href={`https://${s.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-primary hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    Ver site <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
