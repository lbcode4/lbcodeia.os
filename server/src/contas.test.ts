import { describe, it, expect } from "vitest";
import { parseContas } from "./contas.js";

const TABELA = `# Contas de Anúncios

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | act_123 | 999 | @dordrian | — | sim |
| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |
`;

describe("parseContas", () => {
  it("extrai clientes da tabela markdown", () => {
    const contas = parseContas(TABELA);
    expect(contas).toHaveLength(2);
    expect(contas[0]).toEqual({
      cliente: "Dordrian Store",
      metaAdAccount: "act_123",
      handleIg: "@dordrian",
      ativo: true,
    });
  });

  it("ignora linhas de cabeçalho/separador e texto fora da tabela", () => {
    const contas = parseContas("texto solto\nsem tabela\n");
    expect(contas).toEqual([]);
  });
});
