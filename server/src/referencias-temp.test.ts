import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  rm: vi.fn(),
}));

import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);
const mockReadFile = vi.mocked(readFile);
const mockRm = vi.mocked(rm);

beforeEach(() => vi.clearAllMocks());

import { saveReferencia, readReferencia, deleteReferencias } from "./referencias-temp.js";

describe("saveReferencia", () => {
  it("cria diretório e salva arquivo com nome timestamp", async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const buf = Buffer.from("fake-image");
    const filename = await saveReferencia("550e8400-e29b-41d4-a716-446655440000", ".png", buf);

    expect(filename).toMatch(/^\d+\.png$/);
    expect(mockMkdir).toHaveBeenCalledTimes(1);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockWriteFile.mock.calls[0][1]).toBe(buf);
  });

  it("rejeita sessionId inválido", async () => {
    await expect(saveReferencia("../../etc", ".png", Buffer.from(""))).rejects.toThrow("sessionId inválido");
  });

  it("rejeita extensão não-imagem", async () => {
    await expect(saveReferencia("550e8400-e29b-41d4-a716-446655440000", ".exe", Buffer.from(""))).rejects.toThrow("Tipo inválido");
  });
});

describe("readReferencia", () => {
  it("lê arquivo e retorna buffer + mime correto", async () => {
    const fakeBuf = Buffer.from("img");
    mockReadFile.mockResolvedValue(fakeBuf as unknown as string);

    const { buf, mime } = await readReferencia("550e8400-e29b-41d4-a716-446655440000", "1234.jpg");

    expect(buf).toBe(fakeBuf);
    expect(mime).toBe("image/jpeg");
  });

  it("rejeita sessionId inválido", async () => {
    await expect(readReferencia("../etc", "f.png")).rejects.toThrow("sessionId inválido");
  });

  it("rejeita extensão não-imagem", async () => {
    await expect(readReferencia("550e8400-e29b-41d4-a716-446655440000", "f.exe")).rejects.toThrow("Tipo inválido");
  });

  it("rejeita tentativa de path traversal no filename", async () => {
    await expect(
      readReferencia("550e8400-e29b-41d4-a716-446655440000", "../../etc/shadow.png")
    ).rejects.toThrow("Caminho inválido");
  });

  it("lê arquivo do path correto dentro da sessão", async () => {
    const fakeBuf = Buffer.from("img");
    mockReadFile.mockResolvedValue(fakeBuf as unknown as string);

    await readReferencia("550e8400-e29b-41d4-a716-446655440000", "1234.png");

    expect(mockReadFile).toHaveBeenCalledTimes(1);
    const calledPath = mockReadFile.mock.calls[0][0] as string;
    expect(calledPath).toContain("550e8400-e29b-41d4-a716-446655440000");
    expect(calledPath).toContain("1234.png");
  });
});

describe("deleteReferencias", () => {
  it("chama rm com recursive: true, force: true", async () => {
    mockRm.mockResolvedValue(undefined);

    await deleteReferencias("550e8400-e29b-41d4-a716-446655440000");

    expect(mockRm).toHaveBeenCalledTimes(1);
    expect(mockRm.mock.calls[0][1]).toEqual({ recursive: true, force: true });
  });

  it("rejeita sessionId inválido", async () => {
    await expect(deleteReferencias("nao-e-uuid")).rejects.toThrow("sessionId inválido");
  });
});
