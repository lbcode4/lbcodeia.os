# Prompt Lovable — Telas do LBCode Ads (base visual)

> Cole o bloco abaixo no Lovable. Gera **apenas as telas** (UI estática com dados de
> exemplo, sem backend, sem API, sem login real). Serve de base visual do sistema.

---

Crie um web app chamado **LBCode Ads** — um painel (cockpit) de gestão de tráfego pago
que integra Meta Ads e Google Ads, operado com apoio de IA. **Gere APENAS as telas
(frontend), com dados de exemplo (mock) chumbados no código. NÃO crie backend, banco,
autenticação real, nem chamadas de API.** É um protótipo visual navegável.

Stack: React + Tailwind + shadcn/ui + lucide-react (ícones outline). Responsivo (desktop
e mobile). Idioma: **português do Brasil**. Moeda: Real (R$ 1.234,56). Datas em pt-BR.

## Design system (siga à risca — estética "ferramenta profissional", não agência criativa)

- **Cores:**
  - Primária / texto forte: `#1A1A2E` (azul quase preto)
  - CTA / ação / destaque: `#FF6B35` (laranja-terra)
  - Fundo da app: `#F5F5F5`
  - Superfície de cards: `#FFFFFF`
  - Texto secundário / body: `#595959`
  - Bordas: `#E0E0E0`
  - Status: sucesso `#2E9E5B`, alerta `#E0A100`, erro `#D14343` (use com moderação)
- **PROIBIDO:** gradientes, rosa, roxo, sombras pesadas, glassmorphism, neon. Visual limpo e plano.
- **Tipografia:** Inter (ou Outfit). Títulos 600/700, letter-spacing -0.5px, line-height 1.2.
  Corpo 400, 14–16px. Labels 12px.
- **Botões:** fundo `#FF6B35`, texto branco, border-radius 4px, padding 12px 24px, 16px bold.
  Botão secundário: fundo branco, borda `#E0E0E0`, texto `#1A1A2E`.
- **Cards:** fundo branco, borda 1px `#E0E0E0`, sombra quase imperceptível
  `0 2px 4px rgba(0,0,0,0.08)`, padding 24px, cantos 8px.
- **Ícones:** lucide outline, stroke ~2px, cor `#595959` ou `#1A1A2E`, 24px.
- **Dark mode:** inclua toggle claro/escuro no topo. No escuro: fundo `#0F1117`,
  superfície `#1A1D27`, texto `#F5F5F5`, mantendo `#FF6B35` como destaque.

## Layout base (em todas as telas exceto onboarding)

- **Sidebar fixa à esquerda** (colapsável no mobile) com logo "LBCode Ads" no topo e navegação:
  Visão Geral · Dashboard Meta · Diagnóstico Meta · Auditoria Meta · Reels · Gerador de Copy ·
  Gerenciar Anúncios · Dashboard Google · Relatório Unificado · Negativas · Conectar Contas.
  Cada item com ícone outline + label. Item ativo: barra lateral 3px `#FF6B35` + texto `#1A1A2E`.
- **Topbar** com: seletor de cliente (dropdown, ex: "Dordrian Store"), seletor de período
  (Últimos 7/14/30 dias), toggle dark/light, avatar do usuário.
- Conteúdo principal com título da tela + subtítulo curto.

## Dados de exemplo (use em todas as telas)

Cliente ativo: **Dordrian Store** (@dordrianstore). Outros no dropdown: "Loja Beta", "Clínica Sorriso".
Use números realistas de e-commerce (gasto na casa de R$ 3.000–8.000/mês, CTR 0,8–2,5%,
CPA R$ 18–45, ROAS 2–4x). Invente nomes de campanha/anúncio plausíveis.

---

## TELAS (crie todas as 11)

### 1. Conectar Contas (onboarding/configurações)
- Dois cards lado a lado: **Meta Ads** e **Google Ads**. Cada um com ícone, status (badge
  "Conectado" verde ou "Desconectado" cinza) e botão "Conectar"/"Reconectar".
- Meta como "Conectado": abaixo, tabela das contas acessíveis pelo token —
  colunas: Conta | ID (act_…) | Status (Ativo/Desativado). 3 linhas de exemplo.
- Google como "Desconectado": estado vazio com instrução curta "Cole o developer token + OAuth2".
- Seção **"Cadastrar cliente → conta"**: formulário (Nome do cliente, Meta Ad Account,
  IG User ID, Handle IG, Google Ads ID, Ativo) + botão "Salvar".
- Tabela de clientes cadastrados (mock: Dordrian Store, Loja Beta, Clínica Sorriso) com as colunas.

### 2. Visão Geral (home)
- Linha de **KPI cards** cross-platform: Investimento total, Conversões, CPA médio, ROAS —
  cada card com valor grande, label, e delta vs período anterior (seta + % verde/vermelho).
- Duas colunas: card-resumo **Meta** e card-resumo **Google** (gasto, conversões, CTR, mini-sparkline).
- Painel de **Alertas / Atividade recente** (lista): ex. "Orçamento da campanha X queimando",
  "CTR caiu 18% no conjunto Y", "3 novos Reels com bom desempenho". Cada item com ícone de severidade.
- Faixa de **Ações rápidas**: botões que levam às ferramentas (Dashboard Meta, Diagnóstico, etc.).

### 3. Dashboard Meta
- KPI cards: Gasto, Impressões, Cliques, CTR, CPC, Conversões, CPA.
- Gráfico de **gasto x tempo** (área/linha) + gráfico de **conversões x tempo**.
- **Tabela hierárquica expansível**: Campanha → Conjunto de Anúncios → Anúncio (linhas com
  chevron pra expandir), colunas: Nome, Status, Gasto, Impressões, CTR, Conversões, CPA.
- Widget de **funil de vídeo** (retenção: 25% / 50% / 75% / 100% como barras decrescentes).

### 4. Diagnóstico Meta
- Resumo de KPIs no topo (compacto).
- Seção **Alertas** com cards coloridos por severidade (erro/alerta/ok): título + descrição
  curta + valor. Ex.: "Queima de orçamento — conjunto 'Retargeting' gastou 80% sem conversão".
- Lista de **Recomendações priorizadas** (1, 2, 3…) com badge de prioridade (Alta/Média/Baixa)
  e botão "Detalhes". Tom direto e acionável.

### 5. Auditoria Meta
- Tabela de **conjuntos / posicionamentos**: Conjunto, Posicionamento (Feed/Stories/Reels),
  Gasto, Resultados, CPA, sinalizador (✓ ok / ⚠ revisar).
- Painel lateral **Quick wins**: lista priorizada "onde está perdendo dinheiro" com economia
  estimada por item (ex.: "Pausar posicionamento Audience Network → economia ~R$ 420/mês").

### 6. Reels
- **Grid de cards de Reels** (thumbnail placeholder 9:16), cada card: posição no ranking (#1…),
  visualizações, taxa de engajamento, alcance. Ordenados por desempenho.
- Nos 3 melhores, badge laranja **"Impulsionar"**. Filtro por período no topo.

### 7. Gerador de Copy
- Layout em 2 colunas. **Esquerda:** lista dos criativos top performers (por CTR) — card com
  preview, CTR, gasto. **Direita:** painel de **copy gerada** — campos: Título, Texto principal,
  CTA — com botão "Copiar" e abas de 2–3 variações. Botão "Gerar nova variação".

### 8. Gerenciar Anúncios
- Barra de busca por nome do anúncio.
- **Tabela de anúncios**: Nome, Campanha, Status (toggle ACTIVE/PAUSED), Gasto, CTR.
- Ao alternar o status, abrir **modal de confirmação** ("Pausar o anúncio X? Status atual: Ativo").
- Painel lateral **Log de ações** (auditoria): lista com timestamp + ação + anúncio
  (ex.: "03/06 19:42 — Pausou 'Black Friday — Carrossel'").

### 9. Dashboard Google
- Mesma pegada do Dashboard Meta, com métricas Google: Custo, Impressões, Cliques, CTR, CPC,
  Conversões, CPA, **Parcela de impressões (Search)**.
- Gráfico de custo x tempo. **Tabela de campanhas** (Search/Performance Max) com métricas.

### 10. Relatório Unificado
- **Comparativo lado a lado Google × Meta**: dois blocos com KPIs de cada plataforma.
- KPIs combinados no topo (investimento total, conversões totais, CPA blended, ROAS blended).
- Barra de **distribuição de orçamento** Google vs Meta (split %).
- Callout de insight (faixa `#FF6B35` à esquerda): "Onde o orçamento rende mais" — texto curto.

### 11. Negativas (Google)
- **Tabela de termos de busca**: Termo, Cliques, Custo, Conversões — ordenada por custo desc.
- Seções **agrupadas de negativas sugeridas** (collapsible) por tema: Irrelevante,
  Informacional, Concorrente, Emprego, DIY, Geográfico, Público errado — cada termo com tipo
  de correspondência (exata/frase).
- Card de **economia projetada** (mês/ano) + botão "Exportar lista".

---

Crie todas as 11 telas como rotas navegáveis pela sidebar. Capriche no espaçamento, alinhamento
e consistência. Lembre: **dados mockados, sem backend** — é a base visual pra validar o layout.
