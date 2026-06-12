// server/src/meta-campanhas.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type Campanha = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

export type Adset = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
};

const BASE_URL = "https://graph.facebook.com/v21.0";
const CAMPANHA_FIELDS = "id,name,status,effective_status,objective,daily_budget,lifetime_budget";
const ADSET_FIELDS = "id,name,status,effective_status,daily_budget,lifetime_budget";
const ACTIVE_STATUSES = new Set(["ACTIVE", "PAUSED"]);

async function graphGet(path: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/${path}?${qs}`);
  const json = await res.json() as { error?: { message: string }; data?: unknown };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
  return json;
}

async function graphPost(path: string, token: string, body: Record<string, string>): Promise<void> {
  const res = await fetch(`${BASE_URL}/${path}?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { error?: { message: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
}

export async function readMetaToken(): Promise<string> {
  const envPath = join(import.meta.dirname, "..", "..", "integracoes", "credentials", "meta.env");
  const content = await readFile(envPath, "utf-8");
  const match = content.match(/^META_ACCESS_TOKEN=(.+)$/m);
  if (!match) throw new Error("META_ACCESS_TOKEN não encontrado em meta.env");
  return match[1].trim();
}

export async function listCampanhas(accountId: string, token: string): Promise<Campanha[]> {
  const data = await graphGet(`${accountId}/campaigns`, {
    access_token: token,
    fields: CAMPANHA_FIELDS,
    limit: "100",
  }) as { data: Campanha[] };
  return data.data.filter((c) => ACTIVE_STATUSES.has(c.status));
}

export async function setCampanhaStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}

export async function listAdsets(campaignId: string, token: string): Promise<Adset[]> {
  const data = await graphGet(`${campaignId}/adsets`, {
    access_token: token,
    fields: ADSET_FIELDS,
    limit: "100",
  }) as { data: Adset[] };
  return data.data.filter((a) => ACTIVE_STATUSES.has(a.status));
}

export async function setAdsetStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}
