# 🎬 Vídeo 02 — `/lb-sistema-contexto`

> **Bloco 1 — Núcleo.** Duração alvo: 4–6 min · Sem front.

## 🎯 Objetivo do vídeo
Mostrar como abrir uma sessão de trabalho: o comando carrega a memória (empresa, preferências, estratégia, framework, identidade) e devolve um briefing de 1 frase — quem você é, o que está em foco, tom de voz. Pronto pra trabalhar.

## 💡 Dor → solução
- **Dor:** começar o dia sem saber a prioridade; a IA "fria" precisa de aquecimento.
- **Solução:** um único comando aquece o contexto e te lembra o foco da semana.

## 🧠 Framework por trás
Lê os arquivos da memória + `framework-trafego.md`. Garante que toda a sessão seguinte já roda calibrada por RETINA/GCC sem você pedir.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-sistema-contexto em .claude/skills/lb-sistema-contexto/SKILL.md.

Objetivo: abrir uma sessão de trabalho do LBCode.IA.
- Carrega _memoria/empresa.md, preferencias.md, estrategia.md, framework-trafego.md
  e identidade/design-guide.md.
- Devolve um briefing de UMA frase: quem é o negócio, o que está em foco, e o tom de voz.
- Gatilhos: "abrir", "começar", "carrega contexto", /lb-sistema-contexto.
- Não confirmar leitura arquivo por arquivo; usar o contexto naturalmente.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-sistema-contexto em .claude/skills/lb-sistema-contexto/SKILL.md.

FRONTMATTER:
- name: lb-sistema-contexto
- description: Abre uma sessão de trabalho do LBCode.IA. Carrega memória operacional
  (empresa, preferências, estratégia, framework, identidade) e devolve briefing em 1
  frase — quem você é, o que tá em foco, tom de voz. Use no início da sessão, ou
  quando o usuário disser "abrir", "começar", "carrega contexto", "/sistema-abrir".

OBJETIVO: "abrir a máquina". Em uma frase, recalibrar quem você é, onde está o foco e
que tom usar.

WORKFLOW — ler em ordem (se existirem e não estiverem vazios):
1. _memoria/empresa.md — identidade + o que vende
2. _memoria/preferencias.md — tom de voz + o que evitar
3. _memoria/estrategia.md — foco atual + bloqueadores
4. _memoria/framework-trafego.md — não ler na abertura, só saber que está lá
5. identidade/design-guide.md — só checar se existe

VALIDAÇÃO: se algum dos 3 PRIMEIROS estiver vazio/placeholder, responder
"Vi que _memoria/<nome>.md ainda não foi preenchido. Quer rodar /lb-sistema-onboarding
agora pra completar?" e PARAR (sistema não roda com contexto incompleto).

RESPOSTA (máximo 5 linhas) — se tudo preenchido, devolver síntese no formato:
  [Empresa] — [o que faz, 1 linha]
  Foco: [prioridade da semana]
  Tom: [3 palavras: direto, técnico, casual...]
Depois: "Pronto. O que vamos fazer hoje?"

REGRAS:
- Não listar os arquivos lidos; usar o contexto naturalmente.
- Não confirmar leitura ("li empresa.md...").
- Máximo 5 linhas (cabe no terminal).
- Nenhuma pergunta além de "o que vamos fazer?".
- design-guide.md vazio: ignorar (não mencionar).

INTEGRAÇÃO: a skill já sabe internamente que toda skill de marketing lê
framework-trafego.md, toda skill visual lê design-guide.md, e que cada execução é
versionada via /lb-sistema-versionar — o sistema é integrado, não solto.
```

## ⚙️ Como funciona
1. Roda `/lb-sistema-contexto`.
2. Lê silenciosamente os 5 arquivos de memória.
3. Responde com 1 frase de briefing → sessão pronta.

## 🎥 Roteiro de gravação
1. **Gancho:** "Como eu começo todo dia de trabalho em 1 comando."
2. Roda o comando, mostra o briefing.
3. Emenda um pedido qualquer ("me dá 3 temas de post") pra provar que já saiu calibrado.
4. **Fechamento:** "A memória precisa ficar atualizada — é o próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "Antes de trabalhar, eu aqueço o sistema. Um comando e ele me lembra quem sou, o que vendo e qual o foco da semana."

## ✅ Demonstração ao vivo
- Output: briefing de 1 frase + um pedido qualquer respondendo já no tom certo.

## 🔗 Pré-requisitos
- `_memoria/` preenchido (vídeo 01).
</content>
