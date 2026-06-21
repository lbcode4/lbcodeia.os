---
name: lb-google-meu-negocio
description: >
  Otimização completa de Google Business Profile (GBP / Google Meu Negócio / GMN). Aplica
  lógica do Bolo de Cenoura em todos os campos — nome+keyword+bairro, descrição 750 chars,
  5-8 perguntas&respostas pré-cadastradas com termo-alvo, respostas-template pra avaliações,
  fotos com nomes de arquivo otimizados (barbearia-premium-moema.jpg), 4 posts iniciais +
  calendário. Inclui checklist de tempo (esperar 5 dias, máx 3 fotos/dia).
  Use quando o usuário pedir "otimizar google meu negócio", "configurar ficha google",
  "gbp", "gmn", "google business profile", ou /lb-google-meu-negocio.
---

# /lb-google-meu-negocio — Google Business Profile completo

GBP = rede social do Google. Aparece na hora da pesquisa de serviço. **~90% dos negócios não otimiza** → ganho fácil.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md` — OBRIGATÓRIO (Bolo Cenoura)
- **Contexto do negócio:** `_memoria/empresa.md`
- **Tom de voz:** `_memoria/preferencias.md`
- **Pesquisa SEO (se existir):** `saidas/marketing/google-seo/01-pesquisa-demanda.md` — usa top keywords
- **Identidade visual:** `identidade/design-guide.md` (cores/fontes pra fotos quando aplicável)
- **WebSearch:** pra ver perfil atual
- **Outputs:** `saidas/marketing/gbp/<YYYY-MM-DD>/`

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
2. Top 5-10 palavras-chave do nicho identificadas (rodar `/lb-google-seo passo 1` antes — opcional, skill puxa de `_memoria/empresa.md` se vazio)
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

### Passos 2-8 — Otimização de cada campo (Bolo de Cenoura)

**Carregar `reference/campos-bolo-cenoura.md`** e executar em sequência —
templates + exemplos prontos de cada campo:

| Passo | Campo |
|-------|-------|
| 2 | Nome otimizado (keyword + bairro) |
| 3 | Categoria principal + secundárias |
| 4 | Descrição (750 chars) |
| 5 | Perguntas & Respostas pré-cadastradas (5-8) |
| 6 | Respostas-template pra avaliações |
| 7 | Fotos com nomes de arquivo otimizados |
| 8 | 4 posts iniciais + calendário |

Salvar cada saída no arquivo correspondente (ver seção **Output**).

### Passo 9 — Checklist de tempo (CRÍTICO)

- ⏱ **Esperar 5 dias** após pegar acesso antes de alterar QUALQUER campo (Google penaliza mudanças rápidas)
- 📸 **Máximo 3 fotos/dia** (volume alto = spam)
- 📝 **1 post/semana** mínimo (algoritmo gosta de consistência)
- 💬 **Responder 100% das avaliações** em até 48h

---

## Output

```
saidas/marketing/gbp/<YYYY-MM-DD>/
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

1. **Rodar Campanha #3 — Dominação Top 1** (botão Anunciar dentro do GBP) — chamar `/lb-google-ads` modo B. R$100-300/mês move agulha pra negócio local
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
