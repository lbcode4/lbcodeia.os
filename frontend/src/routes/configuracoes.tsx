import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/app-shell";

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

type Status = "idle" | "loading" | "saving" | "saved" | "error";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [empresa, setEmpresa] = useState("");
  const [preferencias, setPreferencias] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/api/configuracoes`)
      .then((r) => r.json())
      .then((data: { empresa: string; preferencias: string }) => {
        setEmpresa(data.empresa);
        setPreferencias(data.preferencias);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Não foi possível carregar as configurações.");
      });
  }, []);

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND}/api/configuracoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa, preferencias }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Configurações do Negócio"
        subtitle="Edite as informações que a IA usa para personalizar suas respostas."
      />

      <div className="flex flex-col gap-6 max-w-3xl">
        <Card className="p-5 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            empresa.md
          </label>
          <textarea
            className="w-full bg-transparent text-sm font-mono resize-y focus:outline-none min-h-[180px]"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            spellCheck={false}
          />
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            preferencias.md
          </label>
          <textarea
            className="w-full bg-transparent text-sm font-mono resize-y focus:outline-none min-h-[120px]"
            value={preferencias}
            onChange={(e) => setPreferencias(e.target.value)}
            spellCheck={false}
          />
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? (
              <><Loader2 size={15} className="animate-spin mr-2" />Salvando...</>
            ) : (
              <><Save size={15} className="mr-2" />Salvar</>
            )}
          </Button>

          {status === "saved" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={15} />
              Salvo com sucesso!
            </span>
          )}

          {status === "error" && (
            <span className="text-sm text-destructive">{errorMsg}</span>
          )}
        </div>
      </div>
    </>
  );
}
