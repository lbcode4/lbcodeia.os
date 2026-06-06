import { query } from "@anthropic-ai/claude-agent-sdk";
import { join } from "node:path";
import { resolveSkill } from "./skills-map.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export type SkillEvent =
  | { type: "status"; text: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; text: string }
  | { type: "data"; payload: unknown };

/** Extrai o último bloco ```json...``` de um texto. Retorna o objeto parseado ou null. */
export function extractJsonBlock(text: string): unknown | null {
  const regex = /```json\s*([\s\S]*?)```/g;
  let last: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    last = match[1].trim();
  }
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

export function buildPrompt(
  skill: string,
  cliente: string,
  input: string,
  mode: "text" | "data",
  outputContract?: unknown,
): string {
  const parts = [
    `Use a skill ${skill}.`,
    `Cliente: ${cliente}.`,
  ];
  if (input.trim()) {
    parts.push(`Briefing / contexto do usuário: ${input}`);
  }
  parts.push("Siga a skill à risca e entregue o resultado final.");
  if (mode === "data" && outputContract) {
    parts.push(
      `\nAo final, emita OBRIGATORIAMENTE um bloco \`\`\`json com o resultado estruturado seguindo este contrato:\n${JSON.stringify(outputContract, null, 2)}\nNenhum texto após o bloco JSON.`,
    );
  }
  return parts.join("\n");
}

function statusForTool(name: string, toolInput: unknown): string | null {
  if (name === "Bash") {
    const cmd = (toolInput as { command?: string })?.command ?? "";
    if (cmd.includes("criativos.py")) return "Puxando top performers…";
    return "Executando script…";
  }
  if (name === "Skill") return "Carregando a skill…";
  return null;
}

export async function* runSkill(
  skill: string,
  cliente: string,
  input: string,
): AsyncGenerator<SkillEvent> {
  const spec = resolveSkill(skill);
  const prompt = buildPrompt(spec.skillName, cliente, input, spec.mode, spec.outputContract);

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

    let accumulated = "";

    for await (const message of messages) {
      if (message.type === "assistant") {
        for (const block of message.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text.trim()) {
              accumulated += text;
              if (spec.mode === "text") yield { type: "chunk", text };
            }
          } else if (block.type === "tool_use") {
            const b = block as { type: "tool_use"; name: string; input: unknown };
            const s = statusForTool(b.name, b.input);
            if (s) yield { type: "status", text: s };
          }
        }
      } else if (message.type === "result") {
        if (spec.mode === "data") {
          const payload = extractJsonBlock(accumulated);
          if (payload !== null) {
            yield { type: "data", payload };
          } else {
            yield { type: "error", text: "Resposta sem bloco JSON estruturado" };
          }
        }
        yield { type: "done" };
        return;
      }
    }
    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}
