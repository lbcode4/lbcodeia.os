import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", async () => {
  const actual = await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises");
  return { ...actual, readFile: vi.fn(), writeFile: vi.fn() };
});

import { readFile, writeFile } from "node:fs/promises";
import { getSection, replaceSection, parsePaleta, serializePaleta, readPaleta, writePaleta, type CorMarca, parseTipografia, serializeTipografia, readTipografia, writeTipografia, type Tipografia, readTomDeVoz, writeTomDeVoz, type TomDeVoz } from "./identidade.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => vi.clearAllMocks());

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

  it("preserva a linha em branco entre heading e corpo quando o original já tinha uma", () => {
    const md = "## Tom de voz\n\nDireto, objetivo, focado em ROI.\n\n## O que evitar\n- x\n";
    const updated = replaceSection(md, "Tom de voz", "Novo tom.");
    expect(updated).toContain("## Tom de voz\n\nNovo tom.\n\n## O que evitar");
  });
});

const DESIGN_GUIDE_COM_PALETA = `# Identidade Visual

## Cores
- Fundo: #07070F
- Roxo neon: #A24BFF
- Ciano neon: #29C5FF

## Tipografia
A definir.
`;

const DESIGN_GUIDE_SEM_PALETA = `# Identidade Visual

## Cores
- Primária: Azul — confirmar hex exato
- Fundo: escuro ou branco clean (minimalista)

## Tipografia
A definir.
`;

describe("parsePaleta", () => {
  it("lê linhas no formato '- Label: #hex'", () => {
    expect(parsePaleta(DESIGN_GUIDE_COM_PALETA)).toEqual([
      { label: "Fundo", hex: "#07070F" },
      { label: "Roxo neon", hex: "#A24BFF" },
      { label: "Ciano neon", hex: "#29C5FF" },
    ]);
  });

  it("ignora linhas fora do formato (texto legado)", () => {
    expect(parsePaleta(DESIGN_GUIDE_SEM_PALETA)).toEqual([]);
  });
});

describe("serializePaleta", () => {
  it("round-trip com parsePaleta", () => {
    const paleta: CorMarca[] = [{ label: "Fundo", hex: "#07070F" }, { label: "Acento", hex: "#FF00AA" }];
    expect(parsePaleta(`## Cores\n${serializePaleta(paleta)}\n\n## Tipografia\nx`)).toEqual(paleta);
  });
});

describe("readPaleta", () => {
  it("retorna a paleta parseada quando o arquivo já está no formato novo", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_PALETA as never);
    const paleta = await readPaleta();
    expect(paleta).toEqual([
      { label: "Fundo", hex: "#07070F" },
      { label: "Roxo neon", hex: "#A24BFF" },
      { label: "Ciano neon", hex: "#29C5FF" },
    ]);
  });

  it("retorna o fallback hardcoded quando a seção ainda está no formato legado", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_SEM_PALETA as never);
    const paleta = await readPaleta();
    expect(paleta.length).toBe(5);
    expect(paleta[0]).toEqual({ hex: "#07070F", label: "Fundo" });
  });
});

describe("writePaleta", () => {
  it("regrava a seção Cores preservando o resto do arquivo", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_PALETA as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writePaleta([{ label: "Nova", hex: "#112233" }]);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("- Nova: #112233");
    expect(written).toContain("## Tipografia\nA definir.");
  });
});

const DESIGN_GUIDE_COM_FONTES = `## Cores
- Fundo: #07070F

## Tipografia
- Título: Poppins
- Corpo: Inter

## Elementos
- x
`;

describe("parseTipografia", () => {
  it("lê título e corpo quando ambos definidos", () => {
    expect(parseTipografia(DESIGN_GUIDE_COM_FONTES)).toEqual({ titulo: "Poppins", corpo: "Inter" });
  });

  it("retorna null pros dois quando a seção está em texto livre legado", () => {
    expect(parseTipografia(DESIGN_GUIDE_SEM_PALETA)).toEqual({ titulo: null, corpo: null });
  });
});

describe("serializeTipografia", () => {
  it("round-trip com parseTipografia quando ambos definidos", () => {
    const t: Tipografia = { titulo: "Sora", corpo: "Manrope" };
    expect(parseTipografia(`## Cores\nx\n\n## Tipografia\n${serializeTipografia(t)}\n\n## Y\nz`)).toEqual(t);
  });

  it("round-trip quando um campo é null (não inventa o outro de volta)", () => {
    const t: Tipografia = { titulo: "Sora", corpo: null };
    expect(parseTipografia(`## Cores\nx\n\n## Tipografia\n${serializeTipografia(t)}\n\n## Y\nz`)).toEqual(t);
  });
});

describe("readTipografia / writeTipografia", () => {
  it("readTipografia lê do design-guide.md", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    expect(await readTipografia()).toEqual({ titulo: "Poppins", corpo: "Inter" });
  });

  it("writeTipografia regrava só a seção Tipografia", async () => {
    mockReadFile.mockResolvedValue(DESIGN_GUIDE_COM_FONTES as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writeTipografia({ titulo: "Outfit", corpo: "Lexend" });

    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("- Título: Outfit");
    expect(written).toContain("- Corpo: Lexend");
    expect(written).toContain("- Fundo: #07070F");
  });
});

const PREFERENCIAS_SAMPLE = `# Preferências

## Tom de voz

Direto, objetivo, focado em ROI.

**Exemplo real (P11):**
> "Sua empresa não precisa trabalhar mais."

## O que evitar
- "vamos juntos"
- "sinergia"

## Frequência de conteúdo
- 3 posts/semana
`;

describe("readTomDeVoz / writeTomDeVoz", () => {
  it("lê as duas seções como markdown raw", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    const data = await readTomDeVoz();
    expect(data.tomDeVoz).toContain("Direto, objetivo, focado em ROI.");
    expect(data.tomDeVoz).toContain("Exemplo real (P11)");
    expect(data.evitar).toBe('- "vamos juntos"\n- "sinergia"');
  });

  it("escreve as duas seções preservando Frequência de conteúdo intacta", async () => {
    mockReadFile.mockResolvedValue(PREFERENCIAS_SAMPLE as never);
    mockWriteFile.mockResolvedValue(undefined);

    await writeTomDeVoz({ tomDeVoz: "Novo tom.", evitar: '- "buzzword"' });

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("## Tom de voz\n\nNovo tom.\n");
    expect(written).toContain('## O que evitar\n- "buzzword"\n');
    expect(written).toContain("## Frequência de conteúdo\n- 3 posts/semana");
  });
});
