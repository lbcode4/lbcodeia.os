# 🎬 Vídeo 05 — `/lb-sistema-novo-projeto`

> **Bloco 1 — Núcleo.** Duração alvo: 6–8 min · Sem front.

## 🎯 Objetivo do vídeo
Mostrar como criar um workspace isolado pra um cliente ou iniciativa nova, com contexto dedicado (`CLAUDE.md` próprio) que herda tom + framework + identidade da raiz, mas permite regras específicas. Estrutura as pastas conforme o tipo de entrega.

## 💡 Dor → solução
- **Dor:** misturar o contexto de vários clientes num projeto só vira bagunça e vazamento de informação.
- **Solução:** cada cliente ganha um workspace isolado que herda o método sem misturar dados.

## 🧠 Framework por trás
Usa o `_memoria/skills-catalogo.md` pra ativar só o subconjunto de skills do **modelo de negócio** do cliente (SaaS B2B / Agência / Local / Criador). Mais skills ≠ mais sistema.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-sistema-novo-projeto em .claude/skills/lb-sistema-novo-projeto/SKILL.md.

Objetivo: criar um workspace isolado pra cliente/iniciativa nova.
- Pergunta nome do cliente e o modelo de negócio (SaaS B2B / Agência / Local / Criador).
- Cria pasta dedicada com CLAUDE.md próprio que herda tom + framework + identidade da raiz.
- Estrutura as subpastas conforme o tipo de entrega.
- Usa _memoria/skills-catalogo.md pra indicar quais skills ativar pra aquele modelo.
- Gatilhos: "novo cliente", "novo projeto", "isolar projeto", /lb-sistema-novo-projeto.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-sistema-novo-projeto em .claude/skills/lb-sistema-novo-projeto/SKILL.md.

FRONTMATTER:
- name: lb-sistema-novo-projeto
- description: Cria workspace isolado pra cliente ou iniciativa nova com contexto
  dedicado (CLAUDE.md próprio). Herda tom + framework + identidade da raiz, mas permite
  regras específicas. Estrutura pastas conforme tipo de entrega. Use quando disser
  "novo cliente", "novo projeto", "/sistema-novo-projeto", "começar trabalho pra X",
  "isolar projeto".

OBJETIVO: criar pasta-projeto que funciona como mini-repositório dentro do LBCode.IA.
Herda o contexto (tom, framework, marca) mas roda com CLAUDE.md próprio. Não é sandbox,
é extensão organizada da operação.

WORKFLOW EM 5 PASSOS:

Passo 1 — 4 perguntas rápidas:
1. Nome do projeto/cliente?
2. É cliente novo / projeto interno / iniciativa pessoal?
3. Objetivo em uma frase?
4. Que tipo de entrega? (ads, site, conteúdo, proposta, automação — pode ser múltiplo)

Passo 2 — decidir pasta-pai pela resposta 2:
- Cliente novo: clientes/<nome>/
- Projeto interno: projetos/<nome>/
- Pessoal: perguntar onde vai
(criar pasta-pai se não existir)

Passo 3 — estrutura:
<nome>/
  CLAUDE.md (herda + específicas)
  briefing.md (contexto do projeto)
  subpastas conforme entregas (ads/, conteudo/, site/, propostas/...)

Passo 4 — conteúdo do CLAUDE.md (template mínimo): título com [Nome] e data; seções
Sobre (objetivo), Tipo, Entregas (lista); seção "Herança" dizendo que tom, marca e
framework vêm da raiz (_memoria/ + identidade/ + framework-trafego.md) e tudo que não
for sobrescrito segue o padrão da empresa; seção "Específico desse projeto" vazia pra
preencher conforme surgirem regras locais.

Passo 5 — resumo: ✓ pasta criada (caminho), ✓ CLAUDE.md + briefing.md, ✓ subpastas
(lista). Pedir pra abrir terminal dentro da pasta pra carregar o contexto específico
junto com o global.

REGRAS:
- Nomeação natural da pasta (preservar acentos, espaços viram hífen, reconhecível).
- Só criar as subpastas solicitadas (sem estrutura "pra organizar").
- Conflito de nome: avisar + oferecer sufixo (_v2) ou sobrescrever.
- Git: projetos ficam versionados juntos, não em repos separados.

INTEGRAÇÃO: herda RETINA + GCC + OPA (se marketing/vendas), segue a identidade visual,
outputs vão pro histórico via /lb-sistema-versionar e o projeto aparece depois no
/lb-sistema-sincronizar (que detecta o novo cliente/projeto).
```

## ⚙️ Como funciona
1. Roda `/lb-sistema-novo-projeto`.
2. Informa cliente + modelo.
3. Gera a pasta + `CLAUDE.md` herdado + estrutura.
4. Lista as skills recomendadas pro modelo.

## 🎥 Roteiro de gravação
1. **Gancho:** "Como atendo vários clientes sem misturar contexto."
2. Roda o comando pra um cliente fictício.
3. Abre o `CLAUDE.md` filho mostrando herança + bloco específico.
4. **Fechamento:** "E quando descubro uma tarefa repetitiva, eu transformo em skill — próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Cada cliente tem um cérebro próprio dentro do meu sistema. Vou criar um do zero, isolado, em segundos."

## ✅ Demonstração ao vivo
- Pasta nova + `CLAUDE.md` filho.

## 🔗 Pré-requisitos
- Núcleo instalado; `skills-catalogo.md` presente.
</content>
