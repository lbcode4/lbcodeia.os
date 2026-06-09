import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export type ChatEvent =
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string };

async function loadSystemPrompt(cliente?: string): Promise<string> {
  const files = [
    "_memoria/empresa.md",
    "_memoria/preferencias.md",
    "_memoria/estrategia.md",
  ];
  const sections: string[] = [
    "Você é o assistente de IA do LBCode Ads — cockpit de gestão de tráfego pago (Meta Ads + Google Ads).\n" +
    "Responda em português do Brasil, de forma clara, objetiva e prática.\n" +
    "Quando o usuário pedir análise de campanhas, sugira ações concretas (pausar, escalar, ajustar criativos, públicos, lances).\n" +
    "Quando pedir copy/criativos, entregue variações prontas. Use markdown leve quando ajudar.",
  ];

  for (const file of files) {
    try {
      const content = await readFile(join(REPO_ROOT, file), "utf-8");
      sections.push(`### ${file}\n${content.trim()}`);
    } catch { /* skip */ }
  }

  if (cliente) {
    try {
      const contas = await readFile(join(REPO_ROOT, "_memoria/contas-ads.md"), "utf-8");
      const row = contas.split("\n").find((l) =>
        l.toLowerCase().includes(cliente.toLowerCase()) && l.includes("|"),
      );
      if (row) {
        const [, , metaAcc, igUserId, handle, googleId] = row.split("|").map((s) => s.trim());
        sections.push(
          `### Conta de Anúncios — ${cliente}\nMeta Ad Account: ${metaAcc ?? "—"}\nIG User ID: ${igUserId ?? "—"}\nHandle IG: ${handle ?? "—"}\nGoogle Ads ID: ${googleId ?? "—"}`,
        );
      }
    } catch { /* skip */ }
  }

  return sections.join("\n\n");
}

export async function* runChat(
  history: { role: "user" | "assistant"; content: string }[],
  cliente?: string,
): AsyncGenerator<ChatEvent> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      yield { type: "error", text: "ANTHROPIC_API_KEY não configurada" };
      return;
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = await loadSystemPrompt(cliente);

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "chunk", text: event.delta.text };
      }
    }

    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}
