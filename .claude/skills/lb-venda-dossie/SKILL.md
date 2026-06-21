---
name: lb-venda-dossie
description: >
  Levanta dossiê de 1 página sobre prospect (cliente em potencial) antes de abordagem.
  Coleta site, CNPJ, dono/sócio, telefone, redes sociais, GBP, se já anuncia (Biblioteca de
  Anúncios Meta), preços/serviços, e 2-3 pontos de conexão específicos pra usar na abordagem.
  Use quando o usuário pedir "levanta dossiê", "stalker do bem", "info sobre [empresa]",
  "pesquisa esse negócio", "dossiê", ou /lb-venda-dossie.
---

# /lb-venda-dossie — Dossiê pra abordagem de prospect

"Quem fecha faz dever de casa e acha que fez pouco." Achar cliente é fácil; **levantar informação é o diferencial**.

## Dependências

- **Framework de tráfego:** `_memoria/framework-trafego.md`
- **WebSearch + WebFetch:** pra pesquisa
- **Outputs:** `saidas/marketing/prospeccao/dossies/<slug-do-prospect>.md`

---

## Workflow

### Passo 1 — Receber identificação
Aceita qualquer combinação de:
- Nome da empresa
- URL do site
- Handle Instagram
- Telefone
- Nome do dono/sócio
- Endereço

Mínimo: 1 desses 5.

### Passo 2 — Coletar dados (paralelo)

**WebSearch:**
- `"<nome empresa>"` — site, redes
- `"<nome empresa>" CNPJ` — registro Receita Federal / Cnpj.biz
- `"<nome empresa>" reclame aqui` — reputação
- `"<dono/sócio>" linkedin` — perfil profissional

**WebFetch:**
- Site oficial (se existir) — extrair: serviços, preços, equipe, telefone, endereço, "sobre"
- Instagram (perfil público): bio, link, métricas básicas
- GBP/Maps: nº avaliações, nota, fotos, última atividade

**Biblioteca de Anúncios Meta:**
- `https://www.facebook.com/ads/library/?country=BR&search_type=keyword_unordered&q=<nome>` — descobre se anuncia
- Se anuncia: pegar criativos atuais, ver "plataformas" (só IG+botão acessar perfil = botão turbinar, pessoa não domina; várias plataformas = gerenciador, sabe mais)
- Se NÃO anuncia: lead quente (margem maior, sem "trauma" de gestor anterior)

**Google operadores (achar email/perfis):**
- `site:instagram.com <nome empresa>` — IG oficial + variações
- `<nome empresa> gmail OR hotmail OR outlook` — email do dono

### Passo 3 — Montar dossiê padrão (1 página)

Template:

```markdown
# Dossiê — <Nome da empresa>
> Levantado em <data> pra abordagem.

## Identificação
- **Razão social:** ...
- **CNPJ:** ...
- **Endereço:** ...
- **Telefone:** ...
- **Site:** ...
- **Instagram:** @<handle> (<N seguidores>)
- **Facebook:** ...
- **LinkedIn:** ...
- **GBP:** <N avaliações> ⭐<nota>

## Pessoas
- **Dono/Sócio principal:** <nome> — <cargo> — <LinkedIn>
- **Email provável:** ...
- **Outros sócios/decisores:** ...

## Negócio
- **O que vende:** ...
- **Como vende:** ... (WhatsApp / loja física / e-commerce / agendamento online)
- **Preço:** ... (faixa, se público)
- **Ticket médio estimado:** ...
- **Tempo de mercado:** desde <ano>

## Status digital
- **Tem site?** Sim/Não — qualidade: Boa/Média/Ruim
- **Já anuncia ativamente?** Sim/Não — onde: Meta / Google / ambos / nenhum
- **Nível de sofisticação:** Botão turbinar / Gerenciador / Agência
- **GBP otimizado?** Sim/Parcial/Não — gaps específicos
- **Instagram (7 elementos):** Score X/7 (rodar `/lb-conteudo-auditoria-insta` se for fundo)
- **Reputação:** Sem reclamações / X reclamações Reclame Aqui / etc

## Métricas-chave estimadas (do agente persona — DONO)
- Faturamento bruto estimado: R$...
- Taxa de ocupação da agenda: ~X%
- LTV/CAC inferido: ...
- Atendimentos/mês: ...

## ⭐ Pontos de conexão (USAR NA ABORDAGEM)
3 fatos específicos que provam pesquisa:
1. <ex.: "Vi que vocês inauguraram a 2ª unidade em Moema mês passado">
2. <ex.: "Notei que vocês usam App Barber pra agenda">
3. <ex.: "Reparei que o post sobre limpeza de pele teve 2k curtidas">

## Gaps que [seu produto] / oferta pode resolver
- ...
- ...

## Status da abordagem
- [ ] Dossiê levantado
- [ ] Mensagem enviada (canal: ___)
- [ ] Resposta recebida em ___
- [ ] Reunião agendada pra ___
- [ ] Resultado: ...
```

### Passo 4 — Salvar

Path: `saidas/marketing/prospeccao/dossies/<slug-do-prospect>.md`
Slug: kebab-case do nome (ex.: "Empresa Dr. Silva" → `clinica-dr-silva`).

### Passo 5 — Próximo passo sugerido

Sempre oferecer:
- *"Quer gerar abordagem personalizada com esse dossiê? (chamo `/lb-venda-prospectar`)"*

---

## Regras

- **Sempre ler `_memoria/framework-trafego.md`** antes
- **Dados reais via WebSearch/WebFetch** — nunca inventar
- **Pontos de conexão devem ser específicos** — "vocês são bons" não conta; "vi que abriram 2ª unidade em Moema" conta
- **Marcar incertezas** — "ticket médio estimado" não é fato, dizer "estimativa"
- **Respeitar privacidade** — só dados públicos. Não usar técnica de scraping invasivo, OSINT só de fontes abertas
- **Se sem site / sem IG público:** dossiê fica curto. Sinalizar limitação ao usuário
- **Não fazer 100 dossiês de uma vez** — qualidade > quantidade. Pra volume usar `/lb-venda-prospectar` (que orquestra)
