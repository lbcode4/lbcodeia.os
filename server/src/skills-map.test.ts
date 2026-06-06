import { describe, it, expect } from "vitest";
import { resolveSkill, isAllowedSkill } from "./skills-map.js";

describe("skills-map", () => {
  it("resolve lb-meta-copy", () => {
    const s = resolveSkill("lb-meta-copy");
    expect(s.skillName).toBe("lb-meta-copy");
    expect(s.allowedTools).toContain("Bash");
    expect(s.allowedTools).toContain("Skill");
  });

  it("rejeita skill desconhecida", () => {
    expect(isAllowedSkill("nao-existe")).toBe(false);
    expect(() => resolveSkill("nao-existe")).toThrow();
  });
});
