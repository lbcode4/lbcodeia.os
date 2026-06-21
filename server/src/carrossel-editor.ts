import { readFile, writeFile, readdir, unlink, mkdtemp, rm } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { ChatMessage } from "./sites.js";

const execFileAsync = promisify(execFile);

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CARROSSEIS_ROOT = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel");

function isPathSafeUnder(absolutePath: string): boolean {
  const root = resolve(CARROSSEIS_ROOT) + sep;
  return absolutePath.startsWith(root);
}

function safeHtmlPath(id: string): string {
  const safe = resolve(join(CARROSSEIS_ROOT, id, "carrossel.html"));
  if (!isPathSafeUnder(safe)) throw new Error("Caminho inválido");
  return safe;
}

export async function readCarrosselHtml(id: string): Promise<string> {
  return readFile(safeHtmlPath(id), "utf-8");
}

function countSlides(html: string): number {
  return (html.match(/class="slide(["\s])/g) ?? []).length;
}

export async function writeCarrosselHtmlAndRender(id: string, html: string): Promise<{ slides: string[] }> {
  const htmlPath = safeHtmlPath(id);
  const carrosselDir = join(CARROSSEIS_ROOT, id);
  const renderPath = resolve(join(carrosselDir, "render.js"));
  if (!isPathSafeUnder(renderPath)) throw new Error("Caminho inválido");

  await writeFile(htmlPath, html, "utf-8");
  await execFileAsync("node", [renderPath], { cwd: carrosselDir, timeout: 30000 });

  const outDir = join(carrosselDir, "instagram");
  const newCount = countSlides(html);
  const beforeCleanup = await readdir(outDir);
  const stale = beforeCleanup.filter((f) => {
    const m = f.match(/^slide-(\d+)\.png$/);
    return m !== null && parseInt(m[1], 10) > newCount;
  });
  await Promise.all(stale.map((f) => unlink(join(outDir, f))));

  const afterCleanup = await readdir(outDir);
  return { slides: afterCleanup.filter((f) => /^slide-\d+\.png$/.test(f)).sort() };
}

export type CarrosselChatEvent =
  | { type: "chunk"; text: string }
  | { type: "html"; html: string }
  | { type: "done" }
  | { type: "error"; text: string };

export async function* streamCarrosselChat(
  html: string,
  instruction: string,
  history: ChatMessage[] = [],
): AsyncGenerator<CarrosselChatEvent> {
  const tmpDir = await mkdtemp(join(tmpdir(), "lbcarrossel-"));
  const htmlPath = join(tmpDir, "carrossel.html");
  await writeFile(htmlPath, html, "utf-8");

  const historyContext = history.length > 0
    ? `\n\nHISTÓRICO DA CONVERSA:\n${history.map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n")}\n`
    : "";

  const prompt = `Você é um assistente especialista em carrosséis de Instagram (HTML).

O arquivo HTML do carrossel está em: ${htmlPath}${historyContext}

MENSAGEM ATUAL DO USUÁRIO: ${instruction}

Regras:
- Cada slide é um <div class="slide ..."> de 1080x1350px. NÃO mude essas dimensões.
- Se adicionar ou remover slides, confirme ao final quantos slides o carrossel ficou.
- Pode ler identidade/design-guide.md (na raiz do projeto) se precisar de contexto de cor/fonte da marca.
- Se for pergunta ou dúvida → responda conversacionalmente, NÃO modifique o arquivo.
- Se for instrução de mudança concreta → leia o arquivo, aplique, salve em ${htmlPath}. Confirme brevemente o que fez.
- Respostas curtas e diretas.`;

  const MODEL = process.env.LBCODE_MODEL ?? "claude-sonnet-4-6";

  try {
    const messages = query({
      prompt,
      options: {
        cwd: REPO_ROOT,
        model: MODEL,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        allowedTools: ["Read", "Write", "Edit"],
        settingSources: ["project"],
        systemPrompt: { type: "preset", preset: "claude_code" },
      },
    });

    for await (const msg of messages) {
      if (msg.type === "assistant") {
        for (const block of msg.message.content) {
          if (block.type === "text") {
            const text = (block as { type: "text"; text: string }).text;
            if (text) yield { type: "chunk", text };
          }
        }
      } else if (msg.type === "result") {
        try {
          const modified = await readFile(htmlPath, "utf-8");
          if (modified !== html) yield { type: "html", html: modified };
        } catch { /* arquivo pode não existir se algo falhou */ }
        break;
      }
    }

    yield { type: "done" };
  } catch (e) {
    yield { type: "error", text: e instanceof Error ? e.message : "Erro desconhecido" };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
