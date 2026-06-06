import { query } from "@anthropic-ai/claude-agent-sdk";
import { join } from "node:path";
import { resolveSkill } from "./skills-map.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string };

/** Monta a instrução que dispara a skill dentro do Claude. */
export function buildPrompt(skill: string, cliente: string, input: string): string {
  return [
    `Use a skill ${skill}.`,
    `Cliente: ${cliente}.`,
    `Briefing do usuário: ${input}`,
    `Siga a skill à risca e entregue a copy final (título, texto principal, CTA).`,
  ].join("\n");
}

/** Deriva um texto de status amigável a partir de um bloco tool_use. */
function statusForTool(name: string, toolInput: unknown): string | null {
  if (name === "Bash") {
    const cmd = (toolInput as { command?: string })?.command ?? "";
    if (cmd.includes("criativos.py")) return "Puxando top performers…";
    return "Executando script…";
  }
  if (name === "Skill") return "Carregando a skill…";
  return null;
}

/** Executa a skill e emite eventos de stream. */
export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
): AsyncGenerator<SkillEvent> {
  const spec = resolveSkill(skill); // lança se não permitida
  const prompt = buildPrompt(spec.skillName, cliente, input);

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        allowedTools: spec.allowedTools,
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    for await (const message of messages) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text.trim()) {
              yield { type: "chunk", text };
            }
          } else if (block.type === "tool_use") {
            const b = block as { type: "tool_use"; name: string; input: unknown };
            const s = statusForTool(b.name, b.input);
            if (s) yield { type: "status", text: s };
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
