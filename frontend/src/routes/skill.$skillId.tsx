import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader, Card, Button } from "@/components/app-shell";
import { runSkill, fetchContas, type Conta, type SkillEvent } from "@/lib/skill-client";
import { findSkillById } from "@/lib/skills";
import { Sparkles, Loader2, Copy, Check, RotateCcw, Send, User, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type CarrosselMeta = { id: string; titulo: string; slides: string[]; legenda: string };

function slideUrl(id: string, slide: string) {
  return `${BACKEND}/api/carrosseis/slide?id=${encodeURIComponent(id)}&slide=${encodeURIComponent(slide)}`;
}

const RETINA_OPTIONS = [
  { id: "R", label: "Relacionamento", desc: "Bastidores, propósito, conexão humana" },
  { id: "E", label: "Engajamento", desc: "Meme, curiosidade, trend" },
  { id: "T", label: "Transformação", desc: "Antes/depois, case de cliente" },
  { id: "I", label: "Interação", desc: "Enquete, convida resposta" },
  { id: "N", label: "Níveis de consciência", desc: "Venda direta, depoimento, prova social" },
  { id: "A", label: "Autoridade", desc: "Dados, processo, prêmio, bastidores técnicos" },
];

const TIPO_OPTIONS = [
  { id: "1", label: "Texto puro", desc: "Educacional, dicas, listas" },
  { id: "2", label: "Com foto IA", desc: "Aspiracional, capa com personagem" },
  { id: "3", label: "Post único", desc: "Frase de impacto, dado, depoimento" },
];

async function fetchCarrosseis(): Promise<CarrosselMeta[]> {
  const r = await fetch(`${BACKEND}/api/carrosseis`);
  if (!r.ok) throw new Error("Falha");
  return r.json();
}

async function fetchNovoCarrossel(existingIds: Set<string>): Promise<CarrosselMeta | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((res) => setTimeout(res, 2000));
    try {
      const list = await fetchCarrosseis();
      const novo = list.find((c) => !existingIds.has(c.id)) ?? list[list.length - 1];
      if (novo && novo.slides.length > 0) return novo;
    } catch { /* retry */ }
  }
  return null;
}

export const Route = createFileRoute("/skill/$skillId")({
  component: SkillPanel,
});

type Turn = { role: "user" | "assistant"; text: string };

function SkillPanel() {
  const { skillId } = Route.useParams();
  const meta = findSkillById(skillId);
  const isCarrossel = skillId === "lb-conteudo-carrossel";

  const [contas, setContas] = useState<Conta[]>([]);
  const [cliente, setCliente] = useState("");
  const [briefing, setBriefing] = useState("");
  const [retinaType, setRetinaType] = useState("");
  const [tipoConteudo, setTipoConteudo] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [status, setStatus] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [running, setRunning] = useState(false);
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);
  const [carrosselResult, setCarrosselResult] = useState<CarrosselMeta | null>(null);
  const [carrosselSlideIdx, setCarrosselSlideIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContas()
      .then((cs) => { setContas(cs); if (cs[0]) setCliente(cs[0].cliente); })
      .catch(() => setErro("Backend offline?"));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, status]);

  const hasTurns = turns.length > 0;

  function buildInput(userText: string): string {
    if (!hasTurns) return userText;
    const history = turns
      .map((t) => (t.role === "user" ? `[Usuário]: ${t.text}` : `[Assistente]: ${t.text}`))
      .join("\n\n");
    return `${history}\n\n[Usuário]: ${userText}`;
  }

  const executar = async (inputText: string) => {
    setRunning(true);
    setStatus("Iniciando…");
    setErro("");
    setCarrosselResult(null);
    setCarrosselSlideIdx(0);

    let existingIds = new Set<string>();
    if (isCarrossel) {
      try {
        const list = await fetchCarrosseis();
        existingIds = new Set(list.map((c) => c.id));
      } catch { /* ignore */ }
    }

    setTurns((t) => [...t, { role: "user", text: inputText }]);
    setTurns((t) => [...t, { role: "assistant", text: "" }]);

    const appendChunk = (chunk: string) =>
      setTurns((t) => {
        const copy = [...t];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: copy[copy.length - 1].text + chunk };
        return copy;
      });

    try {
      await runSkill({ skill: skillId, cliente, input: buildInput(inputText) }, (ev: SkillEvent) => {
        if (ev.type === "status") setStatus(ev.text);
        else if (ev.type === "chunk") appendChunk(ev.text);
        else if (ev.type === "error") setErro(ev.text);
        else if (ev.type === "done") setStatus("");
      });

      if (isCarrossel) {
        setStatus("Carregando imagens…");
        const novo = await fetchNovoCarrossel(existingIds);
        setStatus("");
        if (novo) setCarrosselResult(novo);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao executar");
      setStatus("");
    } finally {
      setRunning(false);
    }
  };

  const iniciar = () => {
    if (!cliente || running) return;
    const parts: string[] = [];
    if (isCarrossel && retinaType) {
      const opt = RETINA_OPTIONS.find((o) => o.id === retinaType);
      parts.push(`Tipo RETINA: ${retinaType} — ${opt?.label}`);
    }
    if (isCarrossel && tipoConteudo) {
      const opt = TIPO_OPTIONS.find((o) => o.id === tipoConteudo);
      parts.push(`Tipo de conteúdo: ${tipoConteudo} — ${opt?.label}`);
    }
    if (briefing.trim()) parts.push(briefing.trim());
    executar(parts.join("\n") || "(sem briefing)");
  };

  const continuar = () => {
    const t = followUp.trim();
    if (!t || running) return;
    setFollowUp("");
    executar(t);
  };

  const reset = () => {
    setTurns([]);
    setBriefing("");
    setFollowUp("");
    setStatus("");
    setErro("");
    setCarrosselResult(null);
    setCarrosselSlideIdx(0);
  };

  const copiarTudo = () => {
    const txt = turns
      .filter((t) => t.role === "assistant")
      .map((t) => t.text)
      .join("\n\n---\n\n");
    navigator.clipboard?.writeText(txt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lastAssistant = [...turns].reverse().find((t) => t.role === "assistant")?.text ?? "";

  return (
    <>
      <PageHeader
        title={meta?.name ?? skillId}
        subtitle={meta?.description ?? "Execute esta skill com IA"}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Config */}
        <Card className="lg:col-span-2 space-y-4 self-start">
          <div>
            <label className="text-[12px] uppercase tracking-wide text-muted-foreground">Cliente</label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              disabled={hasTurns}
              className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] disabled:opacity-60"
            >
              {contas.map((c) => (
                <option key={c.cliente} value={c.cliente}>{c.cliente}</option>
              ))}
            </select>
          </div>

          {!hasTurns ? (
            <>
              {/* Seletores RETINA — só para lb-conteudo-carrossel */}
              {isCarrossel && (
                <>
                  <div>
                    <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                      Tipo RETINA
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {RETINA_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setRetinaType((v) => (v === opt.id ? "" : opt.id))}
                          title={opt.desc}
                          className={`flex flex-col items-start px-2 py-1.5 rounded-md border text-left transition-colors ${
                            retinaType === opt.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <span className="font-bold text-[13px]">{opt.id}</span>
                          <span className="text-[10px] leading-tight mt-0.5 truncate w-full">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    {retinaType && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {RETINA_OPTIONS.find((o) => o.id === retinaType)?.desc}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                      Tipo de conteúdo
                    </label>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {TIPO_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setTipoConteudo((v) => (v === opt.id ? "" : opt.id))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left transition-colors ${
                            tipoConteudo === opt.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <span className="font-bold text-[12px] w-4">{opt.id}</span>
                          <div>
                            <p className="text-[12px] font-medium leading-tight">{opt.label}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                  {isCarrossel ? "Tema / briefing" : "Briefing (opcional)"}
                </label>
                <textarea
                  value={briefing}
                  onChange={(e) => setBriefing(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) iniciar(); }}
                  rows={isCarrossel ? 3 : 5}
                  placeholder={
                    isCarrossel
                      ? "Ex: dicas de agendamento, antes/depois de cliente, benefícios do produto…"
                      : "Contexto adicional para a skill…"
                  }
                  className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
                />
              </div>
              <Button onClick={iniciar} disabled={running || !cliente}>
                {running ? (
                  <><Loader2 size={14} className="animate-spin" /> Executando…</>
                ) : (
                  "Executar"
                )}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-[12px] uppercase tracking-wide text-muted-foreground">
                  Resposta / Continuação
                </label>
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); continuar(); }
                  }}
                  rows={4}
                  placeholder="Responda às perguntas ou dê mais instruções… (Enter envia)"
                  disabled={running}
                  className="mt-1 w-full bg-muted/40 border border-border rounded-md px-3 py-2 text-[14px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={continuar} disabled={running || !followUp.trim()} className="flex-1">
                  {running ? (
                    <><Loader2 size={14} className="animate-spin" /> Processando…</>
                  ) : (
                    <><Send size={13} /> Enviar</>
                  )}
                </Button>
                <button
                  onClick={reset}
                  title="Nova execução"
                  className="px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </>
          )}

          {erro && <p className="text-[13px] text-red-500">{erro}</p>}
        </Card>

        {/* Conversation */}
        <Card className="lg:col-span-3 flex flex-col min-h-[400px] max-h-[80vh]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Resultado
            </h3>
            {lastAssistant && (
              <button
                onClick={copiarTudo}
                className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {turns.length === 0 && !status && (
              <p className="text-[13px] text-muted-foreground">Escolha o cliente e clique em Executar.</p>
            )}

            {turns.map((turn, i) => (
              <div key={i} className={`flex gap-2 ${turn.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    turn.role === "user"
                      ? "bg-accent"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {turn.role === "user" ? <User size={11} /> : <Sparkles size={11} />}
                </div>
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    turn.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {turn.text ||
                    (running && i === turns.length - 1 ? (
                      <span className="opacity-50">…</span>
                    ) : (
                      ""
                    ))}
                </div>
              </div>
            ))}

            {status && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Loader2 size={12} className="animate-spin" /> {status}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Preview do carrossel gerado */}
      {carrosselResult && (
        <Card className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[13px] capitalize">
              Carrossel criado: {carrosselResult.titulo}
            </h3>
            <a
              href="/conteudo"
              className="flex items-center gap-1 text-[12px] text-primary hover:underline"
            >
              Ver todos <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Slide principal */}
            <div className="relative w-full sm:w-64 aspect-square rounded-lg overflow-hidden bg-muted/20 border border-border shrink-0">
              <img
                src={slideUrl(carrosselResult.id, carrosselResult.slides[carrosselSlideIdx])}
                alt={`Slide ${carrosselSlideIdx + 1}`}
                className="w-full h-full object-contain"
              />
              {carrosselResult.slides.length > 1 && (
                <>
                  <button
                    onClick={() => setCarrosselSlideIdx((i) => Math.max(0, i - 1))}
                    disabled={carrosselSlideIdx === 0}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    onClick={() => setCarrosselSlideIdx((i) => Math.min(carrosselResult.slides.length - 1, i + 1))}
                    disabled={carrosselSlideIdx === carrosselResult.slides.length - 1}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight size={13} />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-64 pb-1">
              {carrosselResult.slides.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setCarrosselSlideIdx(i)}
                  className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                    i === carrosselSlideIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={slideUrl(carrosselResult.id, s)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-2">
            {carrosselSlideIdx + 1} / {carrosselResult.slides.length} slides
          </p>
        </Card>
      )}
    </>
  );
}
