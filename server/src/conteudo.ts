import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CONTEUDO_ROOT = join(REPO_ROOT, "marketing", "conteudo");

export type ConteudoItem = {
  id: string;
  titulo: string;
  tipo: "reels" | "stories";
  data: string;
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

async function listTipo(
  tipo: "reels" | "stories",
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
      result.push({ id: d.name, titulo: humanTitle(d.name), tipo, data: relativeTime(s.mtimeMs) });
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
  const [reels, stories, calendario] = await Promise.all([
    listTipo("reels", "roteiro.md"),
    listTipo("stories", "sequencia.md"),
    listCalendario(),
  ]);
  return { reels, stories, calendario };
}

export async function readConteudoArquivo(
  tipo: string,
  id: string,
  arquivo: string,
): Promise<string> {
  const allowed = ["reels", "stories", "calendario"];
  if (!allowed.includes(tipo)) throw new Error("Tipo inválido");
  const safe = resolve(join(CONTEUDO_ROOT, tipo, id, arquivo));
  if (!safe.startsWith(resolve(CONTEUDO_ROOT))) throw new Error("Caminho inválido");
  return readFile(safe, "utf-8");
}
