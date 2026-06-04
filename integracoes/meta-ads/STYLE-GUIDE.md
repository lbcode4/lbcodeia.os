# Style Guide — Relatorios HTML

Referencia obrigatoria para TODOS os relatorios HTML gerados pela agencia.

## Arquivo de Referencia Visual

O template base esta em:
`output/{slug}/relatorio-meta-[mmm]-[yyyy].html`

Todos os novos relatorios devem seguir este padrao visual.

---

## 1. Design System (CSS Variables)

Usar SEMPRE as mesmas variaveis CSS em dark e light mode:

```css
:root, [data-theme="dark"] {
  --bg:#0c0e18; --card:#13161f; --card2:#1a1e2e; --border:#252a3d;
  --accent:#6c5ce7; --accent2:#a855f7; --green:#22c55e; --red:#ef4444;
  --amber:#f59e0b; --blue:#0984e3; --pink:#e84393;
  --text:#e4e9f5; --dim:#5e6a8a; --meta:#1877f2; --ig:#e1306c;
  --shadow: 0 2px 8px rgba(0,0,0,.3);
}
[data-theme="light"] {
  --bg:#f5f7fa; --card:#ffffff; --card2:#f0f2f5; --border:#e2e5ea;
  --accent:#3b5bdb; --accent2:#7c3aed; --green:#16a34a; --red:#dc2626;
  --amber:#d97706; --blue:#2563eb; --pink:#db2777;
  --text:#1e293b; --dim:#64748b; --meta:#1877f2; --ig:#e1306c;
  --shadow: 0 2px 8px rgba(0,0,0,.08);
}
```

## 2. Componentes Obrigatorios

Cada relatorio deve incluir:

### Header
- Gradient background (accent → pink para Meta, accent → blue para Google)
- Titulo: "Relatorio/Dashboard — [Cliente]"
- Subtitulo: periodo + plataforma + fonte de dados
- Botao dark/light toggle (canto direito)
- Data de geracao

### KPI Cards (topo)
- Grid responsivo: `repeat(auto-fit, minmax(150px, 1fr))`
- Cada card: label uppercase (11px), valor grande (24px bold), subtexto (11px dim)
- Cores no valor quando relevante (verde = bom, vermelho = ruim)

### Tabelas
- Background: var(--card), header: var(--bg)
- Font-size: 13px no body, 11px uppercase nos headers
- Hover: var(--card2)
- Status badges com cores semanticas

### Cards de Detalhe
- Border-left colorido por classificacao:
  - Verde (#22c55e) = alto/excelente
  - Azul (#0984e3) = medio/bom
  - Amber (#f59e0b) = destaque/atencao
  - Vermelho (#ef4444) = baixo/critico
- Metricas em grid dentro do card

### Graficos (Chart.js)
- Usar Chart.js v4.4+ via CDN
- Cores consistentes com o design system
- Grid sutil: cor #252a3d40
- Labels: cor var(--dim), font-size 10-11px
- Tipos preferidos: bar, line, doughnut, horizontal bar

### Alertas/Insights
- Cards com border-left por severidade
- Vermelho = urgente, amber = atencao, verde = positivo, azul = info
- Titulo (h4) + descricao (p, cor dim)

### Footer
- Border-top sutil
- "Gerado por Claude Code"
- Data + cliente

## 3. Hierarquia Visual

Ordem das secoes (de cima para baixo):

1. **Header** — identidade visual
2. **KPIs consolidados** — visao rapida dos numeros
3. **Tabela comparativa/ranking** — dados em formato scannable
4. **Graficos** — visualizacao comparativa (2x2 grid)
5. **Cards de detalhe** — analise individual
6. **Padroes/Insights** — conclusoes
7. **Recomendacoes/Acoes** — proximo passo
8. **Alertas** — urgencias
9. **Footer**

## 4. Codificacao de Cores por Performance

| Classificacao | Badge class | Cor | Uso |
|---------------|-------------|-----|-----|
| TOP | `perf-top` | amber | Melhor item do periodo |
| ALTO | `perf-alto` | green | Acima da media |
| MEDIO | `perf-medio` | blue | Na media |
| BAIXO | `perf-baixo` | red | Abaixo da media |

Metricas individuais tambem recebem cor quando desviam da media:
- Verde: metrica > media + 20%
- Vermelho: metrica < media - 30%

## 5. Responsividade

Breakpoint mobile: 768px
- Grid colapsa para 1 coluna
- Graficos ficam full-width
- KPI grid: 2 colunas
- Tabelas: font-size reduzido

## 6. Tipografia

- Font-family: 'Segoe UI', system-ui, sans-serif
- Body: 15px, line-height 1.6
- Labels: 11px uppercase, letter-spacing 0.5px, font-weight 700
- Valores KPI: 24px, font-weight 800
- Metricas em cards: 16-18px bold
- Micro-labels: 9px uppercase

## 7. Padrao de Nomenclatura

Salvar relatorios em:
```
output/{slug}/{tipo}-{periodo}.html
```

Exemplos:
- `dashboard-completo-mar-2026.html`
- `analise-reels-organicos-mar-2026.html`
- `relatorio-semanal-19-25-fev-2026.html`

## 8. Templates Especializados

### Analise de Reels Organicos

Template em: `output/{slug}/analise-reels-organicos-{periodo}.html`
Skill: `/analise-reels-organico`

Componentes especificos deste template:

| Componente | Classe CSS | Descricao |
|------------|-----------|-----------|
| Reels Grid | `.reels-grid` + `.reel-card` | Cards com thumbnail, rank badge, viral badge, metricas |
| Ranking Table | `.reel-table` | Tabela com thumb + link IG + metricas + badge |
| Detail Cards | `.reel-detail` | Thumb clicavel, caption, metricas grid, analise |
| Pattern Cards | `.pattern-card` | `.winner` (verde) e `.loser` (vermelho) |
| Boost Cards | `.boost-card` | Thumb + prioridade + publico + orcamento |
| Roteiro Cards | `.roteiro-card` | Grid de specs + copy box |
| Copy Box | `.copy-box` | Legenda + hashtags |

Header gradient: `--ig` → `--accent2` (Instagram)

Dados embarcados como JSON (`REELS[]` + `BOOSTS[]`), renderizados via JavaScript.

Graficos Chart.js (2x2 grid):
- Alcance vs Eng Rate (combo bar+line, dual axis)
- Distribuicao de Interacoes (stacked bar)
- Shares + Saves (horizontal bar)
- Watch Time Medio (bar com cores por performance)

Tooltip config compartilhado:
```javascript
const tooltipConfig = {
  backgroundColor: '#1a1e2e', titleColor: '#e4e9f5', bodyColor: '#e4e9f5',
  borderColor: '#252a3d', borderWidth: 1, padding: 12, cornerRadius: 8,
  titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }
};
// callbacks.title: mostrar titulo completo do Reel + data
// interaction: { mode: 'index', intersect: false }
```

---

## 9. JavaScript Obrigatorio

```javascript
// Dark/light toggle
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-theme', 'light');
    icon.innerHTML = '&#9728;';
  } else {
    html.setAttribute('data-theme', 'dark');
    icon.innerHTML = '&#127769;';
  }
}
```

Formatters quando aplicavel:
```javascript
const fmtBRL = v => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
const fmtPct = v => Number(v).toFixed(2).replace('.', ',') + '%';
const fmtNum = v => Number(v).toLocaleString('pt-BR');
```
