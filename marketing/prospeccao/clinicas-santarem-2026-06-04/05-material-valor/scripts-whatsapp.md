# Scripts de WhatsApp — Automação para Clínicas

Material pra mostrar ao lead como a automação funciona na prática.
Apresentar como "assim que funcionaria no WhatsApp de vocês".

---

## Fluxo 1: Agendamento inicial (novo paciente)

```
Paciente: "Oi, quero marcar uma consulta"

🤖 Bot: Olá! Seja bem-vindo(a) à [Clínica X] 😊
Sou o assistente virtual da clínica.
Para te ajudar, me conta:

Qual serviço você tem interesse?

1️⃣ Estética facial (botox, harmonização, skincare)
2️⃣ Estética corporal (drenagem, modelagem)
3️⃣ Consulta médica/avaliação
4️⃣ Outro serviço

Paciente: "1"

🤖 Bot: Ótimo! Temos os seguintes procedimentos disponíveis:

✨ Avaliação facial (gratuita)
✨ Botox
✨ Preenchimento labial
✨ Harmonização facial
✨ Tratamento de manchas

Qual te interessa mais?

Paciente: "harmonização facial"

🤖 Bot: Perfeito! 💆‍♀️ 
Para harmonização facial, nosso agendamento é feito com [nome da profissional].

Horários disponíveis essa semana:

📅 Terça 14/01 → 10h ou 14h30
📅 Quarta 15/01 → 9h ou 16h
📅 Sexta 17/01 → 11h

Qual você prefere?

Paciente: "Quarta às 9h"

🤖 Bot: ✅ Agendado!

📋 Resumo do seu agendamento:
• Procedimento: Harmonização facial
• Data: Quarta-feira, 15/01
• Horário: 9h00
• Profissional: [Nome]
• Endereço: [Endereço da clínica]

Você receberá uma confirmação 24h antes 🔔

Alguma dúvida? É só responder aqui.
```

---

## Fluxo 2: Lembrete D-1 (reduz no-show)

```
🤖 Bot: Oi [Nome]! 👋

Lembramos que você tem agendamento amanhã:

📋 [Procedimento]
📅 [Data] às [Horário]
📍 [Endereço]

Sua consulta está confirmada?

1️⃣ Sim, estarei lá ✅
2️⃣ Preciso remarcar

[Se "Sim"]
🤖 Bot: Ótimo! Te esperamos amanhã. 
Qualquer dúvida, é só chamar aqui 😊

[Se "Remarcar"]
🤖 Bot: Sem problema! Veja os próximos horários disponíveis:

📅 [Lista de horários]

Qual você prefere?
```

---

## Fluxo 3: Retorno (30 dias após procedimento)

```
🤖 Bot: Oi [Nome]! Tudo bem? 😊

Já faz 30 dias desde seu procedimento de [Serviço] aqui na [Clínica X].

Como você está se sentindo com o resultado?

Muitos pacientes retornam nesse prazo para [benefício do retorno].

Quer agendar uma avaliação de retorno?

1️⃣ Sim, quero agendar
2️⃣ Ainda não, obrigado(a)

[Se "Sim"]
🤖 Bot: Que ótimo! Temos horários disponíveis:
[Lista de horários]
```

---

## Por que isso funciona (explicar ao lead)

| Situação | Sem automação | Com automação |
|----------|---------------|---------------|
| Lead chega fora do horário | Fica sem resposta até amanhã → esfria | Resposta em <30s → agenda na hora |
| Paciente vai faltar | Clínica não sabe até na hora → buraco na agenda | Lembrete D-1 → paciente confirma ou remarca |
| Paciente sumiu após procedimento | Não volta, sem follow-up | Mensagem em 30 dias → 40-60% retornam |
| Atendente ocupada | Paciente espera → desiste | Bot responde → atendente só confirma |

**Resultado típico:** 30–50% menos no-show, 40–60% mais retorno.
