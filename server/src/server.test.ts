import { describe, it, expect } from "vitest";
import { app } from "./server.js";

describe("GET /api/contas", () => {
  it("retorna lista de contas com Dordrian", async () => {
    const res = await app.request("/api/contas");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((c: { cliente: string }) => c.cliente.includes("Dordrian"))).toBe(true);
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
