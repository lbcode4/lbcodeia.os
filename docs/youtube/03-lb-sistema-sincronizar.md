# 🎬 Vídeo 03 — `/lb-sistema-sincronizar`

> **Bloco 1 — Núcleo.** Duração alvo: 5–7 min · Sem front.

## 🎯 Objetivo do vídeo
Mostrar como manter a memória viva: o comando varre pastas, git history recente e arquivos de contexto, detecta o que mudou (cliente novo, skill criada, foco mudou) e propõe reconciliação — atualizando os 5 arquivos-chave.

## 💡 Dor → solução
- **Dor:** a memória envelhece; o que estava em foco mês passado já mudou e a IA continua agindo pelo contexto antigo.
- **Solução:** auditoria automática que reconcilia memória ↔ realidade do projeto.

## 🧠 Framework por trás
Fecha o **feedback loop** do sistema: o que foi executado retroalimenta a memória. Sem isso, o framework não evolui.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-sistema-sincronizar em .claude/skills/lb-sistema-sincronizar/SKILL.md.

Objetivo: auditar o projeto e reconciliar a memória.
- Varre todas as pastas, o git history recente e os arquivos de contexto.
- Detecta: clientes/projetos novos, mudança de foco, skills criadas, evolução visual.
- Propõe a reconciliação e, ao aprovar, atualiza os 5 arquivos-chave de memória.
- SEMPRE mostrar a mudança antes de salvar; editar só a linha, não reformatar tudo.
- Gatilhos: "atualizar", "sincronizar contexto", "revisar projeto", /lb-sistema-sincronizar.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-sistema-sincronizar em .claude/skills/lb-sistema-sincronizar/SKILL.md.

FRONTMATTER:
- name: lb-sistema-sincronizar
- description: Faz auditoria do projeto: varre pastas, git history recente e arquivos
  de contexto e propõe reconciliação. Detecta clientes/projetos novos, mudanças de
  foco, skills criadas, evolução de identidade visual. Atualiza os 5 arquivos-chave de
  memória. Use quando disser "atualizar", "sincronizar contexto", "revisar projeto",
  "/sistema-atualizar".

OBJETIVO: skill de manutenção. Varre o projeto, identifica o que mudou na realidade e
propõe atualizar a memória pra bater com o estado real.

WORKFLOW EM 4 PASSOS:

Passo 1 — Coleta de evidência:
- Estrutura: pastas da raiz (saidas/ com marketing/, entrada/, relatorios/, cache/;
  scripts/, prompts/, transcricoes/, clientes/), subpastas de clientes/, skills novas
  em .claude/skills/.
- Git: git log --oneline -20, git tag, arquivos alterados nos últimos 30 dias.
- Outputs recentes: carrosséis (saidas/marketing/conteudo/), campanhas
  (saidas/marketing/campanhas/), propostas (saidas/marketing/prospeccao/), planos,
  relatórios.

Passo 2 — Análise de coerência: comparar os 5 arquivos com a realidade:
- empresa.md: clientes/serviços listados batem com pastas? ferramentas ainda usadas?
- preferencias.md: tom listado bate com o que foi gerado? "o que evitar" foi respeitado?
- estrategia.md: foco ainda é prioridade? prazos ainda fazem sentido? gargalos atacados?
- identidade/design-guide.md: cores/tipografia batem com os outputs recentes?
- framework-trafego.md: mudou de abordagem (conteúdo -> ads) e ficou desatualizado?

Passo 3 — Proposta de mudanças: listar numerado, agrupado por Contexto / Skills /
Identidade, citando a EVIDÊNCIA de cada (pasta, data, commit). Perguntar
"Quer que eu aplique? (todas, algumas, nenhuma)".

Passo 4 — Aplicação cirúrgica (se aprovado): uma linha por mudança, sem reformatar
arquivo, mostrar diff antes->depois, nunca apagar (só atualizar/adicionar). Confirmar
com ✓ por mudança.

REGRAS:
- Não inventar fatos — evidência tem que existir (pasta/arquivo/commit/output).
- Evidência ambígua (pasta vazia): perguntar antes.
- Nunca apagar.
- Tudo em sintonia: responder "Tá tudo sincronizado. Nada pra atualizar."
- Na dúvida, perguntar.

INTEGRAÇÃO: é a auditoria do operacional. A máquina roda pelo que está em _memoria/;
se a memória desatualiza, o sistema sai de prumo. Usar toda semana ou em mudança grande.
```

## ⚙️ Como funciona
1. Roda `/lb-sistema-sincronizar`.
2. Varre repo + git log + memória.
3. Lista divergências encontradas.
4. Mostra mudança proposta → você aprova → grava.

## 🎥 Roteiro de gravação
1. **Gancho:** "Seu sistema sabe o que mudou no negócio essa semana? O meu sabe."
2. Faz uma mudança real antes (ex: criar pasta de cliente novo).
3. Roda o comando → ele detecta a mudança.
4. Aprova a reconciliação → mostra `estrategia.md` atualizado.
5. **Fechamento:** "Agora que está atualizado, vamos guardar tudo no GitHub."

## 🗣️ Gancho de abertura pronto
> "Memória de IA estraga rápido. Esse comando faz uma auditoria do projeto e atualiza o contexto sozinho — com você aprovando cada mudança."

## ✅ Demonstração ao vivo
- Antes/depois de um dos arquivos de `_memoria/`.

## 🔗 Pré-requisitos
- Repo com algum histórico (git) e memória preenchida.
</content>
