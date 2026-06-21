# LBCode.IA

**Sistema operacional de tráfego pago, conteúdo e vendas.** Framework executado, não teórico. 
Seu negócio em máquina que aprende a cada execução.

---

## Problema que Resolve

- ❌ "Preciso de agência" → Você precisa estrutura, não gente
- ❌ "Não sai conteúdo rápido" → Estrutura + IA = 30min. Conteúdo. Framework.
- ❌ "Ads não trazem retorno" → 4 Campanhas funciona. Precisa repetição.
- ❌ "Não tenho pipeline" → `/lb-venda-prospectar` + `/lb-venda-proposta` = pipeline montado
- ❌ "Não sei se tá funcionando" → Tudo documentado no GitHub. ROI visível.

---

## Solução: 3 Camadas

### 1. FRAMEWORK (base)
Metodologia comprovada rodando em tudo:
- **RETINA** — posicionamento, diferenciação
- **GCC** — persuasão em copy + ads
- **OPA** — estrutura oferta
- **Bolo de Cenoura** — sequência nutrição leads
- **4 Campanhas de Ouro** — mix tráfego pago

Em `_memoria/framework-trafego.md`. Skills carregam sob demanda.

### 2. MEMÓRIA (contexto)
Seu negócio documentado, lido antes de cada ação:
- `_memoria/empresa.md` — quem, o que vende, dores
- `_memoria/preferencias.md` — tom, estilo, o que evitar
- `_memoria/estrategia.md` — foco semana, bloqueadores
- `identidade/design-guide.md` — cores, fontes, padrão visual
- `_memoria/skills-catalogo.md` — qual skill pra qual modelo

### 3. EXECUÇÃO (skills)
44 workflows prontos, cada um framework-first:
- **Conteúdo:** `/lb-conteudo-carrossel`, `/lb-conteudo-publicar`, `/lb-conteudo-aprovar`, `/lb-conteudo-reels`, `/lb-conteudo-stories`, `/lb-conteudo-calendario`, `/lb-conteudo-auditoria-insta`
- **Tráfego pago (Google):** `/lb-google-ads`, `/lb-google-seo`, `/lb-google-dashboard`, `/lb-google-meu-negocio`, `/lb-google-avaliacoes`, `/lb-ads-unificado`, `/lb-ads-negativas`, `/lb-ads-conectar`
- **Tráfego pago (Meta):** `/lb-meta-campanha-whatsapp`, `/lb-meta-campanha-seguidores`, `/lb-meta-dashboard`, `/lb-meta-completo`, `/lb-meta-relatorio`, `/lb-meta-diagnostico`, `/lb-meta-auditoria`, `/lb-meta-copy`, `/lb-meta-gerenciar`, `/lb-meta-analise-reels`, `/lb-meta-analise-reels-organico`
- **Prospecção/Vendas:** `/lb-venda-prospectar`, `/lb-venda-dossie`, `/lb-venda-diagnostico`, `/lb-venda-proposta`, `/lb-venda-precificar`, `/lb-venda-follow-up`, `/lb-venda-objecoes`, `/lb-venda-email`
- **Operação/Sites:** `/lb-negocio-analisar-dados`, `/lb-negocio-plano-mensal`, `/lb-negocio-mapear-rotinas`, `/lb-negocio-site`, `/lb-negocio-site-v2`
- **Sistema:** `/lb-sistema-contexto`, `/lb-sistema-onboarding`, `/lb-sistema-novo-projeto`, `/lb-sistema-sincronizar`, `/lb-sistema-versionar`

---

## Setup (5 min)

```bash
git clone https://github.com/lbcodeia/lbcodeiaos.git
cd LBCode.IA
code .
```

No terminal: `/lb-sistema-onboarding`

Entrevista negócio + identidade + foco. Preenche memória automaticamente.  
Depois: renomeia pasta pro nome da empresa. Pronto.

---

## Dia a Dia (3 Comandos)

- **`/lb-sistema-contexto`** — carrega contexto antes de trabalhar
- **`/lb-sistema-versionar`** — commit + push (resultado versionado no GitHub)
- **`/lb-sistema-sincronizar`** — varre projeto, sincroniza memória

---

## Semana Tipo

**Segunda:** `/lb-sistema-contexto` + planar semana em `estrategia.md`

**Terça–Quarta:** 
- 3× `/lb-conteudo-carrossel` = posts prontos
- `/lb-google-seo` = artigo + visual + legendas  
- `/lb-google-ads` = campanha CSV pronta

**Quinta:**
- `/lb-venda-prospectar` = lista + pesquisa
- `/lb-venda-proposta` = 2-3 propostas

**Sexta:**
- `/lb-meta-relatorio` = identifica o que rompeu
- `/lb-sistema-versionar` = tudo documentado

**Resultado:** 5 posts + 1 artigo + 1 campanha + 10+ prospecções + 3 propostas.  
Tudo com framework. Pronto pra repetir.


---

## Estrutura

```
_memoria/           → cérebro (empresa, preferências, estratégia, framework)
identidade/         → visual (cores, fontes, logo)
.claude/skills/     → 44 workflows prontos
integracoes/        → Meta Ads + Google Ads live (scripts Python, Graph/Ads API)
frontend/           → dashboard (TanStack/React) que dispara skills via API
server/             → backend (TS) que orquestra skills + entrega relatórios
saidas/             → tudo gerado/consumido pelo LBCode.IA
  saidas/entrada/     → CSVs, JSONs, insumos que você solta pra Claude ler
  saidas/marketing/   → conteúdo + campanhas + prospecção (histórico vivo)
  saidas/relatorios/  → relatórios + dashboards gerados
  saidas/cache/       → cache interno dos resultados de skills (uso do dashboard)
prompts/            → prompts reutilizáveis (persona, RETINA, keywords)
docs/               → specs + planos de implementação das telas
scripts/            → automações e templates
```

---

Docs: `CLAUDE.md`
