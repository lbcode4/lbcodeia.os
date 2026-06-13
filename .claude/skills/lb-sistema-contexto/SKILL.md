---
name: lb-sistema-contexto
description: >
  Abre uma sessão de trabalho do LBCode.IA. Carrega memória operacional
  (empresa, preferências, estratégia, framework, identidade) e devolve briefing
  em 1 frase — quem você é, o que tá em foco, tom de voz. Pronto pra trabalhar.
  Use no início da sessão, ou quando o usuário disser "abrir", "começar",
  "carrega contexto", "/sistema-abrir".
---

# /lb-sistema-contexto — Sessão de trabalho

Abre a máquina. Em uma frase: recalibra quem você é, onde tá o foco, que tom usar.

## Workflow

Ler em ordem (se existirem e não estiverem vazios):

1. `_memoria/empresa.md` — identidade + o que vende
2. `_memoria/preferencias.md` — tom de voz + o que evitar
3. `_memoria/estrategia.md` — foco atual + bloqueadores
4. `_memoria/framework-trafego.md` — framework integrado (não ler na abertura, mas saber que está lá)
5. `identidade/design-guide.md` — branding visual (só pra saber se existe)

---

## Validação

Se algum dos **3 primeiros** estiver vazio (placeholder):

> "Vi que `_memoria/<nome>.md` ainda não foi preenchido.
> Quer rodar `/lb-sistema-onboarding` agora pra completar?"

Parar. Sistema não roda com contexto incompleto.

---

## Resposta (5 linhas máximo)

Se tudo preenchido, devolver síntese:

```
[Empresa] — [o que faz, 1 linha]
Foco: [prioridade da semana]
Tom: [3 palavras descritivas: direto, técnico, casual, etc]
```

Exemplo:
```
Clinic.Up — Agendamento online + prospecção de pacientes
Foco: Auditar Instagram + preparar campanha Meta
Tom: Professional, detalhista, com emojis comedidos
```

Depois:
> "Pronto. O que vamos fazer hoje?"

---

## Regras

- Não listar quais arquivos foram lidos — só usar contexto naturalmente
- Não fazer confirmação de leitura ("li empresa.md, li preferências...")
- Máximo 5 linhas (cabe no terminal)
- Sem pergunta além de "o que vamos fazer?"
- Se `design-guide.md` estiver em branco, ignorar (não mencionar) — vira problema quando skill visual for chamada

---

## Integração ao framework

Internamente, `/lb-sistema-contexto` já sabe que:

- Cada skill de marketing lê `framework-trafego.md`
- Cada skill visual lê `design-guide.md`
- Cada execução é versionada automaticamente via `/lb-sistema-versionar`

Usuário não precisa pensar — é automático. Mas é bom saber que o sistema está **integrado**, não solto.
