# 🎬 Vídeo 01 — `/lb-sistema-onboarding`

> **Bloco 1 — Núcleo.** O vídeo de abertura da série. É aqui que o sistema ganha cérebro.
> Duração alvo: 8–12 min · Sem front (só VSCode + Claude Code).

---

## 🎯 Objetivo do vídeo
Mostrar como, em ~10 minutos, o LBCode.IA aprende **tudo** sobre o negócio (quem é, o que vende, diferencial, tom de voz, gargalo, objetivo) e grava isso na memória — que todas as outras 43 skills vão consumir. **Esse é o "NotebookLM" do negócio.**

## 💡 Dor → solução
- **Dor:** toda vez que você pede algo pra uma IA, precisa reexplicar quem você é, o que vende, o tom. Cansa e o resultado fica genérico.
- **Solução:** uma entrevista guiada de 18 perguntas que preenche `_memoria/` uma vez. Depois disso, toda skill já sabe o contexto sem você repetir.

## 🧠 Framework por trás
A entrevista é estruturada pra extrair os insumos do **RETINA** (posicionamento/diferencial) e da **GCC** (voz/tom pra copy). É o que faz as skills de conteúdo e ads soarem como você, não como robô.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie uma skill chamada lb-sistema-onboarding em .claude/skills/lb-sistema-onboarding/SKILL.md.

Objetivo: instalar o LBCode.IA em 10-12 min preenchendo a memória do negócio.

Estrutura:
- Skill "fina": o SKILL.md orquestra, e cada fase pesada mora num arquivo de apoio
  em reference/ carregado só quando chega a fase.
- Pré-checagem: confere nome da pasta e se _memoria/*.md já tem conteúdo.
- Fase 0: extrai dados do site + Instagram, registra @handle, pede refs visuais.
- Fase 1: pergunta o perfil (criador / freelancer / agência / negócio local).
- Fase 2: entrevista de 18 perguntas em 8 blocos, uma por vez, com exemplo inline.
- Fases 3-5: preenche os 5 arquivos de _memoria/, roda npm install e fecha com briefing.

Regras: nunca inventar dado; Instagram bloqueado = registra @ e não insiste; teto 10-12 min.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-sistema-onboarding em .claude/skills/lb-sistema-onboarding/SKILL.md.

FRONTMATTER:
- name: lb-sistema-onboarding
- description: Instala LBCode.IA em 10-12min. Extrai site/Instagram, entrevista 18
  perguntas (negócio + diferencial + tráfego + voz + frequência + gargalo +
  objetivo+métrica + prioridade). Preenche memória completa pronta pra skills
  específicas. Sem duplicação. Exemplos inline em cada pergunta.

OBJETIVO: primeiro comando pós-clone. Em 10-12 min o sistema conhece o negócio
completo (quem, o que, diferencial, tráfego, voz, frequência, gargalo, objetivo,
métrica, prioridade). Skills específicas aprofundam depois sem duplicar.

ARQUITETURA "skill fina": o SKILL.md só orquestra. Cada fase pesada mora num arquivo
de apoio em reference/, carregado SÓ quando chega a fase (economia de contexto):
- reference/fase-0-site-instagram.md
- reference/fase-2-entrevista.md
- reference/fase-3-5-fechamento.md
Pré-checagem e Fase 1 ficam inline no SKILL.md (são curtas).

SEQUÊNCIA: Pré-checagem -> Fase 0 -> Fase 1 -> Fase 2 -> Fase 3 -> Fase 4 -> Fase 5.

PRÉ-CHECAGEM (inline):
1. Nome da pasta: rodar basename "$(pwd)". Se genérico (lbcode-ia, LBCode.IA...),
   avisar "Pasta tá genérica. Depois renomeamos pro nome da empresa." e registrar pra Fase 5.
2. Contexto já preenchido? Se _memoria/*.md tem conteúdo real, perguntar
   "Já tem contexto. Sobrescrevo ou complemento?". Se limpo, seguir.

FASE 0 (carregar reference/fase-0-site-instagram.md): extrai dados públicos do site +
Instagram, registra o @handle, coleta logo/refs visuais em identidade/. Atalho que
antecipa respostas. NÃO obrigatório — se falhar, segue pela entrevista.

FASE 1 (inline) — Perfil. Perguntar qual tipo representa o negócio:
1. Criador (marca pessoal + negócio digital, audiência como ativo)
2. Freelancer (vende serviço pra terceiros, organiza por projeto)
3. Agência (equipe pequena, vários clientes em paralelo)
4. Negócio local (empresa com presença física/regional)
A resposta define o template templates/perfis/claude-md-<perfil>.md.

FASE 2 (carregar reference/fase-2-entrevista.md) — entrevista de 18 perguntas em 8
blocos, UMA pergunta por vez, com exemplo inline em cada. Se site/IG já responderam,
pular e só confirmar.

FASES 3-5 (carregar reference/fase-3-5-fechamento.md): preenche os 5 arquivos de
_memoria/, roda npm install (Playwright pras skills de visual) e fecha com o briefing
de próximos passos calibrado por P18/P16.

REGRAS:
- Nunca inventar dado; vago entra como veio.
- Site/IG é atalho, não obrigatório; falha = segue entrevista.
- Instagram bloqueado? Registra o @ e não insiste.
- Teto de 10-12 min.
- npm install na Fase 5 é obrigatório — sem ele a 1ª skill de carrossel/site falha no render.

Crie também os 3 arquivos de reference/ com o detalhamento de cada fase.
```

## ⚙️ Como funciona (passo a passo na tela)
1. Roda `/lb-sistema-onboarding`.
2. Pré-checagem do nome da pasta e da memória existente.
3. Fase 0: cola o site/IG e o Claude já preenche o que conseguir.
4. Fase 1: escolhe o perfil → define o `CLAUDE.md`.
5. Fase 2: responde as 18 perguntas (uma por vez).
6. Fases 3-5: vê os arquivos `_memoria/empresa.md`, `preferencias.md`, `estrategia.md` sendo escritos + `npm install`.

## 🎥 Roteiro de gravação (cena a cena)
1. **Gancho (0–15s):** "Toda IA esquece quem você é. Vou resolver isso de uma vez."
2. Abre o VSCode com `_memoria/` **vazio** (mostra que está limpo).
3. Cola o prompt de criação → mostra o `SKILL.md` nascendo.
4. Roda `/lb-sistema-onboarding` e responde rápido (pode acelerar no corte).
5. Abre `_memoria/empresa.md` preenchido lado a lado com a pasta vazia do início.
6. **Fechamento:** "Agora o sistema te conhece. No próximo vídeo abro uma sessão de trabalho com `/lb-sistema-contexto`."

## 🗣️ Gancho de abertura pronto
> "Cansei de explicar meu negócio pra IA toda vez. Então construí um sistema que aprende uma vez e nunca mais esquece. Esse é o primeiro vídeo de uma série — começa pelo cérebro."

## ✅ Demonstração ao vivo
- Antes: `_memoria/` vazio.
- Depois: `empresa.md`, `preferencias.md`, `estrategia.md` preenchidos.
- Prova: pedir um carrossel **antes** (genérico) vs **depois** (na sua voz) — teaser do Bloco 2.

## 🔗 Pré-requisitos
- VSCode + Claude Code instalados.
- Node/npm (pro `npm install` da Fase 5).
- Repo LBCode.IA clonado.
</content>
