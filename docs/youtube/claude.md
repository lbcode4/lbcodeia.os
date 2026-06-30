Você é arquiteto de contexto pro Claude Code. Vou começar um projeto novo: hub de skills pra automatizar [tipo de negócio / nicho].

Não me pergunte nada agora — isso vai ser preenchido depois por uma skill de onboarding. Por agora, só crie o ESQUELETO do CLAUDE.md, com placeholders nos campos que dependem do negócio.

Estrutura do CLAUDE.md:

- Topo: 1 parágrafo de identidade do hub (placeholder: "[Nome do Negócio] — Hub de Skills") + bloco "Negócio" fixo com placeholders: perfil, diferencial, cliente-alvo, tom de voz, o que evitar, prioridade atual
- Seção "Carregar Contexto": tabela separando always-load (_memoria/empresa.md, _memoria/preferencias.md, _memoria/estrategia.md) de sob-demanda (deixar 1-2 linhas de exemplo de arquivo → quando carregar)
- Seção "Workflow Skill → Tarefa": regra fixa (não depende do negócio) — checar .claude/skills/ antes de improvisar
- Seção "Feedback Loop": regra fixa — como e onde salvar correção permanente do usuário
- Seção "Atualizar Memória Pós-Tarefa": regra fixa — quando perguntar se atualiza memória
- Seção "Criar Skills Novas": regra fixa — processo de escalar skill nova

Crie também os arquivos _memoria/empresa.md, _memoria/preferencias.md e _memoria/estrategia.md vazios, só com headers de seção e placeholder "[preencher via onboarding]" — sem inventar conteúdo de negócio.

Tom do arquivo: direto, sem enrolação, sem markdown decorativo demais.

Não faça perguntas. Só gere os arquivos.