import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

export async function getOnboardingStatus(): Promise<{ complete: boolean }> {
  try {
    const content = await readFile(join(REPO_ROOT, "_memoria/empresa.md"), "utf-8");
    // O template (com seções RETINA/Contato) já passa de 50 chars vazio — checa se o campo
    // Nome foi de fato preenchido, não só o tamanho do arquivo.
    const nome = content.match(/\*\*Nome:\*\*[ \t]*(.*)/)?.[1]?.trim() ?? "";
    return { complete: nome.length > 0 };
  } catch {
    return { complete: false };
  }
}

export type Configuracoes = {
  empresa: string;
  preferencias: string;
};

export async function getConfiguracoes(): Promise<Configuracoes> {
  const [empresa, preferencias] = await Promise.allSettled([
    readFile(join(REPO_ROOT, "_memoria/empresa.md"), "utf-8"),
    readFile(join(REPO_ROOT, "_memoria/preferencias.md"), "utf-8"),
  ]);
  return {
    empresa: empresa.status === "fulfilled" ? empresa.value : "",
    preferencias: preferencias.status === "fulfilled" ? preferencias.value : "",
  };
}

export async function saveConfiguracoes(data: Configuracoes): Promise<void> {
  await writeFile(join(REPO_ROOT, "_memoria/empresa.md"), data.empresa, "utf-8");
  await writeFile(join(REPO_ROOT, "_memoria/preferencias.md"), data.preferencias, "utf-8");
}

export type AiConfig = {
  carrosselModel: string;
};

const AI_CONFIG_PATH = join(REPO_ROOT, "_memoria/ai-config.json");
const DEFAULT_AI_CONFIG: AiConfig = { carrosselModel: "claude-sonnet-4-6" };

export async function getAiConfig(): Promise<AiConfig> {
  try {
    const raw = await readFile(AI_CONFIG_PATH, "utf-8");
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export async function saveAiConfig(data: AiConfig): Promise<void> {
  await writeFile(AI_CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}
