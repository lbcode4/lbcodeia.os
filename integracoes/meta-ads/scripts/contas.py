"""
contas.py — resolve cliente → conta de anúncios a partir de _memoria/contas-ads.md.
Fonte única de verdade para os scripts simples (diagnostico, auditoria, reels,
criativos, gerenciar). O token NÃO vive aqui (fica em credentials/, gitignored).
"""
import os

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CONTAS_PATH = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")

VALORES_VAZIOS = ("—", "", "(preencher)", "act_XXXXXXXXX")


class ContaError(Exception):
    pass


def _limpar(v):
    v = v.strip().strip("`").strip()
    return "" if v in VALORES_VAZIOS else v


def parse_contas(path=CONTAS_PATH):
    """Lê a tabela '## Contas Conectadas' e retorna lista de dicts."""
    if not os.path.exists(path):
        raise ContaError(f"Mapa de contas não encontrado: {path}")
    with open(path, "r", encoding="utf-8") as f:
        conteudo = f.read()

    contas = []
    in_secao = False
    headers = []
    for linha in conteudo.split("\n"):
        if "## Contas Conectadas" in linha:
            in_secao = True
            continue
        if in_secao and linha.startswith("## "):
            break
        if not in_secao or "|" not in linha or "---" in linha:
            continue
        partes = [p.strip() for p in linha.split("|") if p.strip()]
        if not partes:
            continue
        if not headers:
            headers = [h.lower().replace(" ", "_") for h in partes]
            continue
        row = {}
        for i, h in enumerate(headers):
            row[h] = _limpar(partes[i]) if i < len(partes) else ""
        contas.append(row)
    return contas


def resolver_cliente(path=CONTAS_PATH, nome=None):
    """Resolve um cliente. Sem nome e 1 só cliente com Meta → usa ele.
    Sem nome e vários → erro. Nome inexistente → erro."""
    contas = [c for c in parse_contas(path) if c.get("meta_ad_account")]
    if not contas:
        raise ContaError("Nenhum cliente com Meta Ad Account configurado em contas-ads.md.")
    if nome:
        alvo = nome.lower()
        match = [c for c in contas if alvo in c.get("cliente", "").lower()]
        if not match:
            disponiveis = ", ".join(c["cliente"] for c in contas)
            raise ContaError(f"Cliente '{nome}' não encontrado. Disponíveis: {disponiveis}")
        return match[0]
    if len(contas) > 1:
        disponiveis = ", ".join(c["cliente"] for c in contas)
        raise ContaError(f"Múltiplos clientes — use --cliente. Disponíveis: {disponiveis}")
    return contas[0]
