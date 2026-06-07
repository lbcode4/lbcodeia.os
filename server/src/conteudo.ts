import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CONTEUDO_ROOT = join(REPO_ROOT, "marketing", "conteudo");

export type ConteudoItem = {
  id: string;
  titulo: string;
  tipo: "reels" | "stories" | "carrossel";
  data: string;
  status: string;
  capa?: string;
};

export type CalendarioItem = {
  id: string;
  titulo: string;
};

function humanTitle(id: string): string {
  const parts = id.split("-");
  const hasDate =
    parts.length >= 3 && /^\d{4}$/.test(parts[parts.length - 3] ?? "");
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

function parseStatus(content: string): string {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    const statusMatch = match[1].match(/^status:\s*(.+)$/m);
    if (statusMatch) return statusMatch[1].trim();
  }
  return "em_desenvolvimento";
}

async function listTipo(
  tipo: "reels" | "stories" | "carrossel",
  filename: string,
): Promise<ConteudoItem[]> {
  const dir = join(CONTEUDO_ROOT, tipo);
  let dirs: import("node:fs").Dirent[];
  try {
    dirs = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const result: ConteudoItem[] = [];
  for (const d of dirs.filter((d) => d.isDirectory())) {
    const mdPath = join(dir, d.name, filename);
    try {
      const s = await stat(mdPath);
      const content = await readFile(mdPath, "utf-8");
      const status = parseStatus(content);
      
      let capa: string | undefined;
      if (tipo === "carrossel") {
        try {
          const files = await readdir(join(dir, d.name, "instagram"));
          const slides = files.filter((f) => [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase())).sort();
          if (slides.length > 0) capa = slides[0];
        } catch {}
      }

      result.push({ id: d.name, titulo: humanTitle(d.name), tipo, data: relativeTime(s.mtimeMs), status, capa });
    } catch { /* sem arquivo */ }
  }
  return result;
}

async function listCalendario(): Promise<CalendarioItem[]> {
  const dir = join(CONTEUDO_ROOT, "calendario");
  let mesDirs: import("node:fs").Dirent[];
  try {
    mesDirs = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const result: CalendarioItem[] = [];
  for (const d of mesDirs.filter((d) => d.isDirectory())) {
    try {
      await stat(join(dir, d.name, "calendario.md"));
      const [ano, mes] = d.name.split("-");
      const titulo = `${MESES[(parseInt(mes) - 1)] ?? mes} ${ano}`;
      result.push({ id: d.name, titulo });
    } catch { /* skip */ }
  }
  return result;
}

export async function listConteudo() {
  const [reels, stories, carrosseis, calendario] = await Promise.all([
    listTipo("reels", "roteiro.md"),
    listTipo("stories", "sequencia.md"),
    listTipo("carrossel", "legenda.md"),
    listCalendario(),
  ]);
  return { reels, stories, carrosseis, calendario };
}

export async function readConteudoArquivo(
  tipo: string,
  id: string,
  arquivo: string,
): Promise<string> {
  const allowed = ["reels", "stories", "calendario", "carrossel"];
  if (!allowed.includes(tipo)) throw new Error("Tipo inválido");
  const safe = resolve(join(CONTEUDO_ROOT, tipo, id, arquivo));
  if (!safe.startsWith(resolve(CONTEUDO_ROOT))) throw new Error("Caminho inválido");
  return readFile(safe, "utf-8");
}

export async function updateConteudoStatus(
  tipo: string,
  id: string,
  arquivo: string,
  novoStatus: string
): Promise<void> {
  const allowed = ["reels", "stories", "calendario", "carrossel"];
  if (!allowed.includes(tipo)) throw new Error("Tipo inválido");
  const safe = resolve(join(CONTEUDO_ROOT, tipo, id, arquivo));
  if (!safe.startsWith(resolve(CONTEUDO_ROOT))) throw new Error("Caminho inválido");

  let content = await readFile(safe, "utf-8");

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    let frontmatter = match[1];
    if (/^status:/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^status:.*$/m, `status: ${novoStatus}`);
    } else {
      frontmatter += `\nstatus: ${novoStatus}`;
    }
    content = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${frontmatter}\n---`);
  } else {
    content = `---\nstatus: ${novoStatus}\n---\n\n${content}`;
  }

  await writeFile(safe, content, "utf-8");
}
