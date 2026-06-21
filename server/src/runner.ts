import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { resolveSkill } from "./skills-map.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const RESULTS_ROOT = join(REPO_ROOT, "saidas", "cache");
const MODEL = process.env.LBCODE_MODEL || "claude-sonnet-4-6";

export async function saveResult(skill: string, cliente: string, payload: unknown): Promise<void> {
  const dir = join(RESULTS_ROOT, skill);
  await mkdir(dir, { recursive: true });
  const safe = cliente.replace(/[^a-zA-Z0-9_-]/g, "_") || "default";
  await writeFile(join(dir, `${safe}.json`), JSON.stringify({ savedAt: new Date().toISOString(), payload }, null, 2), "utf-8");
}

export async function loadResult(skill: string, cliente: string): Promise<unknown | null> {
  const safe = cliente.replace(/[^a-zA-Z0-9_-]/g, "_") || "default";
  try {
    const raw = await readFile(join(RESULTS_ROOT, skill, `${safe}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

// Skills de marketing/ads/conteúdo que precisam do framework-trafego.md
const MARKETING_PREFIXES = ["lb-meta-", "lb-google-", "lb-conteudo-", "lb-ads-", "lb-venda-"];

async function loadContext(skill: string, cliente: string): Promise<string> {
  const sections: string[] = [];

  // Arquivos base — sempre carregados
  const base = ["_memoria/empresa.md", "_memoria/preferencias.md", "_memoria/estrategia.md"];
  for (const file of base) {
    try {
      const content = await readFile(join(REPO_ROOT, file), "utf-8");
      sections.push(`### ${file}\n${content.trim()}`);
    } catch { /* skip se não existir */ }
  }

  // Framework de tráfego — só para skills de marketing/ads/conteúdo/vendas
  if (MARKETING_PREFIXES.some((p) => skill.startsWith(p))) {
    try {
      const content = await readFile(join(REPO_ROOT, "_memoria/framework-trafego.md"), "utf-8");
      sections.push(`### _memoria/framework-trafego.md\n${content.trim()}`);
    } catch { /* skip */ }
  }

  // Conta do cliente — resolve de contas-ads.md (só se skill tiver um cliente real)
  if (cliente.trim()) {
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

  if (!sections.length) return "";
  return `## Contexto do projeto e do cliente\n\n${sections.join("\n\n")}\n\n---`;
}

export function buildPrompt(
  skill: string,
  cliente: string,
  input: string,
  mode: "text" | "data",
  outputContract?: unknown,
  context?: string,
): string {
  const parts: string[] = [];

  if (context) parts.push(context);

  parts.push(`Use a skill ${skill}.`);
  if (cliente.trim()) parts.push(`Cliente: ${cliente}.`);

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
  model?: string,
): AsyncGenerator<SkillEvent> {
  const spec = resolveSkill(skill);
  // Auto-detect follow-up: history marker present → context already in input, skip reload
  const isFollowUp = input.includes("[Assistente]:");
  const context = isFollowUp ? "" : await loadContext(spec.skillName, cliente);
  const prompt = buildPrompt(spec.skillName, cliente, input, spec.mode, spec.outputContract, context);

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: model ?? MODEL,
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
            saveResult(skill, cliente, payload).catch(() => {});
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
