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

export type Ad = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  effective_status: string;
  creative?: {
    id: string;
    body?: string;
    title?: string;
    image_url?: string;
    thumbnail_url?: string;
  };
};

export const BASE_URL = "https://graph.facebook.com/v21.0";
const CAMPANHA_FIELDS = "id,name,status,effective_status,objective,daily_budget,lifetime_budget";
const ADSET_FIELDS = "id,name,status,effective_status,daily_budget,lifetime_budget";
const AD_FIELDS = "id,name,status,effective_status,creative{id,body,title,image_url,thumbnail_url}";
const VALID_STATUSES = new Set(["ACTIVE", "PAUSED"]);

async function graphGet(path: string, params: Record<string, string>): Promise<unknown> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/${path}?${qs}`);
  const json = await res.json() as { error?: { message: string }; data?: unknown };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
  return json;
}

async function graphPost(path: string, token: string, body: Record<string, string>): Promise<void> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { error?: { message: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
}

async function readMetaEnvVar(key: string): Promise<string> {
  const envPath = join(import.meta.dirname, "..", "..", "integracoes", "credentials", "meta.env");
  const content = await readFile(envPath, "utf-8");
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`${key} não encontrado em meta.env`);
  return match[1].trim();
}

export async function readMetaPageId(): Promise<string> {
  return readMetaEnvVar("META_PAGE_ID");
}

export async function readMetaWhatsappPhone(): Promise<string> {
  return readMetaEnvVar("META_WHATSAPP_PHONE");
}

export async function readMetaToken(): Promise<string> {
  try {
    return await readMetaEnvVar("META_ACCESS_TOKEN");
  } catch {
    throw new Error("META_ACCESS_TOKEN não encontrado em meta.env");
  }
}

export async function listCampanhas(accountId: string, token: string): Promise<Campanha[]> {
  const data = await graphGet(`${accountId}/campaigns`, {
    access_token: token,
    fields: CAMPANHA_FIELDS,
    limit: "100",
  }) as { data: Campanha[] };
  return data.data.filter((c) => VALID_STATUSES.has(c.status));
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
  return data.data.filter((a) => VALID_STATUSES.has(a.status));
}

export async function setAdsetStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}

export async function listAds(adsetId: string, token: string): Promise<Ad[]> {
  const data = await graphGet(`${adsetId}/ads`, {
    access_token: token,
    fields: AD_FIELDS,
    limit: "100",
  }) as { data: Ad[] };
  return data.data.filter((a) => VALID_STATUSES.has(a.status));
}

export async function setAdStatus(id: string, status: "ACTIVE" | "PAUSED", token: string): Promise<void> {
  await graphPost(id, token, { status });
}
