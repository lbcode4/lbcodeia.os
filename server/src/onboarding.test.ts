import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOnboardingStatus, saveOnboarding, type Profile } from "./onboarding.js";

// Mock node:fs/promises so tests don't touch real files
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOnboardingStatus", () => {
  it("returns complete=false when empresa.md missing", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: false });
  });

  it("returns complete=false when empresa.md has fewer than 50 chars", async () => {
    mockReadFile.mockResolvedValue("# Empresa\n" as unknown as Buffer);
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: false });
  });

  it("returns complete=true when empresa.md has 50+ meaningful chars", async () => {
    mockReadFile.mockResolvedValue("# Empresa\n\n**Nome:** Clínica Sorriso\n**Setor:** Odontologia\n**Produto:** Clareamento" as unknown as Buffer);
    const result = await getOnboardingStatus();
    expect(result).toEqual({ complete: true });
  });
});

describe("saveOnboarding", () => {
  const profile: Profile = {
    nome: "Clínica Sorriso",
    setor: "Odontologia",
    produto: "Clareamento dental e ortodontia",
    publico: "Mulheres 28-45, classe B/C, Belém-PA",
    diferencial: "Atendimento no mesmo dia, parcelamento em 18x",
    tom: "Profissional mas acolhedor",
    objetivo: "Gerar leads para WhatsApp",
  };

  it("writes empresa.md with nome, setor, produto, publico, diferencial", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);

    const empresaCall = mockWriteFile.mock.calls.find((c) =>
      (c[0] as string).endsWith("empresa.md"),
    );
    expect(empresaCall).toBeDefined();
    const content = empresaCall![1] as string;
    expect(content).toContain("Clínica Sorriso");
    expect(content).toContain("Odontologia");
    expect(content).toContain("Clareamento dental e ortodontia");
    expect(content).toContain("Mulheres 28-45");
    expect(content).toContain("Atendimento no mesmo dia");
  });

  it("writes preferencias.md with tom and objetivo", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);

    const prefCall = mockWriteFile.mock.calls.find((c) =>
      (c[0] as string).endsWith("preferencias.md"),
    );
    expect(prefCall).toBeDefined();
    const content = prefCall![1] as string;
    expect(content).toContain("Profissional mas acolhedor");
    expect(content).toContain("Gerar leads para WhatsApp");
  });

  it("calls writeFile exactly twice", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveOnboarding(profile);
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });
});
