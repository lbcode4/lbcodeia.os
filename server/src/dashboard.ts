import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const RELATORIOS_ROOT = join(REPO_ROOT, "saidas", "relatorios");

function extractJsonObject(html: string, marker: string): unknown {
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error(`${marker} não encontrado`);
  const start = idx + marker.length;
  let depth = 0, i = start;
  while (i < html.length) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") { depth--; if (depth === 0) break; }
    i++;
  }
  return JSON.parse(html.slice(start, i + 1));
}

function extractJsonArray(html: string, marker: string): unknown[] {
  const idx = html.indexOf(marker);
  if (idx === -1) return [];
  let i = idx + marker.length;
  while (i < html.length && html[i] !== "[") i++;
  let depth = 0, j = i;
  while (j < html.length) {
    if (html[j] === "[") depth++;
    else if (html[j] === "]") { depth--; if (depth === 0) break; }
    j++;
  }
  try { return JSON.parse(html.slice(i, j + 1)); } catch { return []; }
}

function normalizeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function findLatestFile(nameFilter: (n: string) => boolean, clienteSlug?: string): Promise<string | null> {
  const candidates: { path: string; name: string }[] = [];
  try {
    const clients = await readdir(RELATORIOS_ROOT, { withFileTypes: true });
    const dirs = clients.filter((d) => d.isDirectory()).filter((d) =>
      !clienteSlug || normalizeSlug(d.name) === normalizeSlug(clienteSlug)
    );
    for (const c of dirs) {
      const files = await readdir(join(RELATORIOS_ROOT, c.name), { withFileTypes: true });
      for (const f of files.filter((f) => f.isFile() && f.name.endsWith(".html") && nameFilter(f.name.toLowerCase()))) {
        candidates.push({ path: join(RELATORIOS_ROOT, c.name, f.name), name: f.name });
      }
    }
  } catch { return null; }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.name.localeCompare(a.name));
  return candidates[0].path;
}

function parseConversao(html: string): Record<string, { value: number; label: string; cost: string; emoji: string }> {
  const result: Record<string, { value: number; label: string; cost: string; emoji: string }> = {};
  const cards = html.split('<div class="conv-card">').slice(1);
  for (const card of cards) {
    const idM = card.match(/id="conv-val-([\w-]+)"/);
    const valM = card.match(/id="conv-val-[\w-]+"[^>]*>([\d.,]+)<\/div>/);
    const labelM = card.match(/class="conv-label">(.*?)<\/div>/);
    const costM = card.match(/class="conv-cost"[^>]*>(.*?)<\/div>/s);
    const emojiM = card.match(/class="conv-emoji">(.*?)<\/div>/);
    if (idM && valM && labelM) {
      const rawVal = valM[1].replace(/\./g, "").replace(",", ".");
      result[idM[1]] = {
        value: parseFloat(rawVal) || 0,
        label: labelM[1].trim(),
        cost: costM?.[1]?.trim() ?? "—",
        emoji: emojiM?.[1]?.trim() ?? "",
      };
    }
  }
  return result;
}

function parseCampanhas(html: string): Array<{
  funnel: string; funnelClass: string; name: string; spend: number; spendPct: string;
  alcance: number; ctr: string; cpc: string; frequencia: string; satBadge: string; satClass: string;
  actions: Array<{ val: string; name: string }>;
}> {
  const campanhas: ReturnType<typeof parseCampanhas> = [];
  const cards = html.split('<div class="camp-card">').slice(1);
  for (const card of cards) {
    try {
      const funnelM = card.match(/class="camp-funnel-tag (\w+)">(.*?)<\/div>/);
      const nameM = card.match(/class="camp-name">([\s\S]*?)<\/div>/);
      const spendM = card.match(/class="camp-spend"[^>]*>(R\$\s*[\d.,]+)<\/div>/);
      const spendPctM = card.match(/([\d.,]+%\s*do total)/);

      const metricVals: string[] = [];
      const mvRe = /class="camp-metric-value"[^>]*>(.*?)<\/div>/g;
      let mv;
      while ((mv = mvRe.exec(card)) !== null) metricVals.push(mv[1].trim());

      const satM = card.match(/class="sat-badge (\w+)">(.*?)<\/span>/);

      const actions: Array<{ val: string; name: string }> = [];
      const actRe = /<div class="action-box"><div class="action-val">(.*?)<\/div><div class="action-name">(.*?)<\/div><\/div>/g;
      let am;
      while ((am = actRe.exec(card)) !== null) actions.push({ val: am[1].trim(), name: am[2].trim() });

      const name = nameM?.[1]?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
      if (!name) continue;

      const spendStr = spendM?.[1]?.replace("R$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".") ?? "0";
      const alcanceStr = metricVals[0]?.replace(/\./g, "") ?? "0";

      campanhas.push({
        funnel: funnelM?.[2]?.trim() ?? "",
        funnelClass: funnelM?.[1]?.trim() ?? "tofu",
        name,
        spend: parseFloat(spendStr) || 0,
        spendPct: spendPctM?.[1]?.trim() ?? "",
        alcance: parseInt(alcanceStr) || 0,
        ctr: metricVals[1] ?? "",
        cpc: metricVals[2] ?? "",
        frequencia: metricVals[3] ?? "",
        satBadge: satM?.[2]?.trim() ?? "",
        satClass: satM?.[1]?.trim() ?? "",
        actions,
      });
    } catch { /* skip malformed card */ }
  }
  return campanhas;
}

function parseAlertas(html: string): Array<{ type: string; icon: string; title: string; desc: string }> {
  const alertas: Array<{ type: string; icon: string; title: string; desc: string }> = [];
  const re = /<div class="alert-card (\w+)">\s*<div class="alert-icon">(.*?)<\/div>\s*<div>\s*<div class="alert-title">(.*?)<\/div>\s*<div class="alert-desc">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    alertas.push({ type: m[1].trim(), icon: m[2].trim(), title: m[3].trim(), desc: m[4].trim() });
  }
  return alertas;
}

export async function getDashboardData(cliente?: string): Promise<unknown> {
  const [dashPath, relatorioPath] = await Promise.all([
    findLatestFile((n) => n.includes("dashboard"), cliente),
    findLatestFile((n) => n.includes("relatorio-meta"), cliente),
  ]);

  if (!dashPath && !relatorioPath) throw new Error("Nenhum relatório encontrado");

  // Dados base do dashboard-completo (JSON estruturado: kpis, reels, followers, comparativo)
  let baseData: Record<string, unknown> = {};
  if (dashPath) {
    const html = await readFile(dashPath, "utf-8");
    try { baseData = extractJsonObject(html, "const DATA = ") as Record<string, unknown>; } catch {}
  }

  // Dados extras do relatorio-meta: DAILY_DATA rico + campanhas + conversão + alertas
  let extraData: Record<string, unknown> = {};
  if (relatorioPath) {
    const html = await readFile(relatorioPath, "utf-8");
    const dailyData = extractJsonArray(html, "const DAILY_DATA = ");
    const campanhas = parseCampanhas(html);
    const conversao = parseConversao(html);
    const alertas = parseAlertas(html);

    const periodM = html.match(/const FULL_PERIOD = \{[^}]+since:\s*'([^']+)',\s*until:\s*'([^']+)',\s*dias:\s*(\d+)/);
    const period = periodM ? { since: periodM[1], until: periodM[2], dias: parseInt(periodM[3]) } : null;

    extraData = { dailyData, campanhas, conversao, alertas, ...(period ? { period } : {}) };
  }

  return { ...baseData, ...extraData };
}
