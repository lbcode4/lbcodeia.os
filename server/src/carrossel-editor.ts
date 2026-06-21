import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

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
