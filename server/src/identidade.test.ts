import { describe, it, expect } from "vitest";
import { getSection, replaceSection } from "./identidade.js";

const SAMPLE = `# Doc

## Cores
- Primária: Azul — confirmar hex exato
- Fundo: escuro ou branco clean (minimalista)
- Acento: a definir

## Tipografia
A definir — confirmar com material de identidade quando disponível.

## Elementos
- Minimalismo
`;

describe("getSection", () => {
  it("extrai o corpo de uma seção do meio do arquivo", () => {
    expect(getSection(SAMPLE, "Cores")).toBe(
      "- Primária: Azul — confirmar hex exato\n- Fundo: escuro ou branco clean (minimalista)\n- Acento: a definir",
    );
  });

  it("extrai o corpo de uma seção que não é a última", () => {
    expect(getSection(SAMPLE, "Tipografia")).toBe(
      "A definir — confirmar com material de identidade quando disponível.",
    );
  });

  it("lança erro quando a seção não existe", () => {
    expect(() => getSection(SAMPLE, "Não Existe")).toThrow('Seção "Não Existe" não encontrada');
  });
});

describe("replaceSection", () => {
  it("substitui só a seção alvo, preservando as vizinhas", () => {
    const updated = replaceSection(SAMPLE, "Cores", "- Fundo: #07070F\n- Roxo neon: #A24BFF");
    expect(getSection(updated, "Cores")).toBe("- Fundo: #07070F\n- Roxo neon: #A24BFF");
    expect(getSection(updated, "Tipografia")).toBe(
      "A definir — confirmar com material de identidade quando disponível.",
    );
    expect(getSection(updated, "Elementos")).toBe("- Minimalismo");
  });

  it("mantém exatamente uma linha em branco antes da próxima seção", () => {
    const updated = replaceSection(SAMPLE, "Cores", "- Fundo: #07070F");
    expect(updated).toContain("- Fundo: #07070F\n\n## Tipografia");
  });

  it("lança erro quando a seção não existe", () => {
    expect(() => replaceSection(SAMPLE, "Não Existe", "x")).toThrow('Seção "Não Existe" não encontrada');
  });
});
