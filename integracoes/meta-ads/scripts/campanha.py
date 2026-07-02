"""
campanha.py — cria campanha WhatsApp completa via Meta Marketing API v21.

Fluxo:
  1. Cria campanha (OUTCOME_ENGAGEMENT, CBO, PAUSED)
  2. Cria conjunto de anúncio (WhatsApp, público manual, sem Facebook)
  3. Faz upload dos criativos (1:1 + 9:16) se caminhos fornecidos
  4. Cria anúncio com asset_feed_spec (5 textos + 5 títulos + 2 formatos)
  5. Salva resultado em output/campanha-criada-{date}.json

Uso:
  python campanha.py --dry-run
  python campanha.py --image-1x1 /path/ad001-1x1.png --image-9x16 /path/ad001-9x16.png
  python campanha.py --step campaign          # só cria campanha
  python campanha.py --step adset --campaign-id <id>
  python campanha.py --step ad --adset-id <id>  --image-1x1 ... --image-9x16 ...

Variáveis de ambiente (integracoes/credentials/meta.env):
  META_ACCESS_TOKEN          obrigatório
  META_AD_ACCOUNT_ID         obrigatório (ex: act_1234567890)
  META_PAGE_ID               obrigatório (página FB vinculada ao WhatsApp)
  META_WHATSAPP_PHONE        obrigatório (somente dígitos, ex: 5593999990000)
"""

import argparse
import json
import os
import sys
from datetime import datetime

import requests

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

# ─── Configuração da campanha (meta-whatsapp-2026-06-24) ────────────────────

CAMPAIGN_NAME = "Mensagem WhatsApp | Santarém/PA | Diagnóstico Gratuito"
ADSET_NAME    = "Gestores PME | Santarém/PA | Diagnóstico"
AD_NAME       = "AD001 Diagnóstico Gratuito"

DAILY_BUDGET_CENTS = 2000  # R$ 20,00

# Santarém/PA — centro da área urbana
LOCATION = {
    "latitude": -2.4468,
    "longitude": -54.7083,
    "radius": 15,
    "distance_unit": "kilometer",
}

AGE_MIN = 28
AGE_MAX = 55

BODY_TEXTS = [
    (
        "O problema da sua empresa não é falta de sistema.\n\n"
        "É ter sistema errado — ou não ter nenhum e resolver tudo no braço.\n\n"
        "Sua equipe copia dado de planilha pra planilha. Informação some. Decisão tarda.\n"
        "Você passa mais tempo apagando incêndio do que gerindo o negócio.\n\n"
        "Isso não é falta de esforço. É falta de estrutura.\n\n"
        "Me chama no WhatsApp. Faço um diagnóstico gratuito pra você ver exatamente onde estão os gargalos."
    ),
    (
        "Quantas horas por semana sua equipe perde com processos manuais?\n\n"
        "Se a resposta for \"não sei\" — esse é o primeiro problema.\n\n"
        "Planilha desatualizada, dado no papel, sistema que não conversa com nenhum outro.\n"
        "Isso custa caro. Em hora, em erro, em oportunidade perdida.\n\n"
        "Chama no WhatsApp. 30 minutos de conversa e eu mostro onde você tá perdendo dinheiro sem perceber."
    ),
    (
        "Dono de empresa em Santarém — leia isso antes de contratar mais um colaborador.\n\n"
        "A maioria das empresas que atendo não precisa de mais gente.\n"
        "Precisa de processo.\n\n"
        "Quando o processo tá errado, mais gente = mais caos.\n"
        "Quando o processo tá certo, o mesmo time entrega 3x mais.\n\n"
        "Me chama no WhatsApp. Faço diagnóstico gratuito pra mapear onde a sua operação trava."
    ),
    (
        "\"A gente perde muito tempo com isso, mas sempre foi assim.\"\n\n"
        "Essa frase é o sinal mais claro de que a empresa está deixando dinheiro na mesa.\n\n"
        "Processo manual não é cultura. É risco.\n"
        "Qualquer erro humano, qualquer saída de colaborador — e o negócio paralisa.\n\n"
        "Não precisa ser assim. Me chama no WhatsApp e a gente vê juntos o que dá pra resolver."
    ),
    (
        "Sistema sob medida com IA não é luxo de empresa grande.\n\n"
        "É o que faz uma média empresa competir com empresa maior usando metade do time.\n\n"
        "Automação de processos, dashboard gerencial em tempo real, integração entre sistemas.\n"
        "Entrego isso em semanas, não meses.\n\n"
        "Chama no WhatsApp. Diagnóstico gratuito pra ver se faz sentido pro seu negócio."
    ),
]

TITLES = [
    "Diagnóstico gratuito da sua operação",
    "Veja onde sua empresa perde tempo e dinheiro",
    "Sistemas que funcionam. Sem planilha, sem retrabalho.",
    "Automação sob medida pra sua empresa",
    "Menos operação manual. Mais resultado.",
]

# Mensagem inicial WhatsApp — rastreia qual anúncio gerou a conversa
WA_WELCOME_MESSAGE = (
    "Oi! Vi o anúncio sobre o diagnóstico gratuito de processos. Quero saber mais."
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")


# ─── Helpers ────────────────────────────────────────────────────────────────

def _page_id():
    pid = os.getenv("META_PAGE_ID")
    if not pid:
        raise MetaAPIError("META_PAGE_ID requerido em meta.env")
    return pid


def _wa_phone():
    phone = os.getenv("META_WHATSAPP_PHONE")
    if not phone:
        raise MetaAPIError("META_WHATSAPP_PHONE requerido em meta.env (somente dígitos)")
    return phone.strip().lstrip("+")


def _wa_welcome_json(message: str) -> str:
    """Retorna string JSON da mensagem inicial WhatsApp (campo page_welcome_message)."""
    payload = {
        "type": "VISUAL_EDITOR",
        "version": 2,
        "landing_screen_type": "welcome_message",
        "media_type": "TEXT",
        "welcome_message": {
            "message": {
                "text": message,
                "tagged_message": {"text": message, "tags": []},
            },
            "type": "WHATSAPP_WELCOME_MESSAGE",
        },
    }
    return json.dumps(payload, ensure_ascii=False)


def _targeting():
    return {
        "age_min": AGE_MIN,
        "age_max": AGE_MAX,
        "geo_locations": {
            "custom_locations": [LOCATION],
            "location_types": ["home", "recent"],
        },
        "publisher_platforms": ["instagram", "whatsapp"],
        "instagram_positions": ["stream", "story", "reels"],
        "targeting_automation": {"advantage_audience": 0},
    }


def _save_result(data: dict):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    date = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    path = os.path.join(OUTPUT_DIR, f"campanha-criada-{date}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Resultado salvo em: {path}")
    return path


# ─── Criação de campanha ────────────────────────────────────────────────────

def create_campaign(client: MetaAPIClient, dry_run=False) -> str:
    payload = {
        "name": CAMPAIGN_NAME,
        "objective": "OUTCOME_ENGAGEMENT",
        "buying_type": "AUCTION",
        "status": "PAUSED",
        "special_ad_categories": [],
        "campaign_budget_optimization": "true",
        "daily_budget": DAILY_BUDGET_CENTS,
    }
    print(f"\n[CAMPANHA] {CAMPAIGN_NAME}")
    print(f"  objetivo=OUTCOME_ENGAGEMENT  CBO=sim  orçamento=R${DAILY_BUDGET_CENTS/100:.2f}/dia  status=PAUSED")
    if dry_run:
        return "DRY_RUN_CAMPAIGN_ID"
    result = client.post(f"{client.account_id}/campaigns", payload)
    cid = result["id"]
    print(f"  ✅ Campanha criada: {cid}")
    return cid


def create_adset(client: MetaAPIClient, campaign_id: str, dry_run=False) -> str:
    print(f"\n[CONJUNTO] {ADSET_NAME}")
    print(f"  destino=WHATSAPP  otimização=CONVERSATIONS  público=manual  Facebook=desabilitado")
    print(f"  localização=Santarém/PA ±{LOCATION['radius']}km  idade={AGE_MIN}–{AGE_MAX}")
    if dry_run:
        return "DRY_RUN_ADSET_ID"
    page_id = _page_id()
    payload = {
        "name": ADSET_NAME,
        "campaign_id": campaign_id,
        "optimization_goal": "CONVERSATIONS",
        "destination_type": "WHATSAPP",
        "billing_event": "IMPRESSIONS",
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "status": "PAUSED",
        "targeting": _targeting(),
        "promoted_object": {"page_id": page_id},
    }
    result = client.post(f"{client.account_id}/adsets", payload)
    aid = result["id"]
    print(f"  ✅ Conjunto criado: {aid}")
    return aid


def upload_image(client: MetaAPIClient, image_path: str, dry_run=False) -> str:
    """Faz upload de imagem e retorna o hash."""
    filename = os.path.basename(image_path)
    print(f"\n[IMAGEM] Upload: {filename}")
    if dry_run:
        return f"DRY_RUN_HASH_{filename}"
    if not os.path.exists(image_path):
        raise MetaAPIError(f"Imagem não encontrada: {image_path}")

    url = f"https://graph.facebook.com/v21.0/{client.account_id}/adimages"
    with open(image_path, "rb") as f:
        resp = requests.post(
            url,
            params={"access_token": client.token},
            files={filename: f},
            timeout=120,
        )
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise MetaAPIError(f"Erro upload imagem: {data['error'].get('message')}")
    images = data.get("images", {})
    img_data = images.get(filename) or next(iter(images.values()), {})
    image_hash = img_data.get("hash")
    if not image_hash:
        raise MetaAPIError(f"Hash não retornado pelo Meta: {data}")
    print(f"  ✅ Hash: {image_hash}")
    return image_hash


def create_ad_creatives(
    client: MetaAPIClient,
    hash_1x1: str,
    hash_9x16: str,
    dry_run=False,
) -> list:
    """Cria 1 criativo (object_story_spec/link_data) por variação de texto+título.
    Dynamic creative (asset_feed_spec) não é aceito por CONVERSATIONS/WhatsApp — usa anúncios separados."""
    images = [hash_1x1, hash_9x16] if hash_9x16 and hash_9x16 != hash_1x1 else [hash_1x1]

    print(f"\n[CRIATIVOS] {len(BODY_TEXTS)} variações (1 anúncio por texto/título)")
    print(f"  aprimoramentos Meta=OPT_OUT  CTA=WHATSAPP_MESSAGE")
    if dry_run:
        return [f"DRY_RUN_CREATIVE_ID_{i}" for i in range(len(BODY_TEXTS))]

    page_id = _page_id()
    phone = _wa_phone()
    creative_ids = []
    for i, (body, title) in enumerate(zip(BODY_TEXTS, TITLES)):
        image_hash = images[i % len(images)]
        payload = {
            "name": f"AD00{i+1} Diagnóstico Gratuito",
            "object_story_spec": {
                "page_id": page_id,
                "link_data": {
                    "message": body,
                    "name": title,
                    "image_hash": image_hash,
                    "call_to_action": {
                        "type": "WHATSAPP_MESSAGE",
                        "value": {
                            "app_destination": "WHATSAPP",
                            "link": f"https://wa.me/{phone}",
                        },
                    },
                },
            },
            # Desativa aprimoramentos Meta (chaves válidas API v21 — standard_enhancements genérico foi descontinuado)
            "degrees_of_freedom_spec": {
                "creative_features_spec": {
                    "IMAGE_ANIMATION": {"enroll_status": "OPT_OUT"},
                    "TEXT_OVERLAY_TRANSLATION": {"enroll_status": "OPT_OUT"},
                }
            },
        }
        result = client.post(f"{client.account_id}/adcreatives", payload)
        cid = result["id"]
        print(f"  ✅ Criativo {i+1}: {cid}")
        creative_ids.append(cid)
    return creative_ids


def create_ads(
    client: MetaAPIClient,
    adset_id: str,
    creative_ids: list,
    dry_run=False,
) -> list:
    print(f"\n[ANÚNCIOS] {len(creative_ids)} anúncios no conjunto {adset_id}")
    if dry_run:
        return [f"DRY_RUN_AD_ID_{i}" for i in range(len(creative_ids))]

    ad_ids = []
    for i, creative_id in enumerate(creative_ids):
        name = f"AD00{i+1} Diagnóstico Gratuito"
        payload = {
            "name": name,
            "adset_id": adset_id,
            "creative": {"creative_id": creative_id},
            "status": "PAUSED",
        }
        result = client.post(f"{client.account_id}/ads", payload)
        aid = result["id"]
        print(f"  ✅ Anúncio {i+1} ({name}): {aid}")
        ad_ids.append(aid)
    return ad_ids


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Cria campanha Meta Ads WhatsApp | LBCode.IA")
    parser.add_argument(
        "--step",
        choices=["all", "campaign", "adset", "ad"],
        default="all",
        help="Etapa a executar (padrão: all)",
    )
    parser.add_argument("--campaign-id", default=None, help="ID de campanha existente (para --step adset|ad)")
    parser.add_argument("--adset-id",    default=None, help="ID de conjunto existente (para --step ad)")
    parser.add_argument("--image-1x1",   default=None, metavar="PATH", help="Caminho do criativo 1080×1080")
    parser.add_argument("--image-9x16",  default=None, metavar="PATH", help="Caminho do criativo 1080×1920")
    parser.add_argument("--dry-run",     action="store_true", help="Simula sem chamar a API")
    parser.add_argument("--cliente",     default=None, help="Cliente (para conta específica)")
    args = parser.parse_args()

    # ── Fallback: imagens padrão da análise pronta ──────────────────────────
    CAMPAIGN_DIR = os.path.abspath(os.path.join(
        os.path.dirname(__file__),
        "..", "..", "..", "saidas", "marketing", "campanhas", "conversao",
        "meta-whatsapp-2026-06-24", "criativos",
    ))
    if not args.image_1x1:
        candidate = os.path.join(CAMPAIGN_DIR, "ad001-1x1.png")
        if os.path.exists(candidate):
            args.image_1x1 = candidate
            print(f"[INFO] --image-1x1 não informado; usando: {candidate}")
    if not args.image_9x16:
        candidate = os.path.join(CAMPAIGN_DIR, "ad001-9x16.png")
        if os.path.exists(candidate):
            args.image_9x16 = candidate
            print(f"[INFO] --image-9x16 não informado; usando: {candidate}")

    # ── Cliente / credenciais ────────────────────────────────────────────────
    if args.dry_run:
        print("\n🔍 DRY-RUN — nenhuma chamada real à API\n")
        client = None
    else:
        try:
            client = MetaAPIClient()
            if args.cliente or not client.account_id:
                from contas import resolver_cliente, ContaError
                try:
                    conta = resolver_cliente(nome=args.cliente)
                    client.account_id = conta["meta_ad_account"]
                except ContaError as e:
                    print(f"Erro: {e}")
                    sys.exit(1)
        except MetaAPIError as e:
            print(f"Erro de credenciais: {e}")
            sys.exit(1)

    result = {}

    try:
        # ── Campanha ─────────────────────────────────────────────────────────
        if args.step in ("all", "campaign"):
            cid = create_campaign(client, dry_run=args.dry_run)
            result["campaign_id"] = cid
        else:
            if not args.campaign_id:
                print("Erro: --campaign-id requerido para --step adset|ad")
                sys.exit(1)
            cid = args.campaign_id
            result["campaign_id"] = cid

        # ── Conjunto ──────────────────────────────────────────────────────────
        if args.step in ("all", "adset"):
            aid = create_adset(client, cid, dry_run=args.dry_run)
            result["adset_id"] = aid
        else:
            if not args.adset_id:
                print("Erro: --adset-id requerido para --step ad")
                sys.exit(1)
            aid = args.adset_id
            result["adset_id"] = aid

        # ── Upload de imagens + Criativo + Anúncio ───────────────────────────
        if args.step in ("all", "ad"):
            if not args.image_1x1:
                print(
                    "\n⚠️  Sem imagem 1:1. Passe --image-1x1 para criar o criativo.\n"
                    "   Campanha e conjunto criados. Adicione o criativo manualmente no Gerenciador."
                )
            else:
                h1x1  = upload_image(client, args.image_1x1,  dry_run=args.dry_run)
                h9x16 = upload_image(client, args.image_9x16, dry_run=args.dry_run) if args.image_9x16 else h1x1
                result["image_hash_1x1"]  = h1x1
                result["image_hash_9x16"] = h9x16

                creative_ids = create_ad_creatives(client, h1x1, h9x16, dry_run=args.dry_run)
                result["creative_ids"] = creative_ids

                ad_ids = create_ads(client, aid, creative_ids, dry_run=args.dry_run)
                result["ad_ids"] = ad_ids

    except MetaAPIError as e:
        print(f"\n❌ Erro API Meta: {e}")
        if result:
            _save_result({**result, "error": str(e)})
        sys.exit(1)

    result["created_at"] = datetime.now().isoformat()
    result["campaign_name"] = CAMPAIGN_NAME
    result["status"] = "PAUSED"
    result["dry_run"] = args.dry_run

    _save_result(result)

    print("\n" + "─" * 60)
    print("CAMPANHA CRIADA — STATUS: PAUSADA")
    print("─" * 60)
    print("Próximos passos:")
    print("  1. Abrir Gerenciador → revisar campanha")
    print("  2. Conectar WhatsApp Business (código 6 dígitos se não feito)")
    print("  3. Conferir localização no mapa (validar Brasil, não França)")
    print("  4. Verificar que todos os aprimoramentos estão OFF")
    print("  5. Revisar checklist.md completamente")
    print("  6. Ativar a campanha quando tudo OK")
    print("─" * 60)


if __name__ == "__main__":
    main()
