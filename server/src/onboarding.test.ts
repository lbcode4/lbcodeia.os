import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, type Profile } from "./onboarding.js";
import { app } from "./server.js";

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

describe("GET /api/onboarding/status", () => {
  it("returns 200 with complete boolean", async () => {
    // readFile already mocked above — reset to return empty string
    mockReadFile.mockResolvedValue("" as unknown as Buffer);
    const res = await app.request("/api/onboarding/status");
    expect(res.status).toBe(200);
    const body = await res.json() as { complete: boolean };
    expect(typeof body.complete).toBe("boolean");
  });
});

describe("POST /api/onboarding/save", () => {
  it("returns 200 { ok: true } with valid profile", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const profile: Profile = {
      nome: "Teste", setor: "Tech", produto: "SaaS",
      publico: "PMEs", diferencial: "Rápido", tom: "Direto", objetivo: "Leads",
    };
    const res = await app.request("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 400 when body is malformed", async () => {
    const res = await app.request("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "não é json",
    });
    expect(res.status).toBe(400);
  });
});

describe("getConfiguracoes", () => {
  it("returns empresa and preferencias content", async () => {
    mockReadFile
      .mockResolvedValueOnce("# Empresa\nconteudo" as unknown as Buffer)
      .mockResolvedValueOnce("# Preferências\nconteudo" as unknown as Buffer);
    const result = await getConfiguracoes();
    expect(result).toEqual({ empresa: "# Empresa\nconteudo", preferencias: "# Preferências\nconteudo" });
  });

  it("returns empty strings when files missing", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await getConfiguracoes();
    expect(result).toEqual({ empresa: "", preferencias: "" });
  });
});

describe("saveConfiguracoes", () => {
  it("writes empresa.md and preferencias.md with given content", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveConfiguracoes({ empresa: "# Empresa\nnovo", preferencias: "# Prefs\nnovo" });

    const empresaCall = mockWriteFile.mock.calls.find((c) => (c[0] as string).endsWith("empresa.md"));
    const prefCall = mockWriteFile.mock.calls.find((c) => (c[0] as string).endsWith("preferencias.md"));

    expect(empresaCall![1]).toBe("# Empresa\nnovo");
    expect(prefCall![1]).toBe("# Prefs\nnovo");
  });

  it("calls writeFile exactly twice", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    await saveConfiguracoes({ empresa: "a", preferencias: "b" });
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });
});

describe("GET /api/configuracoes", () => {
  it("returns 200 with empresa and preferencias strings", async () => {
    mockReadFile
      .mockResolvedValueOnce("# Empresa" as unknown as Buffer)
      .mockResolvedValueOnce("# Preferências" as unknown as Buffer);
    const res = await app.request("/api/configuracoes");
    expect(res.status).toBe(200);
    const body = await res.json() as { empresa: string; preferencias: string };
    expect(typeof body.empresa).toBe("string");
    expect(typeof body.preferencias).toBe("string");
  });
});

describe("PUT /api/configuracoes", () => {
  it("returns 200 { ok: true } with valid body", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const res = await app.request("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa: "# Empresa\ntest", preferencias: "# Prefs\ntest" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("returns 400 on malformed body", async () => {
    const res = await app.request("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "não é json",
    });
    expect(res.status).toBe(400);
  });
});
