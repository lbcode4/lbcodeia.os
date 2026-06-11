import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSite } from "./sites.js";

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
