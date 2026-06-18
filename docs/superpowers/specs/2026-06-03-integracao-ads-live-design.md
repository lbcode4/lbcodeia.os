# Design — Integração Ads Live (Meta + Google) no LBCodeOS

**Data:** 2026-06-03
**Status:** Aprovado (pré-implementação)
**Origem:** porte de `ClaudeCode/` (pai, Windows) + `META_ADS/` (fork Linux, testado, git)

---

## 1. Contexto e problema

LBCodeOS hoje é 100% markdown (skills + framework + `_memoria/`), **zero código** e
**zero integração API live**. As skills de ads existentes operam manualmente:

- `meta-relatorio` lê **CSV/print manual** → markdown
- `google-ads` gera **CSV pra criar** campanha (Google Ads Editor)

Nenhuma puxa dado real da API. Os dois projetos vizinhos preenchem esse buraco:
puxar performance real da Graph API / Google Ads API → dashboard HTML.

### Veredito da análise dos 2 projetos

`META_ADS` é o **fork evoluído** do `ClaudeCode`. Git log prova que já portou o melhor
do pai (relatorio 1833 ln, STYLE-GUIDE, agentes, 4 skills) e adicionou: testes (pytest,
777 ln), formato SKILL.md moderno, classe `MetaAPIClient`, paths Linux portáveis, git,
`gerenciar-anuncios` (mutate + log), `criativos.py`.

`ClaudeCode` tem **uma coisa única** que META_ADS dropou: a **camada Google Ads live**
(`google-ads/lib/` + dashboard unificado Google+Meta + `agente-negativas`).

**Decisão de escopo:** trazer Meta (base META_ADS) + Google live (camada ClaudeCode).

---

## 2. Abordagem escolhida: Motor + Camada Skill (Opção A)

`integracoes/` guarda **motor Python puro** (dado → HTML), portado do META_ADS base +
camada Google do ClaudeCode, paths corrigidos Linux, testes adaptados. Skills `.md` em
`.claude/skills/` são **finas**: leem `_memoria/`, chamam scripts, embrulham a saída na
voz LBCode (Bolo de Cenoura / GCC / RETINA).

**Por que A:** separação limpa (código testável vs framework em markdown), mantém os
777 ln de pytest, encaixa o DNA "framework-first" do LBCodeOS (skill tira força do
framework, código não se mistura).

Alternativas descartadas:
- **B (lift-and-shift, refatora depois):** estado funcional rápido, mas interino bagunçado.
- **C (reescrita skill-first):** mais nativo, mas mais trabalho e risco de perder código testado.

---

## 3. Arquitetura e estrutura de pastas

```
LBCodeOS/
├── integracoes/                    ← guarda-chuva (novo; padrão p/ futuras integrações)
│   ├── meta-ads/
│   │   ├── scripts/                ← motor Python (base META_ADS)
│   │   │   ├── meta_api.py         ← MetaAPIClient (classe, paths Linux)
│   │   │   ├── relatorio.py        ← dashboard HTML (~1846 ln)
│   │   │   ├── diagnostico.py
│   │   │   ├── auditoria.py
│   │   │   ├── reels.py
│   │   │   ├── criativos.py
│   │   │   └── gerenciar.py        ← mutate (pause/ativar) + log auditoria
│   │   ├── tests/                  ← pytest (777 ln, adaptado)
│   │   ├── output/                 ← relatórios HTML + acoes-log.json (gitignored)
│   │   └── STYLE-GUIDE.md          ← padrão HTML (dark/light, Chart.js)
│   ├── google-ads/
│   │   ├── lib/                    ← base ClaudeCode
│   │   │   ├── utils.py            ← get_client, fmt_brl/pct, safe_div
│   │   │   ├── dashboard_google.py
│   │   │   └── dashboard_unificado.py  ← Google + Meta num relatório
│   │   ├── tests/                  ← novos (ClaudeCode não tinha)
│   │   └── output/                 ← gitignored
│   └── credentials/                ← GITIGNORED, nunca commita
│       ├── meta.env               ← META_ACCESS_TOKEN
│       ├── meta.env.example
│       ├── google-ads.yaml        ← OAuth2 Google
│       └── google-ads.yaml.example
├── _memoria/
│   └── contas-ads.md              ← mapa cliente→conta (novo, versionado)
├── requirements.txt                ← deps Python (novo)
└── .claude/skills/                 ← skills finas (markdown, prefixo lb-)
    ├── ads-conectar/
    ├── meta-dashboard/
    ├── meta-diagnostico/
    ├── meta-auditoria/
    ├── meta-reels/
    ├── meta-copy/
    ├── meta-gerenciar/
    ├── google-dashboard/
    ├── ads-unificado/
    └── ads-negativas/
```

**Regra central:** código vive em `integracoes/`, framework vive na skill `.md`.
Futuras integrações seguem o mesmo padrão (ex: `integracoes/notebook-lm/`).

---

## 4. Componentes (porte + adaptação)

### Do META_ADS (base Meta)

| Componente | Origem | Adaptação no porte |
|---|---|---|
| `meta_api.py` | scripts/ | account_id resolvido de `_memoria/contas-ads.md`, não `.env` |
| `relatorio.py` | scripts/ (~1846 ln) | `BASE_DIR` Linux, lê mapa de contas |
| `diagnostico/auditoria/reels/criativos/gerenciar.py` | scripts/ | idem paths |
| `tests/` | tests/ (777 ln) | ajusta imports p/ nova estrutura |
| `STYLE-GUIDE.md` | docs/ | copia (padrão HTML obrigatório) |
| agentes meta (auditoria/copy/reels) | system-prompts/ | viram refs nas skills |

### Do ClaudeCode (camada Google live)

| Componente | Origem | Adaptação |
|---|---|---|
| `utils.py` | google-ads/lib/ | `YAML_PATH` `C:/...` → relativo Linux |
| `dashboard_google.py` | google-ads/lib/ | path + lê mapa contas |
| `dashboard_unificado.py` | google-ads/lib/ | aponta pros 2 dashboards novos |
| `agente-negativas.md` | system-prompts/ | vira skill `ads-negativas` |
| `google-ads.yaml` template | credentials/ | só template, gitignored |

### Descarta (não porta)

- `.claude/commands/*.md` do ClaudeCode (formato antigo — substituído por SKILL.md)
- `meta_client.py` do ClaudeCode (funções soltas — classe `MetaAPIClient` do META_ADS ganha)
- paths Windows, `meta.env`/`.env` duplicados

### Dependências novas (`requirements.txt`)

```
requests
python-dotenv
google-ads
pytest
```

⚠️ **Pré-requisito do usuário p/ Google live:** developer token Google Ads (tem processo
de aprovação) + OAuth2 refresh token. Sem isso, camada Meta roda sozinha; Google fica
pendente de credencial.

---

## 5. Skills (camada framework fina)

10 skills novas, nomes não colidem com existentes. Folder = comando (sem prefixo),
frontmatter `name:` com `lb-` (convenção LBCodeOS existente).

| Folder (comando) | `name:` | Faz | Pilar |
|---|---|---|---|
| `ads-conectar` | `lb-ads-conectar` | valida token Meta + OAuth Google, preenche `_memoria/contas-ads.md` | — (infra) |
| `meta-dashboard` | `lb-meta-dashboard` | Meta live → dashboard HTML | Bolo + GCC |
| `meta-diagnostico` | `lb-meta-diagnostico` | KPIs + alertas + recomendações | Bolo |
| `meta-auditoria` | `lb-meta-auditoria` | auditoria completa da conta | Bolo |
| `meta-reels` | `lb-meta-reels` | ranking reels + impulsionamento | RETINA |
| `meta-copy` | `lb-meta-copy` | copy de anúncio dos top performers | GCC + RETINA |
| `meta-gerenciar` | `lb-meta-gerenciar` | pausar/ativar anúncio via chat + log | — (operacional) |
| `google-dashboard` | `lb-google-dashboard` | Google Ads live → HTML | Bolo |
| `ads-unificado` | `lb-ads-unificado` | Google + Meta num relatório | Bolo |
| `ads-negativas` | `lb-ads-negativas` | termos de busca → lista negativas | — (otimização) |

### Padrão da skill fina (todas seguem)

```
1. Carrega _memoria/ (empresa + preferencias + estrategia) → contexto + voz
2. Lê _memoria/contas-ads.md → resolve conta do cliente (act_id / customer_id)
3. Chama motor: python integracoes/meta-ads/scripts/X.py --cliente "Y"
4. Embrulha saída na voz LBCode + insight do pilar (não despeja HTML cru)
5. Salva relatório no destino certo
```

Diferença vs origem: os projetos rodam o script e mostram. Aqui a skill **adiciona camada
de interpretação** via framework — exigência do CLAUDE.md ("cada skill tira força do framework").

---

## 6. Fluxo de dado + tratamento de erro

### Fluxo end-to-end (ex: `/lb-meta-dashboard` Empresa Teste)

```
usuário: /lb-meta-dashboard Empresa Teste
  → skill lê _memoria/contas-ads.md → resolve "Empresa Teste" = act_1388795691981562
  → skill chama: python integracoes/meta-ads/scripts/relatorio.py --cliente "Empresa Teste"
      → meta_api.py lê token de credentials/meta.env
      → GET Graph API v21.0 (campanhas/adsets/ads/insights)
      → gera HTML (STYLE-GUIDE) em integracoes/meta-ads/output/
  → skill lê resumo, embrulha insight (Bolo de Cenoura) na voz LBCode
  → devolve: caminho do HTML + 3 insights acionáveis
```

### Mapa de contas — `_memoria/contas-ads.md`

```markdown
| Cliente | Meta act_id | IG User ID | Google customer_id | Ativo |
|---------|-------------|------------|--------------------|-------|
| Empresa Teste | act_1388795691981562 | 17841461249791228 | — | sim |
```

Script parseia a tabela → pega a linha do cliente. Mesmo padrão dos projetos, mas em
`_memoria/` (versionado, framework-native).

### Tratamento de erro (já existe no META_ADS, mantém)

| Erro | Comportamento |
|---|---|
| token ausente/inválido | `MetaAPIError` → skill manda rodar `/lb-ads-conectar` |
| API 400/401/403 | extrai `error.message` do JSON, mostra limpo (sem stack) |
| cliente não achado no mapa | lista clientes disponíveis em `_memoria/contas-ads.md` |
| Google OAuth faltando | camada Meta segue, Google avisa "falta credencial" |
| mutate (gerenciar) | confirma antes + grava `output/acoes-log.json` (auditoria) |

### Segurança (crítico)

- token **nunca** em log/output/resposta
- `credentials/` no `.gitignore` — validar antes de qualquer commit
- `output/` (dados de performance) gitignored

---

## 7. Testes

| Camada | Cobertura |
|---|---|
| Meta (porta 777 ln existentes) | meta_api, diagnostico, auditoria, reels, criativos, gerenciar, relatorio — mocka HTTP, valida parsing/cálculo |
| Google (novo) | utils (fmt_brl/pct/safe_div), parsing dashboard — mocka GoogleAdsClient |
| Mapa contas (novo) | parse de `_memoria/contas-ads.md`, cliente não achado, tabela vazia |
| Rodar | `pytest integracoes/ -v` |

Skills `.md` não têm teste unitário (markdown) — validação manual via comando.

---

## 8. Ordem de implementação (fases)

```
Fase 1 — Esqueleto
  integracoes/ + credentials/ gitignored + _memoria/contas-ads.md + requirements.txt

Fase 2 — Motor Meta (base, testado)
  porta scripts META_ADS + tests, corrige paths, lê mapa contas → pytest verde

Fase 3 — Skills Meta finas
  7 skills lb-meta-* chamando o motor + camada framework

Fase 4 — Motor Google (live)
  porta google-ads/lib ClaudeCode, paths Linux, OAuth2 + tests novos

Fase 5 — Skills Google + unificado
  lb-google-dashboard, lb-ads-unificado, lb-ads-negativas, lb-ads-conectar

Fase 6 — Doc + memória
  atualiza CLAUDE.md (seção integrações), skills-catalogo.md, README integracoes/
```

Meta roda sozinha após Fase 3 (Google depende do developer token fornecido pelo usuário).
Cada fase = commit verde.

---

## 9. Fora de escopo (YAGNI)

- Fundir skills CSV/manual existentes com as live (decisão: conviver, nomes novos)
- Skill híbrida que detecta API vs CSV
- Reescrever skills existentes (`meta-relatorio`, `google-ads`)
- UI/painel web próprio (saída é HTML estático, abre no browser)
