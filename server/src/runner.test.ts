import { describe, it, expect } from "vitest";
import { buildPrompt } from "./runner.js";

describe("buildPrompt", () => {
  it("inclui nome da skill, cliente e briefing", () => {
    const p = buildPrompt("lb-meta-copy", "Dordrian Store", "anúncio de tênis");
    expect(p).toContain("lb-meta-copy");
    expect(p).toContain("Dordrian Store");
    expect(p).toContain("anúncio de tênis");
  });
});
