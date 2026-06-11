import { readdir, readFile, stat, writeFile, unlink, mkdtemp, rmdir, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { query } from "@anthropic-ai/claude-agent-sdk";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const SITES_ROOT = join(REPO_ROOT, "marketing", "sites");

export type SiteInfo = {
  id: string;
  name: string;
  updatedAt: string;
  thumbColor: string;
};

const COLORS = ["#FF6B35", "#1A8FE3", "#7A5CFF", "#15803D", "#E04C8A", "#F59E0B"];

function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

function humanName(id: string): string {
  const parts = id.split("-");
  const hasDate = /^\d{4}$/.test(parts[parts.length - 3] ?? "");
  const base = hasDate ? parts.slice(0, -3) : parts;
  return base.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (min < 60) return `há ${min} min`;
  if (hr < 24) return `há ${hr}h`;
  return `há ${days} dias`;
}

export async function listSites(): Promise<SiteInfo[]> {
  let dirs: import("node:fs").Dirent[];
  try {
    dirs = await readdir(SITES_ROOT, { withFileTypes: true });
  } catch { return []; }

  const result: SiteInfo[] = [];
  for (const d of dirs.filter((d) => d.isDirectory())) {
    const htmlPath = join(SITES_ROOT, d.name, "index.html");
    try {
      const s = await stat(htmlPath);
      result.push({
        id: d.name,
        name: humanName(d.name),
        updatedAt: relativeTime(s.mtimeMs),
        thumbColor: colorFromId(d.name),
      });
    } catch { /* sem index.html, pula */ }
  }
  return result;
}

export async function readSiteHtml(id: string): Promise<string> {
  const safe = resolve(join(SITES_ROOT, id, "index.html"));
  if (!safe.startsWith(resolve(SITES_ROOT))) throw new Error("Caminho inválido");
  return readFile(safe, "utf-8");
}

export async function writeSiteHtml(id: string, html: string): Promise<void> {
  const safe = resolve(join(SITES_ROOT, id, "index.html"));
  if (!safe.startsWith(resolve(SITES_ROOT))) throw new Error("Caminho inválido");
  await writeFile(safe, html, "utf-8");
}

export type SiteChatEvent =
  | { type: "chunk"; text: string }
  | { type: "html"; html: string }
  | { type: "done" }
  | { type: "error"; text: string };

export async function* streamSiteChat(
  html: string,
  instruction: string,
  images: { mediaType: string; data: string }[],
): AsyncGenerator<SiteChatEvent> {
  const tmpDir = await mkdtemp(join(tmpdir(), "lbsite-"));
  const htmlPath = join(tmpDir, "site.html");

  await writeFile(htmlPath, html, "utf-8");

  const imagePaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = img.mediaType.split("/")[1] ?? "png";
    const imgPath = join(tmpDir, `ref-${i}.${ext}`);
    await writeFile(imgPath, Buffer.from(img.data, "base64"));
    imagePaths.push(imgPath);
  }

  const imageContext = imagePaths.length
    ? `\nImagens de referência salvas em:\n${imagePaths.map((p) => `- ${p}`).join("\n")}\nUse a ferramenta Read para visualizá-las.`
    : "";

  const prompt = `Você é um assistente especialista em landing pages HTML. Seja conversacional e direto.

O arquivo HTML do site está em: ${htmlPath}${imageContext}

MENSAGEM DO USUÁRIO: ${instruction}

Regras:
- Se for pergunta, dúvida ou pedido de esclarecimento → responda conversacionalmente. NÃO modifique o arquivo.
- Se for instrução de mudança concreta → leia o arquivo, aplique apenas o necessário, salve em ${htmlPath}. Confirme brevemente o que fez.
- Pode ler imagens de referência com a ferramenta Read para analisá-las.
- Respostas curtas e diretas. Sem listas longas quando um parágrafo basta.`;

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
        // Verifica se o HTML foi modificado
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
    const toDelete = [htmlPath, ...imagePaths];
    await Promise.all(toDelete.map((p) => unlink(p).catch(() => {})));
    await rmdir(tmpDir).catch(() => {});
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createSite(name: string): Promise<string> {
  if (name.includes("/") || name.includes("\\") || name.includes("..")) throw new Error("Caminho inválido");
  const slug = slugify(name);
  if (!slug) throw new Error("Caminho inválido");
  const date = new Date().toISOString().slice(0, 10);
  const id = `${slug}-${date}`;
  const siteDir = resolve(join(SITES_ROOT, id));
  if (!siteDir.startsWith(resolve(SITES_ROOT))) throw new Error("Caminho inválido");
  await mkdir(siteDir, { recursive: true });
  const escapedName = escapeHtml(name);
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedName}</title>
  <style>body { font-family: sans-serif; margin: 0; padding: 40px; }</style>
</head>
<body>
  <h1>${escapedName}</h1>
  <p>Use o assistente para personalizar este site.</p>
</body>
</html>`;
  await writeFile(join(siteDir, "index.html"), html, "utf-8");
  return id;
}
