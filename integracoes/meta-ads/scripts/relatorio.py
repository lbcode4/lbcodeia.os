"""
gerar_relatorio_meta.py — Dashboard Meta Ads + Instagram
Gera relatório HTML com hierarquia completa, gráficos CSS puros,
comparativo com período anterior, funil de retenção de vídeo,
toggle dark/light, e insights automáticos.

Uso:
  python gerar_relatorio_meta.py
  python gerar_relatorio_meta.py --cliente "Nome do Cliente"
  python gerar_relatorio_meta.py --periodo last_30d --tema light
  python gerar_relatorio_meta.py --cliente "Nome do Cliente" --periodo last_30d
"""
import sys, io, json, os, re, argparse
from datetime import datetime, timedelta

if 'pytest' not in sys.modules:
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except AttributeError:
        pass
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from meta_api import MetaAPIClient, MetaAPIError

_api_client = None

def get(endpoint, params=None):
    """Compatibility shim: wraps MetaAPIClient to keep all get() calls unchanged."""
    global _api_client
    if _api_client is None:
        _api_client = MetaAPIClient()
    return _api_client.get(endpoint.lstrip('/'), params)

MAX_REELS = 10
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MESES_BR = {1:"Jan",2:"Fev",3:"Mar",4:"Abr",5:"Mai",6:"Jun",
             7:"Jul",8:"Ago",9:"Set",10:"Out",11:"Nov",12:"Dez"}
MESES_BR_LOWER = {1:"jan",2:"fev",3:"mar",4:"abr",5:"mai",6:"jun",
                   7:"jul",8:"ago",9:"set",10:"out",11:"nov",12:"dez"}


# ══════════════════════════════════════════════════════════
# CONFIGURAÇÃO (ler _memoria/contas-ads.md)
# ══════════════════════════════════════════════════════════
sys.path.insert(0, os.path.join(REPO_ROOT, "integracoes", "comum"))
from contas_parser import extrair_agencia, parsear_tabela_multi, parsear_tabela_legado

def carregar_config(cliente_filtro=None):
    """Lê contas-ads.md e retorna config do cliente (Meta).
    Suporta formato multi-cliente (novo) e legado (antigo).
    Se cliente_filtro=None e só tem 1 cliente, usa ele.
    Se múltiplos clientes e sem filtro, lista e sai."""
    path = f"{REPO_ROOT}/_memoria/contas-ads.md"
    if not os.path.exists(path):
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md (ver skill /ads-conectar).")
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as f:
        conteudo = f.read()

    agencia = extrair_agencia(conteudo)

    # Detectar formato: novo (tem "Cliente" no header) vs legado (tem "Campo")
    headers, clientes = parsear_tabela_multi(conteudo)

    if headers and any("cliente" in h for h in headers):
        # Formato novo: multi-cliente
        clientes_meta = []
        for row in clientes:
            nome = row.get("cliente", "")
            ad_account = row.get("meta ad account", "") or row.get("meta ad account id", "")
            ig_user = row.get("ig user id", "")
            handle = row.get("handle ig", "") or row.get("handle", "")
            google_id = row.get("google ads id", "")

            if ad_account or ig_user:
                clientes_meta.append({
                    "nome": nome or agencia,
                    "ad_account_id": ad_account,
                    "ig_user_id": ig_user,
                    "handle": handle,
                    "google_ads_id": google_id,
                    "agencia": agencia,
                })
    else:
        # Formato legado (tabela Campo | Valor)
        dados = parsear_tabela_legado(conteudo)
        cfg = {
            "ad_account_id": dados.get("Meta Ad Account ID", ""),
            "ig_user_id": dados.get("Instagram User ID", ""),
            "handle": dados.get("Handle Instagram", ""),
            "nome": dados.get("cliente", agencia),
            "google_ads_id": dados.get("Google Ads Customer ID", ""),
            "agencia": agencia,
        }
        clientes_meta = [cfg] if (cfg["ad_account_id"] or cfg["ig_user_id"]) else []

    # Filtrar clientes sem Meta Ads configurado
    clientes_meta = [c for c in clientes_meta if c.get("ad_account_id")]

    if not clientes_meta:
        print("ERRO: Nenhum cliente com Meta Ads configurado em CLAUDE.md.")
        print("Execute /configurar-ambiente para adicionar um cliente.")
        sys.exit(1)

    # Selecionar cliente
    if cliente_filtro:
        filtro = cliente_filtro.lower()
        matches = [c for c in clientes_meta if filtro in c["nome"].lower()]
        if not matches:
            print(f"ERRO: Cliente '{cliente_filtro}' não encontrado.")
            print("Clientes disponíveis:")
            for c in clientes_meta:
                print(f"  - {c['nome']} ({c['ad_account_id']})")
            sys.exit(1)
        return matches[0]

    if len(clientes_meta) == 1:
        return clientes_meta[0]

    # Múltiplos clientes, sem filtro
    print("Múltiplos clientes encontrados. Use --cliente para selecionar:")
    for c in clientes_meta:
        print(f"  - {c['nome']} ({c['ad_account_id']}, {c['handle']})")
    print(f"\nExemplo: python gerar_relatorio_meta.py --cliente \"{clientes_meta[0]['nome']}\"")
    sys.exit(1)


# ══════════════════════════════════════════════════════════
# HELPERS DE FORMATAÇÃO
# ══════════════════════════════════════════════════════════
def fmt_num(n):
    try:
        return f"{int(float(n)):,}".replace(",", ".")
    except (ValueError, TypeError):
        return str(n)

def fmt_brl(v):
    try:
        return f"R$ {float(v):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except (ValueError, TypeError):
        return f"R$ {v}"

def fmt_pct(v):
    try:
        return f"{float(v):.2f}%".replace(".", ",")
    except (ValueError, TypeError):
        return f"{v}%"

def safe_div(a, b, default=0):
    try:
        a, b = float(a), float(b)
        return a / b if b != 0 else default
    except (ValueError, TypeError):
        return default

def extrair_action(actions, action_type, default="0"):
    if not actions:
        return default
    for a in actions:
        if a.get("action_type") == action_type:
            return a.get("value", default)
    return default

def data_br(date_str):
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return f"{d.day} {MESES_BR[d.month]}"
    except:
        return date_str

def sanitize_text(s):
    """Remove surrogates e caracteres inválidos de textos da API."""
    if not s:
        return s
    return re.sub(r'[\ud800-\udfff]', '', str(s))

def truncar(texto, max_len=80):
    if not texto:
        return ""
    texto = sanitize_text(texto)
    primeira_linha = texto.split("\n")[0]
    if len(primeira_linha) > max_len:
        return primeira_linha[:max_len] + "..."
    return primeira_linha

def delta_html(valor, inverso=False):
    """Gera HTML para delta. inverso=True: queda é positiva (CPC, CPM)."""
    if valor is None:
        return '<span class="delta neutral">—</span>'
    if inverso:
        classe = "down" if valor > 0 else "up" if valor < 0 else "neutral"
    else:
        classe = "up" if valor > 0 else "down" if valor < 0 else "neutral"
    seta = "▲" if valor > 0 else "▼" if valor < 0 else "—"
    return f'<span class="delta {classe}">{seta} {abs(valor):.1f}%</span>'

def extrair_video_metric(data, field_name):
    actions = data.get(field_name, [])
    if not actions:
        return 0
    return sum(int(a.get('value', 0)) for a in actions)

def extrair_video_retention(data):
    impressions = int(data.get('impressions', 0))
    if impressions == 0:
        return None
    p25 = extrair_video_metric(data, 'video_p25_watched_actions')
    p50 = extrair_video_metric(data, 'video_p50_watched_actions')
    p75 = extrair_video_metric(data, 'video_p75_watched_actions')
    p100 = extrair_video_metric(data, 'video_p100_watched_actions')
    if p25 == 0 and p50 == 0 and p75 == 0 and p100 == 0:
        return None
    return {
        'impressions': impressions,
        'p25': p25, 'p25_pct': safe_div(p25, impressions) * 100,
        'p50': p50, 'p50_pct': safe_div(p50, impressions) * 100,
        'p75': p75, 'p75_pct': safe_div(p75, impressions) * 100,
        'p100': p100, 'p100_pct': safe_div(p100, impressions) * 100,
    }


# ══════════════════════════════════════════════════════════
# CLI E PERÍODO
# ══════════════════════════════════════════════════════════
def parse_args():
    parser = argparse.ArgumentParser(description="Dashboard Meta Ads + Instagram")
    parser.add_argument('--cliente', default=None,
                        help='Nome do cliente (ex: "Nome do Cliente"). Obrigatório se há múltiplos clientes.')
    parser.add_argument('--periodo', default='last_90d',
                        help='last_7d, last_14d, last_30d, last_60d, last_90d ou YYYY-MM-DD:YYYY-MM-DD')
    parser.add_argument('--tema', default='dark', choices=['dark', 'light'],
                        help='Tema inicial do relatório')
    return parser.parse_args()

def calcular_periodos(periodo_str):
    """Retorna dict com params da API para período atual e anterior."""
    hoje = datetime.now()
    preset_map = {'last_7d': 7, 'last_14d': 14, 'last_30d': 30, 'last_60d': 60, 'last_90d': 90}

    if periodo_str in preset_map:
        dias = preset_map[periodo_str]
        until_dt = hoje - timedelta(days=1)
        since_dt = until_dt - timedelta(days=dias - 1)
        ant_until = since_dt - timedelta(days=1)
        ant_since = ant_until - timedelta(days=dias - 1)

        return {
            "atual": {"date_preset": periodo_str},
            "anterior": {"time_range": json.dumps({
                "since": ant_since.strftime("%Y-%m-%d"),
                "until": ant_until.strftime("%Y-%m-%d")
            })},
            "since": since_dt.strftime("%Y-%m-%d"),
            "until": until_dt.strftime("%Y-%m-%d"),
            "since_org": since_dt.strftime("%Y-%m-%d"),
            "until_org": (until_dt + timedelta(days=1)).strftime("%Y-%m-%d"),
            "dias": dias,
            "label": f"Últimos {dias} dias",
        }

    if ':' in periodo_str:
        parts = periodo_str.split(':')
        since_dt = datetime.strptime(parts[0], "%Y-%m-%d")
        until_dt = datetime.strptime(parts[1], "%Y-%m-%d")
        dias = (until_dt - since_dt).days + 1
        ant_until = since_dt - timedelta(days=1)
        ant_since = ant_until - timedelta(days=dias - 1)

        tr_atual = json.dumps({"since": parts[0], "until": parts[1]})
        tr_ant = json.dumps({
            "since": ant_since.strftime("%Y-%m-%d"),
            "until": ant_until.strftime("%Y-%m-%d")
        })
        return {
            "atual": {"time_range": tr_atual},
            "anterior": {"time_range": tr_ant},
            "since": parts[0],
            "until": parts[1],
            "since_org": parts[0],
            "until_org": (until_dt + timedelta(days=1)).strftime("%Y-%m-%d"),
            "dias": dias,
            "label": f"{since_dt.strftime('%d/%m')} – {until_dt.strftime('%d/%m/%Y')}",
        }

    print(f"ERRO: Período inválido: {periodo_str}")
    print("Use: last_7d, last_14d, last_30d ou YYYY-MM-DD:YYYY-MM-DD")
    sys.exit(1)

def gerar_slug(config):
    handle = config.get("handle", "").strip("@").strip()
    if handle:
        return re.sub(r'[^a-z0-9-]', '', handle.lower())
    nome = config.get("nome", "relatorio").lower()
    return re.sub(r'[^a-z0-9-]', '', nome.replace(' ', '-'))


# ══════════════════════════════════════════════════════════
# COLETA DE DADOS
# ══════════════════════════════════════════════════════════
def coletar_account_insights(ad_account_id, params):
    print("  Coletando account insights...")
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "spend,impressions,clicks,reach,ctr,cpc,cpm,frequency,"
                      "actions,cost_per_action_type",
            "level": "account",
            **params,
        })
        if resp.get("data"):
            return resp["data"][0]
    except Exception as e:
        print(f"    ERRO: {e}")
    return {}

def coletar_account_anterior(ad_account_id, params):
    print("  Coletando período anterior (comparativo)...")
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "spend,impressions,clicks,reach,ctr,cpc,cpm,frequency,"
                      "actions,cost_per_action_type",
            "level": "account",
            **params,
        })
        if resp.get("data"):
            return resp["data"][0]
    except Exception as e:
        print(f"    ERRO: {e}")
    return {}

def coletar_campaign_insights(ad_account_id, params):
    print("  Coletando campaign insights...")
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "campaign_name,campaign_id,spend,impressions,clicks,reach,"
                      "ctr,cpc,cpm,frequency,actions,cost_per_action_type",
            "level": "campaign",
            "limit": "50",
            **params,
        })
        return resp.get("data", [])
    except Exception as e:
        print(f"    ERRO: {e}")
    return []

def coletar_adset_insights(ad_account_id, params):
    print("  Coletando ad set insights...")
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "campaign_name,adset_name,adset_id,spend,impressions,"
                      "clicks,reach,ctr,cpc,frequency,actions",
            "level": "adset",
            "limit": "50",
            **params,
        })
        return resp.get("data", [])
    except Exception as e:
        print(f"    ERRO: {e}")
    return []

def coletar_ads_com_criativos(ad_account_id, params):
    print("  Coletando ads + criativos...")
    ads_map = {}
    try:
        resp = get(f"/{ad_account_id}/ads", {
            "fields": "id,name,status,effective_status,"
                      "creative{id,name,title,body,call_to_action_type,"
                      "thumbnail_url,image_url,video_id,link_url}",
            "limit": "100",
        })
        for ad in resp.get('data', []):
            ads_map[ad['id']] = ad
    except Exception as e:
        print(f"    ERRO ads: {e}")

    dados = []
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "ad_id,ad_name,campaign_name,adset_name,"
                      "spend,impressions,clicks,reach,ctr,cpc,actions,"
                      "video_p25_watched_actions,video_p50_watched_actions,"
                      "video_p75_watched_actions,video_p100_watched_actions",
            "level": "ad",
            "limit": "50",
            **params,
        })
        for ins in resp.get('data', []):
            ad_id = ins.get('ad_id', '')
            ad_info = ads_map.get(ad_id, {
                'id': ad_id,
                'name': ins.get('ad_name', 'N/A'),
                'status': 'UNKNOWN'
            })
            dados.append({
                'ad': ad_info,
                'insights': ins,
                'retention': extrair_video_retention(ins),
            })
    except Exception as e:
        print(f"    ERRO ad insights: {e}")
    return dados

def coletar_daily_breakdown(ad_account_id, params):
    print("  Coletando daily breakdown...")
    try:
        resp = get(f"/{ad_account_id}/insights", {
            "fields": "date_start,spend,impressions,clicks,reach,ctr,cpc,actions",
            "time_increment": "1",
            "level": "account",
            **params,
        })
        return resp.get("data", [])
    except Exception as e:
        print(f"    ERRO: {e}")
    return []

def coletar_organico(ig_user_id, since, until):
    dados = {"insights": {}, "profile": {}}
    print("  Coletando IG insights orgânicos...")
    try:
        # IG Insights API: máximo 30 dias por request — dividir em chunks
        since_dt = datetime.strptime(since, "%Y-%m-%d")
        until_dt = datetime.strptime(until, "%Y-%m-%d")
        total_days = (until_dt - since_dt).days
        chunks = []
        chunk_start = since_dt
        while chunk_start < until_dt:
            chunk_end = min(chunk_start + timedelta(days=30), until_dt)
            chunks.append((chunk_start.strftime("%Y-%m-%d"), chunk_end.strftime("%Y-%m-%d")))
            chunk_start = chunk_end

        aggregated = {}
        for c_since, c_until in chunks:
            resp = get(f"/{ig_user_id}/insights", {
                "metric": "reach,profile_views,accounts_engaged,total_interactions,views",
                "period": "day",
                "metric_type": "total_value",
                "since": c_since,
                "until": c_until,
            })
            for m in resp.get("data", []):
                val = m.get("total_value", {}).get("value", 0)
                aggregated[m["name"]] = aggregated.get(m["name"], 0) + val

        dados["insights"] = aggregated
        if len(chunks) > 1:
            print(f"    Coletado em {len(chunks)} chunks de 30 dias")
    except Exception as e:
        print(f"    ERRO IG insights: {e}")

    print("  Coletando IG profile...")
    try:
        resp = get(f"/{ig_user_id}", {
            "fields": "followers_count,follows_count,media_count,username"
        })
        dados["profile"] = resp
    except Exception as e:
        print(f"    ERRO IG profile: {e}")
    return dados

def buscar_reels_recentes(ig_user_id, max_reels=10):
    print(f"  Buscando Reels recentes (máx. {max_reels})...")
    try:
        resp = get(f"/{ig_user_id}/media", {
            "fields": "id,caption,timestamp,media_type",
            "limit": "50",
        })
        reels_ids = []
        for m in resp.get("data", []):
            if m.get("media_type") == "VIDEO":
                reels_ids.append(m["id"])
                if len(reels_ids) >= max_reels:
                    break
        print(f"  Encontrados {len(reels_ids)} Reels")
        return reels_ids
    except Exception as e:
        print(f"    ERRO: {e}")
    return []

def coletar_reels_insights(reels_ids):
    reels = []
    print(f"  Coletando insights de {len(reels_ids)} Reels...")
    for rid in reels_ids:
        reel = {"id": rid, "insights": {}, "details": {}}
        try:
            resp = get(f"/{rid}/insights", {
                "metric": "reach,saved,shares,total_interactions,likes,comments,views"
            })
            for m in resp.get("data", []):
                reel["insights"][m["name"]] = m["values"][0]["value"]
        except Exception as e:
            print(f"    ERRO insights {rid}: {e}")
        try:
            resp = get(f"/{rid}", {
                "fields": "caption,timestamp,like_count,comments_count,media_type,permalink"
            })
            reel["details"] = resp
        except Exception as e:
            print(f"    ERRO details {rid}: {e}")
        reels.append(reel)
    return reels


# ══════════════════════════════════════════════════════════
# CÁLCULOS
# ══════════════════════════════════════════════════════════
def calcular_deltas(atual, anterior):
    if not atual or not anterior:
        return {}
    deltas = {}
    for campo in ['spend', 'impressions', 'clicks', 'reach', 'ctr', 'cpc', 'cpm', 'frequency']:
        v_atual = float(atual.get(campo, 0) or 0)
        v_ant = float(anterior.get(campo, 0) or 0)
        if v_ant > 0:
            deltas[campo] = ((v_atual - v_ant) / v_ant) * 100
        else:
            deltas[campo] = None
    return deltas

def classificar_saturacao(freq):
    try:
        f = float(freq)
        if f >= 5.0:
            return "critica"
        if f >= 3.0:
            return "atencao"
        return "ok"
    except (ValueError, TypeError):
        return "ok"

def gerar_insights_auto(account, campaigns, ads, organico, reels, deltas):
    insights = []
    ctr = float(account.get('ctr', 0) or 0)
    spend = float(account.get('spend', 0) or 0)
    frequency = float(account.get('frequency', 0) or 0)

    # CTR
    if ctr > 2:
        insights.append({
            'tipo': 'success', 'icone': '✅',
            'titulo': f'CTR {fmt_pct(ctr)} — acima da média',
            'desc': 'Média Meta Ads para tráfego: 1–2%. O criativo está performando acima do mercado.'
        })
    elif ctr > 0:
        insights.append({
            'tipo': 'warning', 'icone': '⚠️',
            'titulo': f'CTR {fmt_pct(ctr)} — dentro/abaixo da média',
            'desc': 'Considere testar novos criativos, headlines ou públicos para melhorar o CTR.'
        })

    # Saturação
    if frequency >= 5.0:
        insights.append({
            'tipo': 'danger', 'icone': '🔴',
            'titulo': f'Frequência {frequency:.1f} — saturação crítica',
            'desc': 'O público já viu o anúncio muitas vezes. Troque criativos ou expanda o público.'
        })
    elif frequency >= 3.0:
        insights.append({
            'tipo': 'warning', 'icone': '🟡',
            'titulo': f'Frequência {frequency:.1f} — atenção',
            'desc': 'Frequência subindo. Monitore a taxa de cliques e considere novos criativos.'
        })

    # Saves
    saves = int(extrair_action(account.get('actions', []), 'onsite_conversion.post_save'))
    if saves > 50:
        insights.append({
            'tipo': 'success', 'icone': '💾',
            'titulo': f'{fmt_num(saves)} salvamentos — alta intenção',
            'desc': 'Criar Custom Audience de "Pessoas que salvaram o post" para remarketing.'
        })

    # Top creative
    if ads:
        top_ad = max(ads, key=lambda a: float(a['insights'].get('spend', 0) or 0))
        top_ctr = float(top_ad['insights'].get('ctr', 0) or 0)
        top_name = top_ad['ad'].get('name', 'N/A')
        if top_ctr > 3:
            insights.append({
                'tipo': 'success', 'icone': '🏆',
                'titulo': f'Top criativo: CTR {fmt_pct(top_ctr)}',
                'desc': f'"{truncar(top_name, 50)}" está performando bem. Considere aumentar o orçamento deste ad.'
            })

    # Orgânico
    org_reach = organico.get('insights', {}).get('reach', 0)
    if org_reach > 0:
        insights.append({
            'tipo': 'info', 'icone': '📱',
            'titulo': f'Orgânico: {fmt_num(org_reach)} alcance',
            'desc': f'O conteúdo orgânico amplifica o efeito dos Ads. '
                    f'{len(reels)} Reels analisados no período.'
        })

    # Deltas
    delta_spend = deltas.get('spend')
    delta_ctr = deltas.get('ctr')
    if delta_spend is not None and delta_spend > 30:
        insights.append({
            'tipo': 'info', 'icone': '📈',
            'titulo': f'Gasto aumentou {delta_spend:.0f}% vs anterior',
            'desc': 'Investimento cresceu significativamente. Verifique se o retorno acompanhou.'
        })
    if delta_ctr is not None and delta_ctr < -20:
        insights.append({
            'tipo': 'warning', 'icone': '📉',
            'titulo': f'CTR caiu {abs(delta_ctr):.0f}% vs anterior',
            'desc': 'Possível fadiga de criativo ou público saturado. Teste variações.'
        })

    return insights


# ══════════════════════════════════════════════════════════
# GERAÇÃO DO HTML
# ══════════════════════════════════════════════════════════
def gerar_html(dados, config, tema, periodos):
    acc = dados['account']
    ant = dados['anterior']
    camps = dados['campaigns']
    adsets = dados['adsets']
    ads = dados['ads']
    daily = dados['daily']
    org = dados['organico']
    reels = dados['reels']
    deltas = dados['deltas']
    insights_auto = dados['insights_auto']

    # Métricas da conta
    spend = acc.get('spend', '0')
    impressions = acc.get('impressions', '0')
    clicks = acc.get('clicks', '0')
    reach = acc.get('reach', '0')
    ctr = acc.get('ctr', '0')
    cpc = acc.get('cpc', '0')
    cpm = acc.get('cpm', '0')
    frequency = acc.get('frequency', '0')
    actions = acc.get('actions', [])
    cost_actions = acc.get('cost_per_action_type', [])
    date_start = acc.get('date_start', periodos['since'])
    date_stop = acc.get('date_stop', periodos['until'])
    hoje = datetime.now().strftime("%d/%m/%Y")
    dias_ativos = len(daily) or periodos['dias']
    gasto_diario = safe_div(float(spend), dias_ativos)

    # Actions
    video_views = extrair_action(actions, 'video_view')
    saves = extrair_action(actions, 'onsite_conversion.post_save')
    reactions = extrair_action(actions, 'post_reaction')
    comments_count = extrair_action(actions, 'comment')
    link_clicks = extrair_action(actions, 'link_click')
    dm_conversations = extrair_action(actions, 'onsite_conversion.messaging_conversation_started_7d')
    leads = extrair_action(actions, 'lead')
    landing_page_views = extrair_action(actions, 'landing_page_view')

    # Costs per action
    cpa_link = extrair_action(cost_actions, 'link_click')
    cpa_lead = extrair_action(cost_actions, 'lead')
    cpa_dm = extrair_action(cost_actions, 'onsite_conversion.messaging_conversation_started_7d')
    cpa_save = extrair_action(cost_actions, 'onsite_conversion.post_save')

    # Orgânico
    org_ins = org.get('insights', {})
    org_prof = org.get('profile', {})
    org_reach = org_ins.get('reach', 0)
    org_views = org_ins.get('views', 0)
    org_interactions = org_ins.get('total_interactions', 0)
    org_engaged = org_ins.get('accounts_engaged', 0)
    org_profile_views = org_ins.get('profile_views', 0)
    followers = org_prof.get('followers_count', 0)
    media_count = org_prof.get('media_count', 0)
    username = org_prof.get('username', config['handle'].replace('@', ''))

    # Período label
    try:
        dt_s = datetime.strptime(date_start, "%Y-%m-%d")
        dt_e = datetime.strptime(date_stop, "%Y-%m-%d")
        periodo_label = f"{dt_s.day} – {dt_e.day} {MESES_BR[dt_e.month]} {dt_e.year}"
    except:
        periodo_label = f"{date_start} – {date_stop}"

    # Totais combinados
    total_reach = int(reach) + int(org_reach)
    total_views = int(video_views) + int(org_views)

    # ─── Dados embarcados para filtro interativo ───
    daily_json_items = []
    for d in daily:
        d_actions = d.get('actions', [])
        daily_json_items.append({
            'date': d.get('date_start', ''),
            'spend': round(float(d.get('spend', 0)), 2),
            'impressions': int(d.get('impressions', 0)),
            'clicks': int(d.get('clicks', 0)),
            'reach': int(d.get('reach', 0)),
            'link_clicks': int(extrair_action(d_actions, 'link_click')),
            'video_views': int(extrair_action(d_actions, 'video_view')),
            'saves': int(extrair_action(d_actions, 'onsite_conversion.post_save')),
            'dms': int(extrair_action(d_actions, 'onsite_conversion.messaging_conversation_started_7d')),
            'leads': int(extrair_action(d_actions, 'lead')),
            'reactions': int(extrair_action(d_actions, 'post_reaction')),
            'comments_count': int(extrair_action(d_actions, 'comment')),
            'landing_page_views': int(extrair_action(d_actions, 'landing_page_view')),
        })
    daily_embed = json.dumps(daily_json_items, ensure_ascii=False)

    anterior_embed_obj = None
    if ant:
        anterior_embed_obj = {
            'spend': float(ant.get('spend', 0) or 0),
            'impressions': int(ant.get('impressions', 0) or 0),
            'clicks': int(ant.get('clicks', 0) or 0),
            'reach': int(ant.get('reach', 0) or 0),
            'ctr': float(ant.get('ctr', 0) or 0),
            'cpc': float(ant.get('cpc', 0) or 0),
            'cpm': float(ant.get('cpm', 0) or 0),
        }
    anterior_embed = json.dumps(anterior_embed_obj, ensure_ascii=False)

    # ─── Chart data ───
    daily_labels = json.dumps([data_br(d['date_start']) for d in daily], ensure_ascii=False)
    # daily_spend_data, daily_clicks_data, daily_reach_data removidos (gráfico CSS usa DAILY_DATA JS)

    # Distribuição de gasto por campanha (HTML estático)
    chart_colors = ['#5b7fff','#a855f7','#22c55e','#f59e0b','#ef4444','#e1306c','#1877f2','#06b6d4','#8b5cf6','#f97316']
    dist_html = ""
    if camps:
        camp_spends = [(sanitize_text(truncar(c.get('campaign_name', 'N/A'), 30)), float(c.get('spend', 0))) for c in camps]
        max_spend = max(s for _, s in camp_spends) if camp_spends else 1
        for i, (c_label, c_spend) in enumerate(camp_spends):
            pct = (c_spend / max_spend * 100) if max_spend > 0 else 0
            color = chart_colors[i % len(chart_colors)]
            dist_html += f'<div class="dist-row"><div class="dist-label" title="{c_label}">{c_label}</div><div class="dist-bar-wrap"><div class="dist-bar" style="width:{max(pct, 8):.0f}%;background:{color};">{fmt_brl(c_spend)}</div></div></div>\n'

    # ─── CSS ───
    css = """
:root, [data-theme="dark"] {
  --bg:#0c0e18; --surface:#13161f; --surface2:#1a1e2e; --surface3:#222640;
  --border:#252a3d; --accent:#5b7fff; --accent2:#a855f7;
  --green:#22c55e; --yellow:#f59e0b; --red:#ef4444;
  --text:#e4e9f5; --muted:#5e6a8a; --meta:#1877f2; --ig:#e1306c;
  --card-shadow: 0 2px 8px rgba(0,0,0,.3);
}
[data-theme="light"] {
  --bg:#f5f7fa; --surface:#ffffff; --surface2:#f0f2f5; --surface3:#e8eaed;
  --border:#e2e5ea; --accent:#3b5bdb; --accent2:#7c3aed;
  --green:#16a34a; --yellow:#d97706; --red:#dc2626;
  --text:#1e293b; --muted:#64748b; --meta:#1877f2; --ig:#e1306c;
  --card-shadow: 0 2px 8px rgba(0,0,0,.08);
}
* { box-sizing:border-box; margin:0; padding:0; }
body { background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,-apple-system,sans-serif; font-size:15px; line-height:1.65; -webkit-text-size-adjust:100%; }
.wrap { max-width:1140px; margin:0 auto; padding:0 32px; overflow-x:hidden; }
a { color:var(--accent); text-decoration:none; } a:hover { text-decoration:underline; }

/* Header */
.header { background:linear-gradient(160deg, rgba(91,127,255,.08) 0%, var(--bg) 60%); border-bottom:1px solid var(--border); padding:36px 0; }
.header-inner { max-width:1140px; margin:0 auto; padding:0 32px; display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; }
.header h1 { font-size:32px; font-weight:800; letter-spacing:-0.5px; margin-bottom:4px; }
.header h1 span { color:var(--accent); }
.header-sub { color:var(--muted); font-size:14px; }
.header-right { text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.period-label { font-size:24px; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.gen-date { color:var(--muted); font-size:12px; }
.theme-toggle { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:6px 14px; cursor:pointer; font-size:18px; transition:all .2s; }
.theme-toggle:hover { border-color:var(--accent); }
.chips { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.chip { display:inline-flex; align-items:center; gap:5px; border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; letter-spacing:.4px; }
.chip.meta { background:rgba(24,119,242,.12); border:1px solid rgba(24,119,242,.25); color:var(--meta); }
.chip.ig { background:rgba(225,48,108,.12); border:1px solid rgba(225,48,108,.25); color:var(--ig); }
.chip.agency { background:rgba(91,127,255,.12); border:1px solid rgba(91,127,255,.25); color:var(--accent); }

/* Sections */
.main { padding:40px 0; }
.section-title { font-size:12px; font-weight:700; letter-spacing:1.8px; color:var(--muted); text-transform:uppercase; margin-bottom:20px; display:flex; align-items:center; gap:12px; }
.section-title::after { content:''; flex:1; height:1px; background:var(--border); }

/* KPIs */
.kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; margin-bottom:40px; }
.kpi-card { background:var(--surface); border:1px solid var(--border); border-top:3px solid var(--accent); border-radius:14px; padding:22px 20px; box-shadow:var(--card-shadow); }
.kpi-card.g { border-top-color:var(--green); } .kpi-card.p { border-top-color:var(--accent2); } .kpi-card.ig { border-top-color:var(--ig); } .kpi-card.y { border-top-color:var(--yellow); }
.kpi-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:700; }
.kpi-value { font-size:28px; font-weight:900; margin:8px 0 4px; line-height:1; white-space:nowrap; }
.kpi-sub { font-size:13px; color:var(--muted); white-space:nowrap; }
.delta { font-size:13px; font-weight:700; margin-left:4px; }
.delta.up { color:var(--green); } .delta.down { color:var(--red); } .delta.neutral { color:var(--muted); }

/* Charts CSS */
.charts-row { display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:40px; }
.chart-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:24px; box-shadow:var(--card-shadow); }
.chart-card h3 { font-size:14px; font-weight:700; margin-bottom:16px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; }
.css-bars { display:flex; align-items:flex-end; gap:1px; height:180px; padding:4px 0; border-bottom:1px solid var(--border); }
.css-bar { flex:1; min-width:2px; max-width:24px; border-radius:3px 3px 0 0; position:relative; cursor:pointer; transition:opacity .15s; background:var(--accent); }
.css-bar:hover { opacity:.75; }
.css-bar .bar-tip { display:none; position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:var(--surface); border:1px solid var(--border); padding:6px 10px; border-radius:8px; font-size:11px; white-space:nowrap; z-index:20; box-shadow:0 4px 12px rgba(0,0,0,.2); color:var(--text); line-height:1.5; }
.css-bar:hover .bar-tip { display:block; }
.bar-legend { display:flex; gap:16px; margin-top:10px; justify-content:center; }
.bar-legend span { font-size:12px; color:var(--muted); display:flex; align-items:center; gap:5px; }
.bar-legend i { display:inline-block; width:10px; height:10px; border-radius:2px; }
.css-bars-axis { display:flex; justify-content:space-between; font-size:10px; color:var(--muted); margin-top:4px; padding:0 2px; }
.dist-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.dist-label { min-width:100px; max-width:140px; font-size:13px; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dist-bar-wrap { flex:1; height:26px; background:var(--surface2); border-radius:6px; overflow:hidden; }
.dist-bar { height:100%; border-radius:6px; display:flex; align-items:center; padding:0 8px; font-size:11px; font-weight:700; color:#fff; white-space:nowrap; min-width:fit-content; }
.dist-val { min-width:80px; text-align:right; font-size:13px; color:var(--muted); white-space:nowrap; }

/* Campaigns */
.camp-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:40px; }
.camp-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:var(--card-shadow); }
.camp-top { padding:20px 24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.camp-funnel-tag { display:inline-block; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:3px 10px; border-radius:6px; margin-bottom:6px; }
.camp-funnel-tag.tofu { background:rgba(91,127,255,.12); color:var(--accent); }
.camp-funnel-tag.mofu { background:rgba(168,85,247,.12); color:var(--accent2); }
.camp-funnel-tag.bofu { background:rgba(34,197,94,.12); color:var(--green); }
.camp-name { font-size:15px; font-weight:700; line-height:1.4; }
.camp-spend { font-size:26px; font-weight:900; text-align:right; white-space:nowrap; }
.camp-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); }
.camp-metric { background:var(--surface); padding:16px 18px; }
.camp-metric-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; font-weight:600; margin-bottom:4px; }
.camp-metric-value { font-size:20px; font-weight:800; white-space:nowrap; }
.sat-badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; margin-top:4px; }
.sat-badge.ok { background:rgba(34,197,94,.12); color:var(--green); }
.sat-badge.atencao { background:rgba(245,158,11,.12); color:var(--yellow); }
.sat-badge.critica { background:rgba(239,68,68,.12); color:var(--red); }
.camp-actions { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:18px 24px; }
.action-box { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 8px; text-align:center; }
.action-val { font-size:20px; font-weight:800; margin:4px 0 2px; white-space:nowrap; }
.action-name { font-size:11px; color:var(--muted); }

/* Ad Sets table */
.adsets-table { width:100%; border-collapse:collapse; margin-bottom:40px; background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:var(--card-shadow); }
.adsets-table th { background:var(--surface2); padding:14px 16px; text-align:left; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.7px; color:var(--muted); border-bottom:1px solid var(--border); }
.adsets-table td { padding:14px 16px; border-bottom:1px solid var(--border); font-size:14px; white-space:nowrap; }
.adsets-table td:first-child { white-space:normal; min-width:150px; }
.adsets-table tr:last-child td { border-bottom:none; }
.adsets-table .camp-group { background:var(--surface2); font-weight:700; font-size:13px; color:var(--accent); }

/* Creatives */
.creative-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:40px; }
.creative-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:var(--card-shadow); }
.creative-header { padding:18px 22px; border-bottom:1px solid var(--border); }
.creative-header .camp-path { font-size:12px; color:var(--muted); margin-bottom:4px; }
.creative-header .ad-name { font-size:15px; font-weight:700; }
.creative-header .status-badge { display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; margin-left:8px; }
.creative-header .status-badge.active { background:rgba(34,197,94,.12); color:var(--green); }
.creative-header .status-badge.paused { background:rgba(245,158,11,.12); color:var(--yellow); }
.creative-body { padding:18px 22px; }
.creative-thumb { width:100%; max-height:200px; object-fit:cover; border-radius:10px; margin-bottom:14px; background:var(--surface2); }
.creative-caption { font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:10px; max-height:60px; overflow:hidden; }
.creative-links { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
.creative-links a { font-size:12px; padding:4px 10px; background:var(--surface2); border:1px solid var(--border); border-radius:6px; }
.creative-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:16px 22px; border-top:1px solid var(--border); }
.cm-item { text-align:center; }
.cm-val { font-size:18px; font-weight:800; white-space:nowrap; }
.cm-label { font-size:11px; color:var(--muted); }
.retention-funnel { padding:0 22px 18px; }
.retention-title { font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.7px; margin-bottom:10px; }
.ret-bar-wrap { margin-bottom:4px; }
.ret-bar { height:26px; border-radius:6px; display:flex; align-items:center; padding:0 10px; font-size:12px; font-weight:700; color:#fff; min-width:80px; transition:width .5s; }
.ret-bar.imp { background:linear-gradient(90deg,var(--accent),#3d5fe0); }
.ret-bar.p25 { background:linear-gradient(90deg,#7c6fff,#6355d8); }
.ret-bar.p50 { background:linear-gradient(90deg,var(--accent2),#9333ea); }
.ret-bar.p75 { background:linear-gradient(90deg,var(--yellow),#d97706); }
.ret-bar.p100 { background:linear-gradient(90deg,var(--green),#16a34a); }

/* Reels */
.reels-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:40px; }
.reel-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:22px; position:relative; box-shadow:var(--card-shadow); }
.reel-card.top { border-left:4px solid var(--green); }
.reel-rank { position:absolute; top:14px; right:16px; font-size:11px; font-weight:800; padding:3px 10px; border-radius:6px; background:rgba(34,197,94,.12); color:var(--green); }
.reel-date { font-size:12px; color:var(--muted); margin-bottom:10px; }
.reel-caption { font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:14px; max-height:42px; overflow:hidden; }
.reel-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.reel-metric { text-align:center; }
.reel-metric-val { font-size:18px; font-weight:800; white-space:nowrap; }
.reel-metric-label { font-size:11px; color:var(--muted); margin-top:2px; }
.reel-extras { display:flex; gap:16px; margin-top:12px; padding-top:12px; border-top:1px solid var(--border); flex-wrap:wrap; }
.reel-extra { font-size:13px; color:var(--muted); } .reel-extra strong { color:var(--text); }

/* Totals bar */
.totals-bar { background:linear-gradient(135deg,rgba(91,127,255,.06),rgba(225,48,108,.06)); border:1px solid var(--border); border-radius:14px; padding:22px 28px; margin-bottom:40px; display:flex; justify-content:space-around; flex-wrap:wrap; gap:20px; }
.totals-item { text-align:center; }
.totals-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; font-weight:700; }
.totals-value { font-size:34px; font-weight:900; background:linear-gradient(135deg,var(--accent),var(--ig)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; white-space:nowrap; }
.totals-sub { font-size:13px; color:var(--muted); }

/* Alerts */
.alerts-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:40px; }
.alert-card { background:var(--surface); border:1px solid var(--border); border-left:4px solid; border-radius:14px; padding:20px 22px; display:flex; gap:14px; box-shadow:var(--card-shadow); }
.alert-card.success { border-left-color:var(--green); } .alert-card.warning { border-left-color:var(--yellow); }
.alert-card.danger { border-left-color:var(--red); } .alert-card.info { border-left-color:var(--accent); }
.alert-icon { font-size:22px; flex-shrink:0; margin-top:2px; }
.alert-title { font-size:15px; font-weight:700; margin-bottom:4px; }
.alert-desc { font-size:13px; color:var(--muted); line-height:1.6; }

/* Conversion cards */
.conv-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; margin-bottom:40px; }
.conv-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px 18px; text-align:center; box-shadow:var(--card-shadow); }
.conv-emoji { font-size:24px; margin-bottom:6px; }
.conv-val { font-size:26px; font-weight:900; white-space:nowrap; }
.conv-label { font-size:12px; color:var(--muted); margin-top:2px; }
.conv-cost { font-size:12px; color:var(--accent); margin-top:6px; font-weight:700; }

/* Footer */
.footer { border-top:1px solid var(--border); padding:28px 0; color:var(--muted); font-size:13px; }
.footer-inner { max-width:1140px; margin:0 auto; padding:0 32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; word-break:break-word; }
.footer strong { color:var(--accent); }

/* Filter bar */
.filter-bar { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px 24px; margin-bottom:32px; box-shadow:var(--card-shadow); }
.filter-inner { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
.filter-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.filter-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--muted); margin-right:4px; }
.filter-btn { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:8px 16px; font-size:13px; font-weight:600; color:var(--text); cursor:pointer; transition:all .2s; font-family:inherit; }
.filter-btn:hover { border-color:var(--accent); color:var(--accent); }
.filter-btn.active { background:var(--accent); border-color:var(--accent); color:#fff; }
.filter-date { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:8px 12px; font-size:13px; color:var(--text); font-family:inherit; color-scheme:dark; }
[data-theme="light"] .filter-date { color-scheme:light; }
.filter-info { display:flex; align-items:center; gap:16px; margin-top:14px; padding-top:14px; border-top:1px solid var(--border); flex-wrap:wrap; }
#period-display { font-size:16px; font-weight:800; color:var(--accent); }

/* Responsive */
@media(max-width:900px) {
  .wrap { padding:0 16px; }
  .charts-row,.camp-grid,.creative-grid,.reels-grid,.alerts-grid { grid-template-columns:1fr; }
  .header-inner { flex-direction:column; }
  .header-right { align-items:flex-start; text-align:left; }
  .camp-metrics { grid-template-columns:repeat(2,1fr); }
  .filter-inner { flex-direction:column; align-items:flex-start; }
  .totals-bar { flex-direction:column; gap:16px; padding:18px 20px; }
  .adsets-table { display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; }
}
@media(max-width:600px) {
  .wrap { padding:0 12px; }
  .header h1 { font-size:24px; }
  .period-label { font-size:18px; }
  .kpi-grid { grid-template-columns:1fr 1fr; gap:10px; }
  .kpi-card { padding:16px 14px; }
  .kpi-value { font-size:22px; }
  .kpi-sub { font-size:11px; }
  .conv-grid { grid-template-columns:1fr 1fr; gap:10px; }
  .conv-card { padding:14px 12px; }
  .conv-val { font-size:20px; }
  .creative-metrics { grid-template-columns:repeat(2,1fr); }
  .reel-metrics { grid-template-columns:repeat(2,1fr); }
  .camp-actions { grid-template-columns:repeat(2,1fr); }
  .camp-spend { font-size:20px; }
  .camp-metric-value { font-size:16px; }
  .camp-metric { padding:12px 10px; }
  .section-title { font-size:11px; letter-spacing:1.2px; }
  .filter-bar { padding:14px 16px; }
  .filter-btn { padding:6px 12px; font-size:12px; }
  .filter-date { padding:6px 8px; font-size:12px; }
  .totals-value { font-size:26px; }
  .cm-val { font-size:15px; }
  .reel-metric-val { font-size:15px; }
  .action-val { font-size:16px; }
  .chart-card { padding:16px 12px; }
  .alert-card { padding:14px 16px; }
}
@media(max-width:380px) {
  .kpi-grid { grid-template-columns:1fr; }
  .conv-grid { grid-template-columns:1fr; }
  .camp-metrics { grid-template-columns:1fr 1fr; }
  .camp-actions { grid-template-columns:1fr 1fr; }
  .reel-metrics { grid-template-columns:1fr 1fr; }
}
"""

    # ─── Campanhas HTML ───
    total_spend = float(spend) if float(spend) > 0 else 1
    camps_html = ""
    for camp in camps:
        c_spend = camp.get('spend', '0')
        c_reach = camp.get('reach', '0')
        c_ctr = camp.get('ctr', '0')
        c_cpc = camp.get('cpc', '0')
        c_freq = camp.get('frequency', '0')
        c_name = sanitize_text(camp.get('campaign_name', 'Campanha'))
        c_actions = camp.get('actions', [])
        c_pct = safe_div(float(c_spend), total_spend) * 100
        sat = classificar_saturacao(c_freq)

        c_views = extrair_action(c_actions, 'video_view')
        c_saves = extrair_action(c_actions, 'onsite_conversion.post_save')
        c_reactions = extrair_action(c_actions, 'post_reaction')
        c_comments = extrair_action(c_actions, 'comment')

        # Detect funnel
        c_lower = c_name.lower()
        if any(k in c_lower for k in ['mofu', 'engajamento', 'meio']):
            fc, fl = 'mofu', 'Meio de Funil'
        elif any(k in c_lower for k in ['bofu', 'fundo', 'conversão', 'venda']):
            fc, fl = 'bofu', 'Fundo de Funil'
        else:
            fc, fl = 'tofu', 'Topo de Funil'

        color = 'var(--accent)' if fc == 'tofu' else ('var(--accent2)' if fc == 'mofu' else 'var(--green)')
        ctr_color = 'var(--green)' if float(c_ctr) > 2 else 'var(--accent)'

        camps_html += f"""
    <div class="camp-card">
      <div class="camp-top">
        <div>
          <div class="camp-funnel-tag {fc}">{fl}</div>
          <div class="camp-name">{c_name}</div>
        </div>
        <div style="text-align:right;">
          <div class="camp-spend" style="color:{color};">{fmt_brl(c_spend)}</div>
          <div style="font-size:12px;color:var(--muted);">{fmt_pct(c_pct)} do total</div>
        </div>
      </div>
      <div class="camp-metrics">
        <div class="camp-metric"><div class="camp-metric-label">Alcance</div><div class="camp-metric-value">{fmt_num(c_reach)}</div></div>
        <div class="camp-metric"><div class="camp-metric-label">CTR</div><div class="camp-metric-value" style="color:{ctr_color};">{fmt_pct(c_ctr)}</div></div>
        <div class="camp-metric"><div class="camp-metric-label">CPC</div><div class="camp-metric-value">{fmt_brl(c_cpc)}</div></div>
        <div class="camp-metric">
          <div class="camp-metric-label">Frequência</div>
          <div class="camp-metric-value">{float(c_freq):.1f}</div>
          <span class="sat-badge {sat}">{'OK' if sat == 'ok' else ('Atenção' if sat == 'atencao' else 'Saturado')}</span>
        </div>
      </div>
      <div class="camp-actions">
        <div class="action-box"><div class="action-val">{fmt_num(c_views)}</div><div class="action-name">Views</div></div>
        <div class="action-box"><div class="action-val">{fmt_num(c_reactions)}</div><div class="action-name">Reações</div></div>
        <div class="action-box"><div class="action-val">{fmt_num(c_saves)}</div><div class="action-name">Saves</div></div>
        <div class="action-box"><div class="action-val">{fmt_num(c_comments)}</div><div class="action-name">Comments</div></div>
      </div>
    </div>"""

    # ─── Ad Sets HTML (tabela) ───
    adsets_html = ""
    if adsets:
        current_camp = None
        for a in adsets:
            camp_name = sanitize_text(a.get('campaign_name', ''))
            if camp_name != current_camp:
                current_camp = camp_name
                adsets_html += f'<tr class="camp-group"><td colspan="7">{camp_name}</td></tr>'
            a_freq = a.get('frequency', '0')
            a_sat = classificar_saturacao(a_freq)
            sat_dot = '🟢' if a_sat == 'ok' else ('🟡' if a_sat == 'atencao' else '🔴')
            adsets_html += f"""<tr>
              <td>{sanitize_text(a.get('adset_name','N/A'))}</td>
              <td>{fmt_brl(a.get('spend','0'))}</td>
              <td>{fmt_num(a.get('reach','0'))}</td>
              <td>{fmt_num(a.get('clicks','0'))}</td>
              <td>{fmt_pct(a.get('ctr','0'))}</td>
              <td>{fmt_brl(a.get('cpc','0'))}</td>
              <td>{sat_dot} {float(a_freq):.1f}</td>
            </tr>"""

    # ─── Criativos HTML ───
    creatives_html = ""
    for ad_data in ads:
        ad = ad_data['ad']
        ins = ad_data['insights']
        ret = ad_data['retention']
        creative = ad.get('creative', {})

        ad_name = sanitize_text(ad.get('name', ins.get('ad_name', 'N/A')))
        status = ad.get('effective_status', ad.get('status', 'UNKNOWN'))
        status_class = 'active' if status == 'ACTIVE' else 'paused'
        status_label = 'Ativo' if status == 'ACTIVE' else ('Pausado' if status == 'PAUSED' else status)

        thumb = creative.get('thumbnail_url', creative.get('image_url', ''))
        body = truncar(creative.get('body', ''), 100)
        cta = creative.get('call_to_action_type', '').replace('_', ' ').title()
        link_url = creative.get('link_url', '')
        camp_name = sanitize_text(ins.get('campaign_name', ''))
        adset_name = sanitize_text(ins.get('adset_name', ''))

        a_spend = ins.get('spend', '0')
        a_reach = ins.get('reach', '0')
        a_clicks = ins.get('clicks', '0')
        a_ctr = ins.get('ctr', '0')

        # Thumbnail HTML
        thumb_html = f'<img class="creative-thumb" src="{thumb}" alt="Criativo" onerror="this.style.display=\'none\'">' if thumb else ''

        # Links
        links_html = ''
        if link_url:
            links_html += f'<a href="{link_url}" target="_blank">Destino ↗</a>'
        ad_id = ad.get('id', '')
        if ad_id:
            links_html += f'<a href="https://www.facebook.com/ads/library/?id={ad_id}" target="_blank">Ad Library ↗</a>'

        # Retention funnel
        retention_html = ''
        if ret:
            retention_html = f"""
      <div class="retention-funnel">
        <div class="retention-title">Funil de Retenção</div>
        <div class="ret-bar-wrap"><div class="ret-bar imp" style="width:100%;">{fmt_num(ret['impressions'])} impressões</div></div>
        <div class="ret-bar-wrap"><div class="ret-bar p25" style="width:{ret['p25_pct']:.0f}%;">{fmt_pct(ret['p25_pct'])} — {fmt_num(ret['p25'])} (25%)</div></div>
        <div class="ret-bar-wrap"><div class="ret-bar p50" style="width:{ret['p50_pct']:.0f}%;">{fmt_pct(ret['p50_pct'])} — {fmt_num(ret['p50'])} (50%)</div></div>
        <div class="ret-bar-wrap"><div class="ret-bar p75" style="width:{ret['p75_pct']:.0f}%;">{fmt_pct(ret['p75_pct'])} — {fmt_num(ret['p75'])} (75%)</div></div>
        <div class="ret-bar-wrap"><div class="ret-bar p100" style="width:{ret['p100_pct']:.0f}%;">{fmt_pct(ret['p100_pct'])} — {fmt_num(ret['p100'])} (100%)</div></div>
      </div>"""

        creatives_html += f"""
    <div class="creative-card">
      <div class="creative-header">
        <div class="camp-path">{camp_name} › {adset_name}</div>
        <div class="ad-name">{ad_name} <span class="status-badge {status_class}">{status_label}</span></div>
      </div>
      <div class="creative-body">
        {thumb_html}
        <div class="creative-caption">"{body}"</div>
        {f'<div style="font-size:12px;color:var(--accent);font-weight:700;margin-bottom:8px;">CTA: {cta}</div>' if cta else ''}
        <div class="creative-links">{links_html}</div>
      </div>
      <div class="creative-metrics">
        <div class="cm-item"><div class="cm-val" style="color:var(--accent);">{fmt_brl(a_spend)}</div><div class="cm-label">Gasto</div></div>
        <div class="cm-item"><div class="cm-val">{fmt_num(a_reach)}</div><div class="cm-label">Alcance</div></div>
        <div class="cm-item"><div class="cm-val">{fmt_num(a_clicks)}</div><div class="cm-label">Cliques</div></div>
        <div class="cm-item"><div class="cm-val" style="color:var(--green);">{fmt_pct(a_ctr)}</div><div class="cm-label">CTR</div></div>
      </div>
      {retention_html}
    </div>"""

    # ─── Reels HTML ───
    reels_sorted = sorted(reels, key=lambda r: r['insights'].get('views', 0), reverse=True)
    reels_html = ""
    for i, reel in enumerate(reels_sorted):
        ins = reel['insights']
        det = reel['details']
        r_views = ins.get('views', 0)
        r_reach = ins.get('reach', 0)
        r_likes = ins.get('likes', 0)
        r_comments = ins.get('comments', 0)
        r_saves = ins.get('saved', 0)
        r_shares = ins.get('shares', 0)
        r_interactions = ins.get('total_interactions', 0)
        r_engagement = safe_div(r_interactions, r_reach) * 100

        caption = truncar(sanitize_text(det.get('caption', '')), 70)
        permalink = det.get('permalink', '')
        timestamp = det.get('timestamp', '')
        try:
            dt = datetime.strptime(timestamp[:10], "%Y-%m-%d")
            date_label = f"{dt.day} {MESES_BR[dt.month]} {dt.year}"
        except:
            date_label = timestamp[:10] if timestamp else ''

        card_class = 'reel-card top' if i == 0 else 'reel-card'
        rank_html = '<span class="reel-rank">TOP</span>' if i == 0 else ''
        link_html = f' <a href="{permalink}" target="_blank" style="font-size:12px;">Ver ↗</a>' if permalink else ''

        reels_html += f"""
    <div class="{card_class}">
      {rank_html}
      <div class="reel-date">{date_label}{link_html}</div>
      <div class="reel-caption">"{caption}"</div>
      <div class="reel-metrics">
        <div class="reel-metric"><div class="reel-metric-val">{fmt_num(r_views)}</div><div class="reel-metric-label">Views</div></div>
        <div class="reel-metric"><div class="reel-metric-val">{fmt_num(r_reach)}</div><div class="reel-metric-label">Alcance</div></div>
        <div class="reel-metric"><div class="reel-metric-val">{fmt_num(r_likes)}</div><div class="reel-metric-label">Likes</div></div>
        <div class="reel-metric"><div class="reel-metric-val">{fmt_num(r_comments)}</div><div class="reel-metric-label">Comments</div></div>
      </div>
      <div class="reel-extras">
        <div class="reel-extra"><strong>{fmt_num(r_saves)}</strong> saves</div>
        <div class="reel-extra"><strong>{fmt_num(r_shares)}</strong> shares</div>
        <div class="reel-extra">Eng. <strong>{fmt_pct(r_engagement)}</strong></div>
      </div>
    </div>"""

    # Reel totals
    reel_total_views = sum(r['insights'].get('views', 0) for r in reels)
    reel_total_reach = sum(r['insights'].get('reach', 0) for r in reels)
    reel_total_likes = sum(r['insights'].get('likes', 0) for r in reels)
    reel_total_comments = sum(r['insights'].get('comments', 0) for r in reels)
    reel_total_saves = sum(r['insights'].get('saved', 0) for r in reels)
    reel_total_shares = sum(r['insights'].get('shares', 0) for r in reels)
    reel_total_interactions = sum(r['insights'].get('total_interactions', 0) for r in reels)
    reel_avg_engagement = safe_div(reel_total_interactions, reel_total_reach) * 100

    # ─── Alerts HTML ───
    alerts_html = ""
    for ins_item in insights_auto:
        alerts_html += f"""
    <div class="alert-card {ins_item['tipo']}">
      <div class="alert-icon">{ins_item['icone']}</div>
      <div>
        <div class="alert-title">{ins_item['titulo']}</div>
        <div class="alert-desc">{ins_item['desc']}</div>
      </div>
    </div>"""

    # ─── Nome do cliente ───
    nome_parts = config['nome'].split()
    nome_first = nome_parts[0] if nome_parts else ''
    nome_rest = ' '.join(nome_parts[1:]) if len(nome_parts) > 1 else ''

    # ─── MONTAR HTML FINAL ───
    html = f"""<!DOCTYPE html>
<html lang="pt-BR" data-theme="{tema}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard Meta Ads — {config['nome']} | {periodo_label}</title>
<style>{css}</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="header-inner">
    <div>
      <div class="chips">
        <span class="chip agency">Performance Marketing</span>
        <span class="chip meta">Meta Ads</span>
        <span class="chip ig">Instagram</span>
      </div>
      <h1>{nome_first} <span>{nome_rest}</span></h1>
      <p class="header-sub">{config['handle']} &middot; {config['ad_account_id']} &middot; Dashboard Pago + Orgânico</p>
    </div>
    <div class="header-right">
      <button class="theme-toggle" onclick="toggleTheme()" title="Alternar tema"><span id="theme-icon">{'🌙' if tema == 'dark' else '☀️'}</span></button>
      <div class="period-label">{periodo_label}</div>
      <div class="gen-date">Gerado em {hoje} &middot; Meta Graph API v21.0 &middot; {dias_ativos} dias</div>
    </div>
  </div>
</div>

<div class="main">
<div class="wrap">

  <!-- FILTRO DE PERÍODO -->
  <div class="filter-bar">
    <div class="filter-inner">
      <div class="filter-group">
        <span class="filter-label">Período</span>
        <button class="filter-btn" id="filter-7d" onclick="applyFilter('last_7d')">7 dias</button>
        <button class="filter-btn" id="filter-14d" onclick="applyFilter('last_14d')">14 dias</button>
        <button class="filter-btn" id="filter-30d" onclick="applyFilter('last_30d')">30 dias</button>
        <button class="filter-btn active" id="filter-all" onclick="applyFilter('all')">Tudo ({periodos['dias']}d)</button>
      </div>
      <div class="filter-group">
        <input type="date" id="filter-since" class="filter-date" value="{periodos['since']}">
        <span style="color:var(--muted);font-size:13px;">até</span>
        <input type="date" id="filter-until" class="filter-date" value="{periodos['until']}">
        <button class="filter-btn" id="filter-custom-btn" onclick="applyFilter('custom')">Aplicar</button>
      </div>
    </div>
    <div class="filter-info">
      <span id="period-display">{periodo_label}</span>
      <span style="color:var(--muted);font-size:13px;" id="period-info">{dias_ativos} dias</span>
      <span style="color:var(--accent);font-size:13px;" id="comparison-info">vs período anterior</span>
    </div>
  </div>

  <!-- RESUMO EXECUTIVO -->
  <div class="section-title">Resumo Executivo <span id="kpi-period-label" style="font-weight:400;">&middot; {periodos['label']}</span></div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Investimento</div>
      <div class="kpi-value" id="kpi-val-spend" style="color:var(--accent);">{fmt_brl(spend)}</div>
      <div class="kpi-sub" id="kpi-sub-spend">~{fmt_brl(gasto_diario)}/dia {delta_html(deltas.get('spend'))}</div>
    </div>
    <div class="kpi-card g">
      <div class="kpi-label">Alcance</div>
      <div class="kpi-value" id="kpi-val-reach" style="color:var(--green);">{fmt_num(reach)}</div>
      <div class="kpi-sub" id="kpi-sub-reach">pessoas únicas {delta_html(deltas.get('reach'))}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Cliques</div>
      <div class="kpi-value" id="kpi-val-clicks">{fmt_num(clicks)}</div>
      <div class="kpi-sub" id="kpi-sub-clicks">{fmt_num(impressions)} impressões {delta_html(deltas.get('clicks'))}</div>
    </div>
    <div class="kpi-card g">
      <div class="kpi-label">CTR</div>
      <div class="kpi-value" id="kpi-val-ctr" style="color:var(--green);">{fmt_pct(ctr)}</div>
      <div class="kpi-sub" id="kpi-sub-ctr">taxa de clique {delta_html(deltas.get('ctr'))}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">CPC</div>
      <div class="kpi-value" id="kpi-val-cpc">{fmt_brl(cpc)}</div>
      <div class="kpi-sub" id="kpi-sub-cpc">custo por clique {delta_html(deltas.get('cpc'), inverso=True)}</div>
    </div>
    <div class="kpi-card y">
      <div class="kpi-label">CPM</div>
      <div class="kpi-value" id="kpi-val-cpm">{fmt_brl(cpm)}</div>
      <div class="kpi-sub" id="kpi-sub-cpm">custo por mil {delta_html(deltas.get('cpm'), inverso=True)}</div>
    </div>
  </div>

  <!-- MÉTRICAS DE CONVERSÃO -->
  <div class="section-title">Métricas de Conversão</div>
  <div class="conv-grid">
    <div class="conv-card">
      <div class="conv-emoji">🔗</div>
      <div class="conv-val" id="conv-val-link-clicks">{fmt_num(link_clicks)}</div>
      <div class="conv-label">Link Clicks</div>
      <div class="conv-cost" id="conv-cost-link-clicks">CPC {fmt_brl(cpa_link)}</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">💬</div>
      <div class="conv-val" id="conv-val-dms">{fmt_num(dm_conversations)}</div>
      <div class="conv-label">DMs Iniciadas</div>
      <div class="conv-cost" id="conv-cost-dms">{f'CPM {fmt_brl(cpa_dm)}' if float(cpa_dm) > 0 else '—'}</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">📋</div>
      <div class="conv-val" id="conv-val-leads">{fmt_num(leads)}</div>
      <div class="conv-label">Leads</div>
      <div class="conv-cost" id="conv-cost-leads">{f'CPL {fmt_brl(cpa_lead)}' if float(cpa_lead) > 0 else '—'}</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">💾</div>
      <div class="conv-val" id="conv-val-saves">{fmt_num(saves)}</div>
      <div class="conv-label">Salvamentos</div>
      <div class="conv-cost" id="conv-cost-saves">{f'Custo {fmt_brl(cpa_save)}' if float(cpa_save) > 0 else '—'}</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">👁️</div>
      <div class="conv-val" id="conv-val-lpv">{fmt_num(landing_page_views)}</div>
      <div class="conv-label">Landing Page Views</div>
      <div class="conv-cost">—</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">❤️</div>
      <div class="conv-val" id="conv-val-reactions">{fmt_num(reactions)}</div>
      <div class="conv-label">Reações</div>
      <div class="conv-cost">—</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">💬</div>
      <div class="conv-val" id="conv-val-comments">{fmt_num(comments_count)}</div>
      <div class="conv-label">Comentários</div>
      <div class="conv-cost">—</div>
    </div>
    <div class="conv-card">
      <div class="conv-emoji">▶️</div>
      <div class="conv-val" id="conv-val-video-views">{fmt_num(video_views)}</div>
      <div class="conv-label">Video Views</div>
      <div class="conv-cost">—</div>
    </div>
  </div>

  <!-- GRÁFICOS -->
  <div class="section-title">Evolução Diária</div>
  <div class="charts-row">
    <div class="chart-card">
      <h3>Gasto por Dia</h3>
      <div id="dailyBars" class="css-bars"></div>
      <div id="dailyAxis" class="css-bars-axis"></div>
      <div class="bar-legend">
        <span><i style="background:var(--accent);"></i> Gasto (R$)</span>
        <span><i style="background:var(--green);"></i> Cliques (hover)</span>
      </div>
    </div>
    <div class="chart-card">
      <h3>Distribuição de Gasto</h3>
      {dist_html}
    </div>
  </div>

  <!-- CAMPANHAS -->
  <div class="section-title">Performance por Campanha &middot; {len(camps)} campanhas</div>
  <div class="camp-grid">
    {camps_html if camps_html else '<div style="color:var(--muted);grid-column:1/-1;">Nenhuma campanha com dados no período.</div>'}
  </div>

  <!-- CONJUNTOS DE ANÚNCIOS -->
  <div class="section-title">Conjuntos de Anúncios &middot; {len(adsets)} ad sets</div>
  {f'''<div style="overflow-x:auto;margin-bottom:40px;">
  <table class="adsets-table">
    <thead><tr>
      <th>Conjunto de Anúncios</th><th>Gasto</th><th>Alcance</th><th>Cliques</th><th>CTR</th><th>CPC</th><th>Freq.</th>
    </tr></thead>
    <tbody>{adsets_html}</tbody>
  </table>
  </div>''' if adsets_html else '<div style="color:var(--muted);margin-bottom:40px;">Nenhum conjunto de anúncios com dados no período.</div>'}

  <!-- CRIATIVOS -->
  <div class="section-title">Criativos &middot; {len(ads)} anúncios</div>
  <div class="creative-grid">
    {creatives_html if creatives_html else '<div style="color:var(--muted);grid-column:1/-1;">Nenhum criativo com dados no período.</div>'}
  </div>

  <!-- TOTAIS PAGO + ORGÂNICO -->
  <div class="section-title">Visão Consolidada — Pago + Orgânico</div>
  <div class="totals-bar">
    <div class="totals-item">
      <div class="totals-label">Alcance Total</div>
      <div class="totals-value">{fmt_num(total_reach)}</div>
      <div class="totals-sub">{fmt_num(reach)} pago + {fmt_num(org_reach)} orgânico</div>
    </div>
    <div class="totals-item">
      <div class="totals-label">Views Totais</div>
      <div class="totals-value">{fmt_num(total_views)}</div>
      <div class="totals-sub">{fmt_num(video_views)} pago + {fmt_num(org_views)} orgânico</div>
    </div>
    <div class="totals-item">
      <div class="totals-label">Seguidores</div>
      <div style="font-size:34px;font-weight:900;color:var(--ig);">{fmt_num(followers)}</div>
      <div class="totals-sub">@{username}</div>
    </div>
  </div>

  <!-- INSTAGRAM ORGÂNICO -->
  <div class="section-title">Instagram Orgânico &middot; {config['handle']}</div>
  <div class="kpi-grid">
    <div class="kpi-card ig">
      <div class="kpi-label">Alcance Orgânico</div>
      <div class="kpi-value" style="color:var(--ig);">{fmt_num(org_reach)}</div>
      <div class="kpi-sub">contas alcançadas</div>
    </div>
    <div class="kpi-card ig">
      <div class="kpi-label">Views Orgânicas</div>
      <div class="kpi-value" style="color:var(--ig);">{fmt_num(org_views)}</div>
      <div class="kpi-sub">visualizações totais</div>
    </div>
    <div class="kpi-card ig">
      <div class="kpi-label">Interações</div>
      <div class="kpi-value" style="color:var(--ig);">{fmt_num(org_interactions)}</div>
      <div class="kpi-sub">likes, comments, saves, shares</div>
    </div>
    <div class="kpi-card ig">
      <div class="kpi-label">Contas Engajadas</div>
      <div class="kpi-value" style="color:var(--ig);">{fmt_num(org_engaged)}</div>
      <div class="kpi-sub">{fmt_pct(safe_div(org_engaged, org_reach) * 100)} do alcance</div>
    </div>
    <div class="kpi-card ig">
      <div class="kpi-label">Visitas ao Perfil</div>
      <div class="kpi-value" style="color:var(--ig);">{fmt_num(org_profile_views)}</div>
      <div class="kpi-sub">{fmt_num(media_count)} posts publicados</div>
    </div>
  </div>

  <!-- REELS -->
  <div class="section-title">Performance dos Reels &middot; {len(reels)} Reels</div>
  <div class="reels-grid">
    {reels_html if reels_html else '<div style="color:var(--muted);grid-column:1/-1;">Nenhum Reel encontrado.</div>'}
  </div>

  {f'''<!-- Reel Totals -->
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px 28px;margin-bottom:40px;box-shadow:var(--card-shadow);">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:16px;">Totais dos {len(reels)} Reels</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;text-align:center;">
      <div><div style="font-size:22px;font-weight:900;color:var(--accent);">{fmt_num(reel_total_views)}</div><div style="font-size:11px;color:var(--muted);">Views</div></div>
      <div><div style="font-size:22px;font-weight:900;">{fmt_num(reel_total_reach)}</div><div style="font-size:11px;color:var(--muted);">Alcance</div></div>
      <div><div style="font-size:22px;font-weight:900;color:var(--ig);">{fmt_num(reel_total_likes)}</div><div style="font-size:11px;color:var(--muted);">Likes</div></div>
      <div><div style="font-size:22px;font-weight:900;color:var(--accent2);">{fmt_num(reel_total_comments)}</div><div style="font-size:11px;color:var(--muted);">Comments</div></div>
      <div><div style="font-size:22px;font-weight:900;color:var(--green);">{fmt_num(reel_total_saves)}</div><div style="font-size:11px;color:var(--muted);">Saves</div></div>
      <div><div style="font-size:22px;font-weight:900;color:var(--yellow);">{fmt_num(reel_total_shares)}</div><div style="font-size:11px;color:var(--muted);">Shares</div></div>
    </div>
    <div style="margin-top:14px;padding:10px 16px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:10px;font-size:13px;color:var(--green);">
      Engagement rate médio: <strong>{fmt_pct(reel_avg_engagement)}</strong>
    </div>
  </div>''' if reels else ''}

  <!-- ALERTAS E INSIGHTS -->
  <div class="section-title">Alertas e Insights</div>
  <div class="alerts-grid">
    {alerts_html if alerts_html else '<div style="color:var(--muted);grid-column:1/-1;">Nenhum alerta gerado.</div>'}
  </div>

</div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-inner">
    <div><strong>{config['nome']}</strong> &middot; Performance Marketing &middot; Meta Ads + Instagram</div>
    <div style="text-align:right;">
      Dados: Meta Graph API v21.0 + IG Insights API &middot; Gerado em {hoje}<br>
      {periodo_label} &middot; {dias_ativos} dias &middot; {len(camps)} campanhas &middot; {len(ads)} anúncios &middot; {len(reels)} Reels
    </div>
  </div>
</div>

<!-- JAVASCRIPT -->
<script>
// ═══ DADOS EMBARCADOS PARA FILTRO INTERATIVO ═══
const DAILY_DATA = {daily_embed};
const ANTERIOR_ACCOUNT = {anterior_embed};
const FULL_PERIOD = {{ since: '{periodos["since"]}', until: '{periodos["until"]}', dias: {periodos["dias"]} }};

// ═══ HELPERS DE FORMATAÇÃO (JS) ═══
const MESES_JS = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function parseDate(s) {{ return new Date(s + 'T12:00:00'); }}
function dateBr(ds) {{ const d = parseDate(ds); return d.getDate() + ' ' + MESES_JS[d.getMonth()+1]; }}
function fmtNum(n) {{ return Math.round(n).toLocaleString('pt-BR'); }}
function fmtBrl(v) {{ return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '.'); }}
function fmtPct(v) {{ return v.toFixed(2).replace('.', ',') + '%'; }}

// ═══ FILTRO DE PERÍODO ═══
function filterDaily(since, until) {{
  const s = parseDate(since), u = parseDate(until);
  return DAILY_DATA.filter(d => {{ const dt = parseDate(d.date); return dt >= s && dt <= u; }});
}}

function sumDaily(rows) {{
  const r = {{ spend:0, impressions:0, clicks:0, reach:0, link_clicks:0, video_views:0, saves:0, dms:0, leads:0, reactions:0, comments_count:0, landing_page_views:0 }};
  rows.forEach(d => {{
    r.spend += d.spend; r.impressions += d.impressions; r.clicks += d.clicks; r.reach += d.reach;
    r.link_clicks += d.link_clicks||0; r.video_views += d.video_views||0; r.saves += d.saves||0;
    r.dms += d.dms||0; r.leads += d.leads||0; r.reactions += d.reactions||0;
    r.comments_count += d.comments_count||0; r.landing_page_views += d.landing_page_views||0;
  }});
  r.ctr = r.impressions > 0 ? (r.clicks / r.impressions * 100) : 0;
  r.cpc = r.clicks > 0 ? (r.spend / r.clicks) : 0;
  r.cpm = r.impressions > 0 ? (r.spend / r.impressions * 1000) : 0;
  r.dias = rows.length;
  r.gasto_diario = rows.length > 0 ? (r.spend / rows.length) : 0;
  return r;
}}

function calcDeltas(cur, prev) {{
  const d = {{}};
  ['spend','impressions','clicks','reach','ctr','cpc','cpm'].forEach(k => {{
    const c = cur[k]||0, p = prev[k]||0;
    d[k] = p > 0 ? ((c - p) / p * 100) : null;
  }});
  return d;
}}

function deltaHtml(valor, inverso) {{
  if (valor === null || valor === undefined) return '<span class="delta neutral">\u2014</span>';
  const classe = inverso ? (valor > 0 ? 'down' : valor < 0 ? 'up' : 'neutral') : (valor > 0 ? 'up' : valor < 0 ? 'down' : 'neutral');
  const seta = valor > 0 ? '\u25B2' : valor < 0 ? '\u25BC' : '\u2014';
  return '<span class="delta ' + classe + '">' + seta + ' ' + Math.abs(valor).toFixed(1) + '%</span>';
}}

function applyFilter(preset) {{
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (DAILY_DATA.length === 0) return;

  const lastDate = DAILY_DATA[DAILY_DATA.length - 1].date;
  const lastDt = parseDate(lastDate);
  let since, until;

  if (preset === 'all') {{
    since = FULL_PERIOD.since; until = FULL_PERIOD.until;
    document.getElementById('filter-all').classList.add('active');
  }} else if (preset === 'custom') {{
    since = document.getElementById('filter-since').value;
    until = document.getElementById('filter-until').value;
    if (!since || !until) return;
    document.getElementById('filter-custom-btn').classList.add('active');
  }} else {{
    const diasMap = {{ last_7d: 7, last_14d: 14, last_30d: 30 }};
    const dias = diasMap[preset] || 7;
    const s = new Date(lastDt); s.setDate(s.getDate() - dias + 1);
    since = s.toISOString().slice(0, 10); until = lastDate;
    const btnMap = {{ last_7d:'7d', last_14d:'14d', last_30d:'30d' }};
    const btn = document.getElementById('filter-' + btnMap[preset]);
    if (btn) btn.classList.add('active');
  }}

  const filtered = filterDaily(since, until);
  const current = sumDaily(filtered);

  // Comparativo com período anterior
  const dias = Math.round((parseDate(until) - parseDate(since)) / 86400000) + 1;
  const prevUntilDt = new Date(parseDate(since));
  prevUntilDt.setDate(prevUntilDt.getDate() - 1);
  const prevSinceDt = new Date(prevUntilDt);
  prevSinceDt.setDate(prevSinceDt.getDate() - dias + 1);
  const prevSince = prevSinceDt.toISOString().slice(0, 10);
  const prevUntil = prevUntilDt.toISOString().slice(0, 10);
  const prevFiltered = filterDaily(prevSince, prevUntil);

  let deltas;
  if (prevFiltered.length > 0) {{
    deltas = calcDeltas(current, sumDaily(prevFiltered));
  }} else if (ANTERIOR_ACCOUNT && preset === 'all') {{
    deltas = calcDeltas(current, ANTERIOR_ACCOUNT);
  }} else {{
    deltas = {{}};
  }}

  // Atualizar KPIs
  const el = id => document.getElementById(id);
  el('kpi-val-spend').textContent = fmtBrl(current.spend);
  el('kpi-sub-spend').innerHTML = '~' + fmtBrl(current.gasto_diario) + '/dia ' + deltaHtml(deltas.spend);
  el('kpi-val-reach').textContent = fmtNum(current.reach);
  el('kpi-sub-reach').innerHTML = 'pessoas \u00FAnicas ' + deltaHtml(deltas.reach);
  el('kpi-val-clicks').textContent = fmtNum(current.clicks);
  el('kpi-sub-clicks').innerHTML = fmtNum(current.impressions) + ' impress\u00F5es ' + deltaHtml(deltas.clicks);
  el('kpi-val-ctr').textContent = fmtPct(current.ctr);
  el('kpi-sub-ctr').innerHTML = 'taxa de clique ' + deltaHtml(deltas.ctr);
  el('kpi-val-cpc').textContent = fmtBrl(current.cpc);
  el('kpi-sub-cpc').innerHTML = 'custo por clique ' + deltaHtml(deltas.cpc, true);
  el('kpi-val-cpm').textContent = fmtBrl(current.cpm);
  el('kpi-sub-cpm').innerHTML = 'custo por mil ' + deltaHtml(deltas.cpm, true);

  // Atualizar conversão
  el('conv-val-link-clicks').textContent = fmtNum(current.link_clicks);
  el('conv-val-dms').textContent = fmtNum(current.dms);
  el('conv-val-leads').textContent = fmtNum(current.leads);
  el('conv-val-saves').textContent = fmtNum(current.saves);
  el('conv-val-lpv').textContent = fmtNum(current.landing_page_views);
  el('conv-val-reactions').textContent = fmtNum(current.reactions);
  el('conv-val-comments').textContent = fmtNum(current.comments_count);
  el('conv-val-video-views').textContent = fmtNum(current.video_views);

  // Custo por conversão
  el('conv-cost-link-clicks').textContent = current.link_clicks > 0 ? 'CPC ' + fmtBrl(current.spend / current.link_clicks) : '\u2014';
  el('conv-cost-dms').textContent = current.dms > 0 ? 'CPM ' + fmtBrl(current.spend / current.dms) : '\u2014';
  el('conv-cost-leads').textContent = current.leads > 0 ? 'CPL ' + fmtBrl(current.spend / current.leads) : '\u2014';
  el('conv-cost-saves').textContent = current.saves > 0 ? 'Custo ' + fmtBrl(current.spend / current.saves) : '\u2014';

  // Atualizar gráfico CSS
  renderDailyBars(filtered);

  // Atualizar labels de período
  const sD = parseDate(since), uD = parseDate(until);
  const label = sD.getDate() + ' ' + MESES_JS[sD.getMonth()+1] + ' \u2013 ' + uD.getDate() + ' ' + MESES_JS[uD.getMonth()+1] + ' ' + uD.getFullYear();
  el('period-display').textContent = label;
  el('period-info').textContent = dias + ' dias';
  el('kpi-period-label').innerHTML = '&middot; ' + label;

  // Info de comparação
  if (prevFiltered.length > 0) {{
    const pS = parseDate(prevSince), pU = parseDate(prevUntil);
    el('comparison-info').textContent = 'vs ' + pS.getDate() + ' ' + MESES_JS[pS.getMonth()+1] + ' \u2013 ' + pU.getDate() + ' ' + MESES_JS[pU.getMonth()+1];
    el('comparison-info').style.display = '';
  }} else {{
    el('comparison-info').style.display = 'none';
  }}

  // Atualizar date inputs
  document.getElementById('filter-since').value = since;
  document.getElementById('filter-until').value = until;
}}

// ═══ THEME TOGGLE ═══
function toggleTheme() {{
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') !== 'light';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent = isDark ? '\\u2600\\uFE0F' : '\\uD83C\\uDF19';
  localStorage.setItem('report-theme', isDark ? 'light' : 'dark');
}}

(function() {{
  const saved = localStorage.getItem('report-theme');
  if (saved && saved !== '{tema}') {{
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme-icon').textContent = saved === 'light' ? '\\u2600\\uFE0F' : '\\uD83C\\uDF19';
  }}
}})();

// ═══ GRÁFICO CSS (barras diárias) ═══
function renderDailyBars(data) {{
  var container = document.getElementById('dailyBars');
  var axis = document.getElementById('dailyAxis');
  if (!container) return;
  if (!data || data.length === 0) {{
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted);font-size:14px;">Sem dados para o período</div>';
    if (axis) axis.innerHTML = '';
    return;
  }}
  var maxSpend = 0;
  for (var i = 0; i < data.length; i++) {{
    if (data[i].spend > maxSpend) maxSpend = data[i].spend;
  }}
  if (maxSpend === 0) maxSpend = 1;
  var html = '';
  for (var i = 0; i < data.length; i++) {{
    var d = data[i];
    var h = Math.max(Math.round(d.spend / maxSpend * 170), 2);
    var label = dateBr(d.date);
    html += '<div class="css-bar" style="height:' + h + 'px;" title="' + label + '">';
    html += '<div class="bar-tip"><strong>' + label + '</strong><br>';
    html += 'Gasto: ' + fmtBrl(d.spend) + '<br>';
    html += 'Cliques: ' + fmtNum(d.clicks) + '<br>';
    html += 'Alcance: ' + fmtNum(d.reach) + '</div></div>';
  }}
  container.innerHTML = html;
  // Axis labels
  if (axis && data.length > 1) {{
    axis.innerHTML = '<span>' + dateBr(data[0].date) + '</span><span>' + dateBr(data[data.length-1].date) + '</span>';
  }}
}}
document.addEventListener('DOMContentLoaded', function() {{
  renderDailyBars(DAILY_DATA);
}});
</script>

</body>
</html>"""

    return html


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════
def main():
    args = parse_args()
    config = carregar_config(args.cliente)
    slug = gerar_slug(config)
    periodos = calcular_periodos(args.periodo)

    ad_account_id = config['ad_account_id']
    ig_user_id = config['ig_user_id']

    print(f"═══ Dashboard Meta Ads — {config['nome']} ({config['handle']}) ═══")
    print(f"    Período: {periodos['label']} | Tema: {args.tema}")
    print()

    # Coleta
    print("[1/7] Account insights...")
    account = coletar_account_insights(ad_account_id, periodos['atual'])

    print("[2/7] Período anterior (comparativo)...")
    anterior = coletar_account_anterior(ad_account_id, periodos['anterior'])

    print("[3/7] Campaign insights...")
    campaigns = coletar_campaign_insights(ad_account_id, periodos['atual'])

    print("[4/7] Ad set insights...")
    adsets = coletar_adset_insights(ad_account_id, periodos['atual'])

    print("[5/7] Ads + criativos...")
    ads = coletar_ads_com_criativos(ad_account_id, periodos['atual'])

    print("[6/7] Daily breakdown...")
    daily = coletar_daily_breakdown(ad_account_id, periodos['atual'])

    print("[7/7] Instagram orgânico + Reels...")
    organico = coletar_organico(ig_user_id, periodos['since_org'], periodos['until_org'])
    reels_ids = buscar_reels_recentes(ig_user_id, MAX_REELS)
    reels = coletar_reels_insights(reels_ids)

    # Cálculos
    print()
    print("Calculando deltas e insights...")
    deltas = calcular_deltas(account, anterior)
    insights_auto = gerar_insights_auto(account, campaigns, ads, organico, reels, deltas)

    # Montar dados
    dados = {
        'account': account,
        'anterior': anterior,
        'campaigns': campaigns,
        'adsets': adsets,
        'ads': ads,
        'daily': daily,
        'organico': organico,
        'reels': reels,
        'deltas': deltas,
        'insights_auto': insights_auto,
    }

    # Gerar HTML
    print("Gerando HTML...")
    html = gerar_html(dados, config, args.tema, periodos)

    # Salvar
    output_dir = f"{REPO_ROOT}/saidas/relatorios/{slug}"
    os.makedirs(output_dir, exist_ok=True)
    hoje = datetime.now()
    filename = f"relatorio-meta-{MESES_BR_LOWER[hoje.month]}-{hoje.year}.html"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)

    print()
    print(f"═══ Dashboard gerado com sucesso ═══")
    print(f"  Arquivo   : {filepath}")
    print(f"  Período   : {periodos['since']} → {periodos['until']}")
    print(f"  Campanhas : {len(campaigns)}")
    print(f"  Ad Sets   : {len(adsets)}")
    print(f"  Anúncios  : {len(ads)}")
    print(f"  Reels     : {len(reels)}")
    print(f"  Orgânico  : {organico['profile'].get('username', '?')} ({organico['profile'].get('followers_count', '?')} followers)")
    print(f"  Tema      : {args.tema}")


if __name__ == "__main__":
    main()
