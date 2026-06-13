export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown };

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";

export type Conta = {
  cliente: string;
  metaAdAccount: string;
  handleIg: string;
  ativo: boolean;
};

export async function fetchLastResult<T>(skill: string, cliente: string): Promise<{ savedAt: string; payload: T } | null> {
  try {
    const res = await fetch(`${BACKEND}/api/results/${encodeURIComponent(skill)}?cliente=${encodeURIComponent(cliente)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchContas(): Promise<Conta[]> {
  const res = await fetch(`${BACKEND}/api/contas`);
  if (!res.ok) throw new Error("Falha ao carregar contas");
  return res.json();
}

/** Abre o stream SSE e chama onEvent para cada evento da skill. */
export async function runSkill(
  body: { skill: string; cliente: string; input: string; model?: string },
  onEvent: (ev: SkillEvent) => void,
): Promise<void> {
  const res = await fetch(`${BACKEND}/api/skills/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    onEvent({ type: "error", text: msg || `HTTP ${res.status}` });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE: eventos separados por linha em branco; usamos só a linha "data:".
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      try {
        onEvent(JSON.parse(dataLine.slice(5).trim()) as SkillEvent);
      } catch {
        // ignora frames malformados
      }
    }
  }

  // Finaliza o decoder e processa um eventual frame final sem "\n\n" de término.
  buffer += decoder.decode();
  if (buffer.trim()) {
    const dataLine = buffer.split("\n").find((l) => l.startsWith("data:"));
    if (dataLine) {
      try {
        onEvent(JSON.parse(dataLine.slice(5).trim()) as SkillEvent);
      } catch {
        // ignora frame malformado
      }
    }
  }
}
