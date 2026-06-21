# 🎬 Vídeo 06 — `/lb-negocio-mapear-rotinas`

> **Bloco 1 — Núcleo.** Duração alvo: 7–9 min · Sem front.
> **Vídeo-chave da série:** é o comando que cria *novos* comandos.

## 🎯 Objetivo do vídeo
Mostrar como descobrir tarefas que você repete toda semana (conteúdo, prospecção, relatórios, emails) e transformá-las em skills personalizadas — descreve o padrão, o sistema propõe a automação e, aprovada, vira skill pronta pra usar.

## 💡 Dor → solução
- **Dor:** você repete a mesma rotina manual toda semana e nunca sobra tempo pra automatizar.
- **Solução:** o sistema entrevista a rotina e devolve uma skill estruturada pelo framework certo (RETINA/GCC/OPA conforme o tipo de tarefa).

## 🧠 Framework por trás
Meta-skill: gera workflows já amarrados a RETINA (posicionamento), GCC (copy) ou OPA (oferta) conforme a natureza da tarefa. É como o arsenal de skills cresce sem perder método.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-negocio-mapear-rotinas em .claude/skills/lb-negocio-mapear-rotinas/SKILL.md.

Objetivo: descobrir rotinas repetitivas e transformá-las em skills personalizadas.
- Pergunta qual tarefa o usuário repete (conteúdo, prospecção, relatório, email...).
- Extrai o padrão: entrada, passos, saída esperada, frequência.
- Propõe automação e, ao aprovar, gera o SKILL.md novo usando o skill-creator nativo.
- O workflow aplica o framework adequado (RETINA/GCC/OPA), calibrado por _memoria/.
- Gatilhos: "automatizar meu trabalho", "criar skill personalizada", /lb-negocio-mapear-rotinas.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-negocio-mapear-rotinas em .claude/skills/lb-negocio-mapear-rotinas/SKILL.md.

FRONTMATTER:
- name: lb-negocio-mapear-rotinas
- description: Descobre tarefas que você repete toda semana (conteúdo, prospecção,
  relatórios, emails) e as transforma em skills personalizadas. Você descreve o padrão,
  propõe automação e aprovada vira skill pronta. Inclui gerador de workflow estruturado
  baseado em RETINA/GCC/OPA conforme o tipo de tarefa. Use quando disser
  "/negocio-mapear-rotinas", "automatizar meu trabalho", "criar skill personalizada",
  "o que dá pra automatizar".

OBJETIVO: observar o que você repete, estruturar como workflow e virar skill que roda
automática depois.

WORKFLOW EM 5 PASSOS:

Passo 1 — Entrevista (3 perguntas, uma por vez, esperando resposta):
1. "Que tarefas você faz toda semana e gostaria de nunca mais pensar nelas?"
2. "Pra cada uma, qual é a entrada (o input inicial)?"
3. "E a saída que você espera?"

Passo 2 — Verificar cobertura: ler _memoria/skills-catalogo.md. Se já existe skill que
cobre (ex: /lb-conteudo-carrossel pra posts, /lb-google-seo pra pesquisa,
/lb-meta-relatorio pra análise), oferecer parametrizar em vez de criar nova. Sem
cobertura, seguir.

Passo 3 — Propor estrutura de cada skill no formato:
  ### /<nome-da-skill>
  O que faz: [1 frase]
  Input: [o que recebe]
  Output: [o que entrega]
  Tempo estimado: [5/15/30 min]
  Framework integrado: [RETINA/GCC/OPA/4-campanhas, se aplicável]
  Dependências: [arquivos de _memoria/, identidade/, ferramentas externas]
Mostrar todas e perguntar "Quais quer que eu crie agora? (todas, algumas, nenhuma —
pode pedir ajustes)".

Passo 4 — Criar skills aprovadas. Estrutura de pasta:
  .claude/skills/<nome>/SKILL.md (+ template.md e exemplos/ se precisar).
Conteúdo do SKILL.md: frontmatter (name + description com QUANDO invocar — crítico),
seção "O que faz", workflow numerado (objetivo/ação/output por passo), dependências,
framework integrado (onde e como), regras (sempre/nunca). Calibrar lendo
_memoria/preferencias.md (tom) e _memoria/empresa.md (serviço/público); se usar
framework, referenciar _memoria/framework-trafego.md.

Passo 5 — resumo: listar as N skills criadas com caminho, explicar que se usa digitando
/ + nome e que pra ajustar edita o SKILL.md. Perguntar "Quer testar uma agora?".

REGRAS:
- Skill precisa ser REPETÍVEL (tarefa de uma vez não vira skill).
- Máximo 5 skills por sessão (mais que isso, dividir em rodadas).
- Trigger claro obrigatório na description (sem isso a skill fica invisível).
- Framework integrado obrigatório se for marketing/ads/vendas (RETINA/GCC/OPA documentado).
- Dependência cara/complexa (Notion API, Vision paga): avisar + oferecer versão simples.

INTEGRAÇÃO: cada skill criada vira parte do framework (lê empresa.md, respeita
preferencias.md, usa RETINA/GCC/OPA se for marketing, entrega outputs versionáveis e
fica mapeada em skills-catalogo.md). Não são helpers — é expandir a operação.
```

## ⚙️ Como funciona
1. Roda `/lb-negocio-mapear-rotinas`.
2. Descreve a rotina repetida.
3. O sistema propõe o desenho da skill.
4. Aprova → nasce um `SKILL.md` novo.

## 🎥 Roteiro de gravação
1. **Gancho:** "Esse comando cria outros comandos. É o que faz o sistema crescer sozinho."
2. Descreve uma rotina real (ex: "toda segunda eu monto um resumo de métricas").
3. Mostra a skill sendo gerada.
4. Roda a skill recém-criada na hora.
5. **Fechamento:** "Fechamos o núcleo. A partir do próximo, é produção: conteúdo."

## 🗣️ Gancho de abertura pronto
> "E se a IA pudesse criar as próprias ferramentas? Vou pegar uma tarefa que faço toda semana na mão e transformar em comando — pra nunca mais fazer manual."

## ✅ Demonstração ao vivo
- Uma skill nova nascendo em `.claude/skills/` + primeira execução.

## 🔗 Pré-requisitos
- Núcleo instalado (memória pra calibrar tom).
</content>
