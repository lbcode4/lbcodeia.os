import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, extname, relative, basename } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

export type BibliotecaItem = {
  path: string;       // relative to REPO_ROOT, used as ID
  label: string;
  type: "md" | "html" | "image";
  section: string;
  subsection?: string;
};

type BibliotecaSection = {
  id: string;
  label: string;
  items: BibliotecaItem[];
};

function tipo(filename: string): "md" | "html" | "image" | null {
  const ext = extname(filename).toLowerCase();
  if (ext === ".md") return "md";
  if (ext === ".html") return "html";
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return "image";
  return null;
}

function humanLabel(id: string): string {
  return basename(id, extname(id))
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/, "")
    .trim()
    || basename(id);
}

async function scanDir(
  dir: string,
  section: string,
  subsection?: string,
  recurse = false,
): Promise<BibliotecaItem[]> {
  const items: BibliotecaItem[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch { return []; }

  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory() && recurse) {
      const sub = await scanDir(fullPath, section, e.name, true);
      items.push(...sub);
    } else if (e.isFile()) {
      const t = tipo(e.name);
      if (!t) continue;
      if (e.name === "render.js") continue;
      items.push({
        path: relative(REPO_ROOT, fullPath),
        label: humanLabel(e.name),
        type: t,
        section,
        subsection,
      });
    }
  }
  return items;
}

async function scanCampanhas(dir: string): Promise<BibliotecaItem[]> {
  const items: BibliotecaItem[] = [];
  let camps: import("node:fs").Dirent[];
  try { camps = await readdir(dir, { withFileTypes: true }); } catch { return []; }

  for (const tipo_camp of camps.filter((d) => d.isDirectory())) {
    const tipoDir = join(dir, tipo_camp.name);
    let campaignDirs: import("node:fs").Dirent[];
    try { campaignDirs = await readdir(tipoDir, { withFileTypes: true }); } catch { continue; }

    for (const camp of campaignDirs.filter((d) => d.isDirectory())) {
      const campDir = join(tipoDir, camp.name);
      const sub = await scanDir(campDir, "Campanhas", `${tipo_camp.name}/${camp.name}`, true);
      items.push(...sub);
    }
  }
  return items;
}

async function scanSites(dir: string): Promise<BibliotecaItem[]> {
  const items: BibliotecaItem[] = [];
  let dirs: import("node:fs").Dirent[];
  try { dirs = await readdir(dir, { withFileTypes: true }); } catch { return []; }

  for (const d of dirs.filter((d) => d.isDirectory())) {
    const siteDir = join(dir, d.name);
    // index.html
    const html = join(siteDir, "index.html");
    if (existsSync(html)) {
      items.push({
        path: relative(REPO_ROOT, html),
        label: humanLabel(d.name) || "index",
        type: "html",
        section: "Sites",
        subsection: d.name,
      });
    }
    // previews
    const previewDir = join(siteDir, "preview");
    const previews = await scanDir(previewDir, "Sites", d.name);
    items.push(...previews.filter((i) => i.type === "image"));
  }
  return items;
}

export async function getBiblioteca(): Promise<BibliotecaSection[]> {
  const m = join(REPO_ROOT, "saidas", "marketing");
  const s = join(REPO_ROOT, "saidas");

  const [reels, stories, calendario, carrosseis, auditorias, auditoria_ig, campanhas, gbp, seo, sites, relatorios, prospeccao] =
    await Promise.all([
      scanDir(join(m, "conteudo", "reels"), "Conteúdo", "reels", true),
      scanDir(join(m, "conteudo", "stories"), "Conteúdo", "stories", true),
      scanDir(join(m, "conteudo", "calendario"), "Conteúdo", "calendário", true),
      scanDir(join(m, "conteudo", "carrossel"), "Conteúdo", "carrossel", true),
      scanDir(join(m, "auditorias"), "Auditorias", undefined, false),
      scanDir(join(m, "auditoria-ig"), "Auditorias", "Instagram", false),
      scanCampanhas(join(m, "campanhas")),
      scanDir(join(m, "gbp"), "GBP", undefined, true),
      scanDir(join(m, "google-seo"), "SEO", undefined, false),
      scanSites(join(m, "sites")),
      scanDir(join(s, "relatorios"), "Relatórios", undefined, true),
      scanDir(join(m, "prospeccao"), "Prospecção", undefined, true),
    ]);

  const conteudo = [...reels, ...stories, ...calendario, ...carrosseis];

  const sections: BibliotecaSection[] = [
    { id: "conteudo", label: "Conteúdo", items: conteudo },
    { id: "campanhas", label: "Campanhas", items: campanhas },
    { id: "auditorias", label: "Auditorias", items: [...auditorias, ...auditoria_ig] },
    { id: "gbp", label: "GBP", items: gbp },
    { id: "seo", label: "SEO", items: seo },
    { id: "sites", label: "Sites", items: sites },
    { id: "relatorios", label: "Relatórios", items: relatorios },
    { id: "prospeccao", label: "Prospecção", items: prospeccao },
  ];

  return sections.filter((sec) => sec.items.length > 0);
}

const ALLOWED_ROOTS = ["saidas"];

export async function readBibliotecaFile(path: string): Promise<{ content: Buffer; ext: string }> {
  const safe = resolve(join(REPO_ROOT, path));
  const rootSegment = safe.slice(REPO_ROOT.length + 1).split("/")[0];
  if (!safe.startsWith(resolve(REPO_ROOT)) || !ALLOWED_ROOTS.includes(rootSegment)) {
    throw new Error("Caminho inválido");
  }
  const content = await readFile(safe) as Buffer;
  return { content, ext: extname(path).toLowerCase() };
}
