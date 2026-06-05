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
30+ workflows prontos, cada um framework-first:
- **Conteúdo:** `/lb-conteudo-carrossel`, `/lb-google-seo`, `/lb-conteudo-publicar`, `/lb-conteudo-reels`
- **Trafego pago:** `/lb-google-ads`, `/campanha-meta-*`, `/lb-meta-relatorio`
- **Prospecção:** `/lb-venda-prospectar`, `/lb-venda-dossie`, `/lb-venda-proposta`, `/lb-venda-follow-up`
- **Operação:** `/lb-negocio-analisar-dados`, `/lb-venda-precificar`, `/lb-venda-diagnostico`
- **Planejamento:** `/lb-negocio-plano-mensal`, `/lb-conteudo-calendario`, `/lb-negocio-mapear-rotinas`

---

## Setup (5 min)

```bash
git clone https://github.com/lbcodeia/lbcodeiaos.git
cd LBCode.IA
code .
```

No terminal: `/lb-sistema-instalar`

Entrevista negócio + identidade + foco. Preenche memória automaticamente.  
Depois: renomeia pasta pro nome da empresa. Pronto.

---

## Dia a Dia (3 Comandos)

- **`/lb-sistema-abrir`** — carrega contexto antes de trabalhar
- **`/lb-sistema-salvar`** — commit + push (resultado versionado no GitHub)
- **`/lb-sistema-atualizar`** — varre projeto, sincroniza memória

---

## Semana Tipo

**Segunda:** `/lb-sistema-abrir` + planar semana em `estrategia.md`

**Terça–Quarta:** 
- 3× `/lb-conteudo-carrossel` = posts prontos
- `/lb-google-seo` = artigo + visual + legendas  
- `/lb-google-ads` = campanha CSV pronta

**Quinta:**
- `/lb-venda-prospectar` = lista + pesquisa
- `/lb-venda-proposta` = 2-3 propostas

**Sexta:**
- `/lb-meta-relatorio` = identifica o que rompeu
- `/lb-sistema-salvar` = tudo documentado

**Resultado:** 5 posts + 1 artigo + 1 campanha + 10+ prospecções + 3 propostas.  
Tudo com framework. Pronto pra repetir.


---

## Estrutura

```
_memoria/           → cérebro (empresa, preferências, estratégia, framework)
identidade/         → visual (cores, fontes, logo)
.claude/skills/     → 30+ workflows prontos
marketing/          → saídas conteúdo + campanhas
dados/              → CSVs, JSONs, insumos
saidas/             → resultados finais
scripts/            → automações e templates
```

---

Docs: `CLAUDE.md`
