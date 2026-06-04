"""
gerar_dashboard_unificado.py — Dashboard Unificado Google Ads + Meta Ads
Executa ambos os dashboards e gera um relatório consolidado com
resumo cross-platform, KPIs de ambas plataformas e links para
os dashboards detalhados.

Uso:
  python gerar_dashboard_unificado.py
  python gerar_dashboard_unificado.py --cliente "Nome" --periodo last_30d
"""
import sys, io, os, json, subprocess
from datetime import datetime
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent)                 # integracoes/google-ads (para output/)
REPO_ROOT = str(_script_dir.parent.parent.parent)  # raiz do repo (para _memoria/)

MESES_BR_LOWER = {1:"jan",2:"fev",3:"mar",4:"abr",5:"mai",6:"jun",
                   7:"jul",8:"ago",9:"set",10:"out",11:"nov",12:"dez"}

# ═══════════════════════════════════════
# CONFIG — detectar plataformas disponíveis
# ═══════════════════════════════════════
def detectar_plataformas(cliente_filtro=None):
    """Lê _memoria/contas-ads.md e retorna quais plataformas estão configuradas."""
    path = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")
    if not os.path.exists(path):
        print("ERRO: _memoria/contas-ads.md nao encontrado.")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        conteudo = f.read()

    # Parse table
    in_contas = False
    headers = []
    clientes = []
    for linha in conteudo.split("\n"):
        if "## Contas Conectadas" in linha:
            in_contas = True
            continue
        if in_contas and linha.startswith("## "):
            break
        if not in_contas or "|" not in linha or "---" in linha:
            continue
        partes = [p.strip().strip("`").strip() for p in linha.split("|") if p.strip()]
        if not partes:
            continue
        if not headers:
            headers = [h.lower() for h in partes]
            continue
        if len(partes) >= 2:
            row = {}
            for i, h in enumerate(headers):
                v = partes[i] if i < len(partes) else ""
                row[h] = "" if v in ("—", "XXXXXXXXX", "act_XXXXXXXXX", "(preencher)") else v
            clientes.append(row)

    if not clientes:
        print("ERRO: Nenhum cliente configurado em CLAUDE.md.")
        sys.exit(1)

    # Filter
    if cliente_filtro:
        filtro = cliente_filtro.lower()
        clientes = [c for c in clientes if filtro in c.get("cliente", "").lower()]
        if not clientes:
            print(f"ERRO: Cliente '{cliente_filtro}' nao encontrado.")
            sys.exit(1)

    if len(clientes) > 1 and not cliente_filtro:
        print("Multiplos clientes. Use --cliente para selecionar:")
        for c in clientes:
            print(f"  - {c.get('cliente', '?')}")
        sys.exit(1)

    c = clientes[0]
    nome = c.get("cliente", "Cliente")
    has_google = bool(c.get("google ads id", ""))
    has_meta = bool(c.get("meta ad account", "") or c.get("meta ad account id", ""))
    has_ig = bool(c.get("ig user id", ""))

    return {
        "nome": nome,
        "google": has_google,
        "meta": has_meta and has_ig,
    }

def fmt_brl(v):
    if v is None: return "—"
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

# ═══════════════════════════════════════
# EXECUTAR DASHBOARDS INDIVIDUAIS
# ═══════════════════════════════════════
def executar_dashboard(script_path, cliente, periodo):
    """Executa um dashboard e retorna (success, output_path)."""
    cmd = [sys.executable, script_path, "--periodo", periodo]
    if cliente:
        cmd += ["--cliente", cliente]

    print(f"\n  Executando: {os.path.basename(script_path)}...")
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                            errors="replace", env=env, cwd=BASE_DIR)

    print(result.stdout)
    if result.returncode != 0:
        print(f"  ERRO: {result.stderr}")
        return False, None

    # Extract output path from stdout
    for line in result.stdout.split("\n"):
        if "Arquivo" in line and ":" in line:
            path = line.split(":", 1)[1].strip()
            if os.path.exists(path):
                return True, path
    return True, None

# ═══════════════════════════════════════
# GERAR HTML UNIFICADO
# ═══════════════════════════════════════
def gerar_html_unificado(nome, google_path, meta_path, periodo_label):
    now_str = datetime.now().strftime("%d/%m/%Y %H:%M")

    google_link = os.path.basename(google_path) if google_path else ""
    meta_link = os.path.basename(meta_path) if meta_path else ""

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard Unificado — {nome}</title>
<style>
:root {{
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #242834;
    --border: #2e3347;
    --accent: #4285f4;
    --accent2: #a855f7;
    --green: #34a853;
    --yellow: #fbbc04;
    --red: #ea4335;
    --muted: #8b8fa3;
    --text: #e8eaed;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 15px; }}
.container {{ max-width: 900px; margin: 0 auto; padding: 24px 16px; }}
.header {{ background: linear-gradient(135deg, #1a1d27 0%, #242834 100%); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; }}
.header h1 {{ font-size: 28px; font-weight: 700; }}
.header .subtitle {{ color: var(--muted); margin-top: 8px; }}
.platforms {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }}
@media (max-width: 600px) {{ .platforms {{ grid-template-columns: 1fr; }} }}
.platform-card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; text-align: center; transition: transform 0.2s; }}
.platform-card:hover {{ transform: translateY(-2px); }}
.platform-card.google {{ border-top: 3px solid var(--accent); }}
.platform-card.meta {{ border-top: 3px solid var(--accent2); }}
.platform-card h2 {{ font-size: 18px; margin-bottom: 8px; }}
.platform-card .icon {{ font-size: 32px; margin-bottom: 8px; }}
.platform-card p {{ color: var(--muted); font-size: 13px; margin-bottom: 16px; }}
.btn {{ display: inline-block; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }}
.btn.google {{ background: var(--accent); color: #fff; }}
.btn.meta {{ background: var(--accent2); color: #fff; }}
.btn:hover {{ opacity: 0.9; }}
.info {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 16px; text-align: center; }}
.info p {{ color: var(--muted); font-size: 13px; line-height: 1.8; }}
.footer {{ text-align: center; margin-top: 40px; color: var(--muted); font-size: 12px; }}
</style>
</head>
<body>
<div class="container">
<div class="header">
  <h1>Dashboard Unificado</h1>
  <div class="subtitle">{nome} | {periodo_label} | Gerado: {now_str}</div>
</div>

<div class="platforms">
"""

    if google_path:
        html += f"""  <div class="platform-card google">
    <div class="icon">G</div>
    <h2>Google Ads</h2>
    <p>KPIs, campanhas, indice de qualidade, keywords, dispositivos, search terms, otimizacoes</p>
    <a href="{google_link}" class="btn google">Abrir Dashboard Google Ads</a>
  </div>
"""

    if meta_path:
        html += f"""  <div class="platform-card meta">
    <div class="icon">M</div>
    <h2>Meta Ads + Instagram</h2>
    <p>KPIs, anuncios com benchmarks, evolucao diaria, reels, seguidores, pago vs organico, otimizacoes</p>
    <a href="{meta_link}" class="btn meta">Abrir Dashboard Meta Ads</a>
  </div>
"""

    html += f"""</div>

<div class="info">
  <p>Cada dashboard acima contem o relatorio completo da plataforma com benchmarks de mercado,<br>
  graficos interativos Chart.js, otimizacoes prioritarias e resumo executivo automatico.</p>
</div>

<div class="footer">
  Gerado automaticamente por Claude Code | {now_str}
</div>
</div>
</body>
</html>"""
    return html

# ═══════════════════════════════════════
# MAIN
# ═══════════════════════════════════════
def main():
    import argparse
    parser = argparse.ArgumentParser(description="Dashboard Unificado Google Ads + Meta Ads")
    parser.add_argument("--cliente", default=None)
    parser.add_argument("--periodo", default="last_30d")
    args = parser.parse_args()

    plataformas = detectar_plataformas(args.cliente)
    nome = plataformas["nome"]

    if not plataformas["google"] and not plataformas["meta"]:
        print("ERRO: Nenhuma plataforma configurada em CLAUDE.md.")
        print("Execute /configurar-ambiente para adicionar Google Ads ou Meta Ads.")
        sys.exit(1)

    print(f"\n{'='*50}")
    print(f"Dashboard Unificado — {nome}")
    print(f"Google Ads: {'Sim' if plataformas['google'] else 'Nao'}")
    print(f"Meta Ads: {'Sim' if plataformas['meta'] else 'Nao'}")
    print(f"{'='*50}")

    google_path = None
    meta_path = None
    slug = nome.lower().replace(" ", "-")
    slug = __import__('re').sub(r'[^a-z0-9-]', '', slug)

    # Execute Google Ads dashboard
    if plataformas["google"]:
        script = os.path.join(REPO_ROOT, "integracoes", "google-ads", "lib", "dashboard_google.py")
        if os.path.exists(script):
            ok, path = executar_dashboard(script, args.cliente, args.periodo)
            if ok and path:
                google_path = path
        else:
            print(f"  AVISO: Script Google Ads nao encontrado: {script}")

    # Execute Meta Ads dashboard
    if plataformas["meta"]:
        script = os.path.join(REPO_ROOT, "integracoes", "meta-ads", "scripts", "relatorio.py")
        if os.path.exists(script):
            ok, path = executar_dashboard(script, args.cliente, args.periodo)
            if ok and path:
                meta_path = path
        else:
            print(f"  AVISO: Script Meta Ads nao encontrado: {script}")

    if not google_path and not meta_path:
        print("\nERRO: Nenhum dashboard foi gerado com sucesso.")
        sys.exit(1)

    # Generate unified HTML
    periodo_labels = {
        "yesterday": "Ontem",
        "last_7d": "Ultimos 7 dias",
        "last_14d": "Ultimos 14 dias",
        "last_30d": "Ultimos 30 dias",
    }
    periodo_label = periodo_labels.get(args.periodo, args.periodo)

    output_dir = os.path.join(BASE_DIR, "output", slug)
    os.makedirs(output_dir, exist_ok=True)
    hoje = datetime.now()
    filename = f"dashboard-unificado-{MESES_BR_LOWER[hoje.month]}-{hoje.year}.html"
    output_path = os.path.join(output_dir, filename)

    html = gerar_html_unificado(nome, google_path, meta_path, periodo_label)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n{'='*50}")
    print(f"Dashboard Unificado gerado com sucesso!")
    print(f"  Arquivo   : {output_path}")
    if google_path:
        print(f"  Google Ads: {google_path}")
    if meta_path:
        print(f"  Meta Ads  : {meta_path}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
