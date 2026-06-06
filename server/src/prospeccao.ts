import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const PROSPECCAO_ROOT = join(REPO_ROOT, "marketing", "prospeccao");

export type ProspeccaoLead = {
  prioridade: number;
  slug: string;
  nome: string;
  instagram: string;
  canal: string;
  hasDossie: boolean;
  hasRoteiro: boolean;
};

export type ProspeccaoCampaign = {
  id: string;
  leads: ProspeccaoLead[];
};

function parseLeadsCSV(csv: string): Omit<ProspeccaoLead, "hasDossie" | "hasRoteiro">[] {
  return csv
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .slice(1) // skip header
    .map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      return {
        prioridade: parseInt(cells[0]) || 0,
        slug: cells[1] ?? "",
        nome: cells[2] ?? "",
        instagram: cells[3] ?? "",
        canal: cells[7] ?? "",
      };
    })
    .filter((l) => l.slug && l.prioridade > 0);
}

export async function listCampaigns(): Promise<ProspeccaoCampaign[]> {
  let dirs: import("node:fs").Dirent[];
  try {
    dirs = await readdir(PROSPECCAO_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  const campaigns: ProspeccaoCampaign[] = [];
  for (const d of dirs.filter((d) => d.isDirectory())) {
    const campDir = join(PROSPECCAO_ROOT, d.name);
    const csvPath = join(campDir, "02-leads-priorizados.csv");

    let rawLeads: Omit<ProspeccaoLead, "hasDossie" | "hasRoteiro">[] = [];
    try {
      rawLeads = parseLeadsCSV(await readFile(csvPath, "utf-8"));
    } catch { /* sem CSV */ }

    const leads = rawLeads.map((l) => ({
      ...l,
      hasDossie: existsSync(join(campDir, "dossies", `${l.slug}.md`)),
      hasRoteiro: existsSync(join(campDir, "03-roteiros", `${l.slug}-whatsapp.md`)),
    }));

    campaigns.push({ id: d.name, leads });
  }
  return campaigns;
}

export async function readCampaignFile(campaign: string, file: string): Promise<string> {
  const safe = resolve(join(PROSPECCAO_ROOT, campaign, file));
  if (!safe.startsWith(resolve(PROSPECCAO_ROOT))) throw new Error("Caminho inválido");
  return readFile(safe, "utf-8");
}
