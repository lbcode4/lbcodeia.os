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
