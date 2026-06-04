# [Nome da Agência] — LBCode.IA

> Perfil **agência** — equipe pequena entregando pra múltiplos clientes.
> O sistema gira em torno de prospecção, proposta, produção e relatório.
> O `/sistema-instalar` adapta esse molde com a sua realidade.

## O que é esse workspace

[Uma frase do que essa pasta representa. Ex: "Operação da agência.
Aqui ficam todos os clientes, propostas, conteúdo e relatórios."]

**Estrutura de pastas:**
- `_memoria/` — quem é a agência, como falamos, foco atual, framework
- `identidade/` — marca da agência (aplicada nas peças internas)
- `clientes/` — uma subpasta por cliente, autossuficiente
- `briefings/` — briefings de prospects ainda não fechados
- `propostas/` — propostas em andamento
- `marketing/` — conteúdo institucional da agência
- `saidas/` — documentos pontuais, análises
- `dados/` — arquivos a analisar (relatórios de cliente, exports de ads)
- `scripts/` — utilitários de geração de imagem e publicação
- `transcricoes/` — conteúdo extraído de vídeos e referências
- `tarefas.md` — pipeline comercial e operacional

## Sobre a agência

Somos uma [tipo: agência de tráfego / marketing digital / conteúdo / IA].
Atendemos [perfil de cliente real — segmento, porte, região].
Nossos serviços principais:

- [serviço 1: ex. gestão de tráfego Meta + Google]
- [serviço 2: ex. produção de conteúdo]
- [serviço 3: ex. consultoria de IA]

Time: [N pessoas]. Capacidade: [N clientes ativos simultâneos].

## Clientes ativos

[Lista. O `/sistema-atualizar` mantém isso sincronizado com `clientes/`.]

## Pipeline comercial

- **Prospecção:** [como captamos novos clientes]
- **Diagnóstico:** [como qualificamos — ex. diagnóstico grátis 30min]
- **Proposta:** [formato — ex. HTML gerado pelo `/venda-proposta`]
- **Follow-up:** [cadência pós-proposta]

## Tom de voz

[Como a agência se comunica — com cliente, em conteúdo público.
Frase real ajuda mais que adjetivos.]

Evitar: [o que destoa do posicionamento]

## Regras do sistema

- Cliente novo → criar pasta `clientes/<Nome>/` com `briefing.md`, `estrategia.md`
  e subpastas `conteudo/`, `ads/`, `relatorios/`
- Proposta nova → `propostas/<cliente>-<data>.html` antes de fechar
- Relatório mensal → `clientes/<Nome>/relatorios/<mes>.md`
- Caso de sucesso → `clientes/<Nome>/caso.md` (reutilizar em pitches)

## Skills principais

- `/venda-prospectar` — montar lista de prospects qualificados
- `/venda-dossie` — pesquisar prospect antes da abordagem
- `/venda-proposta` — gerar proposta comercial em HTML
- `/venda-follow-up` — sequência pós-proposta
- `/meta-relatorio` — relatório mensal de performance Meta
- `/google-ads` — criar/ajustar campanhas Google
- `/conteudo-carrossel` — conteúdo de autoridade pra agência
- `/negocio-analisar-dados` — análise de resultado de cliente

## Ferramentas conectadas

- [ ] Notion
- [ ] Gmail
- [ ] Google Calendar
- [ ] Meta Ads
- [ ] Google Ads

*(Marcar conforme for instalando os MCPs)*
