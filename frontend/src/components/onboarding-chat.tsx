import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Profile = {
  nome: string;
  setor: string;
  produto: string;
  publico: string;
  diferencial: string;
  tom: string;
  objetivo: string;
};

type Field = keyof Profile;
type Phase = "chat" | "review" | "saving" | "done";

const STEPS: { question: string; example: string; field: Field }[] = [
  {
    question: "Qual o nome e setor do seu negócio?",
    example: "ex: Clínica Sorriso Pleno / Odontologia",
    field: "nome",
  },
  {
    question: "O que você vende? Descreva seu principal produto ou serviço.",
    example: "ex: Clareamento dental, ortodontia e implantes",
    field: "produto",
  },
  {
    question: "Para quem você vende? Descreva seu cliente ideal.",
    example: "ex: Mulheres 28-45, classe B/C, Belém-PA, querem sorriso bonito",
    field: "publico",
  },
  {
    question: "Por que o cliente escolhe você e não o concorrente?",
    example: "ex: Atendimento no mesmo dia, parcelamento em 18x, sem espera",
    field: "diferencial",
  },
  {
    question: "Como quer ser percebido? Descreva o tom da sua marca.",
    example: "ex: Profissional mas acolhedor, linguagem simples, sem termos técnicos",
    field: "tom",
  },
  {
    question: "Qual seu principal objetivo com tráfego pago?",
    example: "ex: Gerar leads para WhatsApp e agendar consultas",
    field: "objetivo",
  },
];

const LABELS: Record<Field, string> = {
  nome: "Nome do negócio",
  setor: "Setor",
  produto: "Produto / Serviço",
  publico: "Público-alvo",
  diferencial: "Diferencial",
  tom: "Tom de voz",
  objetivo: "Objetivo com tráfego pago",
};

export function OnboardingChat() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("chat");
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: STEPS[0].question },
  ]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function parseNomeSetor(answer: string): Pick<Profile, "nome" | "setor"> {
    const parts = answer.split("/").map((s) => s.trim());
    return { nome: parts[0] ?? answer, setor: parts[1] ?? "" };
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const currentStep = STEPS[step];
    let update: Partial<Profile> = { [currentStep.field]: trimmed };

    // Step 0 parses "Nome / Setor" into two fields
    if (step === 0) {
      update = parseNomeSetor(trimmed);
    }

    const nextProfile = { ...profile, ...update };
    setProfile(nextProfile);

    const nextStep = step + 1;
    const nextHistory = [...history, { role: "user" as const, text: trimmed }];

    if (nextStep < STEPS.length) {
      setHistory([...nextHistory, { role: "ai", text: STEPS[nextStep].question }]);
      setStep(nextStep);
    } else {
      setHistory([...nextHistory, { role: "ai", text: "Ótimo! Revise suas respostas abaixo antes de salvar." }]);
      setPhase("review");
    }

    setInput("");
  }

  async function handleSave() {
    setPhase("saving");
    setSaveError(null);
    try {
      const res = await fetch(`${BACKEND}/api/onboarding/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setPhase("done");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro desconhecido");
      setPhase("review");
    }
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <p className="text-lg font-medium">Tudo pronto! Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-8 px-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Conta-me sobre o seu negócio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vou fazer {STEPS.length} perguntas rápidas pra personalizar o sistema pra você.
        </p>
      </div>

      {/* Progress bar */}
      {phase === "chat" && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{step} / {STEPS.length}</span>
        </div>
      )}

      {/* Chat history */}
      {phase === "chat" && (
        <>
          <div ref={scrollRef} className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                  {msg.role === "ai" && i === history.length - 1 && step < STEPS.length && (
                    <p className="text-xs text-muted-foreground mt-1">{STEPS[step].example}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Sua resposta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              autoFocus
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </>
      )}

      {/* Review phase */}
      {(phase === "review" || phase === "saving") && (
        <>
          <p className="text-sm text-muted-foreground">Revise suas respostas antes de salvar. Edite o que precisar.</p>
          <div className="flex flex-col gap-3">
            {(Object.keys(LABELS) as Field[])
              .filter((f) => f !== "setor")
              .map((field) => (
                <Card key={field} className="p-4 flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {LABELS[field]}
                  </label>
                  <textarea
                    className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[40px]"
                    value={(profile[field] as string) ?? ""}
                    rows={2}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                </Card>
              ))}
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <Button onClick={handleSave} disabled={phase === "saving"} className="w-full">
            {phase === "saving" ? (
              <><Loader2 size={16} className="animate-spin mr-2" /> Salvando...</>
            ) : (
              "Confirmar e Salvar"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
