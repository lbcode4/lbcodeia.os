import { describe, it, expect } from "vitest";
import { extractJsonBlock } from "./runner.js";

describe("extractJsonBlock", () => {
  it("extrai bloco json simples", () => {
    const text = 'texto\n```json\n{"a":1}\n```\nmais texto';
    expect(extractJsonBlock(text)).toEqual({ a: 1 });
  });

  it("extrai o ÚLTIMO bloco quando há múltiplos", () => {
    const text = '```json\n{"first":1}\n```\n...\n```json\n{"last":2}\n```';
    expect(extractJsonBlock(text)).toEqual({ last: 2 });
  });

  it("retorna null quando não há bloco", () => {
    expect(extractJsonBlock("sem bloco json aqui")).toBeNull();
  });

  it("retorna null quando bloco tem JSON inválido", () => {
    expect(extractJsonBlock("```json\n{invalid}\n```")).toBeNull();
  });
});
