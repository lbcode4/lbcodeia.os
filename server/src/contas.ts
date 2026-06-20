import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type Conta = {
  cliente: string;
  metaAdAccount: string;
  handleIg: string;
  ativo: boolean;
};

export type ContaInput = {
  cliente: string;
  metaAdAccount?: string;
  igUserId?: string;
  handleIg?: string;
  googleAdsId?: string;
  ativo?: boolean;
};

// import.meta.dirname = server/src/ ; raiz do repo = dois níveis acima.
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
    if (cells[0] === "") continue;
    out.push({
      cliente: cells[0],
      metaAdAccount: cells[1],
      handleIg: cells[3],
      ativo: cells[5].toLowerCase() === "sim",
    });
  }
  return out;
}

/** Lê o arquivo real do repo e retorna as contas. Retorna [] se o arquivo não existir. */
export async function listContas(): Promise<Conta[]> {
  try {
    const md = await readFile(CONTAS_PATH, "utf-8");
    return parseContas(md);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

const DEFAULT_CONTAS_MD = `# Contas de Anúncios — Mapa Cliente → Conta

Fonte única para resolução de conta nas integrações Meta/Google.
Token secreto NÃO vive aqui (fica em \`integracoes/credentials/\`, gitignored).

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
`;

function rowCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length < 6) return null;
  if (cells[0] === "Cliente") return null;
  if (/^-+$/.test(cells[0].replace(/\s/g, "-"))) return null;
  if (cells[0] === "") return null;
  return cells;
}

function buildRow(input: ContaInput, existing?: string[]): string {
  const metaAdAccount = input.metaAdAccount ?? existing?.[1] ?? "";
  const igUserId = input.igUserId ?? existing?.[2] ?? "";
  const handleIg = input.handleIg ?? existing?.[3] ?? "";
  const googleAdsId = input.googleAdsId ?? existing?.[4] ?? "";
  const ativo = input.ativo === undefined ? (existing?.[5] ?? "Sim") : input.ativo ? "Sim" : "Não";
  return `| ${input.cliente} | ${metaAdAccount} | ${igUserId} | ${handleIg} | ${googleAdsId} | ${ativo} |`;
}

/** Cadastra ou atualiza (por nome de cliente) uma linha em contas-ads.md. Retorna a lista atualizada. */
export async function saveConta(input: ContaInput): Promise<Conta[]> {
  let md: string;
  try {
    md = await readFile(CONTAS_PATH, "utf-8");
  } catch {
    md = DEFAULT_CONTAS_MD;
  }

  let found = false;
  const lines = md.split("\n").map((line) => {
    const cells = rowCells(line);
    if (cells && cells[0].toLowerCase() === input.cliente.toLowerCase()) {
      found = true;
      return buildRow(input, cells);
    }
    return line;
  });

  if (!found) {
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    lines.push(buildRow(input));
  }

  const updated = lines.join("\n").trimEnd() + "\n";
  await writeFile(CONTAS_PATH, updated, "utf-8");
  return parseContas(updated);
}
