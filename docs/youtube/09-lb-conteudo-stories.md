# 🎬 Vídeo 09 — `/lb-conteudo-stories`

> **Bloco 2 — Conteúdo.** Duração alvo: 4–6 min · Sem front.

## 🎯 Objetivo do vídeo
Criar sequência de 5–7 stories interativos (enquete, pergunta, revelação, CTA pro WhatsApp) baseada em RETINA. Transforma engajamento passivo em conversa ativa.

## 💡 Dor → solução
- **Dor:** stories aleatórios que ninguém responde, sem caminho pra conversa.
- **Solução:** sequência com interação planejada que termina puxando pro WhatsApp.

## 🧠 Framework por trás
- **RETINA** dá o fio condutor da sequência.
- Estrutura de **nutrição (Bolo de Cenoura)**: aquecer antes do CTA.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-conteudo-stories em .claude/skills/lb-conteudo-stories/SKILL.md.

Objetivo: gerar sequência de 5-7 stories interativos.
- Mistura enquete, caixa de pergunta, revelação e CTA pro WhatsApp.
- Aplica RETINA pro tema e lógica de nutrição pra aquecer antes do CTA.
- Entrega cada story com texto, tipo de interação e arte sugerida.
- Lê _memoria/ pra tom e oferta.
- Gatilhos: "stories", "sequência de stories", "stories interativos",
  "fazer stories", /lb-conteudo-stories.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-conteudo-stories em .claude/skills/lb-conteudo-stories/SKILL.md.

FRONTMATTER:
- name: lb-conteudo-stories
- description: Cria sequência de 5-7 stories interativos com enquete, pergunta,
  revelação e CTA pro WhatsApp. Baseado em RETINA. Transforma engajamento passivo em
  conversa ativa. Use quando pedir "stories", "sequência de stories", "stories
  interativos", "conteúdo pra stories", "fazer stories", /lb-conteudo-stories.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — RETINA), _memoria/empresa.md,
_memoria/preferencias.md. Output em
saidas/marketing/conteudo/stories/<tema>-<YYYY-MM-DD>/sequencia.md.

ESTRUTURA PADRÃO (7 stories): 1 Gancho (para o dedo) · 2 Enquete (participação ativa,
ativa algoritmo) · 3 Desenvolvimento 1 (dado/problema/contexto) · 4 Desenvolvimento 2
(aprofundamento/revelação parcial) · 5 Revelação (o "aha moment") · 6 Prova (dado
concreto, tela do produto) · 7 CTA (WhatsApp/link/responder). Versão curta (5 stories):
juntar 3+4 e 5+6.

PILARES RETINA pra stories: R Resultado (revelação antes/depois no story 5),
E Educação ("você sabia que..." + enquete de diagnóstico), T Tendência, I Inspiração
(frase + enquete + mindset), N Novidade (suspense revelado no 5), A Autenticidade
(bastidores + "qual você prefere?").

WORKFLOW:
Passo 1 — parâmetros: tema; objetivo principal (gerar lead = focar CTA no story 7 /
engajar = focar enquete e revelação / educar = focar desenvolvimento e revelação);
pilar RETINA (sugerir se não informado).
Passo 2 — gerar a sequência. Template de CADA story: Fundo (cor/foto/vídeo), Texto
principal (máx 10 palavras), Texto secundário, Elemento interativo (enquete A/B,
pergunta aberta, quiz ou nenhum), Posição do sticker, Emoji/ícone, Música (mood). Incluir
um exemplo preenchido story a story.
Passo 3 — salvar no caminho acima.
Passo 4 — oferecer incluir no calendário (/lb-conteudo-calendario).

REGRAS: sequência sempre, nunca avulso; enquete no story 2 (ativa algoritmo); revelação
gradual (quem vê até o fim é lead quente); CTA só no story final; máximo 7 stories
(longas perdem 70% após o 4º); fundo variado; músicas curtas sem letra proeminente.
```

## ⚙️ Como funciona
1. Roda `/lb-conteudo-stories` + tema/objetivo.
2. Gera a sequência story a story com as interações.

## 🎥 Roteiro de gravação
1. **Gancho:** "Stories que viram conversa no WhatsApp — não só visualização."
2. Roda o comando.
3. Mostra a sequência e a lógica enquete → CTA.
4. **Fechamento:** "Já temos formatos. Agora, o calendário do mês inteiro."

## 🗣️ Gancho de abertura pronto
> "Seus stories só somam visualização? Vou montar uma sequência que puxa a pessoa pra conversa no WhatsApp."

## ✅ Demonstração ao vivo
- Sequência 5–7 stories com interações.

## 🔗 Pré-requisitos
- Memória preenchida.
</content>
