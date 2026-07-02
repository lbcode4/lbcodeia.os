import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readLegenda, writeLegenda } from "./carrosseis.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const FIXTURE_ID = "teste-legenda-fixture";
const FIXTURE_DIR = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel", FIXTURE_ID);

beforeAll(async () => {
  await mkdir(FIXTURE_DIR, { recursive: true });
  await writeFile(join(FIXTURE_DIR, "legenda.md"), "legenda de fixture pra teste", "utf-8");
});

afterAll(async () => {
  await rm(FIXTURE_DIR, { recursive: true, force: true });
});

describe("readLegenda", () => {
  it("lê legenda.md existente", async () => {
    const legenda = await readLegenda(FIXTURE_ID);
    expect(legenda).toBe("legenda de fixture pra teste");
  });

  it("retorna string vazia se carrossel não tem legenda.md", async () => {
    const legenda = await readLegenda("carrossel-que-nao-existe");
    expect(legenda).toBe("");
  });

  it("rejeita id com path traversal", async () => {
    await expect(readLegenda("../../etc")).rejects.toThrow("Caminho inválido");
  });
});

describe("writeLegenda", () => {
  it("escreve e a leitura seguinte reflete o novo conteúdo", async () => {
    await writeLegenda(FIXTURE_ID, "legenda de teste temporária");
    const lida = await readLegenda(FIXTURE_ID);
    expect(lida).toBe("legenda de teste temporária");
  });

  it("rejeita id com path traversal", async () => {
    await expect(writeLegenda("../../etc", "x")).rejects.toThrow("Caminho inválido");
  });
});
