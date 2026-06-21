import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
  mkdtemp: vi.fn(),
  rm: vi.fn(),
}));
vi.mock("node:child_process", () => ({
  execFile: vi.fn((_cmd: unknown, _args: unknown, _opts: unknown, cb: (e: Error | null) => void) => cb(null)),
}));

import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { readCarrosselHtml, writeCarrosselHtmlAndRender } from "./carrossel-editor.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockReaddir = vi.mocked(readdir);
const mockUnlink = vi.mocked(unlink);
const mockExecFile = vi.mocked(execFile);

beforeEach(() => vi.clearAllMocks());

describe("readCarrosselHtml", () => {
  it("lê o html do carrossel", async () => {
    mockReadFile.mockResolvedValue("<html></html>" as never);
    const html = await readCarrosselHtml("dor-processo-manual-2026-06-21");
    expect(html).toBe("<html></html>");
  });

  it("rejeita path traversal", async () => {
    await expect(readCarrosselHtml("../../etc")).rejects.toThrow("Caminho inválido");
  });
});

describe("writeCarrosselHtmlAndRender", () => {
  it("escreve o html, roda o render.js e devolve os slides finais", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReaddir.mockResolvedValue(["slide-01.png"] as never);

    const result = await writeCarrosselHtmlAndRender("teste-2026-06-21", '<div class="slide">a</div>');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    expect(mockExecFile).toHaveBeenCalledTimes(1);
    expect(result.slides).toEqual(["slide-01.png"]);
  });

  it("remove PNGs sobrando quando o carrossel encolhe de slides", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    mockReaddir
      .mockResolvedValueOnce(["slide-01.png", "slide-02.png", "slide-03.png"] as never)
      .mockResolvedValueOnce(["slide-01.png"] as never);
    mockUnlink.mockResolvedValue(undefined);

    await writeCarrosselHtmlAndRender("teste-2026-06-21", '<div class="slide">só uma agora</div>');

    expect(mockUnlink).toHaveBeenCalledTimes(2);
  });

  it("rejeita path traversal", async () => {
    await expect(writeCarrosselHtmlAndRender("../../etc", "<html></html>")).rejects.toThrow("Caminho inválido");
  });
});
