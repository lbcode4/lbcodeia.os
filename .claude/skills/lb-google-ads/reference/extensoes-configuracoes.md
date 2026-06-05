# Passos 5-6 — Extensões (OPA-A) + Configurações & Público (OPA-O + OPA-P)

## Passo 5 — OPA-A continuação: Extensões

Gerar CSVs separados pra cada tipo de extensão:

- **Sitelinks** (4-6): "Sobre nós", "Catálogo", "Cases", "WhatsApp", "Localização"
- **Callouts** (6-8 frases curtas, max 25 chars): diferenciais sem CTA — "Sem fidelidade", "Implantação em dias", "Suporte humano", "IA First", "Setup guiado". Formato CSV simples: Campaign, Callout text, Status.
- **Chamadas** (telefone): puxar de `_memoria/empresa.md`. Se não tiver telefone, **não gerar este arquivo** — documentar o motivo em `configuracoes.md`.
- **Snippets estruturados:** lista de serviços, categorias de produto
- **Preço** (se aplicável): faixas de preço dos serviços principais — só gerar se preço estiver confirmado/publicado
- **Promoção** (se aplicável): desconto, condição especial

## Passo 6 — OPA-O + OPA-P: Configurações + Público

Gerar arquivo `configuracoes.md` com:

**Lances (OPA-O continuação):**
- Estratégia: focar em **Conversões** (não cliques)
- **Conta nova / zero histórico de conversão → Manual CPC** (lance máx R$3-8 conforme nicho). Motivo: "Maximizar Conversões" sem dados gasta de forma errática e estoura CPA. Manual CPC dá teto previsível e coleta dados limpos.
- **Migrar pra "Maximizar Conversões"** após ~15-20 conversões registradas.
- **Migrar pra "Maximizar Conversões com tCPA"** após 30+ conversões. CPA-alvo inicial = usar estimativa de custo/lead do briefing ou SEO; ajustar com dado real.
- Conta com histórico (30+ conv/mês) → pode começar direto em "Maximizar Conversões".

**Redes:**
- Só **Rede de Pesquisa**
- **Remover parceiros de pesquisa** (funcionam pior)

**Orçamento:**
- Diário (gastar em 24h, aparecer 24/7) OU
- Total (gastar entre 2 datas, quando programa horários)

**Segmentação geográfica (OPA-P):**
- Cidade/CEP/**alfinete no mapa + raio** (mudar milhas→km)
- Raio inicial ~1 km pra negócio local com endereço específico
- **Opção de local = "Presença"** (quem ESTÁ no local). NUNCA "Interesse"

**Idioma:**
- Sempre **português + inglês + espanhol** (captura busca de gringos/expats)

**Datas + programação de anúncios:**
- Início/fim
- Dias/horários (mín. blocos de 15 min; ex.: 8h-18h seg-sex pra negócio horário comercial)

**Dispositivos:**
- Ajustes recomendados (mobile +0%, desktop +0%, tablet -20%)

**Conversões a configurar (obrigatório antes de ativar):**
- Clique no WhatsApp
- Envio de formulário
- Ligação telefônica
- Tempo no site (>2 min como micro-conversão)

> Sem conversão configurada, Google não otimiza. Relatar isso e exigir setup antes de ativar.
