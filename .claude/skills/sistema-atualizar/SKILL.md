---
name: lb-sistema-atualizar
description: >
  Faz auditoria do projeto: varre todas as pastas, git history recente, arquivos de contexto
  e propõe reconciliação. Detecta clientes/projetos novos, mudanças de foco, skills criadas,
  evolução de identidade visual. Atualiza automaticamente os 5 arquivos-chave de memória
  (`_memoria/empresa.md`, `preferencias.md`, `estrategia.md`, `framework-trafego.md` se muda,
  `identidade/design-guide.md`). Use quando o usuário disser "atualizar", "sincronizar contexto",
  "revisar projeto", "/sistema-atualizar", ou pedir reconciliação geral.
---

# /sistema-atualizar — Auditoria + Reconciliação

Skill de manutenção. Varre o projeto, identifica o que mudou na realidade e propõe atualizar
a memória operacional pra bater com o estado real. Serve pra descobrir quando contexto ficou
desatualizado e quando você criou algo novo que precisa ser registrado.

## Workflow

### Passo 1 — Coleta de evidência

Listar estado real do workspace:

**Estrutura:**
- Pastas na raiz — `marketing/`, `saidas/`, `dados/`, `scripts/`, `prompts/`, `transcricoes/`, `clientes/` (se houver)
- Subpastas de `clientes/` (cada pasta = um cliente ou projeto isolado)
- Skills criadas em `.claude/skills/` — quais novos?

**Git:**
- Últimos 20 commits (`git log --oneline -20`) — o que foi feito?
- Tags versionadas (`git tag`) — há marcos importantes?
- Arquivos alterados nos últimos 30 dias — qual área foi mais tocada?

**Outputs recentes:**
- Carrosséis gerados (pasta `marketing/conteudo/`)
- Campanhas criadas (pasta `marketing/campanhas/`)
- Propostas salvas (pasta `marketing/prospeccao/`)
- Planos e precificações (pasta `saidas/`)
- Relatórios feitos

### Passo 2 — Análise de coerência

Comparar o que existe nos 5 arquivos de contexto com a realidade coletada:

**`_memoria/empresa.md`:**
- Lista clientes/serviços — bate com realidade (vejo cliente X listado mas nenhuma pasta dele)?
- Ferramentas mencionadas — continuam sendo usadas ou ficaram obsoletas?
- Equipe — continua a mesma?

**`_memoria/preferencias.md`:**
- Tom de voz listado — bate com o que foi gerado recentemente (carrosséis, propostas)?
- O que evitar — foi respeitado?

**`_memoria/estrategia.md`:**
- Foco listado — ainda é prioridade ou mudou?
- Prazos — ainda fazem sentido (datas passadas, objetivos atingidos)?
- Gargalos — foram atacados ou continuam?

**`identidade/design-guide.md`:**
- Cores/tipografia/logo — batem com o que foi gerado recentemente?
- Branding ficou consistente?

**`_memoria/framework-trafego.md`:**
- Se mudou abordagem (ex: era focado em conteúdo, virou ads), framework ficou desatualizado?

### Passo 3 — Proposta de mudanças

Apresentar ao usuário lista no formato:

```
Encontrei [N] coisas pra sincronizar:

Contexto:
1. _memoria/empresa.md — novo cliente "Acme" (pasta clientes/acme/ criada 2026-05-20)
2. _memoria/estrategia.md — foco "trazer 5 clientes" já atingido (3 clientes ativos + 2 em pipeline)
3. _memoria/preferencias.md — tom "direto, técnico" — mas últimos 10 carrosséis usaram tom "casual"

Skills:
4. Criou `/conteudo-auditoria-insta` novo em 2026-05-25 — não tá listado em CLAUDE.md

Identidade:
5. design-guide.md — menciona laranja #FF6B35, mas últimos carrosséis usaram #FF7A4A (mais claro)

Quer que eu aplique essas mudanças? (todas, algumas, nenhuma)
```

### Passo 4 — Aplicação cirúrgica

Se usuário aprovar (total ou parcial), editar com precisão:

- Uma linha por mudança
- Sem reformatação de arquivo
- Mostrar diff de cada mudança (antes → depois)
- Não apagar nada — só atualizar

Exemplo:
```
✓ _memoria/empresa.md — adicionada: "- **Acme** | Consultoria estratégica | desde maio/2026"
✓ _memoria/estrategia.md — atualizada linha "Gargalo atual" de "trazer 5 clientes" pra "escalar operação"
✓ identidade/design-guide.md — corrigida cor laranja de #FF6B35 pra #FF7A4A
```

## Regras

- Não inventar fatos — evidência tem que estar no workspace (pasta, arquivo, commit, output visual)
- Se evidência é ambígua (ex: pasta vazia "Cliente Novo"), perguntar antes de adicionar
- Nunca apagar — só atualizar ou adicionar
- Se tudo tiver em sintonia, responder: "Tá tudo sincronizado. Nada pra atualizar."
- Se dúvida, perguntar — não assume

## Integração ao framework

`/sistema-atualizar` é a auditoria do operacional. A máquina roda baseada no que tá em `_memoria/` —
se memória fica desatualizada, sistema começa a ficar fora de prumo. Use toda semana ou
quando tiver mudança grande (cliente novo, pivot de estratégia, skill criada).
