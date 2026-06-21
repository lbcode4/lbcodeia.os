---
name: lb-venda-objecoes
description: >
  Banco de respostas para as 10 objeções mais comuns na venda B2B de SaaS para empresas.
  Cada objeção tem: validação, reframing, prova social/dado e pergunta de avanço.
  Use quando o usuário pedir "como responder X", "objeções", "cliente falou Y",
  "o que digo quando...", "script de objeções", "banco de objeções", ou /lb-venda-objecoes.
---

# /lb-venda-objecoes — Banco das 10 objeções + contornos

"Objeção não é rejeição. É pedido de mais informação."

## Dependências

- **Contexto:** `_memoria/empresa.md` — ler antes pra calibrar preço e oferta atual
- **Tom:** `_memoria/preferencias.md`
- **Outputs:** `saidas/marketing/prospeccao/venda-objecoes.md` (arquivo fixo — atualizado a cada uso)

---

## Modos

**Modo A — Consulta pontual:** usuário quer resposta pra objeção específica
→ Mostrar só o script da objeção pedida, inline

**Modo B — Banco completo:** usuário quer todas as 10 ou arquivo atualizado
→ Gerar/sistema-atualizar `saidas/marketing/prospeccao/venda-objecoes.md`

---

## Workflow

### Passo 1 — Ler contexto

Ler `_memoria/empresa.md` pra calibrar:
- Preço atual do produto
- Cases ou resultados concretos disponíveis
- Diferenciais vs concorrentes

### Passo 2 — Estrutura de cada contorno

Para cada objeção, aplicar 4 passos em ordem:
1. **Validar** — sem discutir a objeção; "Faz sentido pensar assim."
2. **Reframing** — mudar perspectiva sem atacar o ponto de vista
3. **Prova ou dado** — reforçar com evidência concreta (se disponível)
4. **Pergunta de avanço** — mover a conversa pra frente

### Passo 3 — As 10 objeções

---

#### 1. "Já tenho sistema / já tenho CRM"

**Validar:** "Ótimo, ter sistema já é um passo à frente da maioria."

**Reframing:** "[seu produto] não substitui o que você já usa — ele adiciona uma camada de IA que responde leads no WhatsApp 24/7 e agenda automaticamente. O sistema de gestão recebe os dados já organizados."

**Prova:** "A maioria das empresas que usa tem outro software rodando junto — eles se integram sem problema."

**Avanço:** "Qual sistema você usa hoje? Posso mostrar como a integração funciona."

---

#### 2. "É caro / não tenho orçamento"

**Validar:** "Entendo, é importante garantir que o investimento faz sentido antes de fechar."

**Reframing:** "O que custa mais: R$[preço]/mês ou continuar perdendo leads que chegam fora do horário e não recebem resposta? Uma empresa com ticket médio de R$300 e 5 leads perdidos por semana perde R$6.000/mês."

**Prova:** "[ROI do diagnóstico, se foi feito — ou: 'Cenário conservador: +15% de ocupação da agenda = +R$X/mês']"

**Avanço:** "Você sabe hoje quantos leads chegam no WhatsApp depois das 18h?"

---

#### 3. "Não tenho tempo pra implementar"

**Validar:** "Dono de empresa não tem tempo sobrando mesmo — totalmente válido."

**Reframing:** "A implementação é nossa — você não faz nada além de aprovar o roteiro do agente numa reunião de 30 minutos. Cuidamos de tudo o mais."

**Prova:** "Tempo médio de onboarding: 5 dias úteis. Agente no ar na semana seguinte."

**Avanço:** "Posso te mostrar o processo em 10 minutos?"

---

#### 4. "Vou pensar / vou avaliar"

**Validar:** "Claro, decisão importante merece cuidado."

**Reframing:** "Prefiro resolver qualquer dúvida agora do que deixar você com uma pergunta sem resposta."

**Prova:** — (não aplicável aqui — focar na objeção real por trás do "vou pensar")

**Avanço:** "Na escala de 1 a 10, qual a chance de fechar? O que precisaria mudar pra chegar mais perto do 10?"

---

#### 5. "Não confio em IA / cliente não gosta de robô"

**Validar:** "Essa preocupação faz todo sentido — atendimento em saúde precisa de cuidado especial."

**Reframing:** "O agente não substitui o atendimento humano. Ele qualifica, agenda e responde dúvidas simples. A consulta, o exame, o cuidado — esse é o médico. O agente libera a equipe pra focar no que importa."

**Prova:** "Cliente não percebe que é IA quando a conversa é bem configurada. A percepção é 'atendimento rápido' — que é exatamente o que o cliente quer."

**Avanço:** "Posso te mostrar uma conversa real de como o agente responde antes de você decidir?"

---

#### 6. "Já tentei IA antes e não funcionou"

**Validar:** "Já vi muito produto de IA que promete e não entrega. A desconfiança é legítima."

**Reframing:** "O que não funcionou — o agente não sabia responder, não agendava de verdade, ou a equipe não usou? Dependendo da causa, a solução é completamente diferente."

**Prova:** — (demonstração prática vale mais que qualquer argumento aqui)

**Avanço:** "Que tal fazer um teste rápido de 15 minutos conversando com o nosso agente? Você vê o que entrega antes de decidir qualquer coisa."

---

#### 7. "Prefiro contratar uma pessoa / atendente"

**Validar:** "Ter time presencial é ótimo — e tem coisas que só pessoa humana faz."

**Reframing:** "Atendente custa R$1.500-2.500/mês, trabalha 8h/dia, não responde de madrugada nem sábado à noite. [seu produto] por R$[preço]/mês, 24/7, sem férias, sem rescisão."

**Prova:** "Não é uma coisa ou outra — empresas que têm atendente usam IA pra cobrir horários e volume. A atendente faz o que IA não faz: acolhimento, pós-consulta, relacionamento."

**Avanço:** "Quando sua atendente tira férias, o que acontece com os leads que chegam nesse período?"

---

#### 8. "Minha empresa é pequena / não preciso disso agora"

**Validar:** "Faz sentido avaliar o tamanho antes de investir."

**Reframing:** "Empresa pequena perde proporcionalmente mais por lead sem resposta — não tem estrutura pra acompanhar tudo. IA é exatamente o que dá escala sem precisar contratar."

**Prova:** "Quanto mais cedo implementa, mais dados o agente acumula e melhora."

**Avanço:** "Quantos clientes novos você atende por mês hoje? Me conta mais da operação."

---

#### 9. "Quero esperar o negócio estabilizar"

**Validar:** "Lógico — não quer arriscar recurso com incerteza."

**Reframing:** "A estabilização vem de mais clientes. Mais clientes vem de não perder lead. IA resolve exatamente o que trava a estabilização."

**Prova:** "[ROI do diagnóstico se disponível]"

**Avanço:** "O que significaria pra você a empresa 'estabilizar'? Um número de clientes? Um faturamento específico?"

---

#### 10. "Não sei se minha equipe vai usar"

**Validar:** "Adoção de ferramenta nova é o gargalo real de qualquer implementação — você está certo em pensar nisso."

**Reframing:** "Justamente por isso o agente fica no WhatsApp — onde a equipe já trabalha hoje. Não é um sistema novo pra aprender. É o mesmo número, agora com IA respondendo nos horários que a equipe não consegue."

**Prova:** "Treinamento de equipe incluído no onboarding. 30 minutos. Feito por nós."

**Avanço:** "Qual seria a maior resistência da sua equipe — tecnologia, mudança de processo, ou outra coisa?"

---

## Output

Salvar/sistema-atualizar em `saidas/marketing/prospeccao/venda-objecoes.md`.

Arquivo fixo — não criar novo a cada uso. Adicionar objeções novas à medida que surgirem no campo.

---

## Regras

- **Nunca inventar prova social** — se não tem case real, usar demonstração prática
- **Pergunta de avanço é obrigatória** — objeção sem pergunta = conversa morta
- **Validar primeiro sempre** — discutir a objeção diretamente gera reação defensiva
- **Atualizar arquivo** quando usuário trazer objeção nova não listada
- **Modo A (consulta pontual)** — mostrar só a objeção pedida, não o banco inteiro
- **Calibrar preço** — ler `_memoria/empresa.md` antes pra usar valor correto nas respostas
