# scripts/reels.py
import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from meta_api import MetaAPIClient, MetaAPIError

MEDIA_FIELDS = "id,caption,timestamp,media_type,permalink,thumbnail_url,media_url,like_count,comments_count"
INSIGHTS_METRICS = "reach,saved,shares,ig_reels_avg_watch_time"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
THUMBS_ROOT = os.path.join(REPO_ROOT, "saidas", "cache", "ig-thumbs")


def _slug(nome):
    return re.sub(r"[^a-z0-9]+", "", (nome or "conta").lower()) or "conta"


def baixar_thumbs(results, slug):
    """Baixa as capas do IG pra disco. As URLs scontent expiram em horas —
    guardar a URL no cache apodrece; um snapshot local nunca quebra.
    Reescreve `thumb` pra caminho servido pelo backend (/ig-thumbs/...).
    Mantém a URL remota se o download falhar."""
    dest_dir = os.path.join(THUMBS_ROOT, slug)
    os.makedirs(dest_dir, exist_ok=True)
    for r in results:
        remota = r.get("thumb")
        if not remota:
            continue
        arquivo = f"{r['id']}.jpg"
        caminho = os.path.join(dest_dir, arquivo)
        try:
            req = urllib.request.Request(remota, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp, open(caminho, "wb") as f:
                f.write(resp.read())
            r["thumb"] = f"/ig-thumbs/{slug}/{arquivo}"
        except Exception:
            pass  # mantém a URL remota como fallback


def get_ig_user_id(client):
    data = client.get(client.account_id, {"fields": "instagram_actor_id"})
    ig_id = data.get("instagram_actor_id")
    if not ig_id:
        raise MetaAPIError("Instagram Business não vinculado a esta conta de anúncio. "
                           "Verifique a conexão no Business Manager.")
    return ig_id


def fetch_reels(client, days, limit, ig_id=None):
    # ig_id vem do contas-ads.md (fonte de verdade). Fallback: derivar do ad account.
    if not ig_id:
        ig_id = get_ig_user_id(client)
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    media = client.get(f"{ig_id}/media", {
        "fields": MEDIA_FIELDS,
        "since": since,
        "limit": limit
    })

    # Inclui vídeos/reels e também posts de imagem/carrossel — contas sem reels
    # (perfis de conteúdo estático) ficariam com 0 resultados de outra forma.
    ALLOWED_TYPES = ("VIDEO", "REEL", "IMAGE", "CAROUSEL_ALBUM")
    results = []
    for item in media.get("data", []):
        if item.get("media_type") not in ALLOWED_TYPES:
            continue

        try:
            insights = client.get(f"{item['id']}/insights", {
                "metric": INSIGHTS_METRICS
            })
            metrics = {m["name"]: m["values"][0]["value"]
                       for m in insights.get("data", [])}
        except MetaAPIError:
            metrics = {}

        reach = int(metrics.get("reach") or 0)
        likes = int(item.get("like_count") or 0)
        comments = int(item.get("comments_count") or 0)
        saves = int(metrics.get("saved") or 0)
        shares = int(metrics.get("shares") or 0)
        # ig_reels_avg_watch_time vem em milissegundos (plays foi descontinuado na v22+)
        watch = round(int(metrics.get("ig_reels_avg_watch_time") or 0) / 1000, 1)

        engagement_rate = (
            round((likes + comments + shares + saves) / reach * 100, 2)
            if reach > 0 else 0.0
        )

        results.append({
            "id": item["id"],
            "caption": (item.get("caption") or "")[:200],
            "timestamp": item.get("timestamp", ""),
            "permalink": item.get("permalink", ""),
            # thumbnail_url = capa do vídeo/reel; media_url é fallback (imagens)
            "thumb": item.get("thumbnail_url") or item.get("media_url") or "",
            "reach": reach,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "saves": saves,
            "watch": watch,
            "engagement_rate": engagement_rate,
        })

    results.sort(key=lambda x: x["engagement_rate"], reverse=True)
    return results


def main():
    parser = argparse.ArgumentParser(description="Analisa Reels Instagram")
    parser.add_argument("--days", type=int, default=30, choices=[30, 60, 90])
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--cliente", default=None)
    args = parser.parse_args()

    try:
        client = MetaAPIClient()
        ig_id = None
        nome_cliente = args.cliente
        if args.cliente or not client.account_id:
            from contas import resolver_cliente, ContaError
            try:
                conta = resolver_cliente(nome=args.cliente)
                client.account_id = conta["meta_ad_account"]
                ig_id = conta.get("ig_user_id") or None
                nome_cliente = conta.get("cliente") or args.cliente
            except ContaError as e:
                print(f"Erro: {e}")
                sys.exit(1)
        result = fetch_reels(client, args.days, args.limit, ig_id)
        baixar_thumbs(result, _slug(nome_cliente))
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except MetaAPIError as e:
        print(f"Erro: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
