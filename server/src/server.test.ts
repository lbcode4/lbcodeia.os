import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "./server.js";

describe("GET /api/contas", () => {
  it("retorna lista de contas com Loja Beta", async () => {
    const res = await app.request("/api/contas");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((c: { cliente: string }) => c.cliente.includes("Loja Beta"))).toBe(true);
  });
});

describe("POST /api/skills/run validação", () => {
  it("rejeita skill não permitida com 400", async () => {
    const res = await app.request("/api/skills/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "nao-existe", cliente: "X", input: "y" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejeita corpo malformado com 400", async () => {
    const res = await app.request("/api/skills/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "isto não é json",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/identidade", () => {
  it("retorna logo e refs", async () => {
    const res = await app.request("/api/identidade");
    expect(res.status).toBe(200);
    const body = await res.json() as { logo: unknown; refs: unknown[] };
    expect(body).toHaveProperty("logo");
    expect(Array.isArray(body.refs)).toBe(true);
  });
});

describe("GET /api/identidade/arquivo", () => {
  it("retorna 400 quando file não informado", async () => {
    const res = await app.request("/api/identidade/arquivo");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para arquivo inexistente", async () => {
    const res = await app.request("/api/identidade/arquivo?file=naoexiste.png");
    expect(res.status).toBe(404);
  });

  it("retorna 404 para extensão não-imagem", async () => {
    const res = await app.request("/api/identidade/arquivo?file=design-guide.md");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/carrosseis/inspiracoes", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/inspiracoes");
    expect(res.status).toBe(400);
  });

  it("retorna array vazio para carrossel sem inspirações", async () => {
    const res = await app.request("/api/carrosseis/inspiracoes?id=carrossel-que-nao-existe");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });
});

describe("GET /api/carrosseis/inspiracao", () => {
  it("retorna 400 quando id ou file não informados", async () => {
    const res = await app.request("/api/carrosseis/inspiracao?id=foo");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para inspiração inexistente", async () => {
    const res = await app.request("/api/carrosseis/inspiracao?id=naoexiste&file=naoexiste.png");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/carrosseis inclui campo inspiracoes", () => {
  it("cada item tem campo inspiracoes numérico", async () => {
    const res = await app.request("/api/carrosseis");
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ inspiracoes: unknown }>;
    if (body.length > 0) {
      expect(typeof body[0]!.inspiracoes).toBe("number");
    }
  });
});

describe("GET /api/meta/campanhas", () => {
  it("retorna 400 quando cliente não informado", async () => {
    const res = await app.request("/api/meta/campanhas");
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("cliente");
  });
});

describe("PUT /api/meta/campanhas/:id/status", () => {
  it("retorna 400 para status inválido", async () => {
    const res = await app.request("/api/meta/campanhas/cam_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INVALID" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain("ACTIVE");
  });

  it("retorna 400 para JSON malformado", async () => {
    const res = await app.request("/api/meta/campanhas/cam_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "isso nao eh json",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/meta/adsets", () => {
  it("retorna 400 quando campanha_id não informado", async () => {
    const res = await app.request("/api/meta/adsets?cliente=X");
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando cliente não informado", async () => {
    const res = await app.request("/api/meta/adsets?campanha_id=123");
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/meta/adsets/:id/status", () => {
  it("retorna 400 para status inválido", async () => {
    const res = await app.request("/api/meta/adsets/ads_123/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "NOPE" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/carrosseis/referencias", () => {
  it("retorna 400 quando sessionId não informado", async () => {
    const res = await app.request("/api/carrosseis/referencias", { method: "POST" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para sessionId inválido (não-UUID)", async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["x"], { type: "image/png" }), "x.png");
    const res = await app.request("/api/carrosseis/referencias?sessionId=nao-e-uuid", {
      method: "POST",
      body: fd,
    });
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando campo 'file' ausente", async () => {
    const fd = new FormData();
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "POST", body: fd },
    );
    expect(res.status).toBe(400);
  });

  it("retorna 400 para tipo de arquivo inválido", async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["x"], { type: "text/plain" }), "x.txt");
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "POST", body: fd },
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/carrosseis/referencia", () => {
  it("retorna 400 quando sessionId ou file ausentes", async () => {
    const res = await app.request("/api/carrosseis/referencia?sessionId=550e8400-e29b-41d4-a716-446655440000");
    expect(res.status).toBe(400);
  });

  it("retorna 404 para arquivo inexistente", async () => {
    const res = await app.request(
      "/api/carrosseis/referencia?sessionId=550e8400-e29b-41d4-a716-446655440000&file=naoexiste.png",
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/carrosseis/referencias", () => {
  it("retorna 400 quando sessionId não informado", async () => {
    const res = await app.request("/api/carrosseis/referencias", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para sessionId inválido", async () => {
    const res = await app.request("/api/carrosseis/referencias?sessionId=nao-e-uuid", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("retorna 200 para sessionId UUID válido (mesmo que pasta não exista — rm force)", async () => {
    const res = await app.request(
      "/api/carrosseis/referencias?sessionId=550e8400-e29b-41d4-a716-446655440000",
      { method: "DELETE" },
    );
    expect(res.status).toBe(200);
  });
});

describe("GET /api/biblioteca/campanhas-meta", () => {
  it("retorna 200 com array", async () => {
    const res = await app.request("/api/biblioteca/campanhas-meta");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("POST /api/biblioteca/campanhas/publicar", () => {
  it("retorna 400 quando path ausente", async () => {
    const res = await app.request("/api/biblioteca/campanhas/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente: "X" }),
    });
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando cliente ausente", async () => {
    const res = await app.request("/api/biblioteca/campanhas/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "saidas/marketing/campanhas/conversao/x" }),
    });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para JSON malformado", async () => {
    const res = await app.request("/api/biblioteca/campanhas/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "isso nao eh json",
    });
    expect(res.status).toBe(400);
  });

  it("retorna 400 para path fora de saidas/marketing/campanhas", async () => {
    const res = await app.request("/api/biblioteca/campanhas/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "integracoes/credentials", cliente: "X" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("Caminho inválido");
  });

  it("retorna 404 quando pasta não tem campanha.json", async () => {
    const res = await app.request("/api/biblioteca/campanhas/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "saidas/marketing/campanhas/conversao/pasta-que-nao-existe", cliente: "X" }),
    });
    expect(res.status).toBe(404);
  });
});

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const LEGENDA_FIXTURE_ID = "server-legenda-fixture";
const LEGENDA_FIXTURE_DIR = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel", LEGENDA_FIXTURE_ID);

beforeAll(async () => {
  await mkdir(LEGENDA_FIXTURE_DIR, { recursive: true });
  await writeFile(join(LEGENDA_FIXTURE_DIR, "legenda.md"), "legenda de fixture pra rota", "utf-8");
});

afterAll(async () => {
  await rm(LEGENDA_FIXTURE_DIR, { recursive: true, force: true });
});

describe("GET /api/carrosseis/legenda", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/legenda");
    expect(res.status).toBe(400);
  });

  it("retorna legenda do carrossel de teste", async () => {
    const res = await app.request(`/api/carrosseis/legenda?id=${LEGENDA_FIXTURE_ID}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { legenda: string };
    expect(body.legenda).toBe("legenda de fixture pra rota");
  });

  it("retorna string vazia pra carrossel sem legenda", async () => {
    const res = await app.request("/api/carrosseis/legenda?id=carrossel-que-nao-existe");
    expect(res.status).toBe(200);
    const body = await res.json() as { legenda: string };
    expect(body.legenda).toBe("");
  });
});

describe("PUT /api/carrosseis/legenda", () => {
  it("retorna 400 quando id não informado", async () => {
    const res = await app.request("/api/carrosseis/legenda", { method: "PUT" });
    expect(res.status).toBe(400);
  });

  it("escreve e a leitura seguinte reflete o novo conteúdo", async () => {
    const putRes = await app.request(`/api/carrosseis/legenda?id=${LEGENDA_FIXTURE_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legenda: "legenda via rota, teste" }),
    });
    expect(putRes.status).toBe(200);
    const checkRes = await app.request(`/api/carrosseis/legenda?id=${LEGENDA_FIXTURE_ID}`);
    const { legenda: lida } = await checkRes.json() as { legenda: string };
    expect(lida).toBe("legenda via rota, teste");
  });
});

const INSPIRACAO_FIXTURE_ID = "server-inspiracao-fixture";
const INSPIRACAO_FIXTURE_DIR = join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel", INSPIRACAO_FIXTURE_ID, "inspiracoes");

beforeAll(async () => {
  await mkdir(INSPIRACAO_FIXTURE_DIR, { recursive: true });
  await writeFile(join(INSPIRACAO_FIXTURE_DIR, "fixture.png"), "png de teste", "utf-8");
});

afterAll(async () => {
  await rm(join(REPO_ROOT, "saidas", "marketing", "conteudo", "carrossel", INSPIRACAO_FIXTURE_ID), { recursive: true, force: true });
});

describe("DELETE /api/carrosseis/inspiracao", () => {
  it("retorna 400 quando id ou file não informados", async () => {
    const res = await app.request("/api/carrosseis/inspiracao?id=foo", { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  it("retorna 404 pra imagem inexistente", async () => {
    const res = await app.request(`/api/carrosseis/inspiracao?id=${INSPIRACAO_FIXTURE_ID}&file=naoexiste.png`, { method: "DELETE" });
    expect(res.status).toBe(404);
  });

  it("remove a imagem e a listagem seguinte não inclui mais ela", async () => {
    const listBefore = await app.request(`/api/carrosseis/inspiracoes?id=${INSPIRACAO_FIXTURE_ID}`);
    expect(await listBefore.json()).toContain("fixture.png");

    const delRes = await app.request(`/api/carrosseis/inspiracao?id=${INSPIRACAO_FIXTURE_ID}&file=fixture.png`, { method: "DELETE" });
    expect(delRes.status).toBe(200);

    const listAfter = await app.request(`/api/carrosseis/inspiracoes?id=${INSPIRACAO_FIXTURE_ID}`);
    expect(await listAfter.json()).not.toContain("fixture.png");
  });
});
