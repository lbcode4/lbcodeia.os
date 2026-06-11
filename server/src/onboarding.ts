import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

export type Profile = {
  nome: string;
  setor: string;
  produto: string;
  publico: string;
  diferencial: string;
  tom: string;
  objetivo: string;
};

export async function getOnboardingStatus(): Promise<{ complete: boolean }> {
  try {
    const content = await readFile(join(REPO_ROOT, "_memoria/empresa.md"), "utf-8");
    return { complete: content.trim().length >= 50 };
  } catch {
    return { complete: false };
  }
}

export async function saveOnboarding(profile: Profile): Promise<void> {
  const empresa = `# Empresa

> Preenchido via entrevista inicial. Edite a qualquer momento.

**Nome:** ${profile.nome}
**Setor:** ${profile.setor}
**Produto/Serviço:** ${profile.produto}
**Público-alvo:** ${profile.publico}
**Diferencial:** ${profile.diferencial}
`;

  const preferencias = `# Preferências

> Preenchido via entrevista inicial. Edite a qualquer momento.

## Tom de voz
${profile.tom}

## Objetivo principal com tráfego pago
${profile.objetivo}
`;

  await writeFile(join(REPO_ROOT, "_memoria/empresa.md"), empresa, "utf-8");
  await writeFile(join(REPO_ROOT, "_memoria/preferencias.md"), preferencias, "utf-8");
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
