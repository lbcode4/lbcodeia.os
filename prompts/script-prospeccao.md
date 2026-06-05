# Criador de Script de Prospecção

## Quando usar
Dossiê do prospect já levantado (via `/lb-venda-dossie`) + persona do dono pronta (via `persona.md` Modo B). Gera roteiro 10 pontos personalizado pra abordagem.

## Inputs necessários
- Perfil do gestor (quem aborda — nome, formação, anos de experiência)
- Dossiê do prospect (output completo de `/lb-venda-dossie`)
- Persona do dono (output de `persona.md` Modo B)
- Canal de abordagem (WhatsApp / cold call / email / presencial)
- Oferta (o que vai oferecer — serviço + faixa de preço)

## Prompt

```
Você é especialista em prospecção B2B com método estruturado de 10 pontos.
Gere abordagem personalizada pro contexto:

QUEM ABORDA (gestor):
- Nome: [...]
- Anos no mercado: [...]
- Especialidade: [...]
- Tem case/prova social? [Sim/Não — descrever]

PROSPECT (dossiê):
<<<
[colar dossiê completo de /lb-venda-dossie]
>>>

PERSONA DO DONO DESSE NICHO:
<<<
[colar persona Modo B]
>>>

CANAL: [WhatsApp / cold call / email / presencial]
OFERTA: [serviço] — [faixa de preço]

Gere mensagem seguindo ROTEIRO 10 PONTOS:

## MENSAGEM ABORDAGEM INICIAL

1. **Cumprimento** — [adequado ao canal e horário]
2. **Quem sou + o que faço + tempo necessário** — [versão curta, 1 linha,
   menciona "sou rápido, levo X minuto/segundo"]
3. **Como te encontrei** — [específico ao prospect, ex: "cheguei no perfil
   pelo Instagram buscando [nicho] em [bairro]"]
4. **Filtro do tomador de decisão** — ["você é o responsável pelo marketing?"
   ou equivalente]
5. **Prova social** — [Se tem case, citar 1 com número. Se NÃO tem: "meu foco
   hoje é estar 100% disponível pra 2-3 [nicho]"]
6. **O que entrego** — [benefício concreto, NÃO o serviço técnico —
   "captação de clientes via Instagram com agendamento direto no WhatsApp"]
7. **Espaço pro não** — ["talvez não faça sentido agora..."]
8. **Escassez com verdade** — ["estou selecionando 2 [nicho] esse mês"]
9. **Chamada pro envio do material** — ["preparei uma análise do perfil de
   vocês + ideias prontas, posso enviar?"]
10. ⭐ **PONTOS DE CONEXÃO** (DIFERENCIAL — extrair do dossiê):
    - Ponto 1: [fato específico do dossiê]
    - Ponto 2: [fato específico do dossiê]
    - Ponto 3: [fato específico do dossiê]

JUNTAR TUDO em mensagem fluida (não em lista numerada — o usuário vai colar
no [canal]).

⚠️ Adaptar formato ao canal:
- WhatsApp: 2-3 parágrafos curtos, tom direto, sem formalidade exagerada
- Cold call: roteiro de fala com pausas marcadas
- Email: assunto + 4-5 parágrafos, mais formal
- Presencial: bullets pra ter na cabeça (não decorado)

## VERSÃO FINAL — [canal]

[mensagem pronta pra copiar-colar]

## VARIAÇÃO B (se A não responder)

[reescrever 10 pontos com ângulo diferente — ex.: se A foi
"queremos ajudar com [dor X]", B pode ser "vi que vocês fazem [coisa Y]
e curti como [específico]"]

## FOLLOW-UP D+1 (se A não respondeu em 24h)

[mensagem curta, 1-2 frases, reforça ponto de conexão #1 ou #2]

## FOLLOW-UP D+3 (sem resposta)

[mudar ângulo — oferecer especificamente o "material" mencionado no item 9.
Esse FUP vira a oferta principal]

## FOLLOW-UP D+7 (sem resposta)

[mudar canal — se WhatsApp, sugerir email; se email, IG; se ligação, WhatsApp]

## FOLLOW-UP D+14 (despedida educada)

["vou parar de te incomodar. Se um dia [problema], tô aqui: [contato].
Sucesso aí na [Nome do negócio]."]

## TRATAMENTO DE OBJEÇÕES

Top 5 objeções esperadas (da persona Modo B) + resposta pronta:

### "Já tentei e queimei dinheiro"
[resposta personalizada]

### "Não tenho R$ pra isso agora"
[resposta]

### "Tenho um conhecido que já cuida"
[resposta]

### "Vou pensar / depois conversamos"
[resposta]

### "Manda por email" (esconde)
[resposta]

## MATERIAL DE VALOR (anexar após resposta positiva)

Plano de marketing personalizado contendo:
- [extrair dossiê: análise IG, análise GBP, ideias de campanha inicial]
- 5 scripts WhatsApp pra primeiro contato com cliente do [nicho]
- Pesquisa rápida de keywords [nicho] no Google

⚠️ Esse material entrega valor de graça → mostra capacidade →
gera confiança. Não é "rouba teu cliente" — é prova de que sabe fazer.

## CHECKLIST PRÉ-ENVIO

- [ ] Mensagem usa AO MENOS 2 pontos de conexão do dossiê
- [ ] Não inventa prova social
- [ ] Tom adequado ao canal
- [ ] Termina com pergunta clara (CTA)
- [ ] Sem corporativês ("alavancar", "sinergia", "destravar potencial")
- [ ] Sem jargão se a persona não usa
- [ ] Cabe em uma tela (WhatsApp/IG DM)
```

## Output esperado
Mensagem inicial + variação B + 4 follow-ups + tratamento de 5 objeções + material de valor descrito. Pronto pra rodar abordagem.

## Regras
- **Sempre USAR PONTOS DE CONEXÃO do dossiê** — mensagem genérica = nota 5
- **Sempre 2 horários concretos** quando agendar reunião
- **Sempre adaptar ao canal** (formato/tom/extensão)
- **Sempre tratar objeções** previamente — não improvisar
- **Sempre incluir material de valor** — abre porta sem pedir nada
- **Nunca usar nome completo do prospect** — só primeiro nome
- **Nunca prometer resultado garantido** — "X% em Y dias" é mentira
- **Arquivar após D+14** sem resposta — não insistir
