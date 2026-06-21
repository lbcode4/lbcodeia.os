# 🎬 Vídeo 42 — `/lb-negocio-plano-mensal`

> **Bloco 6 — Negócio.** Duração alvo: 6–8 min · Sem front.
> Bom vídeo de "amarração": mostra como as skills anteriores se conectam num plano.

## 🎯 Objetivo do vídeo
Montar o plano de ação executivo do mês: meta principal, bloqueadores ativos, frentes de trabalho (conteúdo, prospecção, tráfego pago, técnica/produto) com checklist semanal de monitoramento. Integra as skills existentes num único planejamento.

## 💡 Dor → solução
- **Dor:** muitas skills, mas sem um plano que diga o que fazer em qual semana.
- **Solução:** um plano executivo que orquestra as frentes e vira checklist.

## 🧠 Framework por trás
- Lê `estrategia.md` (foco/bloqueadores) e aponta quais skills rodar em cada frente.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-negocio-plano-mensal em .claude/skills/lb-negocio-plano-mensal/SKILL.md.

Objetivo: montar plano de ação executivo do mês.
- Lê _memoria/estrategia.md (meta, bloqueadores, foco).
- Estrutura frentes: conteúdo, prospecção, tráfego pago, técnica/produto.
- Cada frente aponta quais skills do sistema usar e gera checklist semanal.
- Saída: plano em markdown com metas + checklist por semana.
- Gatilhos: "planejar o mês", "plano de ação", "prioridades do mês", "plano mensal",
  /lb-negocio-plano-mensal.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-negocio-plano-mensal em .claude/skills/lb-negocio-plano-mensal/SKILL.md.
Princípio: mês sem plano vira resposta a urgência; o plano define o que importa antes de
começar.

FRONTMATTER:
- name: lb-negocio-plano-mensal
- description: Monta plano de ação executivo do mês: meta principal, bloqueadores ativos,
  frentes de trabalho (conteúdo, prospecção, tráfego pago, técnica/produto) com checklist
  semanal. Integra as skills existentes num único planejamento. Gatilhos: "planejar o mês",
  "o que fazer esse mês", "plano de ação", "prioridades do mês", "plano mensal",
  /lb-negocio-plano-mensal.

DEPENDÊNCIAS: _memoria/estrategia.md (OBRIGATÓRIO — fase atual, próximos passos,
bloqueadores), _memoria/empresa.md. Output em saidas/plano-<YYYY-MM>.md.

WORKFLOW:
Passo 1 — ler estrategia.md e empresa.md obrigatoriamente. Identificar: meta principal do
mês (o que "vencer o mês" significa), o que estava planejado e não foi feito, bloqueadores
ativos.
Passo 2 — gerar plano em markdown: Meta principal (1 frase; se não cabe, reformular);
Bloqueadores ativos (lista honesta); até 4 frentes, cada uma com meta + skills + tabela
(Semana | Ação concreta | Skill | Status ⬜):
  Frente 1 Prospecção e fechamento (/lb-venda-diagnostico, prospectar, dossie, proposta,
    objecoes, follow-up).
  Frente 2 Conteúdo orgânico (/lb-conteudo-calendario, carrossel, reels, stories).
  Frente 3 Tráfego pago (/lb-meta-campanha-whatsapp, /lb-google-ads, /lb-meta-relatorio;
    verificar pré-requisitos técnicos antes de ativar).
  Frente 4 Técnica/produto (bloquear antes de escalar ads; tabela por prioridade).
  + Checklist de monitoramento de fim de semana + Próxima revisão.
Passo 3 — salvar em saidas/plano-<YYYY-MM>.md.
Passo 4 — oferecer começar pela frente mais crítica e gerar o calendário
(/lb-conteudo-calendario).

REGRAS: ler estrategia.md primeiro; meta do mês em 1 frase; bloqueadores honestos; máximo
4 frentes; checklist semanal obrigatório; skill por ação; não planejar mês em andamento
sem ler o que já foi feito (commits/saidas).
```

## ⚙️ Como funciona
1. Roda `/lb-negocio-plano-mensal`.
2. Lê estratégia → monta frentes + checklist semanal.

## 🎥 Roteiro de gravação
1. **Gancho:** "44 skills não servem de nada sem um plano. Vou amarrar tudo no mês."
2. Roda o comando.
3. Mostra as frentes apontando pras skills certas.
4. **Fechamento:** "Plano fechado. Pra fechar a série da Parte 1: criar sites."

## 🗣️ Gancho de abertura pronto
> "Tenho dezenas de ferramentas — mas o que faço essa semana? Vou gerar o plano de ação do mês que orquestra todas as frentes."

## ✅ Demonstração ao vivo
- Plano com frentes + checklist semanal.

## 🔗 Pré-requisitos
- `estrategia.md` preenchido.
</content>
