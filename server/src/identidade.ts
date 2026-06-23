import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve, extname, basename } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const IDENTIDADE_ROOT = join(REPO_ROOT, "identidade");
const CARROSSEIS_ROOT = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel");

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export function getSection(md: string, heading: string): string {
  const re = new RegExp(`^## ${heading}[ \\t]*\\n([\\s\\S]*?)(?=\\n\\n##|(?!\\n)$)`, "m");
  const match = md.match(re);
  if (!match) throw new Error(`Seção "${heading}" não encontrada`);
  return match[1].trim();
}

export function replaceSection(md: string, heading: string, newBody: string): string {
  const re = new RegExp(`(^## ${heading}[ \\t]*\\n)([\\s\\S]*?)(?=\\n\\n##|(?!\\n)$)`, "m");
  if (!re.test(md)) throw new Error(`Seção "${heading}" não encontrada`);
  return md.replace(re, (_m, headingLine: string, body: string) => {
    const gap = body.startsWith("\n") ? "\n" : "";
    return `${headingLine}${gap}${newBody.trim()}`;
  });
}

const DESIGN_GUIDE_PATH = join(IDENTIDADE_ROOT, "design-guide.md");

export type CorMarca = { hex: string; label: string };

const PALETA_LINE_RE = /^- (.+?): (#[0-9a-fA-F]{3,8})$/;

const PALETA_FALLBACK: CorMarca[] = [
  { hex: "#07070F", label: "Fundo" },
  { hex: "#A24BFF", label: "Roxo neon" },
  { hex: "#29C5FF", label: "Ciano neon" },
  { hex: "#FFFFFF", label: "Texto principal" },
  { hex: "#C9C9D6", label: "Texto secundário" },
];

export function parsePaleta(md: string): CorMarca[] {
  const body = getSection(md, "Cores");
  return body
    .split("\n")
    .map((line) => line.match(PALETA_LINE_RE))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ label: m[1].trim(), hex: m[2] }));
}

export function serializePaleta(paleta: CorMarca[]): string {
  return paleta.map((c) => `- ${c.label}: ${c.hex}`).join("\n");
}

export async function readPaleta(): Promise<CorMarca[]> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  const paleta = parsePaleta(md);
  return paleta.length > 0 ? paleta : PALETA_FALLBACK;
}

export async function writePaleta(paleta: CorMarca[]): Promise<void> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  await writeFile(DESIGN_GUIDE_PATH, replaceSection(md, "Cores", serializePaleta(paleta)), "utf-8");
}

export type Tipografia = { titulo: string | null; corpo: string | null };

export function parseTipografia(md: string): Tipografia {
  const body = getSection(md, "Tipografia");
  return {
    titulo: body.match(/^- Título: (.+)$/m)?.[1]?.trim() ?? null,
    corpo: body.match(/^- Corpo: (.+)$/m)?.[1]?.trim() ?? null,
  };
}

export function serializeTipografia(t: Tipografia): string {
  const lines: string[] = [];
  if (t.titulo) lines.push(`- Título: ${t.titulo}`);
  if (t.corpo) lines.push(`- Corpo: ${t.corpo}`);
  return lines.length > 0
    ? lines.join("\n")
    : "A definir — confirmar com material de identidade quando disponível.";
}

export async function readTipografia(): Promise<Tipografia> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  return parseTipografia(md);
}

export async function writeTipografia(t: Tipografia): Promise<void> {
  const md = await readFile(DESIGN_GUIDE_PATH, "utf-8");
  await writeFile(DESIGN_GUIDE_PATH, replaceSection(md, "Tipografia", serializeTipografia(t)), "utf-8");
}

const PREFERENCIAS_PATH = join(REPO_ROOT, "_memoria", "preferencias.md");

export type TomDeVoz = { tomDeVoz: string; evitar: string };

export async function readTomDeVoz(): Promise<TomDeVoz> {
  const md = await readFile(PREFERENCIAS_PATH, "utf-8");
  return { tomDeVoz: getSection(md, "Tom de voz"), evitar: getSection(md, "O que evitar") };
}

export async function writeTomDeVoz(data: TomDeVoz): Promise<void> {
  const md = await readFile(PREFERENCIAS_PATH, "utf-8");
  const withTom = replaceSection(md, "Tom de voz", data.tomDeVoz);
  const withEvitar = replaceSection(withTom, "O que evitar", data.evitar);
  await writeFile(PREFERENCIAS_PATH, withEvitar, "utf-8");
}

export type IdentidadeArquivo = { nome: string; label: string };

export type IdentidadeData = {
  logo: IdentidadeArquivo | null;
  refs: IdentidadeArquivo[];
  paleta: CorMarca[];
  tipografia: Tipografia;
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
    return { logo: null, refs: [], paleta: PALETA_FALLBACK, tipografia: { titulo: null, corpo: null } };
  }
  const imageFiles = files.filter((f) => IMAGE_EXTS.includes(extname(f).toLowerCase()));
  const logo = imageFiles.find((f) => /^logo/i.test(f));
  const refs = imageFiles.filter((f) => !/^logo/i.test(f));

  let paleta = PALETA_FALLBACK;
  let tipografia: Tipografia = { titulo: null, corpo: null };
  try {
    const designGuide = await readFile(DESIGN_GUIDE_PATH, "utf-8");
    const parsedPaleta = parsePaleta(designGuide);
    paleta = parsedPaleta.length > 0 ? parsedPaleta : PALETA_FALLBACK;
    tipografia = parseTipografia(designGuide);
  } catch { /* design-guide.md ausente — usa defaults */ }

  return {
    logo: logo ? { nome: logo, label: "Logo" } : null,
    refs: refs.map((f) => ({ nome: f, label: labelFromFilename(f) })),
    paleta,
    tipografia,
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
