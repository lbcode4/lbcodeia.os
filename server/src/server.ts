import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { listContas } from "./contas.js";
import { isAllowedSkill } from "./skills-map.js";
import { runSkill } from "./runner.js";

export const app = new Hono();

app.use("/api/*", cors()); // dev: front em :3000 chama backend em :8787

app.get("/api/contas", async (c) => {
  const contas = await listContas();
  return c.json(contas);
});

app.post("/api/skills/run", async (c) => {
  const { skill, cliente, input } = await c.req.json<{
    skill: string;
    cliente: string;
    input: string;
  }>();

  if (!isAllowedSkill(skill)) {
    return c.json({ error: `Skill não permitida: ${skill}` }, 400);
  }

  return streamSSE(c, async (stream) => {
    for await (const ev of runSkill(skill, cliente, input)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});

// Só sobe o listener quando executado direto (não nos testes).
if (process.argv[1] && process.argv[1].endsWith("server.ts")) {
  const port = Number(process.env.PORT || 8787);
  serve({ fetch: app.fetch, port });
  console.log(`lbcode-backend on http://localhost:${port}`);
}
