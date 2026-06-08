import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export type ChatEvent =
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string };

async function loadEmpresaContext(cliente?: string): Promise<string> {
  const files = [
    "_memoria/empresa.md",
    "_memoria/preferencias.md",
    "_memoria/estrategia.md",
  ];
  const sections: string[] = [];

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

function buildChatPrompt(
  history: { role: "user" | "assistant"; content: string }[],
  context: string,
): string {
  const parts: string[] = [];

  if (context) {
    parts.push(`## Contexto do negócio e do cliente\n\n${context}\n\n---`);
  }

  parts.push(
    "Você é o assistente de IA do LBCode Ads — cockpit de gestão de tráfego pago (Meta Ads + Google Ads).\n" +
    "Responda em português do Brasil, de forma clara, objetiva e prática.\n\n" +
    "## Estrutura de arquivos do projeto\n" +
    "Use as ferramentas Read, Glob e Grep para buscar informações ANTES de responder:\n" +
    "- `_memoria/` — contexto base (empresa, preferências, estratégia)\n" +
    "- `marketing/prospeccao/` — campanhas de prospecção ativas (leads CSV, dossiês, roteiros, funil)\n" +
    "- `marketing/conteudo/` — calendário editorial, reels, carrosseis, stories\n" +
    "- `marketing/campanhas/` — campanhas de tráfego pago\n" +
    "- `marketing/auditorias/` — auditorias de Meta Ads\n\n" +
    "Quando o usuário perguntar sobre prospecções, leads, conteúdo, campanhas ou qualquer dado do negócio: " +
    "USE Glob para descobrir os arquivos relevantes, depois Read para ler o conteúdo. " +
    "Nunca diga que não tem acesso aos dados — os arquivos estão no projeto.",
  );

  for (const msg of history) {
    const label = msg.role === "user" ? "[Usuário]" : "[Assistente]";
    parts.push(`${label}: ${msg.content}`);
  }

  return parts.join("\n\n");
}

export async function* runChat(
  history: { role: "user" | "assistant"; content: string }[],
  cliente?: string,
): AsyncGenerator<ChatEvent> {
  try {
    const context = await loadEmpresaContext(cliente);
    const prompt = buildChatPrompt(history, context);

    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        allowedTools: ["Read", "Glob", "Grep"],
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    for await (const message of messages) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text.trim()) yield { type: "chunk", text };
          }
        }
      } else if (message.type === "result") {
        yield { type: "done" };
        return;
      }
    }

    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}
