import { describe, it, expect } from "vitest";
import { buildPrompt } from "./runner.js";

describe("buildPrompt", () => {
  it("inclui nome da skill, cliente e briefing", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian Store", "anúncio de tênis", "text");
    expect(p).toContain("lb-meta-copy");
    expect(p).toContain("Dordrian Store");
    expect(p).toContain("anúncio de tênis");
  });

  it("injeta contrato JSON quando mode=data", () => {
    const contract = { score: "number" };
    const p = buildPrompt("lb-meta-diagnostico", "Dordrian", "", "data", contract);
    expect(p).toContain("```json");
    expect(p).toContain('"score"');
  });

  it("não injeta JSON quando mode=text", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian", "briefing", "text");
    expect(p).not.toContain("```json");
  });
});
