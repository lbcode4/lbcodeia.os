import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";
import {
  parseCampanhaJson, readCampanhaJson, writeCampanhaPublicado,
  publishWhatsappCampanha, PUBLISHERS, type CampanhaJson,
} from "./campanha-publish.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockFetch = vi.fn();

const CAMPANHA_BASE: CampanhaJson = {
  tipo: "whatsapp",
  nome_campanha: "Mensagem WhatsApp | Teste",
  orcamento_diario_centavos: 2000,
  nome_conjunto: "Conjunto Teste",
  localizacao: { latitude: -2.4468, longitude: -54.7083, raio_km: 15 },
  idade_min: 28,
  idade_max: 55,
  textos: [{ corpo: "Corpo 1", titulo: "Título 1" }, { corpo: "Corpo 2", titulo: "Título 2" }],
  mensagem_inicial_whatsapp: "Oi! Vi o anúncio.",
  criativos: null,
  publicado: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

function mockGraphOk(id: string) {
  return { ok: true, json: async () => ({ id }) } as Response;
}

describe("parseCampanhaJson", () => {
  it("parses valid JSON with all required fields", () => {
    const result = parseCampanhaJson(JSON.stringify(CAMPANHA_BASE));
    expect(result.tipo).toBe("whatsapp");
    expect(result.textos).toHaveLength(2);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseCampanhaJson("{ not json")).toThrow("JSON malformado");
  });

  it("throws when required field is missing", () => {
    const { nome_campanha: _drop, ...semNome } = CAMPANHA_BASE;
    expect(() => parseCampanhaJson(JSON.stringify(semNome))).toThrow("nome_campanha");
  });

  it("throws when textos is empty", () => {
    expect(() => parseCampanhaJson(JSON.stringify({ ...CAMPANHA_BASE, textos: [] }))).toThrow("textos");
  });

  it("defaults criativos/publicado to null when absent", () => {
    const { criativos: _c, publicado: _p, ...semNulos } = CAMPANHA_BASE;
    const result = parseCampanhaJson(JSON.stringify(semNulos));
    expect(result.criativos).toBeNull();
    expect(result.publicado).toBeNull();
  });
});

describe("readCampanhaJson", () => {
  it("reads and parses campanha.json from dir", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(CAMPANHA_BASE) as unknown as Buffer);
    const result = await readCampanhaJson("/fake/dir");
    expect(result.nome_campanha).toBe("Mensagem WhatsApp | Teste");
    expect(mockReadFile).toHaveBeenCalledWith("/fake/dir/campanha.json", "utf-8");
  });

  it("throws friendly error when file doesn't exist", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    await expect(readCampanhaJson("/fake/dir")).rejects.toThrow("campanha.json não encontrado");
  });
});

describe("writeCampanhaPublicado", () => {
  it("merges publicado field and writes back", async () => {
    await writeCampanhaPublicado("/fake/dir", CAMPANHA_BASE, {
      campaign_id: "c1", adset_id: "a1", ad_ids: ["ad1", "ad2"], sem_criativos: false,
    });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const [path, content] = mockWriteFile.mock.calls[0] as [string, string];
    expect(path).toBe("/fake/dir/campanha.json");
    const written = JSON.parse(content);
    expect(written.publicado.campaign_id).toBe("c1");
    expect(written.publicado.ad_ids).toEqual(["ad1", "ad2"]);
    expect(written.nome_campanha).toBe(CAMPANHA_BASE.nome_campanha);
  });
});

describe("publishWhatsappCampanha", () => {
  it("creates campaign + adset only when criativos is null", async () => {
    mockFetch
      .mockResolvedValueOnce(mockGraphOk("campaign_123"))
      .mockResolvedValueOnce(mockGraphOk("adset_456"));

    const result = await publishWhatsappCampanha(
      CAMPANHA_BASE, "/fake/dir", "act_1", "page_1", "5500000000", "token",
    );

    expect(result).toEqual({
      campaign_id: "campaign_123", adset_id: "adset_456", ad_ids: [], sem_criativos: true,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const campaignBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(campaignBody.bid_strategy).toBe("LOWEST_COST_WITHOUT_CAP");
    expect(campaignBody.status).toBe("PAUSED");

    const adsetBody = JSON.parse((mockFetch.mock.calls[1][1] as RequestInit).body as string);
    expect(adsetBody.destination_type).toBe("WHATSAPP");
    expect(adsetBody.targeting.targeting_automation).toEqual({ advantage_audience: 0 });
    expect(adsetBody.promoted_object).toEqual({ page_id: "page_1" });
  });

  it("uploads images and creates 1 ad per texto when criativos present", async () => {
    const campanha: CampanhaJson = {
      ...CAMPANHA_BASE,
      criativos: { "1x1": "criativos/ad-1x1.png", "9x16": "criativos/ad-9x16.png" },
    };
    mockReadFile.mockResolvedValue(Buffer.from("fake-image-bytes"));
    mockFetch
      .mockResolvedValueOnce(mockGraphOk("campaign_1"))
      .mockResolvedValueOnce(mockGraphOk("adset_1"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: { "ad-1x1.png": { hash: "hash1x1" } } }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ images: { "ad-9x16.png": { hash: "hash9x16" } } }) } as Response)
      .mockResolvedValueOnce(mockGraphOk("creative_1"))
      .mockResolvedValueOnce(mockGraphOk("ad_1"))
      .mockResolvedValueOnce(mockGraphOk("creative_2"))
      .mockResolvedValueOnce(mockGraphOk("ad_2"));

    const result = await publishWhatsappCampanha(
      campanha, "/fake/dir", "act_1", "page_1", "5500000000", "token",
    );

    expect(result.sem_criativos).toBe(false);
    expect(result.ad_ids).toEqual(["ad_1", "ad_2"]);
    expect(mockFetch).toHaveBeenCalledTimes(8);
  });

  it("propagates Graph API error message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 400, json: async () => ({ error: { message: "Invalid parameter" } }),
    } as Response);
    await expect(
      publishWhatsappCampanha(CAMPANHA_BASE, "/fake/dir", "act_1", "page_1", "5500000000", "token"),
    ).rejects.toThrow("Invalid parameter");
  });
});

describe("PUBLISHERS", () => {
  it("has a publisher registered for 'whatsapp'", () => {
    expect(PUBLISHERS.whatsapp).toBe(publishWhatsappCampanha);
  });

  it("has no publisher for unsupported types", () => {
    expect(PUBLISHERS.seguidores).toBeUndefined();
  });
});
