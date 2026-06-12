import { describe, it, expect } from "vitest";
import { parseContas } from "./contas.js";

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
