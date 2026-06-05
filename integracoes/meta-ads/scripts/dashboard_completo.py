"""
gerar_dashboard_completo.py — Dashboard Completo Meta Ads + Instagram
Combina: Performance por Anúncio (benchmarks), Evolução Diária,
Evolução de Seguidores, Comparativo Pago vs Orgânico, Top Reels,
Otimizações Prioritárias, Resumo Executivo.

Lê configuração de CLAUDE.md automaticamente (multi-cliente).

Uso:
  python gerar_dashboard_completo.py
  python gerar_dashboard_completo.py --cliente "Nome"
  python gerar_dashboard_completo.py --periodo last_7d
  python gerar_dashboard_completo.py --periodo yesterday
"""
import sys, io, json, os, re
from datetime import datetime, timedelta, date
from pathlib import Path

if 'pytest' not in sys.modules:
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except AttributeError:
        pass

_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent)                 # integracoes/meta-ads (para output/)
REPO_ROOT = str(_script_dir.parent.parent.parent)  # raiz do repo (para _memoria/)

sys.path.insert(0, str(_script_dir))
from meta_api import MetaAPIClient, MetaAPIError

_api_client = None

def get(endpoint, params=None):
    """Compatibility shim: wraps MetaAPIClient to keep all get() calls unchanged."""
    global _api_client
    if _api_client is None:
        _api_client = MetaAPIClient()
    return _api_client.get(endpoint.lstrip('/'), params)

# Globais — preenchidas em main() a partir de CLAUDE.md
AD_ACCOUNT_ID = ""
IG_USER_ID = ""
IG_HANDLE = ""
CLIENT_NAME = ""

MESES_BR_LOWER = {1:"jan",2:"fev",3:"mar",4:"abr",5:"mai",6:"jun",
                   7:"jul",8:"ago",9:"set",10:"out",11:"nov",12:"dez"}

# ═══════════════════════════════════════
# CONFIG — leitura de CLAUDE.md
# ═══════════════════════════════════════
VALORES_VAZIOS = ("—", "—  (não configurado)", "XXXXXXXXX", "act_XXXXXXXXX", "(preencher)", "")

def _limpar_valor(v):
    v = v.strip().strip("`").strip()
    return "" if v in VALORES_VAZIOS else v

def _extrair_agencia(conteudo):
    for linha in conteudo.split("\n"):
        if linha.startswith("# ") and ("Workspace" in linha or "—" in linha):
            return linha.replace("# ", "").split("—")[0].strip()
    return "Workspace"

def _parsear_tabela_multi(conteudo):
    clientes = []
    in_contas = False
    headers = []
    for linha in conteudo.split("\n"):
        if "## Contas Conectadas" in linha:
            in_contas = True
            continue
        if in_contas and linha.startswith("## "):
            break
        if not in_contas or "|" not in linha or "---" in linha:
            continue
        partes = [p.strip() for p in linha.split("|") if p.strip()]
        if not partes:
            continue
        if not headers:
            headers = [h.lower() for h in partes]
            continue
        if len(partes) >= 2:
            row = {}
            for i, h in enumerate(headers):
                row[h] = _limpar_valor(partes[i]) if i < len(partes) else ""
            clientes.append(row)
    return headers, clientes

def _parsear_tabela_legado(conteudo):
    dados = {}
    in_contas = False
    for linha in conteudo.split("\n"):
        if "## Contas Conectadas" in linha:
            in_contas = True
            continue
        if in_contas and linha.startswith("## "):
            break
        if in_contas and "|" in linha and "---" not in linha and "Campo" not in linha:
            partes = [p.strip() for p in linha.split("|") if p.strip()]
            if len(partes) >= 2:
                dados[partes[0]] = _limpar_valor(partes[1])
    CAMPO_MAP = {
        "ad_account_id": "Meta Ad Account ID",
        "ig_user_id": "Instagram User ID",
        "handle": "Handle Instagram",
    }
    config = {}
    for key, campo_md in CAMPO_MAP.items():
        config[key] = dados.get(campo_md, "")
    config["nome"] = dados.get("cliente", _extrair_agencia(conteudo))
    config["google_ads_id"] = dados.get("Google Ads Customer ID", "")
    return [config] if any(config.get(k) for k in ["ad_account_id", "ig_user_id"]) else []

def carregar_config(cliente_filtro=None):
    path = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")
    if not os.path.exists(path):
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md (ver skill /ads-conectar).")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        conteudo = f.read()
    agencia = _extrair_agencia(conteudo)
    headers, clientes = _parsear_tabela_multi(conteudo)
    if headers and any("cliente" in h for h in headers):
        clientes_meta = []
        for row in clientes:
            nome = row.get("cliente", "")
            ad_account = row.get("meta ad account", "") or row.get("meta ad account id", "")
            ig_user = row.get("ig user id", "")
            handle = row.get("handle ig", "") or row.get("handle", "")
            if ad_account or ig_user:
                clientes_meta.append({
                    "nome": nome or agencia,
                    "ad_account_id": ad_account,
                    "ig_user_id": ig_user,
                    "handle": handle,
                    "agencia": agencia,
                })
    else:
        clientes_meta = _parsear_tabela_legado(conteudo)
        for c in clientes_meta:
            c["agencia"] = agencia
    clientes_meta = [c for c in clientes_meta if c.get("ad_account_id") and c.get("ig_user_id")]
    if not clientes_meta:
        print("ERRO: Nenhum cliente com Meta Ads (act_id + IG User ID) em _memoria/contas-ads.md.")
        print("Cadastre o cliente via skill /ads-conectar.")
        sys.exit(1)
    if cliente_filtro:
        filtro = cliente_filtro.lower()
        matches = [c for c in clientes_meta if filtro in c["nome"].lower()]
        if not matches:
            print(f"ERRO: Cliente '{cliente_filtro}' não encontrado.")
            for c in clientes_meta:
                print(f"  - {c['nome']} ({c['ad_account_id']})")
            sys.exit(1)
        return matches[0]
    if len(clientes_meta) == 1:
        return clientes_meta[0]
    print("Múltiplos clientes encontrados. Use --cliente para selecionar:")
    for c in clientes_meta:
        print(f"  - {c['nome']} ({c['ad_account_id']}, {c['handle']})")
    sys.exit(1)

def gerar_slug(config):
    handle = config.get("handle", "").strip("@").strip()
    if handle:
        return re.sub(r'[^a-z0-9-]', '', handle.lower())
    nome = config.get("nome", "relatorio").lower()
    return re.sub(r'[^a-z0-9-]', '', nome.replace(' ', '-'))

# Benchmarks do mercado (Meta Ads Brasil, serviços/infoprodutos)
BENCHMARKS = {
    "ctr": {"excelente": 1.5, "bom": 0.8},
    "cpc": {"excelente": 0.50, "bom": 2.00},
    "cpm": {"excelente": 5.0, "bom": 15.0},
    "frequency": {"excelente": 1.5, "bom": 3.0},
}

# ═══════════════════════════════════════
# FORMATTERS
# ═══════════════════════════════════════
def fmt_brl(v):
    if v is None: return "—"
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

def fmt_num(v):
    if v is None: return "—"
    return f"{int(v):,}".replace(",", ".")

def fmt_pct(v):
    if v is None: return "—"
    return f"{v:.2f}".replace(".", ",") + "%"

def safe_div(a, b, default=0):
    return a / b if b else default

def extrair_action(actions, action_type):
    if not actions: return 0
    for a in actions:
        if a.get("action_type") == action_type:
            return int(a.get("value", 0))
    return 0

def badge_for(metric, value):
    b = BENCHMARKS.get(metric)
    if not b: return None
    if metric in ("cpc", "cpm", "frequency"):
        if value <= b["excelente"]: return "excelente"
        if value <= b["bom"]: return "bom"
        return "ruim"
    else:
        if value >= b["excelente"]: return "excelente"
        if value >= b["bom"]: return "bom"
        return "ruim"

def benchmark_label(metric):
    b = BENCHMARKS.get(metric)
    if not b: return None
    if metric == "ctr": return f">{b['excelente']}%"
    if metric == "cpc": return f"<{fmt_brl(b['excelente'])}"
    if metric == "cpm": return f"R${b['excelente']:.0f}-{b['bom']:.0f}"
    if metric == "frequency": return f"<{b['excelente']}"
    return None

def delta_pct(current, prev):
    if prev is None or prev == 0:
        return {"pct": None, "direction": "up", "label": "Novo"}
    pct = ((current - prev) / prev) * 100
    direction = "up" if pct > 0 else ("down" if pct < 0 else "neutral")
    return {"pct": round(pct, 1), "direction": direction, "label": f"{pct:+.1f}%"}

def sanitize(text):
    if not text: return ""
    return re.sub(r'[\ud800-\udfff]', '', str(text))

def truncar(text, n=60):
    text = sanitize(text)
    return text[:n] + "..." if len(text) > n else text

def gerar_titulo_reel(caption, max_len=30):
    """Gera título curto e amigável a partir da caption do reel."""
    if not caption:
        return "Sem título"
    text = sanitize(caption)
    # Keep only letters, digits, punctuation, spaces (removes all emojis)
    text = re.sub(r'[^\w\s.,;:!?\'\"()\-+/@#&%$=]', '', text)
    # Pega primeira linha não-vazia
    for line in text.split('\n'):
        line = line.strip()
        if len(line) >= 5:
            text = line
            break
    # Remove hashtags e menções
    text = re.sub(r'[#@]\S+', '', text).strip()
    # Trunca no limite mantendo palavras inteiras
    if len(text) > max_len:
        text = text[:max_len].rsplit(' ', 1)[0].rstrip('.,;:!? ') + '...'
    return text.strip() or "Sem título"

# ═══════════════════════════════════════
# PERIOD CALCULATION
# ═══════════════════════════════════════
def parse_periodo(periodo_str):
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    # Exclui o dia atual (dados parciais) — until = ontem
    if ":" in periodo_str:
        parts = periodo_str.split(":")
        since = datetime.strptime(parts[0], "%Y-%m-%d").date()
        until = datetime.strptime(parts[1], "%Y-%m-%d").date()
    elif periodo_str == "yesterday":
        since = yesterday
        until = yesterday
    elif periodo_str == "last_7d":
        since = yesterday - timedelta(days=6)
        until = yesterday
    elif periodo_str == "last_14d":
        since = yesterday - timedelta(days=13)
        until = yesterday
    elif periodo_str == "last_30d":
        since = yesterday - timedelta(days=29)
        until = yesterday
    elif periodo_str == "last_90d":
        since = yesterday - timedelta(days=89)
        until = yesterday
    else:
        since = yesterday - timedelta(days=29)
        until = yesterday

    days_count = (until - since).days
    prev_until = since - timedelta(days=1)
    prev_since = prev_until - timedelta(days=days_count)
    # API limita 37 meses retroativos — cap no período anterior se necessário
    min_date = date.today() - timedelta(days=37 * 30)
    if prev_since < min_date:
        prev_since = min_date
    return since, until, prev_since, prev_until

# ═══════════════════════════════════════
# DATA COLLECTION
# ═══════════════════════════════════════
def _get(endpoint, params, retries=3):
    for i in range(retries):
        try:
            return get(endpoint, params)
        except Exception as e:
            if i == retries - 1: raise
            import time; time.sleep(2)

def coletar_account_insights(since, until):
    print("  [1/8] Account insights...")
    r = _get(f"/{AD_ACCOUNT_ID}/insights", {
        "fields": "spend,impressions,clicks,reach,ctr,cpc,cpm,frequency,actions,cost_per_action_type",
        "time_range": json.dumps({"since": str(since), "until": str(until)}),
        "level": "account"
    })
    data = r.get("data", [{}])[0] if r.get("data") else {}
    spend = float(data.get("spend", 0))
    impressions = int(data.get("impressions", 0))
    clicks = int(data.get("clicks", 0))
    reach = int(data.get("reach", 0))
    ctr = float(data.get("ctr", 0))
    cpc = float(data.get("cpc", 0))
    cpm = float(data.get("cpm", 0))
    freq = float(data.get("frequency", 0))
    actions = data.get("actions", [])
    saves = extrair_action(actions, "onsite_conversion.post_save")
    dms = extrair_action(actions, "onsite_conversion.messaging_conversation_started_7d")
    video_views = extrair_action(actions, "video_view")
    link_clicks = extrair_action(actions, "link_click")
    reactions = extrair_action(actions, "post_reaction")
    comments = extrair_action(actions, "comment")

    return {
        "spend": spend, "impressions": impressions, "clicks": clicks,
        "reach": reach, "ctr": ctr, "cpc": cpc, "cpm": cpm,
        "frequency": freq, "saves": saves, "dms": dms,
        "video_views": video_views, "link_clicks": link_clicks,
        "reactions": reactions, "comments": comments
    }

def coletar_campaign_insights(since, until):
    print("  [2/8] Campaign insights...")
    r = _get(f"/{AD_ACCOUNT_ID}/insights", {
        "fields": "campaign_name,campaign_id,spend,impressions,clicks,reach,ctr,cpc,cpm,frequency,actions,cost_per_action_type",
        "time_range": json.dumps({"since": str(since), "until": str(until)}),
        "level": "campaign",
        "filtering": json.dumps([{"field": "spend", "operator": "GREATER_THAN", "value": "0"}]),
        "limit": "50"
    })
    campaigns = []
    for row in r.get("data", []):
        actions = row.get("actions", [])
        campaigns.append({
            "campaign_name": row.get("campaign_name", ""),
            "campaign_id": row.get("campaign_id", ""),
            "spend": float(row.get("spend", 0)),
            "impressions": int(row.get("impressions", 0)),
            "clicks": int(row.get("clicks", 0)),
            "reach": int(row.get("reach", 0)),
            "ctr": float(row.get("ctr", 0)),
            "cpc": float(row.get("cpc", 0)),
            "cpm": float(row.get("cpm", 0)),
            "frequency": float(row.get("frequency", 0)),
            "saves": extrair_action(actions, "onsite_conversion.post_save"),
            "dms": extrair_action(actions, "onsite_conversion.messaging_conversation_started_7d"),
            "video_views": extrair_action(actions, "video_view"),
            "reactions": extrair_action(actions, "post_reaction"),
            "comments": extrair_action(actions, "comment"),
            "link_clicks": extrair_action(actions, "link_click"),
        })
    return campaigns

def coletar_ads(since, until):
    print("  [3/8] Ads + criativos...")
    r = _get(f"/{AD_ACCOUNT_ID}/ads", {
        "fields": "name,status,campaign{name},adset{name},creative{thumbnail_url,body,object_story_spec,effective_object_story_id,instagram_permalink_url},insights.time_range({\"since\":\"" + str(since) + "\",\"until\":\"" + str(until) + "\"}){spend,impressions,clicks,reach,ctr,cpc,cpm,frequency,actions,cost_per_action_type,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions}",
        "filtering": json.dumps([{"field": "delivery_info", "operator": "IN", "value": ["active","recently_completed","completed","inactive"]}]),
        "limit": "50"
    })
    ads = []
    for ad in r.get("data", []):
        insights = ad.get("insights", {}).get("data", [{}])[0] if ad.get("insights") else {}
        if not insights.get("spend") or float(insights.get("spend", 0)) == 0:
            continue
        creative = ad.get("creative", {})
        campaign = ad.get("campaign", {})
        adset = ad.get("adset", {})
        actions = insights.get("actions", [])

        # Detect funnel from campaign name
        camp_name = campaign.get("name", "").lower()
        if "tofu" in camp_name or "tráfego" in camp_name or "trafego" in camp_name:
            funnel = "tofu"
        elif "mofu" in camp_name or "engajamento" in camp_name:
            funnel = "mofu"
        elif "retarget" in camp_name or "retargeting" in camp_name:
            funnel = "retarget"
        elif "bofu" in camp_name or "venda" in camp_name:
            funnel = "bofu"
        else:
            funnel = "tofu"

        spend = float(insights.get("spend", 0))
        ctr_val = float(insights.get("ctr", 0))
        cpc_val = float(insights.get("cpc", 0))
        cpm_val = float(insights.get("cpm", 0))
        freq_val = float(insights.get("frequency", 0))
        saves_val = extrair_action(actions, "onsite_conversion.post_save")
        dms_val = extrair_action(actions, "onsite_conversion.messaging_conversation_started_7d")
        comments_val = extrair_action(actions, "comment")

        # Overall badge
        scores = [badge_for("ctr", ctr_val), badge_for("cpc", cpc_val), badge_for("cpm", cpm_val)]
        score_map = {"excelente": 3, "bom": 2, "ruim": 1}
        avg = sum(score_map.get(s, 0) for s in scores if s) / max(len([s for s in scores if s]), 1)
        overall = "excelente" if avg >= 2.5 else ("bom" if avg >= 1.5 else "ruim")

        thumb = creative.get("thumbnail_url", "")
        body = sanitize(creative.get("body", ""))

        story_id = creative.get("effective_object_story_id", "")
        fb_permalink = ""
        if story_id and "_" in story_id:
            page_id, post_id = story_id.split("_", 1)
            fb_permalink = f"https://www.facebook.com/{page_id}/posts/{post_id}"

        ig_permalink = creative.get("instagram_permalink_url", "")

        ads.append({
            "id": ad.get("id", ""),
            "ad_name": ad.get("name", ""),
            "campaign_name": campaign.get("name", ""),
            "adset_name": adset.get("name", ""),
            "status": ad.get("status", ""),
            "funnel": funnel,
            "overall_badge": overall,
            "thumb": thumb,
            "body": truncar(body, 80),
            "fb_permalink": fb_permalink,
            "ig_permalink": ig_permalink,
            "metrics": {
                "spend": spend,
                "impressions": int(insights.get("impressions", 0)),
                "clicks": int(insights.get("clicks", 0)),
                "reach": int(insights.get("reach", 0)),
                "ctr": ctr_val,
                "cpc": cpc_val,
                "cpm": cpm_val,
                "frequency": freq_val,
                "saves": saves_val,
                "dms": dms_val,
                "comments": comments_val,
                "link_clicks": extrair_action(actions, "link_click"),
                "video_views": extrair_action(actions, "video_view"),
            },
            "badges": {
                "ctr": badge_for("ctr", ctr_val),
                "cpc": badge_for("cpc", cpc_val),
                "cpm": badge_for("cpm", cpm_val),
                "frequency": badge_for("frequency", freq_val),
            }
        })
    return ads

def coletar_daily(since, until):
    print("  [4/8] Daily breakdown...")
    r = _get(f"/{AD_ACCOUNT_ID}/insights", {
        "fields": "campaign_name,spend,impressions,clicks,reach,actions",
        "time_range": json.dumps({"since": str(since), "until": str(until)}),
        "level": "campaign",
        "time_increment": "1",
        "filtering": json.dumps([{"field": "spend", "operator": "GREATER_THAN", "value": "0"}]),
        "limit": "500"
    })
    daily = {}
    for row in r.get("data", []):
        date = row.get("date_start", "")
        camp = row.get("campaign_name", "Unknown")
        if date not in daily:
            daily[date] = {}
        if camp not in daily[date]:
            daily[date][camp] = {"spend": 0, "reach": 0, "clicks": 0, "saves": 0}
        daily[date][camp]["spend"] += float(row.get("spend", 0))
        daily[date][camp]["reach"] += int(row.get("reach", 0))
        daily[date][camp]["clicks"] += int(row.get("clicks", 0))
        actions = row.get("actions", [])
        daily[date][camp]["saves"] += extrair_action(actions, "onsite_conversion.post_save")
    return daily

def coletar_ig_profile():
    print("  [5/8] IG profile...")
    r = _get(f"/{IG_USER_ID}", {
        "fields": "followers_count,media_count,username"
    })
    return {
        "followers": r.get("followers_count", 0),
        "media_count": r.get("media_count", 0),
        "username": r.get("username", "")
    }

def coletar_ig_insights(since, until):
    print("  [6/8] IG organic insights...")
    all_data = {}

    # Chunk into 30-day periods
    current = since
    while current < until:
        chunk_end = min(current + timedelta(days=29), until)

        # Métricas period=day (reach)
        try:
            r = _get(f"/{IG_USER_ID}/insights", {
                "metric": "reach",
                "period": "day",
                "since": str(current),
                "until": str(chunk_end + timedelta(days=1)),
            })
            for metric_data in r.get("data", []):
                name = metric_data.get("name")
                if name not in all_data:
                    all_data[name] = 0
                for val in metric_data.get("values", []):
                    v = val.get("value", 0)
                    all_data[name] += v if isinstance(v, int) else sum(v.values()) if isinstance(v, dict) else 0
        except:
            pass

        # Métricas metric_type=total_value
        try:
            r2 = _get(f"/{IG_USER_ID}/insights", {
                "metric": "profile_views,accounts_engaged,total_interactions",
                "metric_type": "total_value",
                "since": str(current),
                "until": str(chunk_end + timedelta(days=1)),
            })
            for metric_data in r2.get("data", []):
                name = metric_data.get("name")
                if name not in all_data:
                    all_data[name] = 0
                total_val = metric_data.get("total_value", {}).get("value", 0)
                if isinstance(total_val, int):
                    all_data[name] += total_val
                elif isinstance(total_val, dict):
                    all_data[name] += sum(total_val.values())
        except:
            pass

        current = chunk_end + timedelta(days=1)

    return all_data

def coletar_reels():
    print("  [7/8] Reels recentes...")
    r = _get(f"/{IG_USER_ID}/media", {
        "fields": "id,caption,timestamp,permalink,media_type,thumbnail_url",
        "limit": "20"
    })
    reels = []
    for m in r.get("data", []):
        if m.get("media_type") not in ("VIDEO", "REELS"):
            continue
        reel_id = m.get("id")
        caption = sanitize(m.get("caption", ""))

        # Get reel insights (v22+ compatible)
        try:
            ri = _get(f"/{reel_id}/insights", {
                "metric": "reach,saved,shares,total_interactions,likes,comments,views"
            })
            metrics = {}
            for md in ri.get("data", []):
                name = md.get("name")
                vals = md.get("values", [{}])
                v = vals[0].get("value", 0) if vals else 0
                metrics[name] = v
        except:
            metrics = {}

        reach = metrics.get("reach", 0)
        interactions = metrics.get("total_interactions", 0)
        eng_rate = round(safe_div(interactions, reach, 0) * 100, 1) if reach > 0 else 0

        reels.append({
            "id": reel_id,
            "caption": truncar(caption, 80),
            "short_title": gerar_titulo_reel(caption),
            "permalink": m.get("permalink", ""),
            "thumb": m.get("thumbnail_url", ""),
            "timestamp": m.get("timestamp", ""),
            "metrics": {
                "reach": reach,
                "interactions": interactions,
                "comments": metrics.get("comments", 0),
                "shares": metrics.get("shares", 0),
                "saves": metrics.get("saved", 0),
                "likes": metrics.get("likes", 0),
                "plays": metrics.get("views", 0),
            },
            "eng_rate": eng_rate,
        })
        if len(reels) >= 10:
            break
    # Sort by engagement rate
    reels.sort(key=lambda x: x["eng_rate"], reverse=True)
    return reels

def coletar_ig_followers_daily():
    print("  [8/8] Followers daily (30d)...")
    since = datetime.now().date() - timedelta(days=30)
    until = datetime.now().date()
    try:
        r = _get(f"/{IG_USER_ID}/insights", {
            "metric": "follower_count",
            "period": "day",
            "since": str(since),
            "until": str(until),
        })
        days = []
        values = []
        for md in r.get("data", []):
            if md.get("name") == "follower_count":
                for val in md.get("values", []):
                    end_time = val.get("end_time", "")[:10]
                    d_fmt = end_time[8:] + "/" + end_time[5:7]
                    days.append(d_fmt)
                    values.append(val.get("value", 0))
        return days, values
    except Exception as e:
        print(f"    Erro followers: {e}")
        return [], []

# ═══════════════════════════════════════
# GENERATE OPTIMIZATIONS
# ═══════════════════════════════════════
def gerar_otimizacoes(account, campaigns, ads):
    opts = []
    total_spend = account["spend"]

    for ad in ads:
        m = ad["metrics"]
        ad_label = truncar(ad['ad_name'], 50)
        # CTR ruim
        if m["ctr"] < 0.8 and m["spend"] > 20:
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "CTR baixo",
                "creative": ad_label,
                "description": f"CTR {fmt_pct(m['ctr'])} com {fmt_brl(m['spend'])} gastos. "
                    f"Considerar pausar ou trocar criativo."
            })
        # DMs zero com gasto alto
        if m["dms"] == 0 and m["spend"] > 30:
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "Zero conversões DM",
                "creative": ad_label,
                "description": f"{fmt_brl(m['spend'])} gastos sem conversas no DM. "
                    f"Revisar CTA e objetivo da campanha."
            })
        # Saves altos = oportunidade
        if m["saves"] > 50:
            opts.append({
                "priority": "medium", "card_type": "positive",
                "title": "Alto volume de saves",
                "creative": ad_label,
                "description": f"{fmt_num(m['saves'])} saves. Criar audiência de retargeting "
                    f"com quem salvou para oferta direta."
            })

    # Frequency warning
    for camp in campaigns:
        if camp["frequency"] > 3:
            opts.append({
                "priority": "high", "card_type": "warning",
                "title": "Frequência alta",
                "creative": truncar(camp['campaign_name'], 50),
                "description": f"Frequência {camp['frequency']:.1f}. Público saturado, "
                    f"expandir audiência ou pausar."
            })

    # Sort by priority
    prio_order = {"high": 0, "medium": 1, "low": 2}
    opts.sort(key=lambda x: prio_order.get(x["priority"], 99))
    return opts[:8]

# ═══════════════════════════════════════
# GENERATE EXECUTIVE SUMMARY
# ═══════════════════════════════════════
def gerar_resumo(account, campaigns, ads, reels, ig_organic, period_days):
    lines = []
    spend = account["spend"]
    daily_avg = safe_div(spend, period_days)
    lines.append(f"Investimento total de {fmt_brl(spend)} em {period_days} dias ({fmt_brl(daily_avg)}/dia).")

    if account["reach"] > 0:
        lines.append(f"Alcance de {fmt_num(account['reach'])} pessoas únicas com frequência {account['frequency']:.1f}.")

    if account["dms"] > 0:
        cost_per_dm = safe_div(spend, account["dms"])
        lines.append(f"{account['dms']} conversas no DM iniciadas (custo {fmt_brl(cost_per_dm)}/conversa).")

    if account["saves"] > 50:
        lines.append(f"{fmt_num(account['saves'])} salvamentos — sinal forte de intenção de compra.")

    # Best performing ad
    if ads:
        best = max(ads, key=lambda a: a["metrics"]["ctr"])
        lines.append(f"Melhor anúncio por CTR: \"{best['ad_name'][:50]}\" com {fmt_pct(best['metrics']['ctr'])}.")

    # Top reel
    if reels:
        top = reels[0]
        lines.append(f"Top Reel orgânico: {top['eng_rate']}% eng. rate, "
                      f"{fmt_num(top['metrics']['reach'])} alcance, "
                      f"{fmt_num(top['metrics']['interactions'])} interações.")

    return " ".join(lines)

# ═══════════════════════════════════════
# HTML GENERATION
# ═══════════════════════════════════════
def gerar_html(account, prev_account, campaigns, ads, daily_data, reels,
               ig_profile, ig_organic, followers_days, followers_values,
               optimizations, resumo, since, until, period_days):

    now_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    since_br = since.strftime("%d/%m/%Y")
    until_br = until.strftime("%d/%m/%Y")
    total_spend = account["spend"]

    # Build daily chart data
    sorted_dates = sorted(daily_data.keys())
    camp_names = set()
    for d in sorted_dates:
        for c in daily_data[d]:
            camp_names.add(c)
    camp_names = sorted(camp_names)

    daily_json = {
        "days": [d[8:] + "/" + d[5:7] for d in sorted_dates],
        "campaigns": {}
    }
    for cn in camp_names:
        short_name = cn[:20]
        daily_json["campaigns"][short_name] = {
            "campaign_name": short_name,
            "spend": [round(daily_data[d].get(cn, {}).get("spend", 0), 2) for d in sorted_dates],
            "reach": [daily_data[d].get(cn, {}).get("reach", 0) for d in sorted_dates],
            "clicks": [daily_data[d].get(cn, {}).get("clicks", 0) for d in sorted_dates],
            "saves": [daily_data[d].get(cn, {}).get("saves", 0) for d in sorted_dates],
        }

    # Build ads JSON for ad cards
    ads_json = []
    for ad in ads:
        m = ad["metrics"]
        pct = round(safe_div(m["spend"], total_spend) * 100) if total_spend else 0
        ad_mgr_url = f"https://www.facebook.com/adsmanager/manage/ads?act={AD_ACCOUNT_ID.replace('act_','')}&selected_ad_ids={ad['id']}"
        ads_json.append({
            "id": ad["id"],
            "campaign_name": ad["campaign_name"],
            "adset_name": ad["adset_name"],
            "ad_name": ad["ad_name"],
            "thumb": ad["thumb"],
            "funnel": ad["funnel"],
            "overall_badge": ad["overall_badge"],
            "body": ad["body"],
            "fb_permalink": ad.get("fb_permalink", ""),
            "ig_permalink": ad.get("ig_permalink", ""),
            "ads_manager_url": ad_mgr_url,
            "metrics": {
                "spend": {"value": m["spend"], "pct_of_total": pct},
                "ctr": {"value": m["ctr"], "badge": ad["badges"]["ctr"], "benchmark": benchmark_label("ctr")},
                "cpc": {"value": m["cpc"], "badge": ad["badges"]["cpc"], "benchmark": benchmark_label("cpc")},
                "cpm": {"value": m["cpm"], "badge": ad["badges"]["cpm"], "benchmark": benchmark_label("cpm")},
                "reach": {"value": m["reach"]},
                "clicks": {"value": m["clicks"]},
                "saves": {"value": m["saves"]},
                "comments": {"value": m["comments"]},
                "dms": {"value": m["dms"]},
                "frequency": {"value": m["frequency"], "badge": ad["badges"]["frequency"], "benchmark": benchmark_label("frequency")},
            }
        })

    # Build comparativo data (pago + organico side by side)
    comparativo = []
    for i, ad in enumerate(ads):
        m = ad["metrics"]
        comparativo.append({
            "type": "pago", "group": i,
            "thumb": ad["thumb"],
            "hierarchy": f"{ad['campaign_name']} > {ad['adset_name']} > {ad['ad_name']}",
            "alcance": m["reach"], "saves": m["saves"],
            "comentarios": m["comments"], "shares": 0,
            "ctr_eng": m["ctr"],
            "badge": ad["overall_badge"],
        })

    # Add top reels as organic comparativo
    for j, reel in enumerate(reels[:3]):
        rm = reel["metrics"]
        comparativo.append({
            "type": "organico", "group": j,
            "thumb": reel.get("thumb", ""),
            "hierarchy": f"Orgânico > {reel['short_title']}",
            "alcance": rm["reach"], "saves": rm["saves"],
            "comentarios": rm["comments"], "shares": rm["shares"],
            "ctr_eng": reel["eng_rate"],
            "badge": "viral" if reel["eng_rate"] > 15 else ("performando" if reel["eng_rate"] > 8 else "mediano"),
            "link": reel.get("permalink", ""),
        })

    # Build reels JSON
    reels_json = []
    for i, reel in enumerate(reels[:7]):
        rm = reel["metrics"]
        is_viral = reel["eng_rate"] > 15
        reels_json.append({
            "rank": i + 1,
            "is_viral": is_viral,
            "caption": reel["caption"],
            "short_title": reel["short_title"],
            "permalink": reel.get("permalink", ""),
            "thumb": reel.get("thumb", ""),
            "eng_rate": reel["eng_rate"],
            "metrics": {
                "reach": rm["reach"],
                "interactions": rm["interactions"],
                "comments": rm["comments"],
                "shares": rm["shares"],
                "saves": rm["saves"],
                "plays": rm["plays"],
            }
        })

    # Build optimizations JSON
    opts_json = [{"priority": o["priority"], "card_type": o["card_type"],
                  "title": o["title"], "creative": o.get("creative", ""),
                  "description": o["description"]} for o in optimizations]

    # Build followers JSON
    followers_json = {
        "current_total": ig_profile["followers"],
        "daily": {
            "days": followers_days,
            "values": followers_values,
        }
    }

    # KPIs with deltas
    def kpi_delta(key):
        cur = account.get(key, 0)
        prev = prev_account.get(key, 0) if prev_account else None
        return delta_pct(cur, prev) if prev is not None else {"pct": None, "direction": "neutral", "label": "—"}

    kpis_json = {
        "spend": {"value": account["spend"], "delta": kpi_delta("spend"), "sub": f"~{fmt_brl(safe_div(account['spend'], period_days))}/dia"},
        "reach": {"value": account["reach"], "delta": kpi_delta("reach"), "sub": f"Freq. {account['frequency']:.1f}"},
        "clicks": {"value": account["clicks"], "delta": kpi_delta("clicks"), "sub": f"CPC {fmt_brl(account['cpc'])}"},
        "ctr": {"value": account["ctr"], "delta": kpi_delta("ctr"), "sub": "taxa de clique"},
        "saves": {"value": account["saves"], "delta": kpi_delta("saves"), "sub": "salvamentos"},
        "dms": {"value": account["dms"], "delta": kpi_delta("dms"),
                "sub": f"Custo {fmt_brl(safe_div(account['spend'], account['dms']))}" if account["dms"] > 0 else "—"},
        "video_views": {"value": account["video_views"], "delta": kpi_delta("video_views"), "sub": "views de vídeo"},
        "followers": {"value": ig_profile["followers"], "delta": {"pct": None, "direction": "neutral", "label": fmt_num(ig_profile["followers"])}, "sub": "seguidores", "new_followers": sum(followers_values)},
    }

    # Embed all data as JSON
    dashboard_data = {
        "generated_at": datetime.now().isoformat(),
        "client": CLIENT_NAME,
        "handle": IG_HANDLE,
        "period": {"since": str(since), "until": str(until), "days": period_days},
        "kpis": kpis_json,
        "ads": ads_json,
        "daily": daily_json,
        "comparativo": comparativo,
        "reels": reels_json,
        "optimizations": opts_json,
        "followers": followers_json,
        "resumo": resumo,
        "ig_organic": ig_organic,
    }

    # ── HTML TEMPLATE ──
    html = f"""<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard Completo — {CLIENT_NAME} | {since_br} – {until_br}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
:root, [data-theme="dark"] {{
  --bg:#0c0e18; --card:#13161f; --card2:#1a1e2e; --border:#252a3d;
  --accent:#6c5ce7; --accent2:#a855f7; --green:#22c55e; --red:#ef4444;
  --amber:#f59e0b; --blue:#0984e3; --pink:#e84393;
  --text:#e4e9f5; --dim:#5e6a8a; --meta:#1877f2; --ig:#e1306c;
  --shadow: 0 2px 8px rgba(0,0,0,.3);
}}
[data-theme="light"] {{
  --bg:#f5f7fa; --card:#ffffff; --card2:#f0f2f5; --border:#e2e5ea;
  --accent:#3b5bdb; --accent2:#7c3aed; --green:#16a34a; --red:#dc2626;
  --amber:#d97706; --blue:#2563eb; --pink:#db2777;
  --text:#1e293b; --dim:#64748b; --meta:#1877f2; --ig:#e1306c;
  --shadow: 0 2px 8px rgba(0,0,0,.08);
}}
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,sans-serif; font-size:15px; line-height:1.6; max-width:1300px; margin:0 auto; padding:20px; }}
a {{ color:var(--accent); text-decoration:none; }} a:hover {{ text-decoration:underline; }}

/* Header */
.header {{ background:linear-gradient(135deg, var(--accent), var(--pink)); padding:28px 32px; border-radius:16px; margin-bottom:24px; color:#fff; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }}
.header h1 {{ font-size:24px; font-weight:800; }} .header p {{ font-size:13px; opacity:.85; margin-top:4px; }}
.header-right {{ display:flex; gap:12px; align-items:center; }}
.theme-toggle {{ background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); border-radius:10px; padding:6px 14px; cursor:pointer; font-size:18px; color:#fff; }}

/* Section titles */
.section-title {{ font-size:17px; font-weight:700; margin:32px 0 16px; color:var(--text); display:flex; align-items:center; gap:12px; }}
.section-title::after {{ content:''; flex:1; height:1px; background:var(--border); }}

/* KPI grid */
.kpi-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:24px; }}
.kpi-card {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; box-shadow:var(--shadow); }}
.kpi-label {{ font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:.5px; font-weight:700; }}
.kpi-value {{ font-size:24px; font-weight:800; margin:8px 0 4px; }}
.kpi-sub {{ font-size:11px; color:var(--dim); }}
.delta {{ font-size:12px; font-weight:700; padding:2px 8px; border-radius:12px; display:inline-block; }}
.delta.up {{ background:rgba(34,197,94,.15); color:var(--green); }}
.delta.down {{ background:rgba(239,68,68,.15); color:var(--red); }}
.delta.neutral {{ background:rgba(94,106,138,.15); color:var(--dim); }}
.kpi-card.inverted .delta.up {{ background:rgba(239,68,68,.15); color:var(--red); }}
.kpi-card.inverted .delta.down {{ background:rgba(34,197,94,.15); color:var(--green); }}

/* Benchmark legend */
.bench-legend {{ display:flex; gap:20px; margin-bottom:16px; font-size:12px; color:var(--dim); }}
.bench-legend .dot {{ width:10px; height:10px; border-radius:50%; display:inline-block; margin-right:5px; }}
.bench-legend .dot.g {{ background:var(--green); }} .bench-legend .dot.b {{ background:var(--blue); }} .bench-legend .dot.r {{ background:var(--red); }}

/* Ad cards */
.ad-card {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:16px; box-shadow:var(--shadow); }}
.ad-card.perf-excelente {{ border-left:4px solid var(--green); }}
.ad-card.perf-bom {{ border-left:4px solid var(--blue); }}
.ad-card.perf-ruim {{ border-left:4px solid var(--red); }}
.ad-hierarchy {{ font-size:11px; color:var(--dim); margin-bottom:12px; }}
.ad-header {{ display:flex; gap:16px; align-items:flex-start; margin-bottom:16px; }}
.ad-thumb {{ width:72px; height:72px; border-radius:8px; object-fit:cover; background:var(--border); flex-shrink:0; }}
.ad-info h3 {{ font-size:15px; margin-bottom:4px; }}
.funnel-tag {{ padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; }}
.tag-tofu {{ background:rgba(108,92,231,.2); color:var(--accent); }}
.tag-mofu {{ background:rgba(9,132,227,.2); color:var(--blue); }}
.tag-retarget {{ background:rgba(232,67,147,.2); color:var(--pink); }}
.tag-bofu {{ background:rgba(34,197,94,.2); color:var(--green); }}
.perf-badge {{ padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; margin-left:8px; }}
.perf-excelente {{ background:rgba(34,197,94,.2); color:var(--green); }}
.perf-bom {{ background:rgba(9,132,227,.2); color:var(--blue); }}
.perf-ruim {{ background:rgba(239,68,68,.2); color:var(--red); }}
.ad-metrics-grid {{ display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }}
.ad-metric {{ text-align:center; background:var(--bg); border-radius:8px; padding:10px 6px; min-width:0; overflow:hidden; }}
.am-val {{ font-size:16px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
.am-label {{ font-size:9px; color:var(--dim); text-transform:uppercase; margin-top:3px; }}
.am-dot {{ width:8px; height:8px; border-radius:50%; display:inline-block; margin-top:4px; }}

/* Charts */
.charts-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }}
.chart-card {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; box-shadow:var(--shadow); }}
.chart-card h3 {{ font-size:14px; margin-bottom:12px; color:var(--dim); }}

/* Comparativo table */
.comp-table {{ width:100%; border-collapse:collapse; background:var(--card); border-radius:12px; overflow:hidden; margin-bottom:24px; box-shadow:var(--shadow); }}
.comp-table th {{ background:var(--bg); padding:10px 12px; font-size:11px; text-transform:uppercase; color:var(--dim); text-align:left; }}
.comp-table td {{ padding:10px 12px; font-size:13px; border-bottom:1px solid var(--border); }}
.comp-table tr:last-child td {{ border-bottom:none; }}
.comp-thumb {{ width:40px; height:40px; border-radius:6px; object-fit:cover; background:var(--border); }}
.status-badge {{ padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }}
.status-viral {{ background:rgba(245,158,11,.2); color:var(--amber); }}
.status-performando {{ background:rgba(34,197,94,.2); color:var(--green); }}
.status-mediano {{ background:rgba(9,132,227,.2); color:var(--blue); }}
.status-ruim {{ background:rgba(239,68,68,.2); color:var(--red); }}

/* Reels grid */
.reels-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:24px; }}
.reel-card {{ background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; padding:14px; box-shadow:var(--shadow); }}
.reel-card.viral {{ border:2px solid var(--amber); }}
.reel-thumb {{ width:100%; height:110px; object-fit:cover; border-radius:8px; background:var(--border); margin-bottom:8px; }}
.reel-caption {{ font-size:12px; color:var(--dim); max-height:36px; overflow:hidden; margin-bottom:8px; }}
.reel-metrics {{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; }}
.rm-val {{ font-size:16px; font-weight:700; text-align:center; }}
.rm-label {{ font-size:9px; color:var(--dim); text-align:center; text-transform:uppercase; }}
.reel-link {{ display:block; text-align:center; padding:8px; color:var(--accent); font-size:12px; border-top:1px solid var(--border); margin-top:8px; }}
.viral-badge {{ background:var(--amber); color:#000; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:700; display:inline-block; margin-bottom:6px; }}

/* Optimization cards */
.opt-grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:16px; margin-bottom:24px; }}
.insight-card {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:6px; }}
.insight-card.critical {{ border-left:4px solid var(--red); }}
.insight-card.warning {{ border-left:4px solid var(--amber); }}
.insight-card.info {{ border-left:4px solid var(--blue); }}
.insight-card.positive {{ border-left:4px solid var(--green); }}
.opt-header {{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }}
.priority-tag {{ font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:3px 8px; border-radius:4px; white-space:nowrap; }}
.priority-high {{ color:#fff; background:var(--red); }} .priority-medium {{ color:#fff; background:var(--amber); }} .priority-low {{ color:#fff; background:var(--blue); }}
.opt-creative {{ font-size:11px; color:var(--dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }}
.insight-card h4 {{ font-size:14px; margin:0; line-height:1.3; }}
.insight-card p {{ font-size:13px; color:var(--dim); line-height:1.5; margin:0; }}

/* Resumo */
.resumo-box {{ background:var(--card); border:1px solid var(--border); border-radius:12px; padding:24px; margin-bottom:24px; box-shadow:var(--shadow); }}
.resumo-box p {{ font-size:14px; line-height:1.7; color:var(--dim); }}

/* Footer */
.footer {{ border-top:1px solid var(--border); padding:20px 0; color:var(--dim); font-size:12px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; }}
.footer strong {{ color:var(--accent); }}

/* Mobile */
@media (max-width: 768px) {{
  body {{ padding:10px; }}
  .charts-grid {{ grid-template-columns:1fr; }}
  .kpi-grid {{ grid-template-columns:repeat(2,1fr); }}
  .reels-grid {{ grid-template-columns:1fr; }}
  .opt-grid {{ grid-template-columns:1fr; }}
  .ad-metrics-grid {{ grid-template-columns:repeat(3,1fr); gap:4px; }}
  .comp-table {{ font-size:11px; }}
  .header {{ flex-direction:column; }}
}}
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <h1>Dashboard Completo — {CLIENT_NAME}</h1>
    <p>{IG_HANDLE} | {since_br} – {until_br} | Pago + Orgânico</p>
  </div>
  <div class="header-right">
    <button class="theme-toggle" onclick="toggleTheme()" title="Alternar tema"><span id="theme-icon">&#127769;</span></button>
    <span style="font-size:12px;opacity:.7;">{now_str}</span>
  </div>
</div>

<!-- 1. RESUMO EXECUTIVO -->
<div class="section-title">Resumo Executivo</div>
<div class="resumo-box"><p id="resumoText"></p></div>
<div class="kpi-grid" id="kpiGrid"></div>

<!-- 2. PERFORMANCE POR ANÚNCIO -->
<div class="section-title">Performance por Anúncio (com alertas de mercado)</div>
<div class="bench-legend">
  <span><span class="dot g"></span> Excelente (acima da média)</span>
  <span><span class="dot b"></span> Bom (dentro da média)</span>
  <span><span class="dot r"></span> Ruim (abaixo da média)</span>
</div>
<div id="adCardsContainer"></div>

<!-- 3. EVOLUÇÃO DIÁRIA -->
<div class="section-title">Evolução Diária</div>
<div class="charts-grid">
  <div class="chart-card"><h3>Gasto vs Alcance</h3><canvas id="chartSpend"></canvas></div>
  <div class="chart-card"><h3>Engajamento Diário</h3><canvas id="chartEngagement"></canvas></div>
  <div class="chart-card"><h3>Distribuição de Gasto</h3><canvas id="chartPie"></canvas></div>
  <div class="chart-card"><h3>Top Reels — Alcance vs Interações</h3><canvas id="chartReels"></canvas></div>
</div>

<!-- 4. EVOLUÇÃO DE SEGUIDORES -->
<div class="section-title">Evolução de Seguidores (30 dias)</div>
<div id="followersTitle" style="font-size:14px;margin-bottom:12px;color:var(--dim);"></div>
<div class="chart-card" style="margin-bottom:24px"><canvas id="chartFollowers"></canvas></div>

<!-- 5. COMPARATIVO: PAGO VS ORGÂNICO -->
<div class="section-title">Comparativo: Pago vs Orgânico</div>
<table class="comp-table">
  <thead><tr><th>Thumb</th><th>Hierarquia</th><th>Tipo</th><th>Alcance</th><th>Saves</th><th>Comentários</th><th>Shares</th><th>CTR / Eng.</th><th>Status</th></tr></thead>
  <tbody id="compTableBody"></tbody>
</table>

<!-- 6. TOP 7 REELS ORGÂNICOS -->
<div class="section-title">Top 7 Reels Orgânicos (Período)</div>
<div class="reels-grid" id="reelsGrid"></div>

<!-- 7. OTIMIZAÇÕES PRIORITÁRIAS -->
<div class="section-title">Otimizações Prioritárias</div>
<div class="opt-grid" id="optimizationsGrid"></div>

<!-- FOOTER -->
<div class="footer">
  <span>Gerado por <strong>LBCode.IA</strong> via Claude Code</span>
  <span>{since_br} – {until_br} | Meta Graph API v21.0 | {period_days} dias</span>
</div>

<script>
const DATA = {json.dumps(dashboard_data, ensure_ascii=False)};

// === THEME ===
function toggleTheme() {{
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent = isDark ? '\\u2600\\uFE0F' : '\\uD83C\\uDF19';
}}

// === FORMATTERS ===
function fBRL(v) {{ return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '.'); }}
function fNum(v) {{ return v.toString().replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '.'); }}
function fPct(v) {{ return v.toFixed(2).replace('.', ',') + '%'; }}

// === RENDER RESUMO ===
document.getElementById('resumoText').textContent = DATA.resumo;

// === RENDER KPIs ===
(function() {{
  const grid = document.getElementById('kpiGrid');
  const order = ['spend','reach','clicks','ctr','saves','dms','video_views','followers'];
  const labels = {{spend:'Investimento',reach:'Alcance',clicks:'Cliques',ctr:'CTR',saves:'Saves',dms:'Conversas DM',video_views:'Video Views',followers:'Seguidores'}};
  const inverted = ['spend'];
  grid.innerHTML = order.map(key => {{
    const k = DATA.kpis[key]; if (!k) return '';
    const isInv = inverted.includes(key);
    let val = key === 'spend' ? fBRL(k.value) : (key === 'ctr' ? fPct(k.value) : fNum(k.value));
    let dCls = k.delta ? ('delta ' + (isInv ? (k.delta.direction === 'up' ? 'down' : (k.delta.direction === 'down' ? 'up' : 'neutral')) : k.delta.direction)) : 'delta neutral';
    let dLabel = k.delta ? k.delta.label : '';
    const newF = (key === 'followers' && k.new_followers) ? '<div style="color:var(--green);font-weight:700;font-size:13px;margin-top:4px">+' + fNum(k.new_followers) + ' novos</div>' : '';
    return '<div class="kpi-card' + (isInv ? ' inverted' : '') + '"><div class="kpi-label">' + labels[key] + '</div><div class="kpi-value">' + val + '</div>' +
      (dLabel ? '<span class="' + dCls + '">' + dLabel + '</span>' : '') +
      newF + '<div class="kpi-sub">' + (k.sub || '') + '</div></div>';
  }}).join('');
}})();

// === RENDER AD CARDS ===
(function() {{
  const c = document.getElementById('adCardsContainer');
  const funnelMap = {{tofu:'TOFU',mofu:'MOFU',retarget:'RETARGETING',bofu:'BOFU'}};
  const tagMap = {{tofu:'tag-tofu',mofu:'tag-mofu',retarget:'tag-retarget',bofu:'tag-bofu'}};
  c.innerHTML = DATA.ads.map(ad => {{
    const m = ad.metrics;
    function mHTML(key, label) {{
      const v = m[key]; if (!v) return '';
      let display = key === 'spend' ? fBRL(v.value) :
        ['ctr'].includes(key) ? fPct(v.value) :
        ['cpc','cpm'].includes(key) ? fBRL(v.value) :
        key === 'frequency' ? v.value.toFixed(2).replace('.',',') :
        fNum(v.value);
      const bc = v.badge === 'excelente' ? 'var(--green)' : v.badge === 'bom' ? 'var(--blue)' : v.badge === 'ruim' ? 'var(--red)' : '';
      const vs = bc ? ' style="color:'+bc+'"' : (key==='saves' && v.value>50 ? ' style="color:var(--amber)"' : '');
      const dot = bc ? '<span class="am-dot" style="background:'+bc+'" title="'+((v.badge||'')+' '+(v.benchmark||'')).trim()+'"></span>' : '';
      return '<div class="ad-metric"><div class="am-val"'+vs+'>'+display+'</div><div class="am-label">'+label+'</div>'+dot+'</div>';
    }}
    return '<div class="ad-card perf-'+ad.overall_badge+'">'+
      '<div class="ad-hierarchy">'+ad.campaign_name+' &rsaquo; '+ad.adset_name+' &rsaquo; '+ad.ad_name+'</div>'+
      '<div class="ad-header">'+(ad.thumb?'<img class="ad-thumb" src="'+ad.thumb+'" onerror="this.style.display=\\'none\\'">':'')+
      '<div class="ad-info"><span class="funnel-tag '+tagMap[ad.funnel]+'">'+funnelMap[ad.funnel]+'</span>'+
      '<span class="perf-badge perf-'+ad.overall_badge+'">'+ad.overall_badge.toUpperCase()+'</span>'+
      '<h3>'+ad.ad_name+'</h3></div></div>'+
      '<div class="ad-metrics-grid">'+mHTML('spend','Gasto')+mHTML('ctr','CTR')+mHTML('cpc','CPC')+mHTML('cpm','CPM')+
      mHTML('reach','Alcance')+mHTML('clicks','Cliques')+mHTML('saves','Saves')+mHTML('comments','Comentários')+
      mHTML('dms','DMs')+mHTML('frequency','Frequência')+'</div>'+
      '<div style="display:flex;gap:12px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);font-size:12px">'+
      '<a href="'+ad.ads_manager_url+'" target="_blank" style="color:var(--meta)">Gerenciador de Anúncios &rarr;</a>'+
      (ad.fb_permalink ? '<a href="'+ad.fb_permalink+'" target="_blank" style="color:#1877F2">Ver no Facebook &rarr;</a>' : '') +
      (ad.ig_permalink ? '<a href="'+ad.ig_permalink+'" target="_blank" style="color:var(--ig)">Ver no Instagram &rarr;</a>' : '') +
      '</div></div>';
  }}).join('');
}})();

// === RENDER DAILY CHARTS ===
(function() {{
  const d = DATA.daily;
  const days = d.days;
  const camps = d.campaigns;
  const keys = Object.keys(camps);

  // Aggregate
  const agg = {{spend:[], reach:[], clicks:[], saves:[]}};
  for (let i=0; i<days.length; i++) {{
    let s=0,r=0,c=0,sv=0;
    keys.forEach(k => {{ s+=(camps[k].spend[i]||0); r+=(camps[k].reach[i]||0); c+=(camps[k].clicks[i]||0); sv+=(camps[k].saves[i]||0); }});
    agg.spend.push(s); agg.reach.push(r); agg.clicks.push(c); agg.saves.push(sv);
  }}

  new Chart(document.getElementById('chartSpend'), {{
    type:'bar', data:{{ labels:days, datasets:[
      {{label:'Gasto (R$)',data:agg.spend,backgroundColor:'rgba(108,92,231,0.7)',yAxisID:'y',order:2}},
      {{label:'Alcance',data:agg.reach,type:'line',borderColor:'#22c55e',backgroundColor:'transparent',yAxisID:'y1',tension:.3,pointRadius:3,order:1}}
    ]}}, options:{{responsive:true,interaction:{{mode:'index',intersect:false}},plugins:{{legend:{{labels:{{color:'#5e6a8a'}}}},tooltip:{{callbacks:{{
      label:function(ctx){{
        if(ctx.dataset.label==='Gasto (R$)') return 'Gasto: R$ '+ctx.raw.toFixed(2).replace('.',',');
        if(ctx.dataset.label==='Alcance') return 'Alcance: '+ctx.raw.toLocaleString('pt-BR');
        return ctx.dataset.label+': '+ctx.raw;
      }}
    }}}}}},scales:{{
      x:{{ticks:{{color:'#5e6a8a'}},grid:{{color:'#252a3d'}}}},
      y:{{position:'left',ticks:{{color:'#5e6a8a',callback:v=>'R$'+v}},grid:{{color:'#252a3d'}}}},
      y1:{{position:'right',ticks:{{color:'#22c55e'}},grid:{{display:false}}}}
    }}}}
  }});

  new Chart(document.getElementById('chartEngagement'), {{
    type:'bar', data:{{ labels:days, datasets:[
      {{label:'Saves',data:agg.saves,backgroundColor:'rgba(245,158,11,0.8)'}},
      {{label:'Cliques',data:agg.clicks,backgroundColor:'rgba(9,132,227,0.7)'}}
    ]}}, options:{{responsive:true,plugins:{{legend:{{labels:{{color:'#5e6a8a'}}}}}},scales:{{
      x:{{stacked:true,ticks:{{color:'#5e6a8a'}},grid:{{color:'#252a3d'}}}},
      y:{{stacked:true,ticks:{{color:'#5e6a8a'}},grid:{{color:'#252a3d'}}}}
    }}}}
  }});

  // Pie chart
  const spendByCamp = keys.map(k => ({{label:camps[k].campaign_name, value:camps[k].spend.reduce((a,b)=>a+b,0)}}));
  const colors = ['rgba(108,92,231,0.8)','rgba(9,132,227,0.8)','rgba(232,67,147,0.8)','rgba(34,197,94,0.8)','rgba(245,158,11,0.8)'];
  new Chart(document.getElementById('chartPie'), {{
    type:'doughnut', data:{{
      labels:spendByCamp.map(d=>d.label+' (R$'+d.value.toFixed(0)+')'),
      datasets:[{{data:spendByCamp.map(d=>d.value),backgroundColor:colors.slice(0,spendByCamp.length),borderColor:'#13161f',borderWidth:3}}]
    }}, options:{{responsive:true,plugins:{{legend:{{position:'bottom',labels:{{color:'#5e6a8a',font:{{size:11}}}}}}}}}}
  }});

  // Reels chart
  const reels = DATA.reels.slice(0,6);
  new Chart(document.getElementById('chartReels'), {{
    type:'bar', data:{{
      labels:reels.map(r=>r.short_title),
      datasets:[
        {{label:'Alcance',data:reels.map(r=>r.metrics.reach),backgroundColor:'rgba(34,197,94,0.7)'}},
        {{label:'Interações',data:reels.map(r=>r.metrics.interactions),backgroundColor:'rgba(245,158,11,0.8)'}}
      ]
    }}, options:{{responsive:true,plugins:{{legend:{{labels:{{color:'#5e6a8a'}}}}}},scales:{{
      x:{{ticks:{{color:'#5e6a8a',font:{{size:10}}}},grid:{{color:'#252a3d'}}}},
      y:{{ticks:{{color:'#5e6a8a'}},grid:{{color:'#252a3d'}}}}
    }}}}
  }});
}})();

// === RENDER FOLLOWERS ===
(function() {{
  const f = DATA.followers;
  const fd = f.daily;
  if (!fd.days.length) return;
  const totalNovos = fd.values.reduce((a,b)=>a+b,0);
  document.getElementById('followersTitle').textContent = 'Total atual: ' + fNum(f.current_total) + ' seguidores  |  +' + fNum(totalNovos) + ' no período';
  // Média móvel 7 dias
  const ma7 = fd.values.map((v,i) => {{
    const start = Math.max(0, i-6);
    const window = fd.values.slice(start, i+1);
    return Math.round(window.reduce((a,b)=>a+b,0)/window.length*10)/10;
  }});
  new Chart(document.getElementById('chartFollowers'), {{
    type:'bar', data:{{ labels:fd.days, datasets:[
      {{label:'Novos/dia',data:fd.values,backgroundColor:'rgba(34,197,94,0.6)',yAxisID:'y',order:2}},
      {{label:'Média 7 dias',data:ma7,type:'line',borderColor:'#6c5ce7',backgroundColor:'transparent',yAxisID:'y',tension:.3,pointRadius:3,borderWidth:2.5,order:1}}
    ]}}, options:{{responsive:true,interaction:{{mode:'index',intersect:false}},plugins:{{legend:{{labels:{{color:'#5e6a8a'}}}},tooltip:{{callbacks:{{
      label:function(ctx){{
        if(ctx.dataset.label==='Novos/dia') return 'Novos no dia: +'+ctx.raw;
        if(ctx.dataset.label==='Média 7 dias') return 'Média 7 dias: '+ctx.raw;
        return ctx.dataset.label+': '+ctx.raw;
      }}
    }}}}}},scales:{{
      x:{{ticks:{{color:'#5e6a8a',font:{{size:9}}}},grid:{{color:'#252a3d'}}}},
      y:{{ticks:{{color:'#5e6a8a'}},grid:{{color:'#252a3d'}}}}
    }}}}
  }});
}})();

// === RENDER COMPARATIVO ===
(function() {{
  const tbody = document.getElementById('compTableBody');
  const rows = DATA.comparativo;
  tbody.innerHTML = rows.map(r => {{
    const isPago = r.type === 'pago';
    const tipoTag = isPago ? '<span class="funnel-tag tag-tofu">PAGO</span>' : '<span style="background:rgba(34,197,94,.2);color:var(--green);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600">ORGÂNICO</span>';
    const lvl = r.badge || 'mediano';
    const statusHTML = '<span class="status-badge status-'+lvl+'">'+lvl.charAt(0).toUpperCase()+lvl.slice(1)+'</span>';
    const ctrStr = isPago ? fPct(r.ctr_eng) : r.ctr_eng.toFixed(1).replace('.',',')+' %';
    return '<tr>'+
      '<td>'+(r.thumb?'<img class="comp-thumb" src="'+r.thumb+'" onerror="this.style.display=\\'none\\'">':'—')+'</td>'+
      '<td style="font-size:12px">'+r.hierarchy+'</td>'+
      '<td>'+tipoTag+'</td>'+
      '<td>'+fNum(r.alcance)+'</td>'+
      '<td>'+(r.saves>100?'<strong style="color:var(--amber)">'+fNum(r.saves)+'</strong>':fNum(r.saves))+'</td>'+
      '<td>'+fNum(r.comentarios)+'</td>'+
      '<td>'+fNum(r.shares)+'</td>'+
      '<td style="'+(r.ctr_eng>5?'color:var(--green);font-weight:700':'')+'">'+ctrStr+'</td>'+
      '<td>'+statusHTML+'</td></tr>';
  }}).join('');
}})();

// === RENDER REELS ===
(function() {{
  const grid = document.getElementById('reelsGrid');
  grid.innerHTML = DATA.reels.map(r => {{
    const m = r.metrics;
    return '<div class="reel-card'+(r.is_viral?' viral':'')+'">'+
      (r.is_viral?'<span class="viral-badge">&#9733; VIRAL</span>':'') +
      (r.thumb?'<img class="reel-thumb" src="'+r.thumb+'" onerror="this.style.display=\\'none\\'">':'') +
      '<div class="reel-caption">#'+r.rank+' '+r.short_title+'</div>'+
      '<div class="reel-metrics">'+
        '<div><div class="rm-val">'+fNum(m.reach)+'</div><div class="rm-label">Alcance</div></div>'+
        '<div><div class="rm-val">'+fNum(m.interactions)+'</div><div class="rm-label">Interações</div></div>'+
        '<div><div class="rm-val" style="color:var(--green)">'+r.eng_rate+'%</div><div class="rm-label">Eng. Rate</div></div>'+
        '<div><div class="rm-val">'+fNum(m.saves)+'</div><div class="rm-label">Saves</div></div>'+
        '<div><div class="rm-val">'+fNum(m.comments)+'</div><div class="rm-label">Comments</div></div>'+
        '<div><div class="rm-val">'+fNum(m.shares)+'</div><div class="rm-label">Shares</div></div>'+
      '</div>'+
      (r.permalink?'<a class="reel-link" href="'+r.permalink+'" target="_blank">Ver no Instagram &rarr;</a>':'')+
    '</div>';
  }}).join('');
}})();

// === RENDER OPTIMIZATIONS ===
(function() {{
  const grid = document.getElementById('optimizationsGrid');
  const prioLabel = {{high:'ALTA',medium:'MÉDIA',low:'BAIXA'}};
  const prioIcon = {{critical:'\u26A0',warning:'\u26A0',positive:'\u2714',info:'\u2139'}};
  grid.innerHTML = DATA.optimizations.map((o,i) => {{
    return '<div class="insight-card '+o.card_type+'">'+
      '<div class="opt-header">'+
        '<span class="priority-tag priority-'+o.priority+'">'+(prioLabel[o.priority]||o.priority)+'</span>'+
        '<h4>'+(prioIcon[o.card_type]||'')+' '+o.title+'</h4>'+
      '</div>'+
      (o.creative ? '<div class="opt-creative">'+o.creative+'</div>' : '')+
      '<p>'+o.description+'</p></div>';
  }}).join('');
}})();
</script>
</body>
</html>"""
    return html

# ═══════════════════════════════════════
# MAIN
# ═══════════════════════════════════════
def main():
    global AD_ACCOUNT_ID, IG_USER_ID, IG_HANDLE, CLIENT_NAME

    import argparse
    parser = argparse.ArgumentParser(description="Dashboard Completo Meta Ads + Instagram")
    parser.add_argument("--cliente", default=None,
                        help='Nome do cliente (ex: "Meu Cliente"). Auto se 1 cliente.')
    parser.add_argument("--periodo", default="last_30d",
                        help="yesterday, last_7d, last_14d, last_30d ou YYYY-MM-DD:YYYY-MM-DD")
    args = parser.parse_args()

    # Carregar config de CLAUDE.md
    config = carregar_config(args.cliente)
    AD_ACCOUNT_ID = config["ad_account_id"]
    IG_USER_ID = config["ig_user_id"]
    IG_HANDLE = config.get("handle", "")
    CLIENT_NAME = config["nome"]
    slug = gerar_slug(config)

    since, until, prev_since, prev_until = parse_periodo(args.periodo)
    period_days = (until - since).days or 1
    print(f"\n{'═'*50}")
    print(f"Dashboard Completo — {CLIENT_NAME} ({IG_HANDLE})")
    print(f"Período: {since} → {until} ({period_days} dias)")
    print(f"{'═'*50}\n")

    # Collect data
    account = coletar_account_insights(since, until)
    print(f"    Gasto: {fmt_brl(account['spend'])} | Alcance: {fmt_num(account['reach'])} | CTR: {fmt_pct(account['ctr'])}")

    prev_account = coletar_account_insights(prev_since, prev_until)
    print(f"    Período anterior: {fmt_brl(prev_account['spend'])}")

    campaigns = coletar_campaign_insights(since, until)
    print(f"    {len(campaigns)} campanhas")

    ads = coletar_ads(since, until)
    print(f"    {len(ads)} anúncios com gasto")

    daily_data = coletar_daily(since, until)
    print(f"    {len(daily_data)} dias com dados")

    ig_profile = coletar_ig_profile()
    print(f"    IG: {ig_profile['username']} ({fmt_num(ig_profile['followers'])} followers)")

    ig_organic = coletar_ig_insights(since, until)
    print(f"    Orgânico: {ig_organic}")

    reels = coletar_reels()
    print(f"    {len(reels)} reels (top eng: {reels[0]['eng_rate'] if reels else 0}%)")

    followers_days, followers_values = coletar_ig_followers_daily()
    print(f"    Followers daily: {len(followers_days)} dias")

    # Generate insights
    optimizations = gerar_otimizacoes(account, campaigns, ads)
    resumo = gerar_resumo(account, campaigns, ads, reels, ig_organic, period_days)

    # Generate HTML
    html = gerar_html(account, prev_account, campaigns, ads, daily_data, reels,
                      ig_profile, ig_organic, followers_days, followers_values,
                      optimizations, resumo, since, until, period_days)

    # Save — output dinâmico por cliente (entregáveis vão em saidas/, não enterrados na integração)
    output_dir = os.path.join(REPO_ROOT, "saidas", "relatorios", slug)
    os.makedirs(output_dir, exist_ok=True)
    hoje = datetime.now()
    filename = f"dashboard-completo-{MESES_BR_LOWER[hoje.month]}-{hoje.year}.html"
    output_path = os.path.join(output_dir, filename)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n{'═'*50}")
    print(f"Dashboard gerado com sucesso!")
    print(f"  Arquivo: {output_path}")
    print(f"  Período: {since} → {until}")
    print(f"  Campanhas: {len(campaigns)}")
    print(f"  Anúncios: {len(ads)}")
    print(f"  Reels: {len(reels)}")
    print(f"  Otimizações: {len(optimizations)}")
    print(f"{'═'*50}")

if __name__ == "__main__":
    main()
