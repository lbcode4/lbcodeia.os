import { describe, it, expect } from "vitest";
import { resolveSkill, isAllowedSkill, getAllSkillIds } from "./skills-map.js";

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

describe("todas as skills registradas", () => {
  it("tem pelo menos 42 skills", () => {
    expect(getAllSkillIds().length).toBeGreaterThanOrEqual(42);
  });

  it("cada skill tem mode definido", () => {
    for (const id of getAllSkillIds()) {
      const spec = resolveSkill(id);
      expect(["text", "data"]).toContain(spec.mode);
    }
  });

  it("skills data têm outputContract", () => {
    const dataSkills = ["lb-meta-dashboard", "lb-meta-diagnostico", "lb-meta-auditoria", "lb-meta-analise-reels", "lb-ads-negativas", "lb-google-dashboard"];
    for (const id of dataSkills) {
      const spec = resolveSkill(id);
      expect(spec.mode).toBe("data");
      expect(spec.outputContract).toBeDefined();
    }
  });
});
