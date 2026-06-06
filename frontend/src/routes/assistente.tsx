import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Loader2, Trash2 } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/app-shell";

export const Route = createFileRoute("/assistente")({
  component: AssistentePage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Analise minhas campanhas de Meta Ads e sugira o que pausar.",
  "Gere 3 variações de copy para um anúncio de e-commerce de moda.",
  "Quais métricas devo monitorar diariamente no Google Ads?",
  "Sugira palavras-chave negativas para campanha de search de SaaS.",
];

function AssistentePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({ error: "Falha ao iniciar conversa" }));
        throw new Error(data.error || "Falha ao iniciar conversa");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: rDone } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistant += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && m.role === "assistant" && m.content === "")));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Assistente IA"
        subtitle="Converse com a IA do LBCode Ads — análises, copy, dúvidas técnicas."
        actions={
          messages.length > 0 ? (
            <Button variant="secondary" onClick={() => { setMessages([]); setError(null); }}>
              <Trash2 size={16} /> Limpar
            </Button>
          ) : undefined
        }
      />

      <Card className="p-0 overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="text-primary" size={22} />
              </div>
              <h2 className="text-lg font-semibold">Como posso ajudar?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Peça análises, copy ou tire dúvidas sobre suas campanhas.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-6 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-[13px] p-3 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === "user" ? "bg-accent" : "bg-primary text-primary-foreground"
              }`}>
                {m.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {m.content || (isLoading && i === messages.length - 1 ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : null)}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-border p-4 flex gap-2 bg-card"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Envie uma mensagem... (Shift+Enter para nova linha)"
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-40"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="!px-4 !py-2">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </Button>
        </form>
      </Card>
    </>
  );
}
