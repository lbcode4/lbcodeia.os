import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import {
  Copy,
  Check,
  ChevronRight,
  X,
  FileText,
  FileCode,
  Image,
  Rocket,
  Loader2,
  ClipboardCopy,
} from "lucide-react";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { useCliente } from "@/lib/cliente-context";

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

type CampanhaMeta = {
  subsection: string;
  path: string;
  tipo: string;
  publicavel: boolean;
  criativos: { "1x1": string; "9x16": string } | null;
  publicado: { em: string; campaign_id: string; adset_id: string; ad_ids: string[] } | null;
};

function fmtData(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

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
  const { contas, cliente } = useCliente();
  const [sections, setSections] = useState<BibliotecaSection[]>([]);
  const [campanhasMeta, setCampanhasMeta] = useState<CampanhaMeta[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [selected, setSelected] = useState<BibliotecaItem | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [publishModal, setPublishModal] = useState<CampanhaMeta | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/biblioteca`)
      .then((r) => r.json())
      .then((data: BibliotecaSection[]) => {
        setSections(data);
        if (data[0]) setActiveSection(data[0].id);
      })
      .catch(() => setErro("Backend offline ou sem arquivos"));

    fetch(`${BACKEND}/api/biblioteca/campanhas-meta`)
      .then((r) => r.json())
      .then((data: CampanhaMeta[]) => setCampanhasMeta(data))
      .catch(() => {});
  }, []);

  const confirmarPublicar = async () => {
    if (!publishModal) return;
    setPublishing(true);
    setErro("");
    try {
      const res = await fetch(`${BACKEND}/api/biblioteca/campanhas/publicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: publishModal.path, cliente }),
      });
      const body = (await res.json()) as {
        error?: string;
        campaign_id?: string;
        adset_id?: string;
        ad_ids?: string[];
        sem_criativos?: boolean;
      };
      if (!res.ok) throw new Error(body.error ?? `Erro ${res.status}`);

      setCampanhasMeta((prev) =>
        prev.map((m) =>
          m.subsection === publishModal.subsection
            ? {
                ...m,
                publicado: {
                  em: new Date().toISOString(),
                  campaign_id: body.campaign_id!,
                  adset_id: body.adset_id!,
                  ad_ids: body.ad_ids ?? [],
                },
              }
            : m,
        ),
      );
      setPublishMsg(
        body.sem_criativos
          ? "Campanha e conjunto criados (pausados). Sem criativos ainda — gere as imagens e publique os anúncios depois."
          : `Campanha, conjunto e ${body.ad_ids?.length ?? 0} anúncio(s) criados — todos pausados.`,
      );
      setPublishModal(null);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const gerarImagens = (meta: CampanhaMeta) => {
    const comando = `Gerar criativo de anúncio (não carrossel) pra campanha em ${meta.path}, seguindo o Passo 7b de /lb-meta-campanha-whatsapp: leia campanha.json dessa pasta (campo textos[0] = copy aprovado), use o título de textos[0] como headline (<h1>) — não inventar headline novo. Gere só 2 imagens, no estilo de /lb-conteudo-carrossel (identidade/design-guide.md + referências): ad001-1x1.png (1080x1080) e ad001-9x16.png (1080x1920). Salvar em ${meta.path}/criativos/. Depois atualizar campanha.json preenchendo o campo criativos com esses 2 caminhos relativos.`;
    navigator.clipboard?.writeText(comando).catch(() => {});
    setPublishMsg("Comando copiado — cole no Claude Code pra gerar os criativos 1:1 + 9:16.");
  };

  useEffect(() => {
    if (!publishMsg) return;
    const t = setTimeout(() => setPublishMsg(""), 5000);
    return () => clearTimeout(t);
  }, [publishMsg]);

  const section = sections.find((s) => s.id === activeSection);

  // Extrai a data (YYYY-MM-DD) no final do nome da pasta, se houver.
  const dataDoNome = (sub: string) => sub.match(/(\d{4}-\d{2}-\d{2})$/)?.[1] ?? "";

  // group items by subsection
  const grouped = section
    ? Object.entries(
        section.items.reduce<Record<string, BibliotecaItem[]>>((acc, item) => {
          const key = item.subsection ?? "—";
          (acc[key] ??= []).push(item);
          return acc;
        }, {}),
      ).sort(([a], [b]) => {
        if (activeSection === "campanhas") {
          const dataCmp = dataDoNome(b).localeCompare(dataDoNome(a));
          return dataCmp !== 0 ? dataCmp : b.localeCompare(a);
        }
        return a.localeCompare(b);
      })
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
      <PageHeader title="Biblioteca" subtitle="Todos os arquivos gerados pelo sistema." />

      {erro && <p className="text-[13px] text-red-500 mb-3">{erro}</p>}
      {publishMsg && <p className="text-[13px] text-[color:var(--success)] mb-3">{publishMsg}</p>}

      <div className="flex gap-4 min-h-[70vh]">
        {/* Sidebar seções */}
        <nav className="w-40 shrink-0 space-y-0.5">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                setSelected(null);
                setContent(null);
              }}
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
            {grouped.map(([sub, items]) => {
              const meta =
                activeSection === "campanhas"
                  ? campanhasMeta.find((m) => m.subsection === sub)
                  : undefined;
              return (
                <div key={sub}>
                  {sub !== "—" && (
                    <div className="px-3 py-1.5 bg-muted/20 border-b border-border sticky top-0">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                        {sub.replace(/-/g, " ")}
                      </div>
                      {meta && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {meta.publicado ? (
                            <Link
                              to="/gerenciar-anuncios"
                              className="text-[11px] text-[color:var(--success)] hover:underline flex items-center gap-1"
                            >
                              Publicado em {fmtData(meta.publicado.em)} →
                            </Link>
                          ) : meta.publicavel ? (
                            <>
                              <button
                                onClick={() => setPublishModal(meta)}
                                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                              >
                                <Rocket size={11} /> Publicar no Meta Ads
                              </button>
                              {!meta.criativos && (
                                <button
                                  onClick={() => gerarImagens(meta)}
                                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                                >
                                  <ClipboardCopy size={11} /> Gerar imagens
                                </button>
                              )}
                            </>
                          ) : (
                            <span
                              className="text-[11px] text-muted-foreground/60"
                              title="Esse tipo de campanha ainda não suporta publicação automática"
                            >
                              Publicação automática indisponível pra esse tipo
                            </span>
                          )}
                        </div>
                      )}
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
              );
            })}
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
                  <span className="font-medium text-[13px] truncate capitalize">
                    {selected.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {selected.path.split("/").slice(-2).join("/")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selected.type === "md" && content && (
                    <button
                      onClick={copiar}
                      className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary"
                    >
                      {copiado ? <Check size={12} /> : <Copy size={12} />}
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelected(null);
                      setContent(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
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

      {publishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !publishing && setPublishModal(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="max-w-md w-full">
              <h3 className="font-semibold text-[16px] mb-2">Publicar no Meta Ads?</h3>
              <p className="text-[13px] text-muted-foreground mb-2">
                <span className="font-medium text-foreground">'{publishModal.subsection}'</span> vai
                ser criada (pausada) na conta de{" "}
                <span className="font-medium text-foreground">{cliente || contas[0]?.cliente}</span>
                .
              </p>
              {!publishModal.criativos && (
                <p className="text-[12px] text-amber-600 mb-4">
                  Sem criativos ainda — cria só campanha + conjunto, sem anúncios. Gere as imagens e
                  publique os anúncios depois.
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setPublishModal(null)}
                  disabled={publishing}
                >
                  Cancelar
                </Button>
                <Button onClick={confirmarPublicar} disabled={publishing}>
                  {publishing ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
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
