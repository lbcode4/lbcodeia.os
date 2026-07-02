import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, extname, sep } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CARROSSEIS_ROOT = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel");

export type CarrosselMeta = {
  id: string;
  slides: string[]; // filenames inside instagram/
  legenda: string;
  titulo: string;
  inspiracoes: number;
};

function labelFromId(id: string): string {
  const parts = id.split("-");
  const dateParts = parts.slice(-3);
  const isDate = dateParts.every((p, i) => i === 0 ? p.length === 4 : p.length === 2);
  if (isDate) return parts.slice(0, -3).join(" ");
  return id.replace(/-/g, " ");
}

export async function listCarrosseis(): Promise<CarrosselMeta[]> {
  let dirs: import("node:fs").Dirent[];
  try {
    dirs = await readdir(CARROSSEIS_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  const result: CarrosselMeta[] = [];
  for (const d of dirs.filter((d) => d.isDirectory())) {
    const campDir = join(CARROSSEIS_ROOT, d.name);
    const instagramDir = join(campDir, "instagram");

    let slides: string[] = [];
    try {
      const files = await readdir(instagramDir);
      slides = files
        .filter((f) => [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase()))
        .sort();
    } catch { /* sem pasta instagram */ }

    let legenda = "";
    try {
      legenda = await readFile(join(campDir, "legenda.md"), "utf-8");
    } catch { /* sem legenda */ }

    let inspiracoes = 0;
    try {
      const inspiFiles = await readdir(join(campDir, "inspiracoes"));
      inspiracoes = inspiFiles.filter((f) =>
        [".png", ".jpg", ".jpeg", ".webp"].includes(extname(f).toLowerCase())
      ).length;
    } catch { /* sem pasta */ }

    result.push({ id: d.name, slides, legenda, titulo: labelFromId(d.name), inspiracoes });
  }
  return result;
}

export async function readSlide(carrosselId: string, filename: string): Promise<Buffer> {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "instagram", filename));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  return readFile(safe) as Promise<Buffer>;
}

export async function readLegenda(carrosselId: string): Promise<string> {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "legenda.md"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT) + sep)) throw new Error("Caminho inválido");
  try {
    return await readFile(safe, "utf-8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw e;
  }
}

export async function writeLegenda(carrosselId: string, legenda: string): Promise<void> {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "legenda.md"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT) + sep)) throw new Error("Caminho inválido");
  await writeFile(safe, legenda, "utf-8");
}
