# Integração Google Ads Live — Implementation Plan (Plano 2 de 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trazer integração Google Ads live (porte de `ClaudeCode/google-ads/lib`) pro LBCodeOS — motor Python em `integracoes/google-ads/`, dashboard unificado Google+Meta, skills `lb-google-dashboard` / `lb-ads-unificado` / `lb-ads-negativas`, e ramo Google na `lb-ads-conectar`.

**Architecture:** Espelha o Plano 1 (Meta). Motor Python em `integracoes/google-ads/lib/`, conta resolvida pela coluna `Google Ads ID` de `_memoria/contas-ads.md`, credencial OAuth2 em `integracoes/credentials/google-ads.yaml` (gitignored). Skills finas em `.claude/skills/` embrulham a saída na voz LBCode + pilar. Dashboard unificado roda os 2 motores (Meta `relatorio.py` + Google `dashboard_google.py`) via subprocess e funde num HTML.

**Tech Stack:** Python 3.11+, biblioteca `google-ads` (GoogleAdsClient, GAQL/search_stream), pytest. Google Ads API.

**Escopo:** Plano 2 (Google). Plano 1 (Meta) já está executado na branch `feat/integracao-meta-live`. Continuar nessa mesma branch.

**Spec:** `docs/superpowers/specs/2026-06-03-integracao-ads-live-design.md` (Fases 4-6).

**Fonte do porte:** `/home/luan/LBCodeOS/ClaudeCode/google-ads/lib/` + `ClaudeCode/system-prompts/agents/agente-negativas.md`.

---

## ⚠️ Pré-requisito de credencial (LER ANTES)

A biblioteca `google-ads` instala via pip **sem credencial** (é só o client). Por isso:
- **Testável agora (sem creds):** instalação da lib, funções puras (`fmt_brl`, `fmt_pct`, `safe_div`, `fmt_cost`, `normalizar`), parsing de `_memoria/contas-ads.md`, construção de GAQL, geração de HTML com dado mockado, parsing de `search_term_view` mockado.
- **NÃO testável até o usuário fornecer creds:** round-trip real da API (`search_stream`). Exige `integracoes/credentials/google-ads.yaml` preenchido: `developer_token` (tem processo de aprovação Google), `client_id`, `client_secret`, `refresh_token`, `login_customer_id`.

Tasks marcadas **[LIVE-PENDENTE]** têm um smoke test que só passa com creds reais — nesses, o critério de aceite é "import + testes mockados verdes; smoke live documentado como pendente".

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `integracoes/google-ads/lib/utils.py` | helpers: `get_client`, `fmt_brl`, `fmt_pct`, `safe_div`, `fmt_cost`, `normalizar` |
| `integracoes/google-ads/lib/dashboard_google.py` | dashboard HTML Google Ads (port, config repontado) |
| `integracoes/google-ads/lib/dashboard_unificado.py` | funde Google + Meta num HTML (port, paths repontados) |
| `integracoes/google-ads/lib/negativas.py` | **NOVO** — puxa `search_term_view` (GAQL) p/ análise de negativas |
| `integracoes/google-ads/tests/` | pytest novo (ClaudeCode não tinha) |
| `integracoes/google-ads/__init__.py` + `lib/__init__.py` | pacote |
| `integracoes/credentials/google-ads.yaml` | OAuth2 (GITIGNORED) |
| `integracoes/credentials/google-ads.yaml.example` | template |
| `_memoria/contas-ads.md` | já tem coluna `Google Ads ID` (preencher por cliente) |
| `requirements.txt` | + `google-ads` |
| `.claude/skills/google-dashboard/SKILL.md` | skill `lb-google-dashboard` |
| `.claude/skills/ads-unificado/SKILL.md` | skill `lb-ads-unificado` |
| `.claude/skills/ads-negativas/SKILL.md` | skill `lb-ads-negativas` |
| `.claude/skills/ads-conectar/SKILL.md` | estender com ramo Google |

**Decisão de conta:** a coluna `Google Ads ID` de `_memoria/contas-ads.md` é a fonte. O parser interno de `dashboard_google.py` já procura essa coluna na seção `## Contas Conectadas` — só repontar o caminho do arquivo (de `CLAUDE.md` p/ `_memoria/contas-ads.md`), igual fizemos no `relatorio.py` do Plano 1.

---

## FASE 4 — Motor Google

### Task 1: Dependência google-ads + credencial template

**Files:**
- Modify: `requirements.txt`
- Create: `integracoes/credentials/google-ads.yaml.example`, `integracoes/google-ads/__init__.py`, `integracoes/google-ads/lib/__init__.py`, `integracoes/google-ads/tests/`

- [ ] **Step 1: Criar diretórios + pacote**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
mkdir -p integracoes/google-ads/lib integracoes/google-ads/tests integracoes/google-ads/output
touch integracoes/google-ads/__init__.py integracoes/google-ads/lib/__init__.py integracoes/google-ads/output/.gitkeep
```

- [ ] **Step 2: Adicionar google-ads ao requirements.txt**

Acrescentar a linha `google-ads` ao `requirements.txt` (manter as existentes: requests, python-dotenv, jinja2, pytest):
```
requests
python-dotenv
jinja2
pytest
google-ads
```

- [ ] **Step 3: Instalar no venv**

```bash
.venv/bin/python -m pip install google-ads
.venv/bin/python -c "from google.ads.googleads.client import GoogleAdsClient; print('google-ads OK')"
```
Expected: `google-ads OK` (instala sem credencial — é só a lib cliente).

- [ ] **Step 4: Criar `integracoes/credentials/google-ads.yaml.example`**

```yaml
# Google Ads API — copiar para google-ads.yaml (gitignored) e preencher.
# developer_token exige aprovação no Google Ads API Center.
developer_token: SEU_DEVELOPER_TOKEN
client_id: SEU_CLIENT_ID
client_secret: SEU_CLIENT_SECRET
refresh_token: SEU_REFRESH_TOKEN
login_customer_id: SEU_LOGIN_CUSTOMER_ID
use_proto_plus: true
```

- [ ] **Step 5: Confirmar gitignore cobre o yaml**

```bash
git check-ignore integracoes/credentials/google-ads.yaml || echo "FALTA IGNORE"
```
Expected: imprime o caminho (o `.gitignore` do Plano 1 já tem `integracoes/credentials/*.yaml`). Se imprimir "FALTA IGNORE", adicionar `integracoes/credentials/*.yaml` ao `.gitignore` antes de prosseguir.

- [ ] **Step 6: Commit**

```bash
git add requirements.txt integracoes/credentials/google-ads.yaml.example integracoes/google-ads/__init__.py integracoes/google-ads/lib/__init__.py integracoes/google-ads/output/.gitkeep
git commit -m "chore: google-ads dep + scaffold integracoes/google-ads + yaml.example"
```

---

### Task 2: Portar `utils.py` (helpers puros) — TDD

**Files:**
- Create: `integracoes/google-ads/lib/utils.py`
- Create: `integracoes/google-ads/tests/conftest.py`
- Test: `integracoes/google-ads/tests/test_utils.py`

- [ ] **Step 1: Criar conftest.py (path do lib/)**

`integracoes/google-ads/tests/conftest.py`:
```python
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'lib'))
```

- [ ] **Step 2: Escrever o teste falho**

`integracoes/google-ads/tests/test_utils.py`:
```python
import unittest

from utils import fmt_brl, fmt_pct, safe_div, fmt_cost, normalizar


class TestUtils(unittest.TestCase):
    def test_fmt_brl(self):
        self.assertEqual(fmt_brl(1234.56), "R$ 1.234,56")

    def test_fmt_pct(self):
        self.assertEqual(fmt_pct(9.4), "9,40%")

    def test_safe_div_normal(self):
        self.assertEqual(safe_div(10, 2), 5)

    def test_safe_div_zero(self):
        self.assertEqual(safe_div(10, 0), 0)

    def test_fmt_cost_micros(self):
        self.assertEqual(fmt_cost(1_000_000), 1.0)

    def test_normalizar_remove_acento(self):
        self.assertEqual(normalizar("Açaí"), "acai")


if __name__ == "__main__":
    unittest.main()
```

> Nota: `fmt_pct` original retorna `f"{v:.2f}%"` = `"9.40%"` (ponto). Mas o teste espera vírgula `"9,40%"`. Ajustar `fmt_pct` no porte para usar vírgula (consistente com `fmt_brl`): ver Step 4.

- [ ] **Step 3: Rodar — deve falhar**

```bash
.venv/bin/python -m pytest integracoes/google-ads/tests/test_utils.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'utils'`

- [ ] **Step 4: Implementar `utils.py` (porte com paths Linux + fmt_pct vírgula)**

`integracoes/google-ads/lib/utils.py`:
```python
"""
utils.py — helpers Google Ads API (porte de ClaudeCode, paths Linux).
"""
import os
import sys
import io
import unicodedata
from google.ads.googleads.client import GoogleAdsClient

YAML_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "credentials", "google-ads.yaml"))


def setup_encoding():
    """Garante output UTF-8."""
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def get_client(yaml_path=YAML_PATH):
    """Retorna GoogleAdsClient configurado a partir do yaml."""
    return GoogleAdsClient.load_from_storage(yaml_path)


def fmt_brl(v):
    """Formata valor em BRL: R$ 1.234,56"""
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def fmt_pct(v):
    """Formata percentual com vírgula: 9,40%"""
    return f"{v:.2f}".replace(".", ",") + "%"


def safe_div(a, b):
    """Divisão segura — retorna 0 se denominador for zero."""
    return a / b if b else 0


def normalizar(s):
    """Remove acentos e converte para minúsculas para comparações."""
    nfkd = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()


def fmt_cost(cost_micros):
    """Converte cost_micros para float em BRL."""
    return cost_micros / 1_000_000
```

- [ ] **Step 5: Rodar — deve passar**

```bash
.venv/bin/python -m pytest integracoes/google-ads/tests/test_utils.py -v
```
Expected: PASS (6 passed)

- [ ] **Step 6: Commit**

```bash
git add integracoes/google-ads/lib/utils.py integracoes/google-ads/tests/conftest.py integracoes/google-ads/tests/test_utils.py
git commit -m "feat: portar google-ads utils.py (paths Linux, fmt_pct vírgula) — TDD"
```

---

### Task 3: Portar `dashboard_google.py` + repontar config [LIVE-PENDENTE]

**Files:**
- Create: `integracoes/google-ads/lib/dashboard_google.py`

- [ ] **Step 1: Copiar o arquivo**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
cp /home/luan/LBCodeOS/ClaudeCode/google-ads/lib/gerar_dashboard_google.py integracoes/google-ads/lib/dashboard_google.py
```

- [ ] **Step 2: Repontar BASE_DIR/REPO_ROOT e remover fallback Windows**

No topo (linhas ~20-26), o original é:
```python
_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent.parent)  # google-ads/lib/../../ = workspace root
if not os.path.exists(os.path.join(BASE_DIR, "CLAUDE.md")):
    BASE_DIR = "c:/Claude Code"  # fallback
sys.path.insert(0, os.path.join(BASE_DIR, "google-ads", "lib"))
```
Na nova estrutura `dashboard_google.py` está em `integracoes/google-ads/lib/`, então `parent.parent` = `integracoes/google-ads`. O `_memoria/` está na raiz do repo (3 níveis acima do lib). Substituir o bloco por:
```python
_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent)                 # integracoes/google-ads (para output/)
REPO_ROOT = str(_script_dir.parent.parent.parent)  # raiz do repo (para _memoria/)
sys.path.insert(0, str(_script_dir))
```

- [ ] **Step 3: Repontar carregar_config p/ _memoria/contas-ads.md**

Em `carregar_config` (linha ~96), trocar:
```python
    path = os.path.join(BASE_DIR, "CLAUDE.md")
```
por:
```python
    path = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")
```
E as 3 linhas de erro logo abaixo (linhas ~98-99) e a mensagem da linha ~124-126, trocar referências a `CLAUDE.md` / `setup_bootcamp.py` / `/configurar-ambiente` por:
```python
        print(f"ERRO: mapa de contas não encontrado em: {path}")
        print("Crie _memoria/contas-ads.md e preencha a coluna 'Google Ads ID' (ver skill /lb-ads-conectar).")
```
> O parser (`_parsear_tabela_multi`, coluna `google ads id`) já casa com `_memoria/contas-ads.md`. Nenhuma outra mudança no parser.

- [ ] **Step 4: Repontar YAML_PATH para credentials/**

Em `main()` (linha ~1184 do original) existe:
```python
    YAML_PATH = os.path.join(BASE_DIR, "credentials", "google-ads.yaml")
```
Trocar por (use REPO_ROOT — credenciais ficam em `integracoes/credentials/`, não em `BASE_DIR/credentials`):
```python
    YAML_PATH = os.path.join(REPO_ROOT, "integracoes", "credentials", "google-ads.yaml")
```
Confirmar com `grep -n "YAML_PATH =" integracoes/google-ads/lib/dashboard_google.py` que não restou outra atribuição apontando pro caminho antigo.

- [ ] **Step 5: Confirmar output dir**

Procurar `output_path` / `output` no final do `main()`. Deve gravar em `BASE_DIR/output/<slug>` = `integracoes/google-ads/output/`. Se apontar pra outro lugar, ajustar para `os.path.join(BASE_DIR, "output", slug)`.

- [ ] **Step 6: Verificar import (sem rodar API)**

```bash
.venv/bin/python -c "import sys; sys.path.insert(0,'integracoes/google-ads/lib'); import dashboard_google; print('import OK')"
```
Expected: `import OK` (não deve dar erro de path/sintaxe). Não chama API.

- [ ] **Step 7: [LIVE-PENDENTE] Smoke test (só com creds reais)**

```bash
.venv/bin/python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente com Google Ads ID>"
```
Expected COM creds: gera HTML em `integracoes/google-ads/output/`. SEM creds: erro de autenticação Google — **esperado**; documentar como pendente, não é falha do porte.

- [ ] **Step 8: Commit**

```bash
git add integracoes/google-ads/lib/dashboard_google.py
git commit -m "feat: portar dashboard_google.py (paths Linux, config p/ _memoria/contas-ads.md)"
```

---

### Task 4: Criar `negativas.py` (puxa search_term_view) — TDD

**Files:**
- Create: `integracoes/google-ads/lib/negativas.py`
- Test: `integracoes/google-ads/tests/test_negativas.py`

- [ ] **Step 1: Escrever o teste falho (mocka GoogleAdsClient.search_stream)**

`integracoes/google-ads/tests/test_negativas.py`:
```python
import unittest
from unittest.mock import MagicMock

from negativas import build_query, parse_search_terms


class TestBuildQuery(unittest.TestCase):
    def test_query_inclui_search_term_view_e_periodo(self):
        q = build_query(days=30)
        self.assertIn("search_term_view", q)
        self.assertIn("metrics.cost_micros", q)
        self.assertIn("LAST_30_DAYS", q)


class TestParseSearchTerms(unittest.TestCase):
    def _row(self, term, clicks, cost_micros, conversions):
        r = MagicMock()
        r.search_term_view.search_term = term
        r.metrics.clicks = clicks
        r.metrics.cost_micros = cost_micros
        r.metrics.conversions = conversions
        return r

    def test_parse_extrai_termos_com_custo_em_reais(self):
        batch = MagicMock()
        batch.results = [self._row("curso gratis", 10, 5_000_000, 0)]
        termos = parse_search_terms([batch])
        self.assertEqual(len(termos), 1)
        self.assertEqual(termos[0]["termo"], "curso gratis")
        self.assertEqual(termos[0]["clicks"], 10)
        self.assertEqual(termos[0]["custo"], 5.0)
        self.assertEqual(termos[0]["conversoes"], 0)

    def test_parse_agrega_multiplos_batches(self):
        b1 = MagicMock(); b1.results = [self._row("a", 1, 1_000_000, 0)]
        b2 = MagicMock(); b2.results = [self._row("b", 2, 2_000_000, 1)]
        termos = parse_search_terms([b1, b2])
        self.assertEqual(len(termos), 2)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
.venv/bin/python -m pytest integracoes/google-ads/tests/test_negativas.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'negativas'`

- [ ] **Step 3: Implementar `negativas.py`**

`integracoes/google-ads/lib/negativas.py`:
```python
"""
negativas.py — puxa search_term_view da Google Ads API para análise de negativas.
A análise (categorizar desperdício, sugerir negativas) é feita pela skill /lb-ads-negativas
usando o agente em system-prompts. Aqui só extraímos os dados crus.
"""
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))
from utils import get_client, fmt_cost

PERIODOS = {7: "LAST_7_DAYS", 14: "LAST_14_DAYS", 30: "LAST_30_DAYS"}


def build_query(days=30):
    """GAQL para search_term_view com métricas de custo/clique/conversão.
    Google Ads não tem preset LAST_90_DAYS — usamos só 7/14/30 dias."""
    periodo = PERIODOS.get(days, "LAST_30_DAYS")
    return (
        "SELECT search_term_view.search_term, metrics.clicks, "
        "metrics.cost_micros, metrics.conversions, metrics.impressions "
        "FROM search_term_view "
        f"WHERE segments.date DURING {periodo} "
        "ORDER BY metrics.cost_micros DESC"
    )


def parse_search_terms(batches):
    """Extrai termos de busca dos batches do search_stream."""
    termos = []
    for batch in batches:
        for row in batch.results:
            termos.append({
                "termo": row.search_term_view.search_term,
                "clicks": row.metrics.clicks,
                "custo": fmt_cost(row.metrics.cost_micros),
                "conversoes": row.metrics.conversions,
            })
    return termos


def fetch_search_terms(customer_id, days=30):
    """Roda a query live contra a API (requer credencial)."""
    client = get_client()
    ga_service = client.get_service("GoogleAdsService")
    stream = ga_service.search_stream(customer_id=customer_id, query=build_query(days))
    return parse_search_terms(stream)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Puxa search_term_view Google Ads")
    parser.add_argument("--customer-id", required=True)
    parser.add_argument("--days", type=int, default=30, choices=[7, 14, 30])
    args = parser.parse_args()
    termos = fetch_search_terms(args.customer_id, args.days)
    print(json.dumps({"termos": termos}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Rodar — deve passar**

```bash
.venv/bin/python -m pytest integracoes/google-ads/tests/test_negativas.py -v
```
Expected: PASS (3 passed)

- [ ] **Step 5: Suite Google completa verde**

```bash
.venv/bin/python -m pytest integracoes/google-ads/ -q
```
Expected: PASS (utils + negativas).

- [ ] **Step 6: Commit**

```bash
git add integracoes/google-ads/lib/negativas.py integracoes/google-ads/tests/test_negativas.py
git commit -m "feat: negativas.py — puxa search_term_view (GAQL) p/ análise de negativas (TDD)"
```

---

## FASE 5 — Skills Google + unificado

### Task 5: Portar `dashboard_unificado.py` (Google + Meta) [LIVE-PENDENTE]

**Files:**
- Create: `integracoes/google-ads/lib/dashboard_unificado.py`

- [ ] **Step 1: Copiar**

```bash
cp /home/luan/LBCodeOS/ClaudeCode/google-ads/lib/gerar_dashboard_unificado.py integracoes/google-ads/lib/dashboard_unificado.py
```

- [ ] **Step 2: Repontar BASE_DIR/REPO_ROOT (linhas ~18-20)**

Original:
```python
_script_dir = ...
BASE_DIR = str(_script_dir.parent.parent)
```
Trocar para:
```python
_script_dir = Path(__file__).resolve().parent
BASE_DIR = str(_script_dir.parent)                 # integracoes/google-ads (output/)
REPO_ROOT = str(_script_dir.parent.parent.parent)  # raiz do repo (_memoria/)
```
(garantir `from pathlib import Path` no topo; se faltar, adicionar.)

- [ ] **Step 3: Repontar detectar_plataformas p/ _memoria/contas-ads.md (linha ~30)**

Trocar:
```python
    path = os.path.join(BASE_DIR, "CLAUDE.md")
```
por:
```python
    path = os.path.join(REPO_ROOT, "_memoria", "contas-ads.md")
```
> Já lê colunas `google ads id` e `meta ad account` — casam com `_memoria/contas-ads.md`. Sem outra mudança no parser.

- [ ] **Step 4: Repontar os comandos de subprocess (executar_dashboard)**

A função `executar_dashboard` monta um comando `python <script> --cliente ...`. Apontar para os scripts novos:
- Meta: `integracoes/meta-ads/scripts/relatorio.py`
- Google: `integracoes/google-ads/lib/dashboard_google.py`

Procurar onde o caminho do script é montado (busca: `grep -n "subprocess\|\.py\|script" integracoes/google-ads/lib/dashboard_unificado.py`) e ajustar os caminhos para os dois acima, usando `REPO_ROOT` como base. Usar `sys.executable` em vez de `"python"` literal para herdar o venv:
```python
    cmd = [sys.executable, script_path, "--cliente", cliente]
```

- [ ] **Step 5: Verificar import**

```bash
.venv/bin/python -c "import sys; sys.path.insert(0,'integracoes/google-ads/lib'); import dashboard_unificado; print('import OK')"
```
Expected: `import OK`.

- [ ] **Step 6: [LIVE-PENDENTE] Smoke (precisa creds Google + Meta + cliente com ambos os IDs)**

```bash
.venv/bin/python integracoes/google-ads/lib/dashboard_unificado.py --cliente "<Cliente>"
```
Expected COM creds: HTML unificado em `output/`. SEM creds Google: erro auth — pendente.

- [ ] **Step 7: Commit**

```bash
git add integracoes/google-ads/lib/dashboard_unificado.py
git commit -m "feat: portar dashboard_unificado.py — funde Google+Meta, paths repontados"
```

---

### Task 6: Skills `lb-google-dashboard`, `lb-ads-unificado`, `lb-ads-negativas`

**Files:**
- Create: `.claude/skills/google-dashboard/SKILL.md`
- Create: `.claude/skills/ads-unificado/SKILL.md`
- Create: `.claude/skills/ads-negativas/SKILL.md`
- Copy: `integracoes/google-ads/agente-negativas.md` (do ClaudeCode, referência da skill)

- [ ] **Step 1: Copiar o agente de negativas (referência)**

```bash
cp /home/luan/LBCodeOS/ClaudeCode/system-prompts/agents/agente-negativas.md integracoes/google-ads/agente-negativas.md
```

- [ ] **Step 2: `google-dashboard/SKILL.md`**

```markdown
---
name: lb-google-dashboard
description: >
  Puxa performance Google Ads LIVE da API e gera dashboard HTML completo. Resolve a conta
  do cliente pela coluna 'Google Ads ID' de _memoria/contas-ads.md. Diferente de /lb-google-ads
  (que gera CSV pra criar campanha) — este puxa performance real. Use quando o usuário pedir
  "dashboard google", "performance google ads", "relatório google live", ou /lb-google-dashboard.
---

# /lb-google-dashboard — Dashboard Google Ads (live API)

Puxa dado real da Google Ads API → HTML.

## Dependências
- **Motor:** `integracoes/google-ads/lib/dashboard_google.py`
- **Conta:** `_memoria/contas-ads.md` (coluna Google Ads ID, resolve via --cliente)
- **Framework:** `_memoria/framework-trafego.md` (Bolo de Cenoura)
- **Contexto/voz:** `_memoria/empresa.md`, `estrategia.md`, `preferencias.md`
- **Credencial:** `integracoes/credentials/google-ads.yaml` (validar com `/lb-ads-conectar`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Resolver cliente em `_memoria/contas-ads.md` (precisa Google Ads ID preenchido).
3. Rodar: `python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>"`
4. Pegar o HTML gerado em `integracoes/google-ads/output/`.
5. **Camada framework (Bolo de Cenoura):** ler KPIs e entregar 3 insights na voz LBCode.
6. Devolver: caminho do HTML + os 3 insights.

## Erros
- Credencial faltando → instruir `/lb-ads-conectar` (ramo Google).
- Cliente sem Google Ads ID → avisar e pedir cadastro via `/lb-ads-conectar`.
- NUNCA exibir credenciais em resposta/log.
```

- [ ] **Step 3: `ads-unificado/SKILL.md`**

```markdown
---
name: lb-ads-unificado
description: >
  Gera relatório unificado Google Ads + Meta Ads num HTML só, com resumo cross-platform.
  Roda os dois motores live e funde. Resolve a conta em _memoria/contas-ads.md (precisa
  Google Ads ID E Meta Ad Account preenchidos). Use quando o usuário pedir "relatório
  unificado", "google e meta juntos", "dashboard geral de ads", ou /lb-ads-unificado.
---

# /lb-ads-unificado — Relatório unificado Google + Meta (live)

Funde os 2 dashboards num HTML cross-platform.

## Dependências
- **Motor:** `integracoes/google-ads/lib/dashboard_unificado.py` (chama relatorio.py + dashboard_google.py)
- **Conta:** `_memoria/contas-ads.md` (precisa Google Ads ID + Meta Ad Account)
- **Framework:** Bolo de Cenoura (consistência cross-platform)
- **Credenciais:** Meta (`meta.env`) + Google (`google-ads.yaml`)

## Passos
1. Carregar contexto + voz de `_memoria/`.
2. Resolver cliente (precisa AMBOS os IDs). Se faltar um, avisar qual.
3. Rodar: `python integracoes/google-ads/lib/dashboard_unificado.py --cliente "<Cliente>"`
4. Pegar o HTML unificado em `output/`.
5. **Camada framework:** comparar Google vs Meta, apontar onde o orçamento rende mais, na voz LBCode.
6. Devolver: caminho do HTML + leitura cross-platform.

## Erros
- Falta credencial de uma plataforma → rodar só a que tem + avisar.
- Cliente sem um dos IDs → instruir cadastro via `/lb-ads-conectar`.
```

- [ ] **Step 4: `ads-negativas/SKILL.md`**

```markdown
---
name: lb-ads-negativas
description: >
  Analisa termos de busca do Google Ads (search_term_view) e monta lista de palavras-chave
  negativas pronta pra implementar, agrupada por tema, com gasto desperdiçado justificando cada
  uma. Resolve a conta pela coluna Google Ads ID de _memoria/contas-ads.md. Use quando o usuário
  pedir "negativas", "palavras-chave negativas", "termos de busca", "onde tô gastando à toa no
  google", ou /lb-ads-negativas.
---

# /lb-ads-negativas — Lista de negativas Google Ads (live)

Puxa search_term_view → categoriza desperdício → lista de negativas.

## Dependências
- **Motor:** `integracoes/google-ads/lib/negativas.py` (puxa os dados)
- **Agente:** `integracoes/google-ads/agente-negativas.md` (método de análise)
- **Conta:** `_memoria/contas-ads.md` (Google Ads ID)
- **Credencial:** `integracoes/credentials/google-ads.yaml`

## Passos
1. Resolver cliente → pegar Google Ads ID em `_memoria/contas-ads.md`.
2. Rodar: `python integracoes/google-ads/lib/negativas.py --customer-id <ID> --days 30`
3. **Aplicar o método** de `integracoes/google-ads/agente-negativas.md`:
   categorizar desperdício (irrelevante, informacional, concorrente, emprego, DIY, geo, público).
4. Montar lista de negativas agrupada por tema + tipo de correspondência (exata/frase).
5. Calcular impacto: gasto desperdiçado no período + economia projetada.
6. Devolver: lista pronta pra implementar + justificativa de gasto por negativa.

## Erros
- Credencial faltando → instruir `/lb-ads-conectar` (ramo Google).
- NUNCA exibir credenciais.
```

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/google-dashboard/SKILL.md .claude/skills/ads-unificado/SKILL.md .claude/skills/ads-negativas/SKILL.md integracoes/google-ads/agente-negativas.md
git commit -m "feat: skills lb-google-dashboard, lb-ads-unificado, lb-ads-negativas"
```

---

### Task 7: Estender `lb-ads-conectar` com ramo Google

**Files:**
- Modify: `.claude/skills/ads-conectar/SKILL.md`

- [ ] **Step 1: Adicionar a seção Google ao SKILL.md existente**

Após a seção de Meta (passo 5), adicionar uma nova seção:

```markdown
## Conectar Google Ads (opcional)
1. **Credencial existe?** Conferir `integracoes/credentials/google-ads.yaml`. Se faltar ou placeholder:
   - instruir: `cp integracoes/credentials/google-ads.yaml.example integracoes/credentials/google-ads.yaml`
   - explicar que precisa: developer_token (aprovação Google Ads API Center), client_id, client_secret,
     refresh_token, login_customer_id. NUNCA exibir esses valores em resposta/log.
2. **Cadastrar Google Ads ID do cliente:** pedir o customer_id (formato 123-456-7890 ou 1234567890)
   e gravar na coluna `Google Ads ID` da linha do cliente em `_memoria/contas-ads.md`.
3. **Validar:** rodar `python integracoes/google-ads/lib/dashboard_google.py --cliente "<Cliente>"`
   — se autenticar e puxar dado, está conectado. Erro de auth = credencial incompleta.
```

E atualizar a description do frontmatter para incluir Google (trocar o parêntese final "Google Ads live chega no Plano 2." por "Suporta Meta e Google Ads.").

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/ads-conectar/SKILL.md
git commit -m "feat: lb-ads-conectar — adicionar ramo Google (yaml + Google Ads ID)"
```

---

## FASE 6 — Docs + memória

### Task 8: CLAUDE.md + skills-catalogo + README + verificação final

**Files:**
- Modify: `CLAUDE.md`, `_memoria/skills-catalogo.md`
- Create: `integracoes/google-ads/README.md`

- [ ] **Step 1: Atualizar a linha sob-demanda do CLAUDE.md**

Na tabela "Sob demanda", adicionar:
```markdown
| `integracoes/google-ads/` (lib + tests) | rodar skill `lb-google-dashboard` / `lb-ads-unificado` / `lb-ads-negativas` live (Google Ads API) |
```

- [ ] **Step 2: Registrar as 3 skills no skills-catalogo.md**

Adicionar, após a linha de `/lb-meta-gerenciar`, na matriz (colunas SaaS B2B | Agência | Local | Criador):
```markdown
| `/lb-google-dashboard` | ✅ | ✅ | ✅ | ⚠️ | Live API Google → HTML; precisa Google Ads ID + yaml |
| `/lb-ads-unificado` | ✅ | ✅ | ✅ | ⚠️ | Funde Google+Meta; precisa ambos os IDs + ambas as creds |
| `/lb-ads-negativas` | ✅ | ✅ | ✅ | ❌ | Live API — termos de busca → negativas; só faz sentido com Google Ads |
```
E atualizar a contagem no topo de `37 skills` para `40 skills`.

- [ ] **Step 3: README do motor Google**

`integracoes/google-ads/README.md`:
```markdown
# integracoes/google-ads

Motor Python da integração Google Ads live. Portado de ClaudeCode.
Skills `lb-google-dashboard`, `lb-ads-unificado`, `lb-ads-negativas` consomem estes scripts.

- `lib/utils.py` — get_client, fmt_brl/pct, safe_div, fmt_cost, normalizar
- `lib/dashboard_google.py` — dashboard HTML Google Ads
- `lib/dashboard_unificado.py` — funde Google + Meta (chama relatorio.py + dashboard_google.py)
- `lib/negativas.py` — puxa search_term_view (GAQL)
- `tests/` — `pytest integracoes/google-ads/ -v`

Conta: coluna `Google Ads ID` de `_memoria/contas-ads.md` (resolve via --cliente).
Credencial OAuth2: `integracoes/credentials/google-ads.yaml` (gitignored, NUNCA commitar).
Requer `developer_token` aprovado no Google Ads API Center.
```

- [ ] **Step 4: Verificação final**

```bash
cd /home/luan/LBCodeOS/LBCodeOS
.venv/bin/python -m pytest integracoes/ -q
grep -rn "c:/Claude\|C:/Claude" integracoes/google-ads/ || echo "OK — sem paths Windows"
git check-ignore integracoes/credentials/google-ads.yaml
ls .claude/skills/ | grep -E "google-dashboard|ads-unificado|ads-negativas"
```
Expected: pytest verde (Meta + Google mockados); "OK — sem paths Windows"; yaml gitignored; 3 skills listadas.

- [ ] **Step 5: Commit final**

```bash
git add CLAUDE.md _memoria/skills-catalogo.md integracoes/google-ads/README.md
git commit -m "docs: registrar integração Google live no CLAUDE.md, skills-catalogo e README"
```

---

## Done — critérios de aceite (Plano 2)

- [ ] `pytest integracoes/ -q` verde (Meta do Plano 1 + Google utils/negativas mockados)
- [ ] `google-ads` lib instalada; `import dashboard_google` e `import dashboard_unificado` OK
- [ ] Nenhum path Windows em `integracoes/google-ads/`
- [ ] `integracoes/credentials/google-ads.yaml` gitignored
- [ ] 3 skills novas (`lb-google-dashboard`, `lb-ads-unificado`, `lb-ads-negativas`) + `lb-ads-conectar` com ramo Google
- [ ] **[LIVE-PENDENTE]** smoke tests reais (`dashboard_google.py`, `dashboard_unificado.py`, `negativas.py`) ficam pendentes até o usuário fornecer `google-ads.yaml` válido (developer_token aprovado + OAuth2). Documentar no PR/entrega.

**Conclui a integração de ads (Meta + Google).** Quando as creds Google chegarem: preencher `google-ads.yaml`, preencher `Google Ads ID` em `_memoria/contas-ads.md`, rodar os 3 smoke tests [LIVE-PENDENTE].
