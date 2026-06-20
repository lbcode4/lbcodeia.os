import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseContas } from "./contas.js";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";
import { saveConta } from "./contas.js";
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => {
  vi.clearAllMocks();
});

const TABELA = `# Contas de Anúncios

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Loja Beta | act_123 | 999 | @lojabeta | — | sim |
| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |
`;

describe("parseContas", () => {
  it("extrai clientes da tabela markdown", () => {
    const contas = parseContas(TABELA);
    expect(contas).toHaveLength(2);
    expect(contas[0]).toEqual({
      cliente: "Loja Beta",
      metaAdAccount: "act_123",
      handleIg: "@lojabeta",
      ativo: true,
    });
  });

  it("ignora linhas de cabeçalho/separador e texto fora da tabela", () => {
    const contas = parseContas("texto solto\nsem tabela\n");
    expect(contas).toEqual([]);
  });

  it("não emite linha separadora como conta", () => {
    const contas = parseContas("| ------- | --- | --- | --- | --- | --- |\n");
    expect(contas).toEqual([]);
  });
});

describe("saveConta", () => {
  it("cria o arquivo do zero quando contas-ads.md não existe", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    mockWriteFile.mockResolvedValue(undefined);

    const result = await saveConta({ cliente: "LBCode.IA" });

    expect(result).toEqual([{ cliente: "LBCode.IA", metaAdAccount: "", handleIg: "", ativo: true }]);
    const written = mockWriteFile.mock.calls[0][1] as string;
    expect(written).toContain("| LBCode.IA |  |  |  |  | Sim |");
  });

  it("adiciona nova linha preservando as existentes", async () => {
    mockReadFile.mockResolvedValue(TABELA as unknown as Buffer);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await saveConta({ cliente: "Acme", metaAdAccount: "act_999", ativo: true });

    expect(result).toHaveLength(3);
    expect(result.find((c) => c.cliente === "Acme")).toEqual({
      cliente: "Acme", metaAdAccount: "act_999", handleIg: "", ativo: true,
    });
    // linhas antigas continuam lá
    expect(result.filter((c) => c.cliente === "Loja Beta")).toHaveLength(2);
  });

  it("atualiza linha existente (mesmo cliente) em vez de duplicar", async () => {
    mockReadFile.mockResolvedValue(TABELA as unknown as Buffer);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await saveConta({ cliente: "Loja Beta", metaAdAccount: "act_NOVO", ativo: false });

    const lojaBeta = result.filter((c) => c.cliente === "Loja Beta");
    expect(lojaBeta).toHaveLength(2); // já tinha 2 linhas "Loja Beta" na tabela original
    expect(lojaBeta[0]).toEqual({ cliente: "Loja Beta", metaAdAccount: "act_NOVO", handleIg: "@lojabeta", ativo: false });
  });
});
