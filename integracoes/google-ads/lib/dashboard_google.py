"""
gerar_dashboard_google.py — Dashboard Completo Google Ads
Gera relatório HTML com KPIs, benchmarks, evolução diária,
índice de qualidade, top keywords, dispositivos, search terms,
otimizações prioritárias e resumo executivo.

Lê configuração de CLAUDE.md automaticamente (multi-cliente).

Uso:
  python gerar_dashboard_google.py
  python gerar_dashboard_google.py --cliente "Nome"
  python gerar_dashboard_google.py --periodo last_7d
"""
import sys, io, json, os, re
from datetime import datetime, timedelta, date
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Detectar BASE_DIR e REPO_ROOT dinamicamente
_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent)                 # integracoes/google-ads (para output/)
REPO_ROOT = str(_script_dir.parent.parent.parent)  # raiz do repo (para _memoria/)
sys.path.insert(0, str(_script_dir))
from google.ads.googleads.client import GoogleAdsClient

# Globais — preenchidas em main() a partir de CLAUDE.md
CUSTOMER_ID = ""
CLIENT_NAME = ""
YAML_PATH = ""

MESES_BR_LOWER = {1:"jan",2:"fev",3:"mar",4:"abr",5:"mai",6:"jun",
                   7:"jul",8:"ago",9:"set",10:"out",11:"nov",12:"dez"}

# ═══════════════════════════════════════
# CONFIG — leitura de _memoria/contas-ads.md
# ═══════════════════════════════════════
sys.path.insert(0, os.path.join(REPO_ROOT, "integracoes", "comum"))
from contas_parser import extrair_agencia, parsear_tabela_multi, parsear_tabela_legado

def carregar_config(cliente_filtro=None):
    path = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")
    if not os.path.exists(path):
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md e preencha a coluna 'Google Ads ID' (ver skill /ads-conectar).")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        conteudo = f.read()
    agencia = extrair_agencia(conteudo)
    headers, clientes = parsear_tabela_multi(conteudo)
    if headers and any("cliente" in h for h in headers):
        clientes_google = []
        for row in clientes:
            nome = row.get("cliente", "")
            google_id = row.get("google ads id", "")
            handle = row.get("handle ig", "") or row.get("handle", "")
            if google_id:
                clientes_google.append({
                    "nome": nome or agencia,
                    "google_ads_id": google_id,
                    "handle": handle,
                    "agencia": agencia,
                })
    else:
        dados = parsear_tabela_legado(conteudo)
        google_id = dados.get("Google Ads Customer ID", "") or dados.get("Google Ads ID", "")
        cfg = {
            "google_ads_id": google_id,
            "nome": dados.get("cliente", agencia),
            "agencia": agencia,
        }
        clientes_google = [cfg] if google_id else []
    clientes_google = [c for c in clientes_google if c.get("google_ads_id")]
    if not clientes_google:
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md e preencha a coluna 'Google Ads ID' (ver skill /ads-conectar).")
        sys.exit(1)
    if cliente_filtro:
        filtro = cliente_filtro.lower()
        matches = [c for c in clientes_google if filtro in c["nome"].lower()]
        if not matches:
            print(f"ERRO: Cliente '{cliente_filtro}' nao encontrado.")
            for c in clientes_google:
                print(f"  - {c['nome']} ({c['google_ads_id']})")
            sys.exit(1)
        return matches[0]
    if len(clientes_google) == 1:
        return clientes_google[0]
    print("Multiplos clientes encontrados. Use --cliente para selecionar:")
    for c in clientes_google:
        print(f"  - {c['nome']} ({c['google_ads_id']})")
    sys.exit(1)

def gerar_slug(config):
    handle = config.get("handle", "").strip("@").strip()
    if handle:
        return re.sub(r'[^a-z0-9-]', '', handle.lower())
    nome = config.get("nome", "relatorio").lower()
    return re.sub(r'[^a-z0-9-]', '', nome.replace(' ', '-'))

# Benchmarks Google Ads Brasil (Servicos)
BENCHMARKS = {
    "ctr": {"excelente": 5.0, "bom": 2.0},
    "cpc": {"excelente": 1.50, "bom": 5.00},
    "cpa": {"excelente": 30.0, "bom": 80.0},
    "conv_rate": {"excelente": 5.0, "bom": 2.0},
    "quality_score": {"excelente": 8, "bom": 5},
    "search_impression_share": {"excelente": 70, "bom": 40},
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

def badge_for(metric, value):
    b = BENCHMARKS.get(metric)
    if not b: return None
    if metric in ("cpc", "cpa"):
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
    if metric == "cpa": return f"<{fmt_brl(b['excelente'])}"
    if metric == "conv_rate": return f">{b['excelente']}%"
    if metric == "quality_score": return f">{b['excelente']}"
    if metric == "search_impression_share": return f">{b['excelente']}%"
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

# ═══════════════════════════════════════
# PERIOD CALCULATION
# ═══════════════════════════════════════
def parse_periodo(periodo_str):
    today = date.today()
    yesterday = today - timedelta(days=1)
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
    return since, until, prev_since, prev_until

# ═══════════════════════════════════════
# GOOGLE ADS API HELPERS
# ═══════════════════════════════════════
def _get_service():
    client = GoogleAdsClient.load_from_storage(YAML_PATH)
    return client.get_service("GoogleAdsService")

def _query(ga_service, query):
    return list(ga_service.search(customer_id=CUSTOMER_ID, query=query))

# ═══════════════════════════════════════
# TRATAMENTO DE ERROS AMIGÁVEL
# ═══════════════════════════════════════
def tratar_erro(e):
    msg = str(e)
    if "AUTHENTICATION_ERROR" in msg or "expired" in msg.lower() or "RefreshError" in msg:
        print("\n  ERRO: Token Google Ads expirado ou invalido.")
        print("  Solucao: Execute 'python credentials/get_google_refresh_token.py'")
        print("  Depois atualize o refresh_token em credentials/google-ads.yaml")
    elif "AUTHORIZATION_ERROR" in msg or "permission" in msg.lower() or "USER_PERMISSION_DENIED" in msg:
        print("\n  ERRO: Sem permissao para acessar esta conta Google Ads.")
        print("  Verifique se o Customer ID esta correto em CLAUDE.md")
        print("  E se sua conta tem acesso ao MCC/cliente.")
    elif "NOT_FOUND" in msg or "INVALID_CUSTOMER_ID" in msg:
        print("\n  ERRO: Conta Google Ads nao encontrada.")
        print("  Verifique o Google Ads ID em CLAUDE.md (formato: XXXXXXXXXX)")
    elif "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
        print("\n  ERRO: Limite de requisicoes da API atingido.")
        print("  Aguarde alguns minutos e tente novamente.")
    else:
        print(f"\n  ERRO inesperado: {msg}")
    sys.exit(1)

# ═══════════════════════════════════════
# DATA COLLECTION
# ═══════════════════════════════════════
def coletar_account_kpis(ga_service, since, until):
    print("  [1/8] Account KPIs...")
    q = f"""
        SELECT
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_per_conversion,
            metrics.conversions_from_interactions_rate,
            metrics.search_impression_share
        FROM customer
        WHERE segments.date BETWEEN '{since}' AND '{until}'
    """
    rows = _query(ga_service, q)
    if not rows:
        return {"cost": 0, "impressions": 0, "clicks": 0, "conversions": 0,
                "ctr": 0, "cpc": 0, "cpa": 0, "cpm": 0, "conv_rate": 0,
                "search_impression_share": 0}

    total_cost = sum(r.metrics.cost_micros for r in rows) / 1_000_000
    total_imp = sum(r.metrics.impressions for r in rows)
    total_clk = sum(r.metrics.clicks for r in rows)
    total_conv = sum(r.metrics.conversions for r in rows)
    ctr = safe_div(total_clk, total_imp) * 100
    cpc = safe_div(total_cost, total_clk)
    cpa = safe_div(total_cost, total_conv)
    cpm = safe_div(total_cost, total_imp) * 1000
    conv_rate = safe_div(total_conv, total_clk) * 100

    # Search impression share (average across rows)
    sis_vals = [r.metrics.search_impression_share for r in rows if r.metrics.search_impression_share]
    sis = sum(sis_vals) / len(sis_vals) * 100 if sis_vals else 0

    return {
        "cost": total_cost, "impressions": total_imp, "clicks": total_clk,
        "conversions": total_conv, "ctr": ctr, "cpc": cpc, "cpa": cpa,
        "cpm": cpm, "conv_rate": conv_rate, "search_impression_share": sis
    }

def coletar_campaigns(ga_service, since, until):
    print("  [2/8] Campaigns...")
    q = f"""
        SELECT
            campaign.name,
            campaign.id,
            campaign.status,
            campaign.advertising_channel_type,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_per_conversion,
            metrics.conversions_from_interactions_rate,
            metrics.search_impression_share
        FROM campaign
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND campaign.status != 'REMOVED'
          AND metrics.cost_micros > 0
        ORDER BY metrics.cost_micros DESC
    """
    rows = _query(ga_service, q)
    campaigns = []
    for r in rows:
        cost = r.metrics.cost_micros / 1_000_000
        imp = r.metrics.impressions
        clk = r.metrics.clicks
        conv = r.metrics.conversions
        ctr = safe_div(clk, imp) * 100
        cpc = safe_div(cost, clk)
        cpa = safe_div(cost, conv)
        conv_rate = safe_div(conv, clk) * 100
        sis = r.metrics.search_impression_share * 100 if r.metrics.search_impression_share else 0

        channel = str(r.campaign.advertising_channel_type).replace("AdvertisingChannelType.", "")
        campaigns.append({
            "name": r.campaign.name,
            "id": str(r.campaign.id),
            "status": str(r.campaign.status).replace("CampaignStatus.", ""),
            "channel": channel,
            "cost": cost, "impressions": imp, "clicks": clk,
            "conversions": conv, "ctr": ctr, "cpc": cpc, "cpa": cpa,
            "conv_rate": conv_rate, "search_impression_share": sis,
            "badges": {
                "ctr": badge_for("ctr", ctr),
                "cpc": badge_for("cpc", cpc),
                "cpa": badge_for("cpa", cpa) if conv > 0 else None,
                "conv_rate": badge_for("conv_rate", conv_rate) if conv > 0 else None,
            }
        })
    return campaigns

def coletar_daily(ga_service, since, until):
    print("  [3/8] Daily evolution...")
    q = f"""
        SELECT
            segments.date,
            campaign.name,
            metrics.cost_micros,
            metrics.clicks,
            metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND campaign.status != 'REMOVED'
          AND metrics.cost_micros > 0
        ORDER BY segments.date
    """
    rows = _query(ga_service, q)
    daily = {}
    for r in rows:
        d = r.segments.date
        camp = r.campaign.name
        if d not in daily:
            daily[d] = {}
        if camp not in daily[d]:
            daily[d][camp] = {"cost": 0, "clicks": 0, "conversions": 0}
        daily[d][camp]["cost"] += r.metrics.cost_micros / 1_000_000
        daily[d][camp]["clicks"] += r.metrics.clicks
        daily[d][camp]["conversions"] += r.metrics.conversions
    return daily

def coletar_quality_scores(ga_service):
    print("  [4/8] Quality scores...")
    q = f"""
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.quality_info.quality_score,
            ad_group_criterion.quality_info.creative_quality_score,
            ad_group_criterion.quality_info.post_click_quality_score,
            ad_group_criterion.quality_info.search_predicted_ctr,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros
        FROM keyword_view
        WHERE ad_group_criterion.status = 'ENABLED'
          AND campaign.status = 'ENABLED'
          AND ad_group.status = 'ENABLED'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
    """
    try:
        rows = _query(ga_service, q)
    except Exception:
        return []

    keywords = []
    for r in rows:
        qs = r.ad_group_criterion.quality_info.quality_score
        if not qs:
            continue
        keywords.append({
            "keyword": r.ad_group_criterion.keyword.text,
            "quality_score": qs,
            "creative_quality": str(r.ad_group_criterion.quality_info.creative_quality_score).replace("QualityScoreBucket.", ""),
            "landing_page": str(r.ad_group_criterion.quality_info.post_click_quality_score).replace("QualityScoreBucket.", ""),
            "expected_ctr": str(r.ad_group_criterion.quality_info.search_predicted_ctr).replace("QualityScoreBucket.", ""),
            "campaign": r.campaign.name,
            "impressions": r.metrics.impressions,
            "clicks": r.metrics.clicks,
            "cost": r.metrics.cost_micros / 1_000_000,
        })
    return keywords

def coletar_top_keywords(ga_service, since, until):
    print("  [5/8] Top keywords...")
    q = f"""
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.quality_info.quality_score,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.cost_micros,
            metrics.ctr,
            metrics.average_cpc
        FROM keyword_view
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND ad_group_criterion.status = 'ENABLED'
          AND campaign.status = 'ENABLED'
          AND metrics.impressions > 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 30
    """
    try:
        rows = _query(ga_service, q)
    except Exception:
        return []

    keywords = []
    for r in rows:
        cost = r.metrics.cost_micros / 1_000_000
        clk = r.metrics.clicks
        conv = r.metrics.conversions
        ctr = r.metrics.ctr * 100 if r.metrics.ctr else 0
        cpc = safe_div(cost, clk)
        qs = r.ad_group_criterion.quality_info.quality_score or 0

        keywords.append({
            "keyword": r.ad_group_criterion.keyword.text,
            "match_type": str(r.ad_group_criterion.keyword.match_type).replace("KeywordMatchType.", ""),
            "campaign": r.campaign.name,
            "impressions": r.metrics.impressions,
            "clicks": clk,
            "conversions": conv,
            "cost": cost,
            "ctr": ctr,
            "cpc": cpc,
            "quality_score": qs,
            "badge_qs": badge_for("quality_score", qs) if qs else None,
            "badge_ctr": badge_for("ctr", ctr),
        })
    return keywords

def coletar_search_terms(ga_service, since, until):
    print("  [6/8] Search terms audit...")
    q = f"""
        SELECT
            search_term_view.search_term,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.cost_micros
        FROM search_term_view
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND metrics.cost_micros > 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
    """
    try:
        rows = _query(ga_service, q)
    except Exception:
        return []

    terms = []
    for r in rows:
        cost = r.metrics.cost_micros / 1_000_000
        terms.append({
            "term": r.search_term_view.search_term,
            "campaign": r.campaign.name,
            "impressions": r.metrics.impressions,
            "clicks": r.metrics.clicks,
            "conversions": r.metrics.conversions,
            "cost": cost,
        })
    return terms

def coletar_devices(ga_service, since, until):
    print("  [7/8] Device breakdown...")
    q = f"""
        SELECT
            segments.device,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '{since}' AND '{until}'
          AND campaign.status != 'REMOVED'
          AND metrics.cost_micros > 0
    """
    rows = _query(ga_service, q)
    devices = {}
    for r in rows:
        dev = str(r.segments.device).replace("Device.", "")
        if dev not in devices:
            devices[dev] = {"cost": 0, "impressions": 0, "clicks": 0, "conversions": 0}
        devices[dev]["cost"] += r.metrics.cost_micros / 1_000_000
        devices[dev]["impressions"] += r.metrics.impressions
        devices[dev]["clicks"] += r.metrics.clicks
        devices[dev]["conversions"] += r.metrics.conversions
    return devices

# ═══════════════════════════════════════
# GENERATE OPTIMIZATIONS
# ═══════════════════════════════════════
def gerar_otimizacoes(account, campaigns, keywords, search_terms, quality_scores):
    opts = []

    # Campaign-level optimizations
    for camp in campaigns:
        # CTR baixo
        if camp["ctr"] < 2.0 and camp["cost"] > 20 and camp["channel"] == "SEARCH":
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "CTR abaixo do mercado",
                "creative": truncar(camp['name'], 50),
                "description": f"CTR {fmt_pct(camp['ctr'])} com {fmt_brl(camp['cost'])} gastos. "
                    f"Benchmark Search: >2%. Revisar anuncios e palavras-chave."
            })
        # CPA muito alto
        if camp["conversions"] > 0 and camp["cpa"] > 80:
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "CPA acima do mercado",
                "creative": truncar(camp['name'], 50),
                "description": f"CPA {fmt_brl(camp['cpa'])} (benchmark: <R$80). "
                    f"Otimizar lances e revisar publico-alvo."
            })
        # Zero conversions with significant spend
        if camp["conversions"] == 0 and camp["cost"] > 50:
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "Sem conversoes",
                "creative": truncar(camp['name'], 50),
                "description": f"{fmt_brl(camp['cost'])} gastos sem conversoes. "
                    f"Verificar tracking, landing page e relevancia."
            })
        # Low impression share
        if camp["search_impression_share"] > 0 and camp["search_impression_share"] < 30:
            opts.append({
                "priority": "medium", "card_type": "warning",
                "title": "Perdendo impressoes",
                "creative": truncar(camp['name'], 50),
                "description": f"Share de impressao {camp['search_impression_share']:.0f}%. "
                    f"Aumentar lance ou melhorar QS para ganhar mais leiloes."
            })

    # Keyword quality score issues
    for kw in quality_scores[:10]:
        if kw["quality_score"] < 5 and kw["cost"] > 20:
            opts.append({
                "priority": "high", "card_type": "critical",
                "title": "Indice de qualidade baixo",
                "creative": f'"{kw["keyword"]}" (QS: {kw["quality_score"]})',
                "description": f"QS {kw['quality_score']}/10 com {fmt_brl(kw['cost'])} gastos. "
                    f"Pagina: {kw['landing_page']}, CTR esperado: {kw['expected_ctr']}. "
                    f"Melhorar anuncio e landing page."
            })

    # Search terms without conversions (top spenders)
    wasted_terms = [t for t in search_terms if t["conversions"] == 0 and t["cost"] > 10]
    if wasted_terms:
        total_wasted = sum(t["cost"] for t in wasted_terms[:5])
        term_list = ", ".join(f'"{t["term"]}"' for t in wasted_terms[:3])
        opts.append({
            "priority": "medium", "card_type": "warning",
            "title": "Termos de busca a negativar",
            "creative": f"{len(wasted_terms)} termos sem conversao",
            "description": f"{fmt_brl(total_wasted)} gastos em termos sem retorno. "
                f"Exemplos: {term_list}. Adicionar como palavras-chave negativas."
        })

    # Sort by priority
    prio_order = {"high": 0, "medium": 1, "low": 2}
    opts.sort(key=lambda x: prio_order.get(x["priority"], 99))
    return opts[:8]

# ═══════════════════════════════════════
# GENERATE EXECUTIVE SUMMARY
# ═══════════════════════════════════════
def gerar_resumo(account, campaigns, keywords, period_days):
    lines = []
    cost = account["cost"]
    daily_avg = safe_div(cost, period_days)
    lines.append(f"Investimento total de {fmt_brl(cost)} em {period_days} dias ({fmt_brl(daily_avg)}/dia).")

    if account["clicks"] > 0:
        lines.append(f"{fmt_num(account['clicks'])} cliques com CTR de {fmt_pct(account['ctr'])} e CPC medio de {fmt_brl(account['cpc'])}.")

    if account["conversions"] > 0:
        lines.append(f"{account['conversions']:.0f} conversoes com CPA de {fmt_brl(account['cpa'])}.")

    # Best campaign
    if campaigns:
        best = max(campaigns, key=lambda c: c["conversions"])
        if best["conversions"] > 0:
            lines.append(f"Campanha destaque: \"{best['name'][:40]}\" com {best['conversions']:.0f} conversoes e CPA {fmt_brl(best['cpa'])}.")

    # Quality score average
    qs_vals = [k["quality_score"] for k in keywords if k.get("quality_score")]
    if qs_vals:
        avg_qs = sum(qs_vals) / len(qs_vals)
        lines.append(f"Indice de qualidade medio: {avg_qs:.1f}/10 ({len(qs_vals)} keywords avaliadas).")

    return " ".join(lines)

# ═══════════════════════════════════════
# HTML GENERATION
# ═══════════════════════════════════════
def gerar_html(account, prev_account, campaigns, daily_data, quality_scores,
               top_keywords, search_terms, devices, optimizations, resumo,
               since, until, period_days):

    now_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    since_br = since.strftime("%d/%m/%Y")
    until_br = until.strftime("%d/%m/%Y")
    total_cost = account["cost"]

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
        short_name = cn[:25]
        daily_json["campaigns"][short_name] = {
            "cost": [round(daily_data[d].get(cn, {}).get("cost", 0), 2) for d in sorted_dates],
            "clicks": [daily_data[d].get(cn, {}).get("clicks", 0) for d in sorted_dates],
            "conversions": [round(daily_data[d].get(cn, {}).get("conversions", 0), 1) for d in sorted_dates],
        }

    # KPI deltas
    kpis = [
        {"label": "Investimento", "value": fmt_brl(account["cost"]),
         "delta": delta_pct(account["cost"], prev_account["cost"]),
         "icon": "money", "invert": True},
        {"label": "Cliques", "value": fmt_num(account["clicks"]),
         "delta": delta_pct(account["clicks"], prev_account["clicks"]),
         "icon": "click"},
        {"label": "Conversoes", "value": f"{account['conversions']:.0f}",
         "delta": delta_pct(account["conversions"], prev_account["conversions"]),
         "icon": "target"},
        {"label": "CTR", "value": fmt_pct(account["ctr"]),
         "delta": delta_pct(account["ctr"], prev_account["ctr"]),
         "icon": "percent", "badge": badge_for("ctr", account["ctr"])},
        {"label": "CPC", "value": fmt_brl(account["cpc"]),
         "delta": delta_pct(account["cpc"], prev_account["cpc"]),
         "icon": "coin", "invert": True, "badge": badge_for("cpc", account["cpc"])},
        {"label": "CPA", "value": fmt_brl(account["cpa"]) if account["conversions"] > 0 else "—",
         "delta": delta_pct(account["cpa"], prev_account["cpa"]) if account["conversions"] > 0 else {"pct": None, "direction": "neutral", "label": "—"},
         "icon": "funnel", "invert": True,
         "badge": badge_for("cpa", account["cpa"]) if account["conversions"] > 0 else None},
        {"label": "CPM", "value": fmt_brl(account["cpm"]),
         "delta": delta_pct(account["cpm"], prev_account["cpm"]),
         "icon": "eye", "invert": True},
        {"label": "Taxa Conv.", "value": fmt_pct(account["conv_rate"]),
         "delta": delta_pct(account["conv_rate"], prev_account["conv_rate"]),
         "icon": "chart", "badge": badge_for("conv_rate", account["conv_rate"])},
    ]

    # Quality score distribution
    qs_dist = {"low": 0, "mid": 0, "high": 0}
    qs_values = []
    for kw in quality_scores:
        qs = kw["quality_score"]
        qs_values.append(qs)
        if qs <= 3: qs_dist["low"] += 1
        elif qs <= 6: qs_dist["mid"] += 1
        else: qs_dist["high"] += 1
    avg_qs = sum(qs_values) / len(qs_values) if qs_values else 0

    # Campaigns JSON
    camps_json = []
    for c in campaigns:
        pct = round(safe_div(c["cost"], total_cost) * 100) if total_cost else 0
        camps_json.append({
            "name": c["name"],
            "channel": c["channel"],
            "status": c["status"],
            "cost": c["cost"], "impressions": c["impressions"],
            "clicks": c["clicks"], "conversions": c["conversions"],
            "ctr": c["ctr"], "cpc": c["cpc"], "cpa": c["cpa"],
            "conv_rate": c["conv_rate"],
            "search_impression_share": c["search_impression_share"],
            "pct_budget": pct,
            "badges": c["badges"],
        })

    # Keywords JSON
    kw_json = []
    for kw in top_keywords[:20]:
        kw_json.append({
            "keyword": kw["keyword"],
            "match_type": kw["match_type"],
            "campaign": kw["campaign"][:25],
            "impressions": kw["impressions"],
            "clicks": kw["clicks"],
            "conversions": kw["conversions"],
            "cost": kw["cost"],
            "ctr": kw["ctr"],
            "cpc": kw["cpc"],
            "quality_score": kw["quality_score"],
            "badge_qs": kw["badge_qs"],
            "badge_ctr": kw["badge_ctr"],
        })

    # Search terms (no-conversion only)
    wasted_json = [t for t in search_terms if t["conversions"] == 0 and t["cost"] > 5][:15]

    # Devices JSON
    dev_labels = {"MOBILE": "Mobile", "DESKTOP": "Desktop", "TABLET": "Tablet",
                  "CONNECTED_TV": "TV", "OTHER": "Outro"}
    dev_json = []
    for dev, data in sorted(devices.items(), key=lambda x: x[1]["cost"], reverse=True):
        dev_json.append({
            "label": dev_labels.get(dev, dev),
            "cost": data["cost"], "impressions": data["impressions"],
            "clicks": data["clicks"], "conversions": data["conversions"],
        })

    # Build the DATA object
    data_obj = {
        "client": CLIENT_NAME,
        "period": f"{since_br} - {until_br}",
        "generated": now_str,
        "kpis": kpis,
        "campaigns": camps_json,
        "daily": daily_json,
        "quality_scores": {
            "distribution": qs_dist,
            "average": round(avg_qs, 1),
            "keywords": [{"keyword": k["keyword"], "score": k["quality_score"],
                          "creative": k["creative_quality"], "landing": k["landing_page"],
                          "ctr": k["expected_ctr"]} for k in quality_scores[:15]],
        },
        "keywords": kw_json,
        "search_terms_wasted": wasted_json,
        "devices": dev_json,
        "optimizations": optimizations,
        "resumo": resumo,
    }

    # ─── FULL HTML ───
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard Google Ads — {sanitize(CLIENT_NAME)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
:root {{
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #242834;
    --border: #2e3347;
    --accent: #4285f4;
    --accent2: #34a853;
    --green: #34a853;
    --yellow: #fbbc04;
    --red: #ea4335;
    --muted: #8b8fa3;
    --text: #e8eaed;
    --text2: #bdc1c6;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 15px; line-height: 1.6; }}
.container {{ max-width: 1100px; margin: 0 auto; padding: 24px 16px; }}

/* Header */
.header {{ background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; position: relative; overflow: hidden; }}
.header::after {{ content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: rgba(255,255,255,0.05); border-radius: 50%; }}
.header h1 {{ font-size: 26px; font-weight: 700; color: #fff; }}
.header .subtitle {{ color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 6px; }}
.header .meta {{ display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap; }}
.header .meta span {{ background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 8px; font-size: 13px; color: #fff; }}

/* Section titles */
.section-title {{ display: flex; align-items: center; gap: 10px; margin: 32px 0 16px; font-size: 18px; font-weight: 600; color: var(--text); }}
.section-title .num {{ background: var(--accent); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }}

/* KPI Grid */
.kpi-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }}
@media (max-width: 768px) {{ .kpi-grid {{ grid-template-columns: repeat(2, 1fr); }} }}
.kpi-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }}
.kpi-card .label {{ font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }}
.kpi-card .value {{ font-size: 22px; font-weight: 700; margin: 6px 0; color: var(--text); }}
.kpi-card .delta {{ font-size: 12px; font-weight: 600; }}
.kpi-card .delta.up {{ color: var(--green); }}
.kpi-card .delta.down {{ color: var(--red); }}
.kpi-card .delta.neutral {{ color: var(--muted); }}
.kpi-card .delta.up.invert {{ color: var(--red); }}
.kpi-card .delta.down.invert {{ color: var(--green); }}
.badge {{ display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }}
.badge.excelente {{ background: rgba(52,168,83,0.2); color: var(--green); }}
.badge.bom {{ background: rgba(251,188,4,0.2); color: var(--yellow); }}
.badge.ruim {{ background: rgba(234,67,53,0.2); color: var(--red); }}

/* Campaign cards */
.camp-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }}
.camp-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; position: relative; }}
.camp-card .camp-header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }}
.camp-card .camp-name {{ font-size: 14px; font-weight: 600; color: var(--text); max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.camp-card .camp-channel {{ font-size: 11px; padding: 2px 8px; border-radius: 6px; background: rgba(66,133,244,0.15); color: var(--accent); font-weight: 600; }}
.camp-card .metrics-row {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }}
.camp-card .metric {{ text-align: center; }}
.camp-card .metric .m-label {{ font-size: 11px; color: var(--muted); }}
.camp-card .metric .m-value {{ font-size: 15px; font-weight: 600; }}
.camp-card .budget-bar {{ margin-top: 10px; height: 4px; background: var(--border); border-radius: 2px; }}
.camp-card .budget-bar .fill {{ height: 100%; background: var(--accent); border-radius: 2px; }}

/* Chart container */
.chart-box {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }}
.chart-box canvas {{ max-height: 350px; }}

/* Quality Score */
.qs-grid {{ display: grid; grid-template-columns: 200px 1fr; gap: 16px; }}
@media (max-width: 768px) {{ .qs-grid {{ grid-template-columns: 1fr; }} }}
.qs-summary {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }}
.qs-summary .qs-avg {{ font-size: 48px; font-weight: 700; }}
.qs-summary .qs-avg.excelente {{ color: var(--green); }}
.qs-summary .qs-avg.bom {{ color: var(--yellow); }}
.qs-summary .qs-avg.ruim {{ color: var(--red); }}
.qs-dist {{ display: flex; gap: 12px; margin-top: 12px; }}
.qs-dist .qs-bucket {{ flex: 1; text-align: center; padding: 8px; border-radius: 8px; }}
.qs-dist .qs-bucket.high {{ background: rgba(52,168,83,0.15); }}
.qs-dist .qs-bucket.mid {{ background: rgba(251,188,4,0.15); }}
.qs-dist .qs-bucket.low {{ background: rgba(234,67,53,0.15); }}
.qs-dist .count {{ font-size: 20px; font-weight: 700; }}
.qs-dist .qs-label {{ font-size: 11px; color: var(--muted); }}

/* Keywords table */
.kw-table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
.kw-table th {{ text-align: left; padding: 8px 6px; color: var(--muted); font-size: 11px; text-transform: uppercase; border-bottom: 1px solid var(--border); }}
.kw-table td {{ padding: 8px 6px; border-bottom: 1px solid var(--border); }}
.kw-table tr:hover {{ background: var(--surface2); }}
.kw-table .kw-text {{ max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.match-badge {{ font-size: 10px; padding: 1px 5px; border-radius: 4px; background: var(--surface2); color: var(--muted); }}

/* Device cards */
.dev-grid {{ display: grid; grid-template-columns: 250px 1fr; gap: 16px; align-items: center; }}
@media (max-width: 768px) {{ .dev-grid {{ grid-template-columns: 1fr; }} }}
.dev-list {{ display: flex; flex-direction: column; gap: 8px; }}
.dev-item {{ background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }}
.dev-item .dev-name {{ font-weight: 600; }}
.dev-item .dev-cost {{ color: var(--accent); font-weight: 600; }}

/* Search terms */
.st-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }}
.st-card .st-term {{ font-size: 13px; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.st-card .st-cost {{ color: var(--red); font-weight: 600; font-size: 13px; }}

/* Optimizations */
.opt-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }}
.insight-card {{ background: var(--surface); border-radius: 12px; padding: 16px; border-left: 4px solid var(--border); }}
.insight-card.critical {{ border-left-color: var(--red); }}
.insight-card.warning {{ border-left-color: var(--yellow); }}
.insight-card.positive {{ border-left-color: var(--green); }}
.opt-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }}
.opt-header h4 {{ font-size: 14px; font-weight: 600; }}
.priority-tag {{ font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }}
.priority-high {{ background: var(--red); color: #fff; }}
.priority-medium {{ background: var(--yellow); color: #000; }}
.priority-low {{ background: var(--green); color: #fff; }}
.opt-creative {{ font-size: 12px; color: var(--muted); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
.insight-card p {{ font-size: 13px; color: var(--text2); line-height: 1.5; }}

/* Resumo */
.resumo-box {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-top: 16px; }}
.resumo-box p {{ font-size: 15px; line-height: 1.8; color: var(--text2); }}

/* Footer */
.footer {{ text-align: center; margin-top: 40px; padding: 20px; color: var(--muted); font-size: 12px; }}
.footer a {{ color: var(--accent); text-decoration: none; }}
</style>
</head>
<body>
<div class="container">

<!-- Header -->
<div class="header">
  <h1>Dashboard Google Ads</h1>
  <div class="subtitle">{sanitize(CLIENT_NAME)}</div>
  <div class="meta">
    <span>{since_br} - {until_br}</span>
    <span>{period_days} dias</span>
    <span>Gerado: {now_str}</span>
  </div>
</div>

<!-- Content rendered by JS -->
<div id="dashboard"></div>

<div class="footer">
  Gerado automaticamente por Claude Code | {now_str}
</div>

</div>

<script>
const DATA = {json.dumps(data_obj, ensure_ascii=False)};

(function() {{
  const root = document.getElementById('dashboard');

  // ── 1. KPIs ──
  let kpiHtml = '<div class="section-title"><span class="num">1</span> Indicadores-Chave</div><div class="kpi-grid">';
  DATA.kpis.forEach(k => {{
    const d = k.delta;
    let dirClass = d.direction;
    if (k.invert && d.direction !== 'neutral') dirClass += ' invert';
    const badgeHtml = k.badge ? ' <span class="badge '+k.badge+'">'+k.badge+'</span>' : '';
    kpiHtml += '<div class="kpi-card"><div class="label">'+k.label+'</div><div class="value">'+k.value+badgeHtml+'</div><div class="delta '+dirClass+'">'+(d.pct !== null ? (d.direction==='up'?'\\u25B2':'\\u25BC')+' '+d.label : d.label)+'</div></div>';
  }});
  kpiHtml += '</div>';
  root.innerHTML = kpiHtml;

  // ── 2. Campaigns ──
  const channelLabels = {{'SEARCH':'Search','DISPLAY':'Display','VIDEO':'Video','SHOPPING':'Shopping','PERFORMANCE_MAX':'PMax','SMART':'Smart','DISCOVERY':'Discovery','DEMAND_GEN':'Demand Gen'}};
  let campHtml = '<div class="section-title"><span class="num">2</span> Performance por Campanha</div><div class="camp-grid">';
  DATA.campaigns.forEach(c => {{
    const badges = Object.entries(c.badges).filter(([k,v])=>v).map(([k,v])=>'<span class="badge '+v+'">'+k.toUpperCase()+': '+v+'</span>').join(' ');
    campHtml += '<div class="camp-card"><div class="camp-header"><span class="camp-name" title="'+c.name+'">'+c.name.substring(0,35)+'</span><span class="camp-channel">'+(channelLabels[c.channel]||c.channel)+'</span></div>';
    campHtml += '<div class="metrics-row"><div class="metric"><div class="m-label">Investimento</div><div class="m-value">R$ '+(c.cost).toLocaleString('pt-BR',{{minimumFractionDigits:2}})+'</div></div>';
    campHtml += '<div class="metric"><div class="m-label">Cliques</div><div class="m-value">'+c.clicks.toLocaleString('pt-BR')+'</div></div>';
    campHtml += '<div class="metric"><div class="m-label">Conversoes</div><div class="m-value">'+c.conversions.toFixed(0)+'</div></div></div>';
    campHtml += '<div class="metrics-row"><div class="metric"><div class="m-label">CTR</div><div class="m-value">'+(c.ctr).toFixed(2)+'%</div></div>';
    campHtml += '<div class="metric"><div class="m-label">CPC</div><div class="m-value">R$ '+(c.cpc).toFixed(2)+'</div></div>';
    campHtml += '<div class="metric"><div class="m-label">CPA</div><div class="m-value">'+(c.conversions>0?'R$ '+(c.cpa).toFixed(2):'\\u2014')+'</div></div></div>';
    if (c.search_impression_share > 0) {{
      campHtml += '<div class="metrics-row" style="margin-top:4px"><div class="metric"><div class="m-label">Imp. Share</div><div class="m-value">'+(c.search_impression_share).toFixed(0)+'%</div></div><div class="metric" style="grid-column:span 2"><div class="m-label">Benchmarks</div><div class="m-value" style="font-size:12px">'+badges+'</div></div></div>';
    }} else {{
      campHtml += '<div style="margin-top:6px;text-align:center;font-size:12px">'+badges+'</div>';
    }}
    campHtml += '<div class="budget-bar"><div class="fill" style="width:'+c.pct_budget+'%"></div></div></div>';
  }});
  campHtml += '</div>';
  root.innerHTML += campHtml;

  // ── 3. Daily Evolution ──
  root.innerHTML += '<div class="section-title"><span class="num">3</span> Evolucao Diaria</div><div class="chart-box"><canvas id="dailyChart"></canvas></div>';

  const dailyCtx = document.getElementById('dailyChart').getContext('2d');
  const campKeys = Object.keys(DATA.daily.campaigns);
  const colors = ['#4285f4','#ea4335','#fbbc04','#34a853','#ff6d01','#46bdc6','#ab47bc','#78909c'];

  // Stacked bar datasets (cost)
  const barDatasets = campKeys.map((cn, i) => ({{
    label: cn + ' (R$)',
    data: DATA.daily.campaigns[cn].cost,
    backgroundColor: colors[i % colors.length] + 'cc',
    stack: 'cost',
    yAxisID: 'y',
    order: 2,
  }}));

  // Line dataset (total conversions)
  const totalConv = DATA.daily.days.map((_, di) => {{
    return campKeys.reduce((s, cn) => s + (DATA.daily.campaigns[cn].conversions[di]||0), 0);
  }});
  barDatasets.push({{
    label: 'Conversoes',
    data: totalConv,
    type: 'line',
    borderColor: '#34a853',
    backgroundColor: 'transparent',
    borderWidth: 2,
    pointRadius: 3,
    tension: 0.3,
    yAxisID: 'y1',
    order: 1,
  }});

  new Chart(dailyCtx, {{
    type: 'bar',
    data: {{ labels: DATA.daily.days, datasets: barDatasets }},
    options: {{
      responsive: true,
      interaction: {{ mode: 'index', intersect: false }},
      plugins: {{
        tooltip: {{
          callbacks: {{
            label: function(ctx) {{
              if (ctx.dataset.yAxisID === 'y1') return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(0);
              return ctx.dataset.label + ': R$ ' + ctx.parsed.y.toFixed(2);
            }}
          }}
        }},
        legend: {{ labels: {{ color: '#8b8fa3', font: {{ size: 11 }} }} }}
      }},
      scales: {{
        x: {{ ticks: {{ color: '#8b8fa3', font: {{ size: 10 }} }}, grid: {{ color: '#2e3347' }} }},
        y: {{ position: 'left', title: {{ display: true, text: 'Investimento (R$)', color: '#8b8fa3' }}, ticks: {{ color: '#8b8fa3' }}, grid: {{ color: '#2e3347' }} }},
        y1: {{ position: 'right', title: {{ display: true, text: 'Conversoes', color: '#34a853' }}, ticks: {{ color: '#34a853' }}, grid: {{ display: false }} }}
      }}
    }}
  }});

  // ── 4. Quality Score ──
  const qs = DATA.quality_scores;
  let qsHtml = '<div class="section-title"><span class="num">4</span> Indice de Qualidade</div><div class="qs-grid"><div class="qs-summary"><div class="qs-avg '+(qs.average>=8?'excelente':qs.average>=5?'bom':'ruim')+'">'+qs.average+'</div><div style="color:var(--muted);font-size:13px">Media QS</div><div class="qs-dist"><div class="qs-bucket high"><div class="count">'+qs.distribution.high+'</div><div class="qs-label">7-10</div></div><div class="qs-bucket mid"><div class="count">'+qs.distribution.mid+'</div><div class="qs-label">4-6</div></div><div class="qs-bucket low"><div class="count">'+qs.distribution.low+'</div><div class="qs-label">1-3</div></div></div></div>';

  qsHtml += '<div class="chart-box" style="margin-bottom:0"><canvas id="qsChart"></canvas></div></div>';
  root.innerHTML += qsHtml;

  if (qs.keywords.length > 0) {{
    const qsCtx = document.getElementById('qsChart').getContext('2d');
    new Chart(qsCtx, {{
      type: 'bar',
      data: {{
        labels: qs.keywords.map(k => k.keyword.substring(0,20)),
        datasets: [{{
          label: 'Quality Score',
          data: qs.keywords.map(k => k.score),
          backgroundColor: qs.keywords.map(k => k.score >= 8 ? '#34a853cc' : k.score >= 5 ? '#fbbc04cc' : '#ea4335cc'),
          borderRadius: 4,
        }}]
      }},
      options: {{
        indexAxis: 'y',
        responsive: true,
        plugins: {{ legend: {{ display: false }} }},
        scales: {{
          x: {{ min: 0, max: 10, ticks: {{ color: '#8b8fa3' }}, grid: {{ color: '#2e3347' }} }},
          y: {{ ticks: {{ color: '#8b8fa3', font: {{ size: 11 }} }}, grid: {{ display: false }} }}
        }}
      }}
    }});
  }}

  // ── 5. Top Keywords ──
  let kwHtml = '<div class="section-title"><span class="num">5</span> Top Palavras-Chave</div><div class="chart-box" style="overflow-x:auto"><table class="kw-table"><thead><tr><th>Keyword</th><th>Tipo</th><th>Imp.</th><th>Cliques</th><th>Conv.</th><th>Custo</th><th>CTR</th><th>QS</th></tr></thead><tbody>';
  DATA.keywords.forEach(kw => {{
    const qsBadge = kw.quality_score ? '<span class="badge '+(kw.badge_qs||'')+'">'+kw.quality_score+'</span>' : '-';
    kwHtml += '<tr><td class="kw-text" title="'+kw.keyword+'">'+kw.keyword.substring(0,30)+'</td><td><span class="match-badge">'+kw.match_type+'</span></td><td>'+kw.impressions.toLocaleString('pt-BR')+'</td><td>'+kw.clicks.toLocaleString('pt-BR')+'</td><td>'+kw.conversions.toFixed(0)+'</td><td>R$ '+kw.cost.toFixed(2)+'</td><td><span class="badge '+(kw.badge_ctr||'')+'">'+(kw.ctr).toFixed(2)+'%</span></td><td>'+qsBadge+'</td></tr>';
  }});
  kwHtml += '</tbody></table></div>';
  root.innerHTML += kwHtml;

  // ── 6. Devices ──
  root.innerHTML += '<div class="section-title"><span class="num">6</span> Dispositivos</div><div class="dev-grid"><div class="chart-box" style="margin-bottom:0"><canvas id="devChart"></canvas></div><div class="dev-list" id="devList"></div></div>';

  const devCtx = document.getElementById('devChart').getContext('2d');
  const devColors = ['#4285f4','#ea4335','#fbbc04','#34a853','#ab47bc'];
  new Chart(devCtx, {{
    type: 'doughnut',
    data: {{
      labels: DATA.devices.map(d => d.label),
      datasets: [{{
        data: DATA.devices.map(d => d.cost),
        backgroundColor: devColors.slice(0, DATA.devices.length),
        borderWidth: 0,
      }}]
    }},
    options: {{
      responsive: true,
      plugins: {{
        legend: {{ position: 'bottom', labels: {{ color: '#8b8fa3' }} }},
        tooltip: {{ callbacks: {{ label: ctx => ctx.label + ': R$ ' + ctx.parsed.toFixed(2) }} }}
      }}
    }}
  }});

  const devList = document.getElementById('devList');
  devList.innerHTML = DATA.devices.map(d => '<div class="dev-item"><span class="dev-name">'+d.label+'</span><span class="dev-cost">R$ '+d.cost.toFixed(2)+'</span><span style="color:var(--muted);font-size:12px">'+d.clicks+' cliques | '+d.conversions.toFixed(0)+' conv.</span></div>').join('');

  // ── 7. Search Terms Audit ──
  if (DATA.search_terms_wasted.length > 0) {{
    let stHtml = '<div class="section-title"><span class="num">7</span> Auditoria de Termos de Busca</div><div style="color:var(--muted);font-size:13px;margin-bottom:10px">Termos com gasto e zero conversoes — considere negativar:</div>';
    DATA.search_terms_wasted.forEach(t => {{
      stHtml += '<div class="st-card"><span class="st-term" title="'+t.term+'">'+t.term+'</span><span style="color:var(--muted);font-size:12px">'+t.clicks+' cliques</span><span class="st-cost">R$ '+t.cost.toFixed(2)+'</span></div>';
    }});
    root.innerHTML += stHtml;
  }}

  // ── 8. Optimizations ──
  const prioLabel = {{'high':'ALTA','medium':'MEDIA','low':'BAIXA'}};
  const prioIcon = {{'critical':'\\u26A0\\uFE0F','warning':'\\u26A0\\uFE0F','positive':'\\u2705'}};
  if (DATA.optimizations.length > 0) {{
    let optHtml = '<div class="section-title"><span class="num">8</span> Otimizacoes Prioritarias</div><div class="opt-grid">';
    optHtml += DATA.optimizations.map(o => {{
      return '<div class="insight-card '+o.card_type+'"><div class="opt-header"><span class="priority-tag priority-'+o.priority+'">'+(prioLabel[o.priority]||o.priority)+'</span><h4>'+(prioIcon[o.card_type]||'')+' '+o.title+'</h4></div>'+(o.creative?'<div class="opt-creative">'+o.creative+'</div>':'')+'<p>'+o.description+'</p></div>';
    }}).join('');
    optHtml += '</div>';
    root.innerHTML += optHtml;
  }}

  // ── 9. Executive Summary ──
  root.innerHTML += '<div class="section-title"><span class="num">9</span> Resumo Executivo</div><div class="resumo-box"><p>'+DATA.resumo+'</p></div>';
}})();
</script>
</body>
</html>"""
    return html

# ═══════════════════════════════════════
# MAIN
# ═══════════════════════════════════════
def main():
    global CUSTOMER_ID, CLIENT_NAME, YAML_PATH

    import argparse
    parser = argparse.ArgumentParser(description="Dashboard Completo Google Ads")
    parser.add_argument("--cliente", default=None,
                        help='Nome do cliente (ex: "Meu Cliente"). Auto se 1 cliente.')
    parser.add_argument("--periodo", default="last_30d",
                        help="yesterday, last_7d, last_14d, last_30d ou YYYY-MM-DD:YYYY-MM-DD")
    args = parser.parse_args()

    # Carregar config de CLAUDE.md
    config = carregar_config(args.cliente)
    CUSTOMER_ID = config["google_ads_id"].replace("-", "")
    CLIENT_NAME = config["nome"]
    YAML_PATH = os.path.join(REPO_ROOT, "integracoes", "credentials", "google-ads.yaml")
    slug = gerar_slug(config)

    if not os.path.exists(YAML_PATH):
        print(f"ERRO: Credenciais nao encontradas: {YAML_PATH}")
        print("Execute /conectar-google para configurar.")
        sys.exit(1)

    since, until, prev_since, prev_until = parse_periodo(args.periodo)
    period_days = (until - since).days or 1
    print(f"\n{'='*50}")
    print(f"Dashboard Google Ads — {CLIENT_NAME}")
    print(f"Periodo: {since} -> {until} ({period_days} dias)")
    print(f"Customer ID: {CUSTOMER_ID}")
    print(f"{'='*50}\n")

    try:
        ga_service = _get_service()
    except Exception as e:
        tratar_erro(e)

    # Collect data
    try:
        account = coletar_account_kpis(ga_service, since, until)
        print(f"    Gasto: {fmt_brl(account['cost'])} | Cliques: {fmt_num(account['clicks'])} | CTR: {fmt_pct(account['ctr'])}")

        prev_account = coletar_account_kpis(ga_service, prev_since, prev_until)
        print(f"    Periodo anterior: {fmt_brl(prev_account['cost'])}")

        campaigns = coletar_campaigns(ga_service, since, until)
        print(f"    {len(campaigns)} campanhas")

        daily_data = coletar_daily(ga_service, since, until)
        print(f"    {len(daily_data)} dias com dados")

        quality_scores = coletar_quality_scores(ga_service)
        print(f"    {len(quality_scores)} keywords com QS")

        top_keywords = coletar_top_keywords(ga_service, since, until)
        print(f"    {len(top_keywords)} keywords")

        search_terms = coletar_search_terms(ga_service, since, until)
        print(f"    {len(search_terms)} search terms")

        devices = coletar_devices(ga_service, since, until)
        print(f"    {len(devices)} dispositivos")

    except Exception as e:
        tratar_erro(e)

    # Generate insights
    optimizations = gerar_otimizacoes(account, campaigns, quality_scores, search_terms, quality_scores)
    resumo = gerar_resumo(account, campaigns, top_keywords, period_days)

    # Generate HTML
    html = gerar_html(account, prev_account, campaigns, daily_data, quality_scores,
                      top_keywords, search_terms, devices, optimizations, resumo,
                      since, until, period_days)

    # Save
    output_dir = os.path.join(REPO_ROOT, "saidas", "relatorios", slug)
    os.makedirs(output_dir, exist_ok=True)
    hoje = datetime.now()
    filename = f"dashboard-google-ads-{MESES_BR_LOWER[hoje.month]}-{hoje.year}.html"
    output_path = os.path.join(output_dir, filename)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n{'='*50}")
    print(f"Dashboard gerado com sucesso!")
    print(f"  Arquivo   : {output_path}")
    print(f"  Periodo   : {since} -> {until}")
    print(f"  Campanhas : {len(campaigns)}")
    print(f"  Keywords  : {len(top_keywords)}")
    print(f"  QS medio  : {sum(k['quality_score'] for k in quality_scores)/max(len(quality_scores),1):.1f}/10" if quality_scores else "  QS        : sem dados")
    print(f"  Otimizacoes: {len(optimizations)}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
