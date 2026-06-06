import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve, extname, basename } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const IDENTIDADE_ROOT = join(REPO_ROOT, "identidade");
const CARROSSEIS_ROOT = join(REPO_ROOT, "marketing", "conteudo", "carrossel");

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export type IdentidadeArquivo = { nome: string; label: string };

export type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
};

function labelFromFilename(nome: string): string {
  return basename(nome, extname(nome))
    .replace(/^ref-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveInspiracoes(carrosselId: string): string {
  const safe = resolve(join(CARROSSEIS_ROOT, carrosselId, "inspiracoes"));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  return safe;
}

export async function listIdentidade(): Promise<IdentidadeData> {
  let files: string[];
  try {
    files = await readdir(IDENTIDADE_ROOT);
  } catch {
    return { logo: null, refs: [] };
  }
  const imageFiles = files.filter((f) => IMAGE_EXTS.includes(extname(f).toLowerCase()));
  const logo = imageFiles.find((f) => /^logo/i.test(f));
  const refs = imageFiles.filter((f) => !/^logo/i.test(f));
  return {
    logo: logo ? { nome: logo, label: "Logo" } : null,
    refs: refs.map((f) => ({ nome: f, label: labelFromFilename(f) })),
  };
}

export async function readIdentidadeArquivo(filename: string): Promise<{ buf: Buffer; mime: string }> {
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  const safe = resolve(join(IDENTIDADE_ROOT, filename));
  if (!safe.startsWith(resolve(IDENTIDADE_ROOT))) throw new Error("Caminho inválido");
  return { buf: await readFile(safe), mime };
}

export async function listInspiracoes(carrosselId: string): Promise<string[]> {
  const dir = resolveInspiracoes(carrosselId);
  try {
    const files = await readdir(dir);
    return files.filter((f) => IMAGE_EXTS.includes(extname(f).toLowerCase())).sort();
  } catch {
    return [];
  }
}

export async function saveInspiracao(carrosselId: string, filename: string, data: Buffer): Promise<void> {
  const ext = extname(filename).toLowerCase();
  if (!IMAGE_EXTS.includes(ext)) throw new Error("Tipo inválido");
  const dir = resolveInspiracoes(carrosselId);
  await mkdir(dir, { recursive: true });
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  await writeFile(safe, data);
}

export async function readInspiracao(carrosselId: string, filename: string): Promise<{ buf: Buffer; mime: string }> {
  const ext = extname(filename).toLowerCase();
  const mime = MIME_MAP[ext];
  if (!mime) throw new Error("Tipo inválido");
  const dir = resolveInspiracoes(carrosselId);
  const safe = resolve(join(dir, filename));
  if (!safe.startsWith(resolve(CARROSSEIS_ROOT))) throw new Error("Caminho inválido");
  return { buf: await readFile(safe), mime };
}
