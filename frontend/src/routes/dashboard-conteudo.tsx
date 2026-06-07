import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type ConteudoItem = { id: string; titulo: string; tipo: string; data: string; status: string; capa?: string };

export const Route = createFileRoute("/dashboard-conteudo")({
  component: DashboardConteudoPage,
});

const COLUMNS = [
  { id: "em_desenvolvimento", label: "📝 Em Desenvolvimento" },
  { id: "criados", label: "🎨 Criados" },
  { id: "esperando_aprovacao", label: "⏳ Aprovação" },
  { id: "agendados", label: "📅 Agendados" },
  { id: "publicados", label: "✅ Publicados" }
];

function DashboardConteudoPage() {
  const [items, setItems] = useState<ConteudoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    fetch(`${BACKEND}/api/conteudo`)
      .then((r) => r.json())
      .then((d) => {
        const todos = [
          ...(d.reels || []),
          ...(d.stories || []),
          ...(d.carrosseis || []),
        ];
        setItems(todos.map((t: any) => ({ ...t, status: t.status || "em_desenvolvimento" })));
        setLoading(false);
      });
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleDragStart = (e: React.DragEvent, item: ConteudoItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const item: ConteudoItem = JSON.parse(data);
    if (item.status === statusId) return;

    setItems((prev) => prev.map((p) => p.id === item.id && p.tipo === item.tipo ? { ...p, status: statusId } : p));

    try {
      const arquivo = item.tipo === "reels" ? "roteiro.md" : item.tipo === "carrossel" ? "legenda.md" : "sequencia.md";
      await fetch(`${BACKEND}/api/conteudo/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: item.tipo, id: item.id, arquivo, status: statusId })
      });
    } catch (err) {
      carregar();
    }
  };

  return (
    <>
      <PageHeader
        title="Dashboard de Conteúdo"
        subtitle="Gerencie o fluxo de criação arrastando os cards entre as colunas."
      />

      {loading ? (
        <p className="text-muted-foreground text-[13px]">Carregando...</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
          {COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.status === col.id);
            return (
              <div
                key={col.id}
                className="flex-shrink-0 w-[300px] bg-card rounded-xl border border-border flex flex-col h-full shadow-sm overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/10">
                  <h3 className="font-semibold text-[13px]">{col.label}</h3>
                  <span className="text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3">
                  {colItems.map((item) => (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all flex gap-3"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      {item.capa && (
                        <div className="w-12 h-12 shrink-0 rounded overflow-hidden bg-muted border border-border">
                          <img 
                            src={`${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(item.id)}&slide=${encodeURIComponent(item.capa)}`} 
                            className="w-full h-full object-cover" 
                            alt=""
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                            {item.tipo}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">{item.data}</span>
                        </div>
                        <p className="font-semibold text-[13px] leading-snug line-clamp-2">{item.titulo}</p>
                      </div>
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-[12px] text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/5">
                      Arraste um post para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
