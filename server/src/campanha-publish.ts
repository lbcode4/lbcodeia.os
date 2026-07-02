// server/src/campanha-publish.ts
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { BASE_URL } from "./meta-campanhas.js";

export type CampanhaTexto = { corpo: string; titulo: string };

export type CampanhaJson = {
  tipo: string;
  nome_campanha: string;
  orcamento_diario_centavos: number;
  nome_conjunto: string;
  localizacao: { latitude: number; longitude: number; raio_km: number };
  idade_min: number;
  idade_max: number;
  textos: CampanhaTexto[];
  mensagem_inicial_whatsapp: string;
  criativos: { "1x1": string; "9x16": string } | null;
  publicado: { em: string; campaign_id: string; adset_id: string; ad_ids: string[] } | null;
};

export type ResultadoPublicacao = {
  campaign_id: string;
  adset_id: string;
  ad_ids: string[];
  sem_criativos: boolean;
};

const CAMPOS_OBRIGATORIOS: (keyof CampanhaJson)[] = [
  "tipo", "nome_campanha", "orcamento_diario_centavos", "nome_conjunto",
  "localizacao", "idade_min", "idade_max", "textos", "mensagem_inicial_whatsapp",
];

export function parseCampanhaJson(raw: string): CampanhaJson {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("campanha.json inválido (JSON malformado)");
  }
  const obj = data as Record<string, unknown>;
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (obj[campo] === undefined || obj[campo] === null) {
      throw new Error(`campanha.json inválido: campo obrigatório "${campo}" ausente`);
    }
  }
  if (!Array.isArray(obj.textos) || obj.textos.length === 0) {
    throw new Error("campanha.json inválido: \"textos\" precisa ser uma lista não-vazia");
  }
  return {
    ...(obj as unknown as CampanhaJson),
    criativos: (obj.criativos as CampanhaJson["criativos"]) ?? null,
    publicado: (obj.publicado as CampanhaJson["publicado"]) ?? null,
  };
}

export async function readCampanhaJson(campanhaDir: string): Promise<CampanhaJson> {
  const path = join(campanhaDir, "campanha.json");
  let raw: string;
  try {
    raw = await readFile(path, "utf-8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("campanha.json não encontrado nessa pasta");
    }
    throw e;
  }
  return parseCampanhaJson(raw);
}

export async function writeCampanhaPublicado(
  campanhaDir: string,
  campanha: CampanhaJson,
  resultado: ResultadoPublicacao,
): Promise<void> {
  const path = join(campanhaDir, "campanha.json");
  const atualizado: CampanhaJson = {
    ...campanha,
    publicado: {
      em: new Date().toISOString(),
      campaign_id: resultado.campaign_id,
      adset_id: resultado.adset_id,
      ad_ids: resultado.ad_ids,
    },
  };
  await writeFile(path, JSON.stringify(atualizado, null, 2), "utf-8");
}

async function graphPostJson(path: string, token: string, body: unknown): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { error?: { message: string }; id?: string };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Graph API error ${res.status}`);
  return json as { id: string };
}

async function uploadImagem(accountId: string, token: string, imagePath: string): Promise<string> {
  const buffer = await readFile(imagePath);
  const filename = imagePath.split("/").pop() ?? "imagem.png";
  const form = new FormData();
  form.append(filename, new Blob([new Uint8Array(buffer)]), filename);

  const res = await fetch(`${BASE_URL}/${accountId}/adimages?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: form,
  });
  const json = await res.json() as {
    error?: { message: string };
    images?: Record<string, { hash?: string }>;
  };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Erro upload imagem: ${res.status}`);
  const primeira = Object.values(json.images ?? {})[0];
  if (!primeira?.hash) throw new Error(`Hash não retornado pelo Meta ao subir ${filename}`);
  return primeira.hash;
}

export async function publishWhatsappCampanha(
  campanha: CampanhaJson,
  campanhaDir: string,
  accountId: string,
  pageId: string,
  phone: string,
  token: string,
): Promise<ResultadoPublicacao> {
  const campaign = await graphPostJson(`${accountId}/campaigns`, token, {
    name: campanha.nome_campanha,
    objective: "OUTCOME_ENGAGEMENT",
    buying_type: "AUCTION",
    status: "PAUSED",
    special_ad_categories: [],
    campaign_budget_optimization: "true",
    daily_budget: campanha.orcamento_diario_centavos,
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
  });

  const adset = await graphPostJson(`${accountId}/adsets`, token, {
    name: campanha.nome_conjunto,
    campaign_id: campaign.id,
    optimization_goal: "CONVERSATIONS",
    destination_type: "WHATSAPP",
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: {
      age_min: campanha.idade_min,
      age_max: campanha.idade_max,
      geo_locations: {
        custom_locations: [{
          latitude: campanha.localizacao.latitude,
          longitude: campanha.localizacao.longitude,
          radius: campanha.localizacao.raio_km,
          distance_unit: "kilometer",
        }],
        location_types: ["home", "recent"],
      },
      publisher_platforms: ["instagram", "whatsapp"],
      instagram_positions: ["stream", "story", "reels"],
      targeting_automation: { advantage_audience: 0 },
    },
    promoted_object: { page_id: pageId },
  });

  if (!campanha.criativos) {
    return { campaign_id: campaign.id, adset_id: adset.id, ad_ids: [], sem_criativos: true };
  }

  const hash1x1 = await uploadImagem(accountId, token, join(campanhaDir, campanha.criativos["1x1"]));
  const hash9x16 = await uploadImagem(accountId, token, join(campanhaDir, campanha.criativos["9x16"]));
  const imagens = hash9x16 !== hash1x1 ? [hash1x1, hash9x16] : [hash1x1];

  const adIds: string[] = [];
  for (let i = 0; i < campanha.textos.length; i++) {
    const { corpo, titulo } = campanha.textos[i];
    const imageHash = imagens[i % imagens.length];
    const creative = await graphPostJson(`${accountId}/adcreatives`, token, {
      name: `AD00${i + 1} ${campanha.nome_campanha}`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: corpo,
          name: titulo,
          image_hash: imageHash,
          call_to_action: {
            type: "WHATSAPP_MESSAGE",
            value: { app_destination: "WHATSAPP", link: `https://wa.me/${phone}` },
          },
        },
      },
      degrees_of_freedom_spec: {
        creative_features_spec: {
          IMAGE_ANIMATION: { enroll_status: "OPT_OUT" },
          TEXT_OVERLAY_TRANSLATION: { enroll_status: "OPT_OUT" },
        },
      },
    });

    const ad = await graphPostJson(`${accountId}/ads`, token, {
      name: `AD00${i + 1} ${campanha.nome_campanha}`,
      adset_id: adset.id,
      creative: { creative_id: creative.id },
      status: "PAUSED",
    });
    adIds.push(ad.id);
  }

  return { campaign_id: campaign.id, adset_id: adset.id, ad_ids: adIds, sem_criativos: false };
}

export type PublisherFn = (
  campanha: CampanhaJson,
  campanhaDir: string,
  accountId: string,
  pageId: string,
  phone: string,
  token: string,
) => Promise<ResultadoPublicacao>;

export const PUBLISHERS: Record<string, PublisherFn> = {
  whatsapp: publishWhatsappCampanha,
};
