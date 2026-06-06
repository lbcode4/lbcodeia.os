"""
contas_parser.py — primitivos de parsing de _memoria/contas-ads.md.

Fonte ÚNICA da lógica de leitura da tabela de contas, compartilhada pelos
dashboards (relatorio.py, dashboard_completo.py, dashboard_google.py). Antes
cada arquivo tinha sua cópia destes helpers e elas já tinham divergido
(VALORES_VAZIOS diferente entre os dashboards) — divergência silenciosa.

Cada dashboard ainda monta seu próprio `carregar_config` (mapeamento de
colunas + filtro + mensagens de erro variam por plataforma), mas a parte
frágil — limpar valores, achar a seção, parsear a tabela — vive só aqui.

Os scripts simples (diagnostico, auditoria, reels, criativos, gerenciar)
usam contas.py (parse_contas/resolver_cliente), que cobre o mesmo arquivo
com uma API mais enxuta.
"""

# Placeholders e valores "vazios" do template — tratados como não-preenchidos.
VALORES_VAZIOS = ("—", "—  (não configurado)", "XXXXXXXXX", "act_XXXXXXXXX", "(preencher)", "")


def limpar_valor(v):
    """Remove backticks e espaços; retorna '' se for um placeholder vazio."""
    v = v.strip().strip("`").strip()
    return "" if v in VALORES_VAZIOS else v


def extrair_agencia(conteudo):
    """Extrai o nome da agência/workspace do título (# ...) do arquivo."""
    for linha in conteudo.split("\n"):
        if linha.startswith("# ") and ("Workspace" in linha or "—" in linha):
            return linha.replace("# ", "").split("—")[0].strip()
    return "Workspace"


def parsear_tabela_multi(conteudo):
    """Parseia a tabela multi-cliente (formato novo) da seção '## Contas Conectadas'.

    Retorna (headers, linhas) onde headers são os nomes de coluna em minúsculas
    e cada linha é um dict {header: valor_limpo}.
    """
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
        if linha.lstrip().startswith(">"):
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
                row[h] = limpar_valor(partes[i]) if i < len(partes) else ""
            clientes.append(row)
    return headers, clientes


def parsear_tabela_legado(conteudo):
    """Parseia a tabela legado (formato antigo Campo | Valor).

    Retorna um dict bruto {Campo: valor_limpo}. O mapeamento Campo→config
    fica a cargo de cada dashboard (varia por plataforma).
    """
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
                dados[partes[0]] = limpar_valor(partes[1])
    return dados
