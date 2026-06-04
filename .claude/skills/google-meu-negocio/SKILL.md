---
name: lb-google-meu-negocio
description: >
  Otimização completa de Google Business Profile (GBP / Google Meu Negócio / GMN). Aplica
  lógica do Bolo de Cenoura em todos os campos — nome+keyword+bairro, descrição 750 chars,
  5-8 perguntas&respostas pré-cadastradas com termo-alvo, respostas-template pra avaliações,
  fotos com nomes de arquivo otimizados (barbearia-premium-moema.jpg), 4 posts iniciais +
  calendário. Inclui checklist de tempo (esperar 5 dias, máx 3 fotos/dia).
  Use quando o usuário pedir "otimizar google meu negócio", "configurar ficha google",
  "gbp", "gmn", "google business profile", ou /google-meu-negocio.
---

# /google-meu-negocio — Google Business Profile completo

GBP = rede social do Google. Aparece na hora da pesquisa de serviço. **~90% dos negócios não otimiza** → ganho fácil.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (Bolo Cenoura)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Pesquisa SEO (se existir):** `marketing/google-seo/01-pesquisa-demanda.md` — usa top keywords
- **Identidade visual:** `identidade/design-guide.md` (cores/fontes pra fotos quando aplicável)
- **WebSearch:** pra ver perfil atual
- **Outputs:** `marketing/gbp/<YYYY-MM-DD>/`

---

## Princípio central

Aplicar **Bolo de Cenoura** em TODOS os campos da ficha — cercar termo-alvo por todos os lados:
- Nome → keyword
- Categoria → tema
- Descrição → keywords naturais
- Perguntas&Respostas → termo-alvo explícito
- Respostas a avaliações → termo-alvo + bairro
- Nomes de arquivo das fotos → keyword
- Posts → keyword + bairro

Ficha redundante (sem soar spam) > ficha vaga.

---

## Pré-requisitos

1. Acesso ao GBP do cliente (cliente vai em 3 pontinhos → Configuração da empresa → libera pra seu email — NÃO passar senha). **Se NÃO tem GBP ainda, skill cria do zero — pular esse item**
2. Top 5-10 palavras-chave do nicho identificadas (rodar `/google-seo passo 1` antes — opcional, skill puxa de `_memoria/empresa.md` se vazio)
3. **Aguardar 5 dias** após pegar acesso antes de alterar (Google penaliza mudanças rápidas)

---

## Workflow

### Passo 0 — ENTREVISTA GUIADA (15 itens)

Skill cobre 2 casos: **criar GBP do zero** OU **atualizar existente**. Em ambos, começa coletando dados do dono via entrevista numerada (padrão definido em `_memoria/framework-trafego.md`).

Apresentar mensagem:

> "Pra começar a otimização completa do seu Google Business Profile, me envie as informações abaixo. Pode responder no formato `1 - X, 2 - Y` ou separado por linhas:
>
> 1. Nome da empresa
> 2. Nicho/segmento (ex: empresa de estética, pizzaria, escritório de advocacia)
> 3. Cidade + bairro de atuação
> 4. Lista de serviços ou produtos oferecidos
> 5. Telefone
> 6. Site (se tiver)
> 7. Endereço físico (se tiver — se não tem, escreva 'sem endereço, atendimento online/domicílio')
> 8. Horário de funcionamento (dias e horários)
> 9. Data de fundação (mês e ano)
> 10. Tipo de atendimento: presencial, delivery/deslocamento, online, ou combinação?
> 11. Áreas de atendimento (cidades, bairros ou regiões — se atender fora do ponto fixo)
> 12. Diferenciais do negócio (o que torna essa empresa diferente das concorrentes?)
> 13. Público-alvo principal (quem são os clientes ideais?)
> 14. Perguntas que clientes mais fazem antes de contratar ou comprar
> 15. Já tem GBP ativo? (Sim/Não — se sim, qual o URL ou nome exato como aparece no Maps?)"

**Pré-preenchimento automático:** antes de mostrar a mensagem, ler `_memoria/empresa.md` — se já houver nome, nicho, cidade, site, telefone preenchidos, **mostrar como rascunho** (`1 - [seu produto] (do empresa.md, confirma?)`) e pedir só o que falta.

**Validação:**
- Itens obrigatórios mínimos: 1, 2, 3, 4 (sem isso skill não roda)
- Itens 6 (site), 7 (endereço) e 15 (GBP existe) podem ser vazios
- Se faltar obrigatório: pedir só o que faltou ("Faltam itens 9 e 11. Pode me responder só esses?")

**Confirmação:**
Antes de gerar pacote, mostrar resumo:
> "Confirma esses dados? [bloco com tudo coletado]. Quer ajustar algo antes de seguir?"

Só então rodar Passo 1.

### Passo 1 — Diagnóstico do estado atual

Se item 15 da entrevista = **Sim** (tem GBP):
- WebSearch: `<nome do negócio> <cidade>` → ver ficha que aparece
- Capturar:
  - Nome atual no GBP
  - Categoria principal + secundárias
  - Avaliação (estrelas + nº reviews)
  - Fotos (quantas, qualidade)
  - Última publicação (se houver)
  - Perguntas&Respostas (quantas, respondidas?)
- Comparar com o que vai ser gerado nos próximos passos → marcar **gaps**

Se item 15 = **Não** (sem GBP):
- Pular busca
- Marcar como **criação do zero**
- Output do Passo 9 (cronograma) começa com "criar a ficha"

### Passo 2 — Nome otimizado (keyword + bairro)

Adicionar keyword + bairro ao nome quando política Google permitir.

Exemplos:
- "Barbuda" → **"Barbuda Barbearia Premium Moema"**
- "Dr. Silva" → **"Dr. Silva Dermatologista Pinheiros"**
- "Studio Z" → **"Studio Z Pilates Vila Madalena"**

⚠️ Não exagerar — Google penaliza keyword stuffing. Adicionar SÓ termo natural + bairro/cidade.

### Passo 3 — Categoria principal + secundárias

**Pesquisar:** Google Categories Helper ou listagem de categorias do GBP.

Padrão: 1 principal + 2-5 secundárias.

Exemplos:
- Empresa odonto: principal "Dentista", secundárias "Empresa odontológica", "Implantodontista", "Ortodontista"
- Barbearia: principal "Barbearia", secundárias "Barbeiro", "Esteticista masculino"

### Passo 4 — Descrição (750 caracteres)

Estrutura:
1. **Frase 1 (até 100 chars):** quem é + onde atende + diferencial principal — embute keyword principal
2. **Parágrafo do meio:** serviços principais + dor que resolve
3. **Frase final:** CTA suave + horário/endereço

Exemplo (empresa estética):
```
Empresa de estética em Pinheiros especializada em harmonização facial,
limpeza de pele e tratamentos com tecnologia. Atendemos com agendamento
automático pelo WhatsApp, equipe formada por dermatologistas e
biomédicos, e protocolo personalizado pra cada cliente. Mais de 800
clientes atendidos desde 2018. Agende sua avaliação gratuita pelo
WhatsApp ou diretamente aqui no Google. Aberto seg-sex 9h-19h e sab 9h-14h.
```

Tom: conforme `_memoria/preferencias.md`.

### Passo 5 — Perguntas & Respostas pré-cadastradas (5-8)

⚠️ **Você mesmo cria as perguntas + responde** embutindo termo-alvo.

99% dos negócios ignora esse campo = oportunidade fácil.

Modelo:
```
P: Vocês fazem [serviço-chave] em [bairro]?
R: Sim, somos especialistas em [serviço-chave] aqui na [Nome do negócio
com bairro]. Atendemos com [diferencial]. Agende pelo WhatsApp [link] ou
chame por aqui no Google.
```

Exemplos pra empresa:
- "Vocês fazem botox em Pinheiros?"
- "Tem agendamento pelo WhatsApp?"
- "Atendem convênio?"
- "Qual o horário de funcionamento?"
- "Vocês fazem avaliação gratuita?"
- "Têm estacionamento?"
- "Qual a forma de pagamento?"

Cada resposta repete o termo-alvo + bairro pelo menos 1x.

### Passo 6 — Respostas-template pra avaliações

Pra `/google-avaliacoes` consumir. SEMPRE repetir termo-alvo + bairro.

**Positiva (5⭐):**
```
Obrigado [Nome]! Que bom que gostou do [serviço] aqui na [Nome do negócio].
A gente caprichou no atendimento e fica feliz que tenha sentido. ❤️
```

**Negativa (1-2⭐):**
```
[Nome], obrigado pelo feedback. Lamentamos que sua experiência com
[Nome do negócio] em [bairro] não foi positiva. Quer contar mais detalhes
pra gente resolver? Fala com a gente: [WhatsApp].
```

**Detalhada:** chamar `/google-avaliacoes` que já segue padrão.

### Passo 7 — Fotos com nomes de arquivo otimizados

Checklist mínimo:
- 1× fachada
- 3-5× interior
- 5-10× produtos/serviços/procedimentos
- 1-3× equipe (com permissão)
- 1× logo grande

**Renomear ANTES de subir** — Google indexa o nome do arquivo:

❌ `IMG_1234.jpg`
✅ `barbearia-premium-moema-fachada.jpg`
✅ `clinica-estetica-pinheiros-recepcao.jpg`
✅ `harmonizacao-facial-pinheiros.jpg`

Padrão: `<keyword>-<bairro>-<descrição-do-conteúdo>.jpg`

⚠️ Especificações:
- Mínimo 720×720px
- JPG ou PNG
- **Máximo 3 fotos/dia** — volume alto sinaliza spam

### Passo 8 — 4 posts iniciais + calendário

**4 posts pra subir nos primeiros 30 dias:**
1. Apresentação (Quem somos + diferenciais)
2. Serviço principal (foto + benefício + CTA)
3. Depoimento/case
4. Promoção/oferta atual (ou novidade)

Cada post:
- 150-300 caracteres
- Inclui termo-alvo + bairro
- CTA claro
- 1 imagem (com nome de arquivo otimizado)

**Calendário recorrente:** 1 post/semana mínimo.

### Passo 9 — Checklist de tempo (CRÍTICO)

- ⏱ **Esperar 5 dias** após pegar acesso antes de alterar QUALQUER campo (Google penaliza mudanças rápidas)
- 📸 **Máximo 3 fotos/dia** (volume alto = spam)
- 📝 **1 post/semana** mínimo (algoritmo gosta de consistência)
- 💬 **Responder 100% das avaliações** em até 48h

---

## Output

```
marketing/gbp/<YYYY-MM-DD>/
  00-diagnostico.md     ← estado atual da ficha
  01-nome-categoria.md  ← nome novo + categorias
  02-descricao.md       ← 750 caracteres pronto
  03-perguntas-respostas.md  ← 5-8 P&R pra copiar
  04-respostas-avaliacoes.md ← templates positiva/negativa
  05-fotos-checklist.md ← lista do que tirar + nomes de arquivo
  06-posts-iniciais.md  ← 4 posts prontos + calendário
  07-checklist-tempo.md ← cronograma 30 dias
  README.md             ← ordem de execução + acesso ao GBP
```

---

## Próximos passos

Após otimização completa, oferecer:

1. **Rodar Campanha #3 — Dominação Top 1** (botão Anunciar dentro do GBP) — chamar `/google-ads` modo B. R$100-300/mês move agulha pra negócio local
2. **Cadastrar em diretórios** (Bing Places, Apple Maps, etc.) com NAP consistente
3. **Monitorar** posições + reviews semanalmente

---

## Preço de mercado declarado (referência)

Se for vender essa otimização como serviço:
- **Setup: R$500** (entrega tudo otimizado)
- **Mensal: R$300** (~30-40 min/semana — responder avaliações, postar 1×, monitorar)

Pra cliente que fatura R$10-50k/mês isso é insignificante perto do retorno (mais ligações + visitas).

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes
- **Sempre Bolo de Cenoura** em TODOS os campos
- **Sempre esperar 5 dias** após pegar acesso
- **Máx 3 fotos/dia** (sempre)
- **NUNCA pedir senha** — só acesso via Configurações → email
- **NUNCA exagerar keyword no nome** (Google penaliza spam)
- **Sempre renomear fotos** antes de subir
- **Sempre criar P&R próprias** (campo ignorado por concorrentes)
- **Tom segue `_memoria/preferencias.md`** estritamente
