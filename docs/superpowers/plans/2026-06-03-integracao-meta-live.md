# Integração Meta Ads Live — Implementation Plan (Plano 1 de 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trazer integração Meta Ads live (porte do `META_ADS/`) pro LBCodeOS — motor Python testado em `integracoes/meta-ads/` + 7 skills finas `lb-meta-*` que resolvem conta por cliente via `_memoria/contas-ads.md`.

**Architecture:** Motor Python puro em `integracoes/meta-ads/scripts/` (portado do META_ADS, paths Linux, tests pytest verdes). Resolução de conta multi-cliente centralizada em `_memoria/contas-ads.md` (versionado) via novo módulo `contas.py`. Skills `.md` finas em `.claude/skills/` chamam o motor e embrulham a saída na voz LBCode + pilar de framework. Token secreto em `integracoes/credentials/meta.env` (gitignored).

**Tech Stack:** Python 3.11+, requests, python-dotenv, jinja2, pytest. Meta Graph API v21.0.

**Escopo:** Este é o **Plano 1 (Meta)**. Google Ads live (Fases 4-6 do spec) ganha **Plano 2** após este rodar verde. Meta é independente e shippável sozinho.

**Spec:** `docs/superpowers/specs/2026-06-03-integracao-ads-live-design.md`

**Fonte do porte:** `/home/luan/LBCodeOS/META_ADS/` (irmão do repo).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `integracoes/meta-ads/scripts/meta_api.py` | `MetaAPIClient` — GET/POST Graph API, erros, test_connection |
| `integracoes/meta-ads/scripts/contas.py` | **NOVO** — parseia `_memoria/contas-ads.md`, resolve conta por cliente |
| `integracoes/meta-ads/scripts/relatorio.py` | dashboard HTML completo (port, path repontado) |
| `integracoes/meta-ads/scripts/diagnostico.py` | KPIs + alertas (port + flag `--cliente`) |
| `integracoes/meta-ads/scripts/auditoria.py` | auditoria conta (port + `--cliente`) |
| `integracoes/meta-ads/scripts/reels.py` | ranking reels (port + `--cliente`) |
| `integracoes/meta-ads/scripts/criativos.py` | top performers p/ copy (port + `--cliente`) |
| `integracoes/meta-ads/scripts/gerenciar.py` | mutate pause/ativar + log (port + `--cliente`) |
| `integracoes/meta-ads/tests/` | pytest portado (777 ln) + `test_contas.py` novo |
| `integracoes/meta-ads/STYLE-GUIDE.md` | padrão HTML (copiado) |
| `integracoes/credentials/meta.env` | token (GITIGNORED) |
| `integracoes/credentials/meta.env.example` | template |
| `_memoria/contas-ads.md` | mapa cliente→conta (versionado) |
| `requirements.txt` | deps Python |
| `.gitignore` | ignora credentials + output |
| `.claude/skills/lb-meta-*/SKILL.md` | 7 skills finas |

**Decisão de unificação de conta:** `relatorio.py` já tem parser de tabela markdown (`carregar_config`) — apenas repontamos o caminho pra `_memoria/contas-ads.md`. Os 5 scripts simples (diagnostico/auditoria/reels/criativos/gerenciar) ganham flag `--cliente` que usa o novo `contas.py` pra setar `client.account_id`. Isso é **aditivo** — não altera as assinaturas das funções `fetch_*`, então os testes existentes seguem verdes.

---

## FASE 1 — Esqueleto

### Task 1: Criar estrutura de pastas + gitignore

**Files:**
- Create: `integracoes/meta-ads/scripts/`, `integracoes/meta-ads/tests/`, `integracoes/meta-ads/output/`, `integracoes/credentials/`
- Modify/Create: `.gitignore` (raiz)

- [ ] **Step 1: Criar diretórios**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
mkdir -p integracoes/meta-ads/scripts integracoes/meta-ads/tests integracoes/meta-ads/output integracoes/credentials
touch integracoes/meta-ads/output/.gitkeep
```

- [ ] **Step 2: Garantir .gitignore na raiz com as entradas de segurança**

Verifique se `.gitignore` existe na raiz. Adicione (sem duplicar) estas linhas:

```gitignore
# Integrações — credenciais e outputs (NUNCA commitar)
integracoes/credentials/*.env
integracoes/credentials/*.yaml
integracoes/*/output/*.html
integracoes/*/output/*.json
__pycache__/
*.pyc
.pytest_cache/
.venv/
```

Run para confirmar que credentials está ignorado:
```bash
git check-ignore integracoes/credentials/meta.env
```
Expected: imprime `integracoes/credentials/meta.env` (= está ignorado)

- [ ] **Step 3: Commit**

```bash
git add .gitignore integracoes/meta-ads/output/.gitkeep
git commit -m "chore: scaffold integracoes/ + gitignore credenciais e output"
```

---

### Task 2: requirements.txt + credenciais template

**Files:**
- Create: `requirements.txt` (raiz), `integracoes/credentials/meta.env.example`

- [ ] **Step 1: Criar requirements.txt**

```
requests
python-dotenv
jinja2
pytest
```

- [ ] **Step 2: Criar meta.env.example**

`integracoes/credentials/meta.env.example`:
```
# Meta API — copiar para meta.env (gitignored) e preencher
META_ACCESS_TOKEN=SEU_TOKEN_AQUI

# Opcional: conta padrão se não usar --cliente.
# O mapa multi-cliente vive em _memoria/contas-ads.md.
# META_AD_ACCOUNT_ID=act_XXXXXXXXXX
```

- [ ] **Step 3: Criar meta.env real (local, não commitado) a partir do token existente**

```bash
cp /home/luan/LBCodeOS/META_ADS/meta.env /home/luan/LBCodeOS/LBCodeOS/integracoes/credentials/meta.env 2>/dev/null || cp integracoes/credentials/meta.env.example integracoes/credentials/meta.env
git check-ignore integracoes/credentials/meta.env
```
Expected: imprime o caminho (ignorado). **Se NÃO imprimir, PARE — não commite o token.**

- [ ] **Step 4: Commit (só o exemplo e requirements)**

```bash
git add requirements.txt integracoes/credentials/meta.env.example
git commit -m "chore: requirements.txt + meta.env.example"
```

---

### Task 3: Criar `_memoria/contas-ads.md` (mapa cliente→conta)

**Files:**
- Create: `_memoria/contas-ads.md`

**Nota:** os headers da tabela são escolhidos para casar com o parser de `relatorio.py` (`carregar_config` procura a seção `## Contas Conectadas` e colunas `meta ad account`, `ig user id`, `handle ig`, `google ads id`). Não renomear sem ajustar o parser.

- [ ] **Step 1: Criar o arquivo**

`_memoria/contas-ads.md`:
```markdown
# Contas de Anúncios — Mapa Cliente → Conta

Fonte única para resolução de conta nas integrações Meta/Google.
Token secreto NÃO vive aqui (fica em `integracoes/credentials/`, gitignored).

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | act_1388795691981562 | 17841461249791228 | @dordrianstore | — | sim |
```

- [ ] **Step 2: Commit**

```bash
git add _memoria/contas-ads.md
git commit -m "feat: _memoria/contas-ads.md — mapa cliente para conta de anuncios"
```

---

## FASE 2 — Motor Meta (porte + testes verdes)

### Task 4: Portar `meta_api.py` (core client)

**Files:**
- Create: `integracoes/meta-ads/scripts/meta_api.py`

- [ ] **Step 1: Copiar o arquivo do META_ADS**

```bash
cp /home/luan/LBCodeOS/META_ADS/scripts/meta_api.py /home/luan/LBCodeOS/LBCodeOS/integracoes/meta-ads/scripts/meta_api.py
```

- [ ] **Step 2: Verificar path do meta.env**

O arquivo já usa path relativo (`os.path.join(os.path.dirname(__file__), '..', 'meta.env')`). Na nova estrutura o `.env` está em `integracoes/credentials/meta.env`, não em `integracoes/meta-ads/meta.env`. Editar a linha do `_env_path`:

Antiga (linha ~6):
```python
_env_path = os.path.join(os.path.dirname(__file__), '..', 'meta.env')
```
Nova:
```python
_env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'credentials', 'meta.env')
```

- [ ] **Step 3: Testar conexão**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
python integracoes/meta-ads/scripts/meta_api.py --test
```
Expected: `✅ Meta conectado: ...` (se token válido) OU `Erro: META_ACCESS_TOKEN requerido` se ainda não configurado. Qualquer um confirma que o import/paths funcionam.

- [ ] **Step 4: Commit**

```bash
git add integracoes/meta-ads/scripts/meta_api.py
git commit -m "feat: portar meta_api.py — MetaAPIClient com path de credentials novo"
```

---

### Task 5: Criar `contas.py` (resolvedor de conta) — TDD

**Files:**
- Create: `integracoes/meta-ads/scripts/contas.py`
- Create: `integracoes/meta-ads/tests/conftest.py`
- Test: `integracoes/meta-ads/tests/test_contas.py`

- [ ] **Step 1: Criar conftest.py (path dos scripts)**

`integracoes/meta-ads/tests/conftest.py`:
```python
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
```

- [ ] **Step 2: Escrever o teste falho**

`integracoes/meta-ads/tests/test_contas.py`:
```python
import os
import tempfile
import unittest

from contas import parse_contas, resolver_cliente, ContaError

TABELA = """# Contas

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | act_123 | 999 | @dordrian | — | sim |
| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |
"""


class TestParseContas(unittest.TestCase):
    def _write(self, conteudo):
        f = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8")
        f.write(conteudo)
        f.close()
        return f.name

    def test_parse_retorna_todos_clientes(self):
        path = self._write(TABELA)
        contas = parse_contas(path)
        self.assertEqual(len(contas), 2)
        self.assertEqual(contas[0]["cliente"], "Dordrian Store")
        self.assertEqual(contas[0]["meta_ad_account"], "act_123")

    def test_resolver_por_nome_parcial_case_insensitive(self):
        path = self._write(TABELA)
        conta = resolver_cliente(path, "dordrian")
        self.assertEqual(conta["meta_ad_account"], "act_123")

    def test_resolver_unico_cliente_sem_filtro(self):
        path = self._write(TABELA.replace("| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |\n", ""))
        conta = resolver_cliente(path, None)
        self.assertEqual(conta["meta_ad_account"], "act_123")

    def test_resolver_multiplos_sem_filtro_erra(self):
        path = self._write(TABELA)
        with self.assertRaises(ContaError):
            resolver_cliente(path, None)

    def test_resolver_cliente_inexistente_erra(self):
        path = self._write(TABELA)
        with self.assertRaises(ContaError):
            resolver_cliente(path, "inexistente")

    def test_arquivo_ausente_erra(self):
        with self.assertRaises(ContaError):
            parse_contas("/tmp/nao_existe_xyz.md")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 3: Rodar — deve falhar**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
python -m pytest integracoes/meta-ads/tests/test_contas.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'contas'`

- [ ] **Step 4: Implementar `contas.py`**

`integracoes/meta-ads/scripts/contas.py`:
```python
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
```

- [ ] **Step 5: Rodar — deve passar**

```bash
python -m pytest integracoes/meta-ads/tests/test_contas.py -v
```
Expected: PASS (6 passed)

- [ ] **Step 6: Commit**

```bash
git add integracoes/meta-ads/scripts/contas.py integracoes/meta-ads/tests/conftest.py integracoes/meta-ads/tests/test_contas.py
git commit -m "feat: contas.py — resolve cliente para conta via _memoria/contas-ads.md (TDD)"
```

---

### Task 6: Portar os 5 scripts simples + tests

**Files:**
- Create: `integracoes/meta-ads/scripts/{diagnostico,auditoria,reels,criativos,gerenciar}.py`
- Create: `integracoes/meta-ads/tests/test_{diagnostico,auditoria,reels,criativos,gerenciar}.py`

- [ ] **Step 1: Copiar scripts + tests do META_ADS**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
for f in diagnostico auditoria reels criativos gerenciar; do
  cp /home/luan/LBCodeOS/META_ADS/scripts/$f.py integracoes/meta-ads/scripts/$f.py
  cp /home/luan/LBCodeOS/META_ADS/tests/test_$f.py integracoes/meta-ads/tests/test_$f.py
done
```

- [ ] **Step 2: Corrigir o LOG_FILE do gerenciar.py**

`gerenciar.py` linha ~10 aponta o log p/ `../output`. Na nova estrutura `output/` é irmão de `scripts/`, então o path `'..', 'output'` continua correto. Confirmar (nenhuma edição necessária se já for `os.path.join(os.path.dirname(__file__), '..', 'output', 'acoes-log.json')`). Se houver path Windows, corrigir para esse relativo.

- [ ] **Step 3: Rodar os testes portados — devem passar (mocam HTTP, não tocam paths novos)**

```bash
python -m pytest integracoes/meta-ads/tests/ -v
```
Expected: PASS (todos os testes de diagnostico/auditoria/reels/criativos/gerenciar + contas)

- [ ] **Step 4: Adicionar flag `--cliente` aos 5 scripts (resolve conta via contas.py)**

Para cada script simples que hoje só usa `client.account_id`, adicionar no topo do `main()` (antes de chamar as funções `fetch_*`) a resolução por cliente. Padrão exato a inserir no `main()` de cada um:

```python
    # --- resolução de conta por cliente (LBCodeOS) ---
    import argparse
    from contas import resolver_cliente, ContaError
    parser = argparse.ArgumentParser()
    parser.add_argument("--cliente", default=None)
    args, _ = parser.parse_known_args()
    client = MetaAPIClient()
    if args.cliente or not client.account_id:
        try:
            conta = resolver_cliente(nome=args.cliente)
            client.account_id = conta["meta_ad_account"]
        except ContaError as e:
            print(f"Erro: {e}")
            sys.exit(1)
    # --- fim resolução ---
```

> Aplicar respeitando o `main()` existente de cada script (alguns já criam `client = MetaAPIClient()` — não duplicar; reaproveitar a variável). Se o script já tem `argparse`, adicionar só o argumento `--cliente` e o bloco de resolução.

- [ ] **Step 5: Rodar os testes de novo — ainda verdes (a mudança é só no main, fora das funções testadas)**

```bash
python -m pytest integracoes/meta-ads/tests/ -v
```
Expected: PASS (mesmo número de testes)

- [ ] **Step 6: Smoke test de um script com --cliente (precisa token válido)**

```bash
python integracoes/meta-ads/scripts/diagnostico.py --cliente Dordrian
```
Expected: JSON de KPIs OU erro de API limpo. Não deve dar traceback de path/import.

- [ ] **Step 7: Commit**

```bash
git add integracoes/meta-ads/scripts integracoes/meta-ads/tests
git commit -m "feat: portar 5 scripts Meta + tests, flag --cliente via contas.py"
```

---

### Task 7: Portar `relatorio.py` (dashboard) — repontar config

**Files:**
- Create: `integracoes/meta-ads/scripts/relatorio.py`
- Create: `integracoes/meta-ads/tests/test_relatorio.py`
- Create: `integracoes/meta-ads/STYLE-GUIDE.md`

- [ ] **Step 1: Copiar relatorio.py + test + STYLE-GUIDE**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
cp /home/luan/LBCodeOS/META_ADS/scripts/relatorio.py integracoes/meta-ads/scripts/relatorio.py
cp /home/luan/LBCodeOS/META_ADS/tests/test_relatorio.py integracoes/meta-ads/tests/test_relatorio.py
cp /home/luan/LBCodeOS/META_ADS/docs/STYLE-GUIDE.md integracoes/meta-ads/STYLE-GUIDE.md
```

- [ ] **Step 2: Adicionar REPO_ROOT e repontar o config p/ _memoria/contas-ads.md**

Em `relatorio.py`, após a linha `BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))` (linha ~34), adicionar:
```python
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
```

Na função `carregar_config` (linha ~126), trocar:
```python
    path = f"{BASE_DIR}/CLAUDE.md"
```
por:
```python
    path = f"{REPO_ROOT}/_memoria/contas-ads.md"
```

E na mensagem de erro logo abaixo, trocar referências a `CLAUDE.md` / `setup_bootcamp.py` / `/configurar-ambiente` por:
```python
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md (ver skill /lb-ads-conectar).")
```

> O parser interno (`_parsear_tabela_multi`) procura a seção `## Contas Conectadas` e colunas `meta ad account` / `ig user id` / `handle ig` / `google ads id` — que é exatamente o formato de `_memoria/contas-ads.md` (Task 3). Nenhuma outra edição no parser.

- [ ] **Step 3: Confirmar que output vai pra integracoes/meta-ads/output**

Linha ~1824 usa `output_dir = f"{BASE_DIR}/output/{slug}"`. BASE_DIR = `integracoes/meta-ads`, então OK. Nenhuma edição.

- [ ] **Step 4: Rodar o teste portado**

```bash
python -m pytest integracoes/meta-ads/tests/test_relatorio.py -v
```
Expected: PASS. Se algum teste mockava o path do CLAUDE.md, ajustar o mock para `_memoria/contas-ads.md` e repetir.

- [ ] **Step 5: Smoke test do dashboard (precisa token)**

```bash
python integracoes/meta-ads/scripts/relatorio.py --cliente Dordrian
ls integracoes/meta-ads/output/
```
Expected: gera um `.html` em `output/<slug>/`. Não deve dar erro de path/CLAUDE.md.

- [ ] **Step 6: Suite completa verde**

```bash
python -m pytest integracoes/meta-ads/ -v
```
Expected: PASS (todos)

- [ ] **Step 7: Commit**

```bash
git add integracoes/meta-ads/scripts/relatorio.py integracoes/meta-ads/tests/test_relatorio.py integracoes/meta-ads/STYLE-GUIDE.md
git commit -m "feat: portar relatorio.py (dashboard Meta) repontando config p/ _memoria/contas-ads.md"
```

---

## FASE 3 — Skills Meta finas

**Padrão comum de toda skill** — Tasks 9-11 **copiam o SKILL.md da Task 8 como template** e trocam SOMENTE os campos indicados (name, description/triggers, comando do motor, pilar). O corpo de 6 passos é idêntico.

Estrutura do SKILL.md:
1. Frontmatter `name: lb-meta-<x>` + `description:` com triggers em PT.
2. Carrega `_memoria/empresa.md`, `preferencias.md`, `estrategia.md` (contexto + voz).
3. Resolve cliente em `_memoria/contas-ads.md`.
4. Roda o script do motor com `--cliente`.
5. Lê a saída, embrulha insight do pilar (não despeja HTML cru).

### Task 8: Skill `lb-meta-dashboard` (exemplo completo de referência)

**Files:**
- Create: `.claude/skills/meta-dashboard/SKILL.md`

- [ ] **Step 1: Escrever o SKILL.md completo**

`.claude/skills/meta-dashboard/SKILL.md`:
```markdown
---
name: lb-meta-dashboard
description: >
  Puxa performance Meta Ads LIVE da Graph API e gera dashboard HTML completo
  (hierarquia campanha→adset→ad, comparativo de período, funil de vídeo, dark/light).
  Resolve a conta do cliente em _memoria/contas-ads.md. Diferente de /lb-meta-relatorio
  (que lê CSV manual) — este puxa direto da API. Use quando o usuário pedir
  "dashboard meta live", "puxar dados do meta", "relatório meta da API",
  "performance ao vivo", ou /lb-meta-dashboard.
---

# /lb-meta-dashboard — Dashboard Meta Ads (live API)

Puxa dado real da Graph API v21.0 → HTML. Não é CSV manual.

## Dependências
- **Motor:** `integracoes/meta-ads/scripts/relatorio.py`
- **Conta:** `_memoria/contas-ads.md` (resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/meta.env` (validar com `python integracoes/meta-ads/scripts/meta_api.py --test`; skill `/lb-ads-conectar` chega no Plano 2)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Identificar o cliente. Se não dito, listar os de `_memoria/contas-ads.md`.
3. Rodar:
   `python integracoes/meta-ads/scripts/relatorio.py --cliente "<Cliente>"`
4. Pegar o caminho do HTML gerado em `integracoes/meta-ads/output/`.
5. **Camada framework (Bolo de Cenoura + GCC):** ler os KPIs e entregar
   3 insights acionáveis na voz LBCode — validar consistência termo→anúncio→landing,
   apontar queima de orçamento, CTR baixo, criativo quebrando.
6. Devolver: caminho do HTML + os 3 insights.

## Erros
- Token faltando → conferir `integracoes/credentials/meta.env` e rodar `python integracoes/meta-ads/scripts/meta_api.py --test` (skill `/lb-ads-conectar` chega no Plano 2).
- Cliente não achado → listar disponíveis de `_memoria/contas-ads.md`.
- NUNCA exibir o token em resposta/log.
```

- [ ] **Step 2: Validação manual**

```bash
ls .claude/skills/meta-dashboard/SKILL.md
```
Expected: arquivo existe. (Skills .md não têm teste unitário — validação é rodar o comando depois.)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/meta-dashboard/SKILL.md
git commit -m "feat: skill lb-meta-dashboard — dashboard Meta live com camada framework"
```

---

### Task 9: Skills `lb-meta-diagnostico` e `lb-meta-auditoria`

**Files:**
- Create: `.claude/skills/meta-diagnostico/SKILL.md`
- Create: `.claude/skills/meta-auditoria/SKILL.md`

- [ ] **Step 1: meta-diagnostico/SKILL.md** (seguir o padrão da Task 8, trocando):
- `name: lb-meta-diagnostico`
- description triggers: "diagnóstico meta", "como tá a conta", "kpis meta", "/meta-diagnostico"
- Motor: `integracoes/meta-ads/scripts/diagnostico.py --cliente "<Cliente>"`
- Pilar: **Bolo de Cenoura** — saída é KPIs + alertas (gasto, CPL, CTR) + recomendação na voz LBCode.

- [ ] **Step 2: meta-auditoria/SKILL.md** (mesmo padrão):
- `name: lb-meta-auditoria`
- triggers: "auditoria meta", "auditar conta meta", "quick wins meta", "/meta-auditoria"
- Motor: `integracoes/meta-ads/scripts/auditoria.py --cliente "<Cliente>"`
- Pilar: **Bolo de Cenoura** — auditoria de adsets/placements + quick wins priorizados.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/meta-diagnostico/SKILL.md .claude/skills/meta-auditoria/SKILL.md
git commit -m "feat: skills lb-meta-diagnostico e lb-meta-auditoria"
```

---

### Task 10: Skills `lb-meta-reels` e `lb-meta-copy`

**Files:**
- Create: `.claude/skills/meta-reels/SKILL.md`
- Create: `.claude/skills/meta-copy/SKILL.md`

- [ ] **Step 1: meta-reels/SKILL.md** (padrão Task 8):
- `name: lb-meta-reels`
- triggers: "reels meta", "ranking de reels", "qual reel impulsionar", "/meta-reels"
- Motor: `integracoes/meta-ads/scripts/reels.py --cliente "<Cliente>"`
- Pilar: **RETINA** — qual conteúdo performou + recomendação de impulsionamento alinhada ao posicionamento.

- [ ] **Step 2: meta-copy/SKILL.md** (padrão Task 8):
- `name: lb-meta-copy`
- triggers: "copy meta", "anúncio a partir dos top", "gerar copy facebook/instagram", "/meta-copy"
- Motor: `integracoes/meta-ads/scripts/criativos.py --cliente "<Cliente>"` (puxa top performers por CTR)
- Pilar: **GCC + RETINA** — gera copy do anúncio usando os criativos vencedores como base.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/meta-reels/SKILL.md .claude/skills/meta-copy/SKILL.md
git commit -m "feat: skills lb-meta-reels e lb-meta-copy"
```

---

### Task 11: Skill `lb-meta-gerenciar` (mutate — confirmação obrigatória)

**Files:**
- Create: `.claude/skills/meta-gerenciar/SKILL.md`

- [ ] **Step 1: Escrever SKILL.md** (padrão Task 8, com regra de confirmação):
- `name: lb-meta-gerenciar`
- triggers: "pausar anúncio", "ativar anúncio", "gerenciar anúncios meta", "/meta-gerenciar"
- Motor:
  - buscar: `python integracoes/meta-ads/scripts/gerenciar.py --action search --name "<termo>"`
  - pausar: `... --action pause --ad-id <id>`
  - ativar: `... --action activate --ad-id <id>`
- **Regra crítica (operação destrutiva):** SEMPRE confirmar com o usuário antes de `pause`/`activate`. Mostrar nome + status atual do anúncio. Toda ação grava em `integracoes/meta-ads/output/acoes-log.json` (auditoria).
- Pilar: operacional (sem pilar de copy).

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/meta-gerenciar/SKILL.md
git commit -m "feat: skill lb-meta-gerenciar — pausar/ativar anuncio com confirmacao + log"
```

---

### Task 12: Atualizar CLAUDE.md + skills-catalogo + verificação final

**Files:**
- Modify: `CLAUDE.md` (raiz) — seção carregamento sob demanda
- Modify: `_memoria/skills-catalogo.md` — registrar as 7 skills
- Create: `integracoes/meta-ads/README.md`

- [ ] **Step 1: Adicionar linha de carregamento sob demanda no CLAUDE.md**

Na tabela "Sob demanda" do `CLAUDE.md`, adicionar a linha:
```markdown
| `integracoes/meta-ads/` (scripts + STYLE-GUIDE) | rodar skill `lb-meta-*` (dashboard/diagnóstico/auditoria/reels/copy/gerenciar) live |
```

- [ ] **Step 2: Registrar as 7 skills no skills-catalogo.md**

Adicionar entradas para `lb-meta-dashboard`, `lb-meta-diagnostico`, `lb-meta-auditoria`, `lb-meta-reels`, `lb-meta-copy`, `lb-meta-gerenciar` (+ nota de que dependem de `_memoria/contas-ads.md` + credencial). Seguir o formato das entradas existentes no arquivo.

- [ ] **Step 3: README do motor**

`integracoes/meta-ads/README.md`:
```markdown
# integracoes/meta-ads

Motor Python da integração Meta Ads live (Graph API v21.0).
Portado de META_ADS. Skills `lb-meta-*` em `.claude/skills/` consomem estes scripts.

- `scripts/meta_api.py` — MetaAPIClient (token em `integracoes/credentials/meta.env`)
- `scripts/contas.py` — resolve cliente→conta via `_memoria/contas-ads.md`
- `scripts/relatorio.py` — dashboard HTML completo
- `scripts/{diagnostico,auditoria,reels,criativos,gerenciar}.py` — funções específicas
- `tests/` — `pytest integracoes/meta-ads/ -v`

Conta resolvida por `--cliente "<Nome>"` (casa com `_memoria/contas-ads.md`).
Credenciais NUNCA commitadas (gitignored).
```

- [ ] **Step 4: Rodar a suite completa + checar paths Windows residuais**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
python -m pytest integracoes/meta-ads/ -v
grep -rn "C:/\|c:/Claude" integracoes/meta-ads/scripts/ || echo "OK — sem paths Windows"
git check-ignore integracoes/credentials/meta.env
```
Expected: pytest PASS, "OK — sem paths Windows", check-ignore imprime o caminho.

- [ ] **Step 5: Commit final da Fase 3**

```bash
git add CLAUDE.md _memoria/skills-catalogo.md integracoes/meta-ads/README.md
git commit -m "docs: registrar integração Meta live no CLAUDE.md, skills-catalogo e README"
```

---

## Done — critérios de aceite (Plano 1)

- [ ] `pytest integracoes/meta-ads/ -v` todo verde (testes portados + `test_contas.py`)
- [ ] `python integracoes/meta-ads/scripts/relatorio.py --cliente Dordrian` gera HTML em `output/`
- [ ] Nenhum path Windows em `integracoes/meta-ads/scripts/`
- [ ] `integracoes/credentials/meta.env` gitignored (token nunca commitado)
- [ ] 6 skills `lb-meta-*` (dashboard/diagnostico/auditoria/reels/copy/gerenciar) criadas e registradas no skills-catalogo (a infra `/lb-ads-conectar` é do Plano 2)
- [ ] `_memoria/contas-ads.md` é a fonte única de conta

**Próximo:** Plano 2 — Google Ads live (Fases 4-6 do spec): porta `google-ads/lib` do ClaudeCode, OAuth2, dashboard unificado, `lb-ads-negativas`, `lb-ads-conectar`. Escrever após este rodar verde.
```
