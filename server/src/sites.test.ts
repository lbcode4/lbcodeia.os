import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSite, replaceImagePathsWithDataUris, formatSdkExecutionError } from "./sites.js";

describe("formatSdkExecutionError", () => {
  it("usa as mensagens de erro quando existem", () => {
    const result = formatSdkExecutionError("error_max_turns", ["limite de turnos atingido"]);
    expect(result).toBe("Execução interrompida (limite de turnos atingido) — nenhuma mudança foi salva.");
  });

  it("junta múltiplas mensagens de erro", () => {
    const result = formatSdkExecutionError("error_during_execution", ["erro A", "erro B"]);
    expect(result).toBe("Execução interrompida (erro A; erro B) — nenhuma mudança foi salva.");
  });

  it("usa o subtype como fallback quando não há mensagens de erro", () => {
    const result = formatSdkExecutionError("error_max_budget_usd", []);
    expect(result).toBe("Execução interrompida (error_max_budget_usd) — nenhuma mudança foi salva.");
  });
});

describe("replaceImagePathsWithDataUris", () => {
  it("troca uma referência ao caminho temporário por um data URI", () => {
    const html = "<div style=\"background: url('/tmp/lbsite-abc/ref-0.png') center/cover;\"></div>";
    const result = replaceImagePathsWithDataUris(
      html,
      ["/tmp/lbsite-abc/ref-0.png"],
      [{ mediaType: "image/png", data: "QUJD" }],
    );
    expect(result).toBe("<div style=\"background: url('data:image/png;base64,QUJD') center/cover;\"></div>");
  });

  it("troca todas as ocorrências do mesmo caminho", () => {
    const html = "a /tmp/x/ref-0.png b /tmp/x/ref-0.png c";
    const result = replaceImagePathsWithDataUris(
      html,
      ["/tmp/x/ref-0.png"],
      [{ mediaType: "image/png", data: "ZGF0YQ==" }],
    );
    expect(result).toBe("a data:image/png;base64,ZGF0YQ== b data:image/png;base64,ZGF0YQ== c");
  });

  it("não muda nada quando não há imagens", () => {
    const html = "<div>sem imagem</div>";
    expect(replaceImagePathsWithDataUris(html, [], [])).toBe(html);
  });

  it("não muda nada quando a IA não referenciou o caminho temporário", () => {
    const html = "<div>tudo normal, sem path</div>";
    const result = replaceImagePathsWithDataUris(
      html,
      ["/tmp/x/ref-0.png"],
      [{ mediaType: "image/png", data: "ZGF0YQ==" }],
    );
    expect(result).toBe(html);
  });
});

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  mkdtemp: vi.fn(),
  rmdir: vi.fn(),
  mkdir: vi.fn(),
}));

import { mkdir, writeFile } from "node:fs/promises";
const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => vi.clearAllMocks());

describe("createSite", () => {
  it("creates directory and writes index.html, returns id", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const id = await createSite("Minha Loja");

    expect(id).toMatch(/^minha-loja-\d{4}-\d{2}-\d{2}$/);
    expect(mockMkdir).toHaveBeenCalledTimes(1);
    expect(mockMkdir.mock.calls[0][1]).toEqual({ recursive: true });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const htmlArg = mockWriteFile.mock.calls[0][1] as string;
    expect(htmlArg).toContain("<!DOCTYPE html>");
    expect(htmlArg).toContain("Minha Loja");
  });

  it("slugifies name: removes accents, lowercases, spaces become hyphens", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const id = await createSite("Clínica Saúde & Vida");
    expect(id).toMatch(/^clinica-saude-vida-\d{4}-\d{2}-\d{2}$/);
  });

  it("throws on path traversal attempt", async () => {
    await expect(createSite("../../etc")).rejects.toThrow("Caminho inválido");
  });
});

import { app } from "./server.js";

describe("POST /api/sites", () => {
  it("returns 200 with id on valid name", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Meu Site" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { id: string };
    expect(typeof body.id).toBe("string");
    expect(body.id).toMatch(/^meu-site-\d{4}-\d{2}-\d{2}$/);
  });

  it("returns 400 on malformed body", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "não é json",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is empty", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when name slugifies to empty (only special chars)", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "!!!" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is non-string", async () => {
    const res = await app.request("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: 123 }),
    });
    expect(res.status).toBe(400);
  });
});
