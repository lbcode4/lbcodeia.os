# 🎬 Vídeo 16 — `/lb-google-avaliacoes`

> **Bloco 3 — Google orgânico.** Duração alvo: 4–6 min · Sem front.

## 🎯 Objetivo do vídeo
Responder reviews do Google Meu Negócio com voz autêntica (não automática). Integra GCC: cita o nome, agradece de forma variada, puxa um elemento concreto (produto, processo, detalhe), emoji quando couber. 5★ e críticas ganham tratamento diferente. Pronto pra copiar/colar.

## 💡 Dor → solução
- **Dor:** responder review dá preguiça e sai robótico ("Obrigado pela avaliação!").
- **Solução:** respostas personalizadas que reforçam SEO local e soam humanas.

## 🧠 Framework por trás
- **GCC (Copy + Conversão):** cada resposta inclui termo-alvo e convida ao retorno.

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-google-avaliacoes em .claude/skills/lb-google-avaliacoes/SKILL.md.

Objetivo: responder reviews do Google Meu Negócio com voz autêntica.
- Recebe o texto da review (ou prints) e a nota.
- Aplica GCC: cita o nome do cliente, agradecimento variado (não repetir fórmula),
  puxa um elemento concreto da review, emoji se couber.
- Trata 5★ (reforço + termo-alvo) e críticas (acolhimento + solução) de formas diferentes.
- Saída pronta pra copiar/colar.
- Gatilhos: "responder avaliação", "review do google", "tem uma 5 estrelas",
  /lb-google-avaliacoes.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-google-avaliacoes em .claude/skills/lb-google-avaliacoes/SKILL.md.
Skill rápida: transforma uma review em resposta que parece genuína (não automática),
usando GCC pra reforçar confiança via pessoa-produto-cuidado.

FRONTMATTER:
- name: lb-google-avaliacoes
- description: Responde reviews do Google Meu Negócio com voz autêntica. Integra GCC:
  cita nome do cliente, agradece variado, puxa elemento concreto (produto, processo,
  detalhe), emoji se couber. 5★ e críticas ganham tratamento diferente. Tudo pronto pra
  copiar/colar. Use quando vir review nova ou disser "responder avaliação", "review do
  google", "tem uma 5 estrelas".

FLUXO: usuário cola print/texto da review (nome, texto, estrelas) -> skill extrai nome,
tipo (elogio/crítica/neutra) e tema (atendimento/produto/prazo) -> gera resposta no tom
de _memoria/preferencias.md -> mostra pronta pra copiar/colar.

PADRÃO DE RESPOSTA (5 regras):
1. Nome sempre: citar primeiro nome (capitalização natural; username -> nome; se ambíguo,
   pular nome e usar agradecimento caloroso).
2. Agradecimento variado: alternar "Obrigado / Muito obrigado / Que bom / Valeu /
   Apreciamos" (não repetir exato em respostas consecutivas).
3. Frase concreta de GCC (não genérica): puxar detalhe de produto, processo ou evidência
   (ex: "artesanato em cada peça", "entregamos em 24h"). EVITAR frases vazias ("seu
   feedback é importante", "qualidade ímpar").
4. Emoji opcional e estratégico: 5★ emoji caloroso (🙏😊❤️) ~80% das vezes; crítica/formal
   sem emoji; máximo 1 por resposta; nunca ✨🎉💯🚀 salvo se a marca usa.
5. Tom segue preferencias.md (direto/casual/formal) na resposta inteira.

TIPOS DE REVIEW (dar template de cada):
- 5★ elogio: "Obrigado [Nome]! [frase concreta]. [emoji?]"
- 5★ sem texto: "[agradecimento variado], [Nome]."
- 1-3★ crítica válida: agradecer + reconhecer o ponto + solução/convite a conversar (sem
  emoji, sem defensiva).
- 1-3★ crítica injusta/spam: agradecer + corrigir o fato polidamente + convite a resolver
  em privado/DM (não engajar na briga).

INTEGRAÇÃO GCC: cada resposta reforça G (gatilhos/prova social: "voltam 5x", "8 anos
aqui"), C (copy autêntica, sem jargão, frase memorizável) e C (conversão: convite
implícito a voltar/recomendar/DM). Não é vender — é reafirmar confiança.
```

## ⚙️ Como funciona
1. Roda `/lb-google-avaliacoes` + texto da review.
2. Gera resposta personalizada conforme a nota.

## 🎥 Roteiro de gravação
1. **Gancho:** "Responder avaliação errado afasta cliente. Vou mostrar o jeito certo — automatizado."
2. Roda com uma 5★ e com uma crítica.
3. Compara o tom humano vs robótico.
4. **Fechamento:** "Presença orgânica coberta. Hora do tráfego pago — começa pela infra."

## 🗣️ Gancho de abertura pronto
> "Vou responder uma avaliação 5 estrelas e uma crítica — cada uma do jeito certo, com a minha voz, pronta pra colar."

## ✅ Demonstração ao vivo
- Resposta pra 5★ e pra crítica.

## 🔗 Pré-requisitos
- Memória; texto das reviews.
</content>
