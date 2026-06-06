import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Conta = {
  cliente: string;
  metaAdAccount: string;
  handleIg: string;
  ativo: boolean;
};

// Raiz do repo lbcodeia.os = um nível acima de server/.
const REPO_ROOT = join(import.meta.dirname, "..", "..");
const CONTAS_PATH = join(REPO_ROOT, "_memoria", "contas-ads.md");

/** Faz parse da tabela markdown de contas. Recebe o conteúdo bruto do .md. */
export function parseContas(markdown: string): Conta[] {
  const out: Conta[] = [];
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    if (cells[0] === "Cliente") continue;        // cabeçalho
    if (/^-+$/.test(cells[0].replace(/\s/g, "-"))) continue; // separador ---
    if (cells[0] === "" || cells[0].startsWith("--")) continue;
    out.push({
      cliente: cells[0],
      metaAdAccount: cells[1],
      handleIg: cells[3],
      ativo: cells[5].toLowerCase() === "sim",
    });
  }
  return out;
}

/** Lê o arquivo real do repo e retorna as contas. */
export async function listContas(): Promise<Conta[]> {
  const md = await readFile(CONTAS_PATH, "utf-8");
  return parseContas(md);
}
