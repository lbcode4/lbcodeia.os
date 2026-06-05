---
name: lb-google-avaliacoes
description: >
  Responde reviews do Google Meu Negócio com voz autêntica (não automática).
  Integra GCC (Copywriting + Conversão): cita nome do cliente, agradece variado,
  puxa elemento concreto (produto, processo, detalhe), emoji (se couber). 5★ e críticas
  ganham tratamento diferente. Tudo pronto pra copiar/colar. Use quando vir review nova
  ou disser "responder avaliação", "review do google", "tem uma 5 estrelas".
---

# /lb-google-avaliacoes — Respostas autênticas no Google

Skill rápida: transforma review em resposta que parece genuína (não automática).
Usa GCC internamente — cada resposta reforça confiança via pessoa-produto-cuidado.

## Fluxo

1. Usuário cola print/texto da review (nome, texto, estrelas)
2. Skill extrai: nome do cliente, tipo de avaliação (elogio/crítica/neutra), tema (atendimento/produto/prazo)
3. Gera resposta no padrão de `_memoria/preferencias.md` (tom de voz)
4. Mostra e pronto — copia/cola no Google

## Padrão de resposta

### Regra 1 — Nome sempre

Citar primeiro nome (ou apelido se indicado).
Se nome está minúsculo ou é username, usar nome com capitalização natural.
Se ambíguo, pular nome e usar agradecimento caloroso genérico.

Ex: "jj nascimento" → "JJ"; "thiago_tech" → "Thiago"; "alice"  → "Alice"

### Regra 2 — Agradecimento variado

Rodar: "Obrigado" / "Muito obrigado" / "Que bom" / "Valeu" / "Apreciamos"
(Não repetir exato em respostas consecutivas — variar)

### Regra 3 — Frase concreta de GCC (não genérica)

Puxar:
- **De produto:** detalhe específico mencionado ("saudável", "entrega rápida", "atenção")
- **De processo:** o que a empresa faz bem (artesanato, cuidado, customização)
- **De evidência:** "anos fazendo isso", "clientes voltam", quantidade/velocidade real

Evitar frases vazias:
- ❌ "seu feedback é importante"
- ❌ "estamos sempre à disposição"
- ❌ "qualidade ímpar", "experiência diferenciada"
- ✅ "artesanato em cada peça"
- ✅ "entregamos em 24h"
- ✅ "cliente voltou 5 vezes esse mês"

### Regra 4 — Emoji (opcional, estratégico)

- **Reviews 5★:** emoji caloroso (🤩 😊 🙏 ❤️) + 80% das vezes
- **Reviews crítica/formal:** pular emoji
- **Reviews neutras:** só se combinar com tom em `_memoria/preferencias.md`
- **Nicho-específico:** comida 🔥👏 / beleza 💅 (cuidado, pode parecer genérico)
- **NUNCA:** ✨ 🎉 💯 🚀 (exceto se marca usa no tom de voz)

Máximo 1 emoji por resposta.

### Regra 5 — Tom segue preferências

Ler `_memoria/preferencias.md` — direto / casual / formal / descontraído.
Aplicar tom na resposta inteira.

Ex: Marca "direto" → "Obrigado [Nome], saudação! Caprichamos." (não "Agradeço sinceramente sua consideração")

## Tipos de review

### 5★ elogio
```
Obrigado [Nome]! [Frase concreta sobre o que foi elogiado]. [Emoji?]
```
Ex: "Obrigado Gabriel! Saber que a entrega chegou rápido é exatamente o objetivo. 🙏"

### 5★ sem texto
```
[Agradecimento variado], [Nome].
```
Ex: "Que bom sua avaliação, Maria! 😊"

### 1-3★ crítica válida
```
Obrigado [Nome] pelo feedback. [Reconhecer o ponto]. [Solução ou convite pra conversar].
```
Ex: "Obrigado Lucas. Entendemos — a entrega atrasou naquele dia. Marca um papo conosco pra consertar?"
(Sem emoji. Sem defensiva.)

### 1-3★ crítica injusta/spam
```
Obrigado pela mensagem. [Corrigir fato polidamente se necessário]. [Convite pra resolver em privado].
```
Ex: "Valeu. A promoção valia em lojas selecionadas — manda DM pra confirmar a sua."
(Não engaja na briga. Resolve em privado.)

## Integração GCC

Cada resposta reforça 3 pilares de conversão:
- **G (Gatilhos):** "voltam 5x", "entregamos em 24h", "8 anos aqui" — prova social
- **C (Copy):** voz autêntica, sem jargão, frase memorizável
- **C (Conversão):** convite implícito ("volte", "recomende", convite a conversar em DM)

Não é vender — é reafirmar confiança.
