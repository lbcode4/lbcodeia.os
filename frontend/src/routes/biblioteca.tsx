import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/app-shell";
import { Copy, Check, ChevronRight, X, FileText, FileCode, Image } from "lucide-react";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type BibliotecaItem = {
  path: string;
  label: string;
  type: "md" | "html" | "image";
  section: string;
  subsection?: string;
};

type BibliotecaSection = {
  id: string;
  label: string;
  items: BibliotecaItem[];
};

const FILE_URL = (path: string) =>
  `${BACKEND}/api/biblioteca/arquivo?path=${encodeURIComponent(path)}`;

function fileIcon(type: BibliotecaItem["type"]) {
  if (type === "html") return <FileCode size={13} className="text-orange-400" />;
  if (type === "image") return <Image size={13} className="text-blue-400" />;
  return <FileText size={13} className="text-muted-foreground" />;
}

export const Route = createFileRoute("/biblioteca")({
  component: BibliotecaPagina,
});

function BibliotecaPagina() {
  const [sections, setSections] = useState<BibliotecaSection[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [selected, setSelected] = useState<BibliotecaItem | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/api/biblioteca`)
      .then((r) => r.json())
      .then((data: BibliotecaSection[]) => {
        setSections(data);
        if (data[0]) setActiveSection(data[0].id);
      })
      .catch(() => setErro("Backend offline ou sem arquivos"));
  }, []);

  const section = sections.find((s) => s.id === activeSection);

  // group items by subsection
  const grouped = section
    ? Object.entries(
        section.items.reduce<Record<string, BibliotecaItem[]>>((acc, item) => {
          const key = item.subsection ?? "—";
          (acc[key] ??= []).push(item);
          return acc;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  const abrirArquivo = async (item: BibliotecaItem) => {
    setSelected(item);
    setContent(null);
    setLoading(true);
    try {
      if (item.type === "image") {
        setContent(FILE_URL(item.path)); // URL direta
      } else {
        const res = await fetch(FILE_URL(item.path));
        if (!res.ok) throw new Error("Não encontrado");
        setContent(await res.text());
      }
    } catch {
      setContent(null);
      setErro(`Erro ao abrir: ${item.path}`);
    } finally {
      setLoading(false);
    }
  };

  const copiar = () => {
    if (!content) return;
    navigator.clipboard?.writeText(content).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <>
      <PageHeader
        title="Biblioteca"
        subtitle="Todos os arquivos gerados pelo sistema."
      />

      {erro && <p className="text-[13px] text-red-500 mb-3">{erro}</p>}

      <div className="flex gap-4 min-h-[70vh]">
        {/* Sidebar seções */}
        <nav className="w-40 shrink-0 space-y-0.5">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => { setActiveSection(sec.id); setSelected(null); setContent(null); }}
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors flex items-center justify-between ${
                activeSection === sec.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span>{sec.label}</span>
              <span className="text-[11px] opacity-60">{sec.items.length}</span>
            </button>
          ))}
        </nav>

        {/* Lista de arquivos */}
        <Card className="w-64 shrink-0 p-0 overflow-hidden self-start">
          <div className="overflow-y-auto max-h-[75vh]">
            {grouped.map(([sub, items]) => (
              <div key={sub}>
                {sub !== "—" && (
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/20 border-b border-border sticky top-0">
                    {sub.replace(/-/g, " ")}
                  </div>
                )}
                {items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => abrirArquivo(item)}
                    className={`w-full text-left px-3 py-2.5 text-[12.5px] border-b border-border last:border-0 flex items-center gap-2 transition-colors ${
                      selected?.path === item.path
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/30 text-foreground"
                    }`}
                  >
                    {fileIcon(item.type)}
                    <span className="truncate capitalize flex-1">{item.label}</span>
                    <ChevronRight size={11} className="shrink-0 opacity-40" />
                  </button>
                ))}
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="px-3 py-4 text-[12px] text-muted-foreground">Nenhum arquivo.</p>
            )}
          </div>
        </Card>

        {/* Viewer */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {fileIcon(selected.type)}
                  <span className="font-medium text-[13px] truncate capitalize">{selected.label}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{selected.path.split("/").slice(-2).join("/")}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selected.type === "md" && content && (
                    <button onClick={copiar} className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary">
                      {copiado ? <Check size={12} /> : <Copy size={12} />}
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                  )}
                  <button onClick={() => { setSelected(null); setContent(null); }} className="text-muted-foreground hover:text-foreground">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {loading && <p className="text-[13px] text-muted-foreground">Carregando…</p>}

              {!loading && content && (
                <>
                  {selected.type === "md" && (
                    <div className="flex-1 overflow-auto max-h-[68vh] p-2">
                      <MarkdownViewer content={content} />
                    </div>
                  )}
                  {selected.type === "html" && (
                    <iframe
                      src={FILE_URL(selected.path)}
                      className="w-full flex-1 rounded-md border border-border min-h-[60vh]"
                      title={selected.label}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  )}
                  {selected.type === "image" && (
                    <div className="flex-1 flex items-start justify-center overflow-auto">
                      <img src={content} alt={selected.label} className="max-w-full rounded-md" />
                    </div>
                  )}
                </>
              )}
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground">
              Selecione um arquivo na lista.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
