export type SkillSpec = {
  skillName: string;
  allowedTools: string[];
};

// MVP: apenas a skill validada ponta-a-ponta. Adicionar entradas conforme liga novas telas.
const SKILLS: Record<string, SkillSpec> = {
  "lb-meta-copy": {
    skillName: "lb-meta-copy",
    allowedTools: ["Skill", "Bash", "Read", "Glob", "Grep"],
  },
};

export function isAllowedSkill(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(SKILLS, id);
}

export function resolveSkill(id: string): SkillSpec {
  const spec = SKILLS[id];
  if (!spec) throw new Error(`Skill não permitida: ${id}`);
  return spec;
}
