import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
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

  it("contagem de slides rejeita false positives como class=\"slide-footer\"", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    // HTML com 1 slide real + 1 elemento com classe prefixada que não é um slide
    const html = '<div class="slide">real</div><div class="slide-footer">footer</div>';
    mockReaddir
      .mockResolvedValueOnce(["slide-01.png", "slide-02.png"] as never)
      .mockResolvedValueOnce(["slide-01.png"] as never);
    mockUnlink.mockResolvedValue(undefined);

    await writeCarrosselHtmlAndRender("teste-2026-06-21", html);

    // Deve contar apenas 1 slide (não 2), então unlink deve ser chamado 1 vez (slide-02.png)
    expect(mockUnlink).toHaveBeenCalledTimes(1);
  });

  it("conta slides com segunda classe CSS no mesmo div (formato real dos templates)", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    // Mirrors real carrossel.html templates: every slide div carries a second
    // modifier class (e.g. <div class="slide cyan">). A regex requiring the
    // character right after "slide" to be a literal backslash-then-s would
    // never match this and would undercount to 0.
    const html =
      '<div class="slide cyan">1</div>' +
      '<div class="slide dark">2</div>' +
      '<div class="slide photo">3</div>';
    mockReaddir
      .mockResolvedValueOnce(["slide-01.png", "slide-02.png", "slide-03.png", "slide-04.png"] as never)
      .mockResolvedValueOnce(["slide-01.png", "slide-02.png", "slide-03.png"] as never);
    mockUnlink.mockResolvedValue(undefined);

    const result = await writeCarrosselHtmlAndRender("teste-2026-06-21", html);

    // newCount deve ser 3 (não 0). Só slide-04.png (índice > 3) é stale.
    expect(mockUnlink).toHaveBeenCalledTimes(1);
    expect(mockUnlink).toHaveBeenCalledWith(expect.stringContaining("slide-04.png"));
    expect(result.slides).toEqual(["slide-01.png", "slide-02.png", "slide-03.png"]);
  });
});
