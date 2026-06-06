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

  it("toda skill data tem outputContract definido", () => {
    const dataSkills = getAllSkillIds().filter((id) => resolveSkill(id).mode === "data");
    expect(dataSkills.length).toBeGreaterThanOrEqual(6); // pelo menos as 6 telas data-driven
    for (const id of dataSkills) {
      expect(resolveSkill(id).outputContract).toBeDefined();
    }
  });
});
