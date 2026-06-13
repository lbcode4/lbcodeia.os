---
name: lb-negocio-mapear-rotinas
description: >
  Descobre tarefas que você repete toda semana (conteúdo, prospecção, relatórios, emails)
  e as transforma em skills personalizadas. Você descreve o padrão, propõe automação
  e aprovada vira skill pronta pra usar. Inclui gerador de workflow estruturado baseado
  em framework RETINA/GCC/OPA conforme o tipo de tarefa. Use quando o usuário disser
  "/negocio-mapear-rotinas", "automatizar meu trabalho", "criar skill personalizada", "o que dá pra automizar".
---

# /lb-negocio-mapear-rotinas — De tarefa repetida pra skill própria

Skill de descoberta e automação. Objetivo: observar o que você repete, estruturar como workflow,
virar skill que roda automática depois.

## Workflow

### Passo 1 — Entrevista: O que você repete?

Fazer 3 perguntas (uma por vez, esperando resposta):

1. **"Que tarefas você faz toda semana e gostaria de nunca mais pensar nelas?"**
   (ex: "criar carrossel semanal", "fazer briefing de cliente novo", "montar proposta", "analisar perfil Instagram")

2. **"Pra cada uma, qual é a entrada (o input inicial)?"**
   (ex: "um tema", "um briefing solto", "dados do cliente", "um link")

3. **"E a saída que você espera?"**
   (ex: "5 slides em PNG prontos", "proposta PDF", "diagnóstico de 5 pontos", "relatório em markdown")

### Passo 2 — Verificar se já existe cobertura

Ler `_memoria/skills-catalogo.md` (ou intuir do conhecimento):
- Se `/lb-conteudo-carrossel` já cobre criação de posts → oferecer parametrizar em vez de criar nova
- Se `/lb-google-seo` já cobre pesquisa de nicho → mesma coisa
- Se `/lb-meta-relatorio` já faz análise de campanha → mesma coisa

Se a tarefa **não tem cobertura**, seguir pra Passo 3.

### Passo 3 — Propor estrutura de skill

Apresentar modelo no formato:

```
### /<nome-da-skill>

**O que faz:** [1 frase claraão]
**Input:** [lista do que recebe (arquivo, URL, resposta verbal)]
**Output:** [exatamente o que entrega]
**Tempo estimado:** [5 min | 15 min | 30 min]

**Framework integrado:** [se usa RETINA/GCC/OPA/4-campanhas, descrever]
**Dependências:** [quais arquivos de _memoria/, identidade/, ferramentas externas]
```

Mostrar todas as propostas e perguntar:
> "Quais you quer que eu crie agora? (todas, algumas, nenhuma — pode pedir ajustes também)"

### Passo 4 — Criar skills aprovadas

Pra cada skill aprovada:

**Estrutura de pasta:**
```
.claude/skills/<nome-da-skill>/
├── SKILL.md (frontmatter + workflow estruturado)
├── template.md (se precisar, ex: template de proposta)
└── exemplos/ (se precisar, ex: exemplos de output)
```

**Conteúdo de SKILL.md:**
- **Frontmatter:** `name`, `description` (quando invocar — crítico!)
- **Seção "O que faz":** 1 parágrafo explicando pra quem não conhece
- **Workflow estruturado:** passos numerados, cada um com objetivo, ação, output
- **Dependências:** quais arquivos de `_memoria/` / `identidade/` / ferramentas externas
- **Framework integrado:** se usa RETINA/GCC/OPA, documentar onde e como
- **Regras:** o que sempre fazer, o que nunca fazer

**Calibração:**
- Ler `_memoria/preferencias.md` pra tom (direto, casual, formal)
- Ler `_memoria/empresa.md` pra contexto de serviço/público
- Se usar framework, incluir referência a `_memoria/framework-trafego.md` nas dependências

### Passo 5 — Resumo + próximos passos

```
✓ Criei [N] skills personalizadas:
✓ /<nome1> — em .claude/skills/<nome1>/SKILL.md
✓ /<nome2> — em .claude/skills/<nome2>/SKILL.md

Pra usar: digita / + nome da skill em qualquer sessão.
Pra ajustar depois: edita o SKILL.md.
```

Perguntar:
> "Quer testar uma agora?"

## Regras

- Skill precisa ser **repetível** — se é tarefa de uma vez, não vira skill
- Max 5 skills por sessão (se quer mais, split em rodadas)
- **Trigger claro obrigatório:** `description` precisa dizer QUANDO invocar — sem isso skill fica invisível
- **Framework integrado obrigatório:** se é skill de marketing/ads/vendas, TEM que usar RETINA/GCC/OPA — documentar
- Se depender de ferramenta cara/complexa (Notion API, Claude Vision pagos), avisar + oferecer versão simplificada

## Integração ao framework

Cada skill criada aqui vira parte do framework operacional — não é standalone.
Significa que:
- Lê contexto do negócio (`_memoria/empresa.md`)
- Respeita tom de voz (`_memoria/preferencias.md`)
- Usa metodologia RETINA/GCC/OPA (se for marketing/sales)
- Entrega outputs prontos pra versionagem via `/lb-sistema-versionar`
- Fica mapeada em `_memoria/skills-catalogo.md` depois

Você não tá criando helpers — tá expandindo sua operação.
