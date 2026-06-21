# 🎬 Vídeo 19 — `/lb-meta-campanha-whatsapp`

> **Bloco 4 — Tráfego pago.** Duração alvo: 7–9 min · Sem front.
> **Campanha de Ouro #2 — Vendas 1-a-1 no WhatsApp.**

## 🎯 Objetivo do vídeo
Criar a Campanha de Ouro #2 via Meta Ads (Gerenciador de Anúncios): 7 passos prontos pra copiar/colar — objetivo, nome, orçamento CBO, conjunto com destino WhatsApp, público manual (recusa Advantage), posicionamento sem Facebook, criativos 1:1 + 9:16, mensagem inicial. Desativa todos os aprimoramentos Meta.

## 💡 Dor → solução
- **Dor:** a Meta empurra automações (Advantage) que gastam mal pra quem quer conversa qualificada.
- **Solução:** roteiro manual passo a passo que mantém controle total da segmentação.

## 🧠 Framework por trás
- **4 Campanhas de Ouro (#2)** + **OPA** na mensagem inicial (oferta/proposta/ação).

## ⌨️ Prompt pra gerar a skill (cole no Claude Code)

### Versão simples — pra mostrar a forma rápida no vídeo
```
Crie a skill lb-meta-campanha-whatsapp em .claude/skills/lb-meta-campanha-whatsapp/SKILL.md.

Objetivo: montar a Campanha de Ouro #2 (conversas no WhatsApp) no Gerenciador de Anúncios.
- 7 passos prontos pra copiar/colar: objetivo, nome, orçamento CBO, conjunto com
  destino WhatsApp, público manual (RECUSA Advantage), posicionamento sem Facebook,
  criativos 1:1 + 9:16, mensagem inicial do WhatsApp (aplicar OPA).
- SEMPRE desativar todos os aprimoramentos/Advantage da Meta.
- Adaptar a mensagem inicial ao modelo de negócio.
- Gatilhos: "campanha pra WhatsApp", "anúncio que cai no zap",
  "gerar conversas WhatsApp", /lb-meta-campanha-whatsapp.
```

### Versão completa — gera a skill igual à minha
```
Crie a skill lb-meta-campanha-whatsapp em .claude/skills/lb-meta-campanha-whatsapp/SKILL.md.
Premissa: a melhor venda pra qualquer negócio é 1-a-1 no WhatsApp; a skill monta tudo pra
subir via Gerenciador de Anúncios.

FRONTMATTER:
- name: lb-meta-campanha-whatsapp
- description: Cria Campanha de Ouro #2 (Vendas 1-a-1 no WhatsApp) via Meta Ads. Gera 7
  passos prontos pra copiar-colar no Gerenciador: objetivo, nome, orçamento CBO, conjunto
  com destino WhatsApp, público manual (recusa Advantage), posicionamento sem Facebook,
  criativos 1:1 + 9:16, mensagem inicial. Sempre desativa todos os aprimoramentos Meta.
  Gatilhos: "campanha pra WhatsApp", "anúncio que cai no zap", "gerar conversas WhatsApp",
  /lb-meta-campanha-whatsapp.

DEPENDÊNCIAS: _memoria/framework-trafego.md (OBRIGATÓRIO — OPA, GCC, regras Meta),
_memoria/empresa.md, _memoria/preferencias.md, identidade/design-guide.md; rodar
/lb-conteudo-auditoria-insta antes (recomendado); 99 scripts WhatsApp se existir. Output
em saidas/marketing/campanhas/conversao/meta-whatsapp-<YYYY-MM-DD>/.

PRÉ-REQUISITOS: conta Meta Business + Gerenciador; WhatsApp Business conectado; pagamento
ativo; perfil IG organizado; pixel/conversões ativas.

WORKFLOW — 7 PASSOS DO GERENCIADOR:
1. Objetivo: Criar -> Engajamento -> campanha MANUAL (NÃO a "personalizada/varinha mágica").
2. Nomear: "Mensagem WhatsApp | <Cidade/Bairro> | <Produto/Serviço>".
3. Orçamento: ativar CBO; diário (24/7) ou total (programar horários).
4. Conjunto (destino + programação): destino = WhatsApp (código 6 dígitos; nunca >1
   destino); datas + fuso São Paulo; programação por quadradinhos (mín 15 min).
5. Público (OPA-P): CRÍTICO descer ao Advantage e clicar "trocar para opções originais"
   (ignorar o "-9,7% custo"); público manual (personalizados + localização por CEP ou
   pino+raio ~1km — validar BRASIL, default cai na França; cuidado com bairro "Brasil" na
   BA); idade + gênero por persona.
6. Posicionamento manual: Instagram (Feed/Stories/Reels) + WhatsApp; DESMARCAR Facebook e
   Audience Network.
7. Anúncio (OPA-A): nome "AD001 <Produto>"; identidade Página FB + IG; sempre 2 formatos
   (1:1 feed + 9:16 stories); estrutura GCC (gancho 1 dos 4 tipos + corpo + CTA "Chama no
   WhatsApp"); 5+ textos principais e 3+ títulos; DESATIVAR TODOS os aprimoramentos Meta
   (essenciais, comentários, expansão, música, texto); editar a mensagem inicial do
   WhatsApp pra identificar qual anúncio gerou a conversa.

OUTPUT: pasta com configuracao.md (7 passos), copies.md, mensagem-inicial.md, criativos/
(ad001-1x1.png, ad001-9x16.png — chamar /lb-conteudo-carrossel se precisar), publicos.md,
followup-script.md, checklist.md.

CHECKLIST PRÉ-ATIVAÇÃO: engajamento manual, CBO ativo, destino WhatsApp validado, fuso SP,
programação definida, público em opções originais (não Advantage), localização Brasil,
Facebook desmarcado, todos aprimoramentos desativados, criativos 1:1+9:16, 5+ textos/3+
títulos, mensagem inicial editada, FB+IG conectados, pagamento ativo.

MÉTRICAS (entram no /lb-meta-relatorio): custo por mensagem iniciada, taxa de resposta,
taxa de qualificação, custo por lead qualificado, taxa de fechamento, frequência (alvo
1.5-3.0).

REGRAS: sempre ler framework-trafego.md; sempre manual (nunca personalizada); sempre
recusar Advantage (<30 dias); sempre desativar aprimoramentos; desmarcar Facebook pra
premium; validar Brasil; sempre 2 formatos; sempre editar mensagem inicial; sempre
pausado primeiro.
```

## ⚙️ Como funciona
1. Roda `/lb-meta-campanha-whatsapp`.
2. Entrega os 7 passos + mensagem inicial.

## 🎥 Roteiro de gravação
1. **Gancho:** "Vou montar a campanha que gera conversa no WhatsApp — sem cair nas armadilhas da Meta."
2. Roda o comando.
3. Percorre os 7 passos no Gerenciador.
4. Destaca o "recusar Advantage".
5. **Fechamento:** "Essa é a #2. A #1 é seguidores qualificados — próximo vídeo."

## 🗣️ Gancho de abertura pronto
> "A Meta quer automatizar sua segmentação — e isso queima dinheiro. Vou montar a campanha de WhatsApp do jeito manual, com controle total."

## ✅ Demonstração ao vivo
- Os 7 passos + mensagem inicial pronta.

## 🔗 Pré-requisitos
- Conta Meta Ads + número WhatsApp Business.
</content>
