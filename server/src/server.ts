import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { listContas } from "./contas.js";
import { isAllowedSkill } from "./skills-map.js";
import { runSkill, loadResult } from "./runner.js";
import { listCampaigns, readCampaignFile } from "./prospeccao.js";
import { listConteudo, readConteudoArquivo, updateConteudoStatus } from "./conteudo.js";
import { createSite, listSites, readSiteHtml, writeSiteHtml, streamSiteChat, type ChatMessage } from "./sites.js";
import { listCarrosseis, readSlide } from "./carrosseis.js";
import { listIdentidade, readIdentidadeArquivo, listInspiracoes, saveInspiracao, readInspiracao } from "./identidade.js";
import { saveReferencia, readReferencia, deleteReferencias } from "./referencias-temp.js";
import { getBiblioteca, readBibliotecaFile } from "./biblioteca.js";
import { getDashboardData } from "./dashboard.js";
import { runChat } from "./chat.js";
import { getOnboardingStatus, saveOnboarding, getConfiguracoes, saveConfiguracoes, getAiConfig, saveAiConfig, type Profile, type Configuracoes, type AiConfig } from "./onboarding.js";
import { listCampanhas, setCampanhaStatus, listAdsets, setAdsetStatus, readMetaToken } from "./meta-campanhas.js";

export const app = new Hono();

app.use("/api/*", cors()); // dev: front em :3000 chama backend em :8787

app.get("/api/contas", async (c) => {
  try {
    const contas = await listContas();
    return c.json(contas);
  } catch {
    return c.json({ error: "Falha ao carregar contas" }, 500);
  }
});

app.post("/api/skills/run", async (c) => {
  let body: { skill: string; cliente: string; input: string; model?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo inválido: JSON esperado" }, 400);
  }
  const { skill, cliente, input, model } = body;

  if (!skill || !isAllowedSkill(skill)) {
    return c.json({ error: `Skill não permitida: ${skill}` }, 400);
  }

  return streamSSE(c, async (stream) => {
    for await (const ev of runSkill(skill, cliente, input, model)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});

app.get("/api/results/:skill", async (c) => {
  const skill = c.req.param("skill");
  const cliente = c.req.query("cliente") ?? "";
  const result = await loadResult(skill, cliente);
  if (!result) return c.json({ error: "Sem resultado salvo" }, 404);
  return c.json(result);
});

app.post("/api/chat", async (c) => {
  let body: { messages: { role: "user" | "assistant"; content: string }[]; cliente?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo inválido: JSON esperado" }, 400);
  }

  return streamSSE(c, async (stream) => {
    for await (const ev of runChat(body.messages, body.cliente)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});

app.get("/api/prospeccao", async (c) => {
  try {
    return c.json(await listCampaigns());
  } catch {
    return c.json({ error: "Falha ao carregar prospecções" }, 500);
  }
});

app.get("/api/prospeccao/arquivo", async (c) => {
  const campaign = c.req.query("campaign");
  const file = c.req.query("file");
  if (!campaign || !file) return c.json({ error: "campaign e file obrigatórios" }, 400);
  try {
    return c.text(await readCampaignFile(campaign, file));
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido")
      return c.json({ error: "Arquivo não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.get("/api/carrosseis", async (c) => {
  try {
    return c.json(await listCarrosseis());
  } catch {
    return c.json({ error: "Falha ao carregar carrosseis" }, 500);
  }
});

app.get("/api/carrosseis/slide", async (c) => {
  const carrosselId = c.req.query("id");
  const filename = c.req.query("slide");
  if (!carrosselId || !filename) return c.json({ error: "id e slide obrigatórios" }, 400);
  try {
    const buf = await readSlide(carrosselId, filename);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    return new Response(buf.buffer as ArrayBuffer, { headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" } });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido")
      return c.json({ error: "Slide não encontrado" }, 404);
    return c.json({ error: "Erro ao ler slide" }, 500);
  }
});

app.get("/api/identidade", async (c) => {
  try {
    return c.json(await listIdentidade());
  } catch {
    return c.json({ error: "Falha ao carregar identidade" }, 500);
  }
});

app.get("/api/identidade/arquivo", async (c) => {
  const file = c.req.query("file");
  if (!file) return c.json({ error: "file obrigatório" }, 400);
  try {
    const { buf, mime } = await readIdentidadeArquivo(file);
    return new Response(buf.buffer as ArrayBuffer, {
      headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Caminho inválido" || msg === "Tipo inválido") return c.json({ error: "Arquivo não encontrado" }, 404);
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Arquivo não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.get("/api/carrosseis/inspiracoes", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    return c.json(await listInspiracoes(id));
  } catch {
    return c.json({ error: "Falha ao listar inspirações" }, 500);
  }
});

app.post("/api/carrosseis/inspiracoes", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Multipart inválido" }, 400);
  }
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "Campo 'file' obrigatório" }, 400);
  const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
  if (!ALLOWED.includes(file.type)) return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeName = `${Date.now()}.${ext}`;
  try {
    await saveInspiracao(id, safeName, Buffer.from(await file.arrayBuffer()));
    return c.json({ ok: true, filename: safeName });
  } catch (e) {
    if ((e as Error).message === "Caminho inválido") return c.json({ error: "id inválido" }, 400);
    if ((e as Error).message === "Tipo inválido") return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
    return c.json({ error: "Erro ao salvar" }, 500);
  }
});

app.get("/api/carrosseis/inspiracao", async (c) => {
  const id = c.req.query("id");
  const file = c.req.query("file");
  if (!id || !file) return c.json({ error: "id e file obrigatórios" }, 400);
  try {
    const { buf, mime } = await readInspiracao(id, file);
    return new Response(buf.buffer as ArrayBuffer, {
      headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Caminho inválido" || msg === "Tipo inválido") return c.json({ error: "Não encontrado" }, 404);
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.post("/api/carrosseis/referencias", async (c) => {
  const sessionId = c.req.query("sessionId");
  if (!sessionId) return c.json({ error: "sessionId obrigatório" }, 400);
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: "Multipart inválido" }, 400);
  }
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "Campo 'file' obrigatório" }, 400);
  const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
  if (!ALLOWED.includes(file.type)) return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
  if (file.size > 10 * 1024 * 1024) return c.json({ error: "Arquivo muito grande. Máximo 10MB." }, 400);
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const ext = `.${rawExt}`;
  try {
    const filename = await saveReferencia(sessionId, ext, Buffer.from(await file.arrayBuffer()));
    return c.json({ ok: true, filename });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido" || msg === "Caminho inválido") return c.json({ error: "sessionId inválido" }, 400);
    if (msg === "Tipo inválido") return c.json({ error: "Tipo inválido. Use PNG, JPG ou WebP." }, 400);
    return c.json({ error: "Erro ao salvar" }, 500);
  }
});

app.get("/api/carrosseis/referencia", async (c) => {
  const sessionId = c.req.query("sessionId");
  const file = c.req.query("file");
  if (!sessionId || !file) return c.json({ error: "sessionId e file obrigatórios" }, 400);
  try {
    const { buf, mime } = await readReferencia(sessionId, file);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": mime } });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido" || msg === "Caminho inválido" || msg === "Tipo inválido") {
      return c.json({ error: "Não encontrado" }, 404);
    }
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return c.json({ error: "Não encontrado" }, 404);
    return c.json({ error: "Erro ao ler" }, 500);
  }
});

app.delete("/api/carrosseis/referencias", async (c) => {
  const sessionId = c.req.query("sessionId");
  if (!sessionId) return c.json({ error: "sessionId obrigatório" }, 400);
  try {
    await deleteReferencias(sessionId);
    return c.json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "sessionId inválido") return c.json({ error: "sessionId inválido" }, 400);
    return c.json({ error: "Erro ao deletar" }, 500);
  }
});

app.get("/api/dashboard/data", async (c) => {
  try {
    const cliente = c.req.query("cliente");
    return c.json(await getDashboardData(cliente));
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.get("/api/sites", async (c) => {
  try {
    return c.json(await listSites());
  } catch {
    return c.json({ error: "Falha ao listar sites" }, 500);
  }
});

app.get("/api/sites/html", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const html = await readSiteHtml(id);
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido")
      return c.json({ error: "Site não encontrado" }, 404);
    return c.json({ error: "Erro ao ler site" }, 500);
  }
});

app.put("/api/sites/html", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "id obrigatório" }, 400);
  try {
    const { html } = await c.req.json<{ html: string }>();
    await writeSiteHtml(id, html);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.post("/api/sites", async (c) => {
  let body: { name: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return c.json({ error: "name obrigatório" }, 400);
  }
  try {
    const id = await createSite(body.name.trim());
    return c.json({ id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "Caminho inválido") return c.json({ error: "Nome de site inválido" }, 400);
    return c.json({ error: "Erro interno" }, 500);
  }
});

app.post("/api/sites/chat", async (c) => {
  let body: { html: string; instruction: string; images?: { mediaType: string; data: string }[]; history?: ChatMessage[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const { html, instruction, images = [], history = [] } = body;
  if (!html || !instruction) return c.json({ error: "html e instruction obrigatórios" }, 400);

  return streamSSE(c, async (stream) => {
    for await (const ev of streamSiteChat(html, instruction, images, history)) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
      if (ev.type === "done" || ev.type === "error") break;
    }
  });
});

app.get("/api/conteudo", async (c) => {
  try {
    return c.json(await listConteudo());
  } catch {
    return c.json({ error: "Falha ao carregar conteúdo" }, 500);
  }
});

app.get("/api/conteudo/arquivo", async (c) => {
  const tipo = c.req.query("tipo");
  const id = c.req.query("id");
  const arquivo = c.req.query("arquivo");
  if (!tipo || !id || !arquivo) return c.json({ error: "tipo, id e arquivo obrigatórios" }, 400);
  try {
    return c.text(await readConteudoArquivo(tipo, id, arquivo));
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido" || (e as Error).message === "Tipo inválido")
      return c.json({ error: "Arquivo não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.put("/api/conteudo/status", async (c) => {
  let body: { tipo: string; id: string; arquivo: string; status: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  const { tipo, id, arquivo, status } = body;
  if (!tipo || !id || !arquivo || !status) return c.json({ error: "tipo, id, arquivo e status obrigatórios" }, 400);
  try {
    await updateConteudoStatus(tipo, id, arquivo, status);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

app.get("/api/biblioteca", async (c) => {
  try {
    return c.json(await getBiblioteca());
  } catch {
    return c.json({ error: "Falha ao carregar biblioteca" }, 500);
  }
});

app.get("/api/biblioteca/arquivo", async (c) => {
  const path = c.req.query("path");
  if (!path) return c.json({ error: "path obrigatório" }, 400);
  try {
    const { content, ext } = await readBibliotecaFile(path);
    const mimeMap: Record<string, string> = {
      ".md": "text/plain; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const mime = mimeMap[ext] ?? "application/octet-stream";
    const isText = mime.startsWith("text/");
    return new Response(isText ? content.toString("utf-8") : (content.buffer as ArrayBuffer), {
      headers: { "Content-Type": mime, "Cache-Control": "max-age=3600" },
    });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || (e as Error).message === "Caminho inválido")
      return c.json({ error: "Arquivo não encontrado" }, 404);
    return c.json({ error: "Erro ao ler arquivo" }, 500);
  }
});

app.get("/api/onboarding/status", async (c) => {
  return c.json(await getOnboardingStatus());
});

app.post("/api/onboarding/save", async (c) => {
  let body: Profile;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  await saveOnboarding(body);
  return c.json({ ok: true });
});

app.get("/api/configuracoes", async (c) => {
  return c.json(await getConfiguracoes());
});

app.put("/api/configuracoes", async (c) => {
  let body: Configuracoes;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSON inválido" }, 400);
  }
  await saveConfiguracoes(body);
  return c.json({ ok: true });
});

app.get("/api/ai-config", async (c) => {
  try {
    return c.json(await getAiConfig());
  } catch {
    return c.json({ error: "Falha ao carregar ai-config" }, 500);
  }
});

app.put("/api/ai-config", async (c) => {
  let body: AiConfig;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Corpo inválido: JSON esperado" }, 400);
  }
  if (!body.carrosselModel || typeof body.carrosselModel !== "string") {
    return c.json({ error: "carrosselModel é obrigatório" }, 400);
  }
  const ALLOWED_CARROSSEL_MODELS = [
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-6",
    "claude-opus-4-8",
  ];
  if (!ALLOWED_CARROSSEL_MODELS.includes(body.carrosselModel)) {
    return c.json({ error: "modelo não permitido" }, 400);
  }
  await saveAiConfig(body);
  return c.json({ ok: true });
});

app.get("/api/meta/campanhas", async (c) => {
  const cliente = c.req.query("cliente");
  if (!cliente) return c.json({ error: "cliente obrigatório" }, 400);
  try {
    const contas = await listContas();
    const conta = contas.find((ct) => ct.cliente === cliente);
    if (!conta?.metaAdAccount) return c.json({ error: "Conta Meta não configurada para este cliente" }, 404);
    const token = await readMetaToken();
    const campanhas = await listCampanhas(conta.metaAdAccount, token);
    return c.json(campanhas);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.put("/api/meta/campanhas/:id/status", async (c) => {
  const id = c.req.param("id");
  let body: { status: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "JSON inválido" }, 400); }
  if (body.status !== "ACTIVE" && body.status !== "PAUSED") {
    return c.json({ error: "status deve ser ACTIVE ou PAUSED" }, 400);
  }
  try {
    const token = await readMetaToken();
    const status = body.status as "ACTIVE" | "PAUSED";
    await setCampanhaStatus(id, status, token);
    return c.json({ id, new_status: status });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.get("/api/meta/adsets", async (c) => {
  const campanha_id = c.req.query("campanha_id");
  const cliente = c.req.query("cliente");
  if (!campanha_id || !cliente) return c.json({ error: "campanha_id e cliente obrigatórios" }, 400);
  try {
    const token = await readMetaToken();
    const adsets = await listAdsets(campanha_id, token);
    return c.json(adsets);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

app.put("/api/meta/adsets/:id/status", async (c) => {
  const id = c.req.param("id");
  let body: { status: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "JSON inválido" }, 400); }
  if (body.status !== "ACTIVE" && body.status !== "PAUSED") {
    return c.json({ error: "status deve ser ACTIVE ou PAUSED" }, 400);
  }
  try {
    const token = await readMetaToken();
    const status = body.status as "ACTIVE" | "PAUSED";
    await setAdsetStatus(id, status, token);
    return c.json({ id, new_status: status });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 502);
  }
});

// Só sobe o listener quando executado direto (não nos testes).
if (process.argv[1] && /server\.(ts|js)$/.test(process.argv[1])) {
  const port = Number(process.env.PORT || 8787);
  serve({ fetch: app.fetch, port });
  console.log(`lbcode-backend on http://localhost:${port}`);
}
