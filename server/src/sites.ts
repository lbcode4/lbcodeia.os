import { readdir, readFile, stat, writeFile, unlink, mkdtemp, rmdir } from "node:fs/promises";
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

export async function editSiteHtml(
  html: string,
  instruction: string,
  images: { mediaType: string; data: string }[],
): Promise<string> {
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
    ? `\nImagens de referência salvas em:\n${imagePaths.map((p) => `- ${p}`).join("\n")}\nUse a ferramenta Read para visualizá-las antes de editar.`
    : "";

  const prompt = `Você é um editor de HTML especialista em landing pages.

O arquivo HTML está em: ${htmlPath}${imageContext}

INSTRUÇÃO: ${instruction}

1. Leia o arquivo HTML em ${htmlPath}
${imagePaths.length ? "2. Leia as imagens de referência para entender o estilo/conteúdo desejado\n3. " : "2. "}Aplique a instrução modificando apenas o necessário — preservando o restante do HTML
${imagePaths.length ? "4. " : "3. "}Salve o HTML modificado de volta em ${htmlPath}

Salve apenas HTML válido e completo. Nenhum texto fora do HTML.`;

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
      if (msg.type === "result") break;
    }

    const modified = await readFile(htmlPath, "utf-8");
    return modified;
  } finally {
    const toDelete = [htmlPath, ...imagePaths];
    await Promise.all(toDelete.map((p) => unlink(p).catch(() => {})));
    await rmdir(tmpDir).catch(() => {});
  }
}
