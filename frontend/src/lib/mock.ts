// Mock data for LBCode Ads prototype (pt-BR)

export const clients = [
  { id: "dordrian", name: "Dordrian Store", handle: "@dordrianstore", metaAct: "act_8829110023", igUserId: "1784920033", googleAdsId: "748-221-9930", ativo: true },
  { id: "beta", name: "Loja Beta", handle: "@lojabeta", metaAct: "act_5520199881", igUserId: "1928301122", googleAdsId: "229-118-4471", ativo: true },
  { id: "sorriso", name: "Clínica Sorriso", handle: "@clinicasorriso", metaAct: "act_7710022991", igUserId: "2010338829", googleAdsId: "554-902-1188", ativo: false },
];

export const periods = ["Últimos 7 dias", "Últimos 14 dias", "Últimos 30 dias"];

export const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtInt = (v: number) => v.toLocaleString("pt-BR");
export const fmtPct = (v: number) =>
  `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

// Meta accounts (for Conectar Contas)
export const metaAccounts = [
  { conta: "Dordrian Store - Principal", id: "act_8829110023", status: "Ativo" },
  { conta: "Dordrian Store - Retargeting", id: "act_8829110099", status: "Ativo" },
  { conta: "Loja Beta - Master", id: "act_5520199881", status: "Desativado" },
];

// Visão Geral KPIs
export const overviewKpis = [
  { label: "Investimento total", value: fmtBRL(6842.5), delta: 12.4, deltaUp: true },
  { label: "Conversões", value: "248", delta: 8.2, deltaUp: true },
  { label: "CPA médio", value: fmtBRL(27.59), delta: -4.1, deltaUp: false, deltaGood: true },
  { label: "ROAS", value: "3,2x", delta: 0.4, deltaUp: true },
];

export const platformSummary = {
  meta: { gasto: 4120.8, conversoes: 168, ctr: 1.62, spark: [12, 18, 14, 22, 19, 26, 24] },
  google: { gasto: 2721.7, conversoes: 80, ctr: 4.21, spark: [10, 9, 13, 11, 17, 15, 19] },
};

export const alerts = [
  { sev: "warning", title: "Orçamento queimando", desc: "Campanha 'Black Friday — Carrossel' gastou 80% sem conversão." },
  { sev: "error", title: "CTR caiu 18%", desc: "Conjunto 'Lookalike 1% — Compradores' teve queda relevante." },
  { sev: "success", title: "3 novos Reels em alta", desc: "Engajamento acima de 8% nos últimos 7 dias." },
  { sev: "warning", title: "Termos negativos detectados", desc: "12 buscas irrelevantes consumiram R$ 318,40 no Google." },
];

// Meta dashboard
export const metaKpis = [
  { label: "Gasto", value: fmtBRL(4120.8) },
  { label: "Impressões", value: fmtInt(412980) },
  { label: "Cliques", value: fmtInt(6692) },
  { label: "CTR", value: "1,62%" },
  { label: "CPC", value: fmtBRL(0.62) },
  { label: "Conversões", value: "168" },
  { label: "CPA", value: fmtBRL(24.53) },
];

export const spendOverTime = [
  { d: "27/05", v: 480 }, { d: "28/05", v: 520 }, { d: "29/05", v: 610 },
  { d: "30/05", v: 580 }, { d: "31/05", v: 720 }, { d: "01/06", v: 640 },
  { d: "02/06", v: 570 },
];
export const convOverTime = [
  { d: "27/05", v: 18 }, { d: "28/05", v: 22 }, { d: "29/05", v: 28 },
  { d: "30/05", v: 24 }, { d: "31/05", v: 32 }, { d: "01/06", v: 26 },
  { d: "02/06", v: 18 },
];

export type MetaRow = {
  id: string; name: string; status: "Ativo" | "Pausado";
  gasto: number; impressoes: number; ctr: number; conv: number; cpa: number;
  children?: MetaRow[];
};

export const metaTable: MetaRow[] = [
  {
    id: "c1", name: "Black Friday — Aquisição", status: "Ativo",
    gasto: 1820.4, impressoes: 184200, ctr: 1.78, conv: 78, cpa: 23.34,
    children: [
      { id: "c1a1", name: "Lookalike 1% Compradores", status: "Ativo", gasto: 920.1, impressoes: 92100, ctr: 1.82, conv: 42, cpa: 21.91,
        children: [
          { id: "c1a1n1", name: "Carrossel — 4 produtos", status: "Ativo", gasto: 520.4, impressoes: 51200, ctr: 1.91, conv: 26, cpa: 20.02 },
          { id: "c1a1n2", name: "Vídeo 15s — depoimento", status: "Ativo", gasto: 399.7, impressoes: 40900, ctr: 1.74, conv: 16, cpa: 24.98 },
        ],
      },
      { id: "c1a2", name: "Interesses — Moda Feminina", status: "Ativo", gasto: 900.3, impressoes: 92100, ctr: 1.74, conv: 36, cpa: 25.01 },
    ],
  },
  {
    id: "c2", name: "Retargeting — Site 30d", status: "Ativo",
    gasto: 1480.2, impressoes: 142800, ctr: 1.49, conv: 62, cpa: 23.87,
    children: [
      { id: "c2a1", name: "Visitantes carrinho", status: "Ativo", gasto: 880.1, impressoes: 78400, ctr: 1.66, conv: 38, cpa: 23.16 },
      { id: "c2a2", name: "Engajou IG/FB 14d", status: "Pausado", gasto: 600.1, impressoes: 64400, ctr: 1.28, conv: 24, cpa: 25.0 },
    ],
  },
  {
    id: "c3", name: "Prospecção — Reels", status: "Ativo",
    gasto: 820.2, impressoes: 85980, ctr: 1.42, conv: 28, cpa: 29.29,
  },
];

export const videoFunnel = [
  { label: "25%", value: 100 },
  { label: "50%", value: 64 },
  { label: "75%", value: 38 },
  { label: "100%", value: 21 },
];

// Diagnóstico
export const diagnosticAlerts = [
  { sev: "error", title: "Queima de orçamento", desc: "Conjunto 'Retargeting Carrinho' gastou 80% sem conversão hoje.", value: fmtBRL(412) },
  { sev: "warning", title: "Frequência alta", desc: "Anúncio 'Carrossel Black Friday' com freq. 6,2 — risco de fadiga.", value: "6,2x" },
  { sev: "warning", title: "CPA 2x acima da meta", desc: "Conjunto 'Interesses — Moda' atingiu CPA R$ 58,40.", value: fmtBRL(58.4) },
  { sev: "success", title: "Criativo escalável", desc: "Vídeo 'Depoimento Cliente' com CPA R$ 12,80 — recomendado escalar.", value: fmtBRL(12.8) },
];

export const recommendations = [
  { prio: "Alta", title: "Pausar conjunto 'Retargeting Carrinho'", desc: "Sem conversão nos últimos 5 dias, gasto R$ 412." },
  { prio: "Alta", title: "Aumentar verba do criativo 'Depoimento'", desc: "ROAS 4,8x. Sugerido +30% no orçamento diário." },
  { prio: "Média", title: "Renovar criativo 'Carrossel Black Friday'", desc: "Frequência 6,2x indica saturação." },
  { prio: "Média", title: "Excluir posicionamento Audience Network", desc: "CPA 3x maior que Feed e Stories." },
  { prio: "Baixa", title: "Revisar público 'Interesses — Moda'", desc: "Sobreposição alta com Lookalike 1%." },
];

// Auditoria
export const auditRows = [
  { conjunto: "Lookalike 1% Compradores", pos: "Feed", gasto: 520.4, resultados: 26, cpa: 20.02, ok: true },
  { conjunto: "Lookalike 1% Compradores", pos: "Stories", gasto: 280.1, resultados: 11, cpa: 25.46, ok: true },
  { conjunto: "Lookalike 1% Compradores", pos: "Audience Network", gasto: 420.0, resultados: 4, cpa: 105.0, ok: false },
  { conjunto: "Retargeting Carrinho", pos: "Feed", gasto: 880.1, resultados: 38, cpa: 23.16, ok: true },
  { conjunto: "Retargeting Carrinho", pos: "Reels", gasto: 320.5, resultados: 7, cpa: 45.79, ok: false },
  { conjunto: "Interesses — Moda", pos: "Feed", gasto: 600.2, resultados: 22, cpa: 27.28, ok: true },
];

export const quickWins = [
  { title: "Pausar Audience Network", economy: 420 },
  { title: "Excluir Reels em 'Retargeting Carrinho'", economy: 320 },
  { title: "Reduzir orçamento 'Interesses — Moda' em 30%", economy: 180 },
  { title: "Pausar anúncios com freq. > 6", economy: 240 },
];

// Reels
export const reels = Array.from({ length: 9 }).map((_, i) => ({
  id: `r${i + 1}`,
  rank: i + 1,
  views: 184000 - i * 12400,
  eng: 9.4 - i * 0.6,
  reach: 142000 - i * 9800,
  title: [
    "Antes e depois — cliente real",
    "3 erros ao escolher tênis",
    "Tutorial: combine 1 peça, 5 looks",
    "Bastidores do estoque",
    "POV: chegou o pedido",
    "Black Friday começou",
    "Resposta pros comentários",
    "Top 5 mais pedidos da semana",
    "Tira-dúvidas ao vivo",
  ][i],
}));

// Copy generator
export const topCreatives = [
  { id: 1, name: "Vídeo — Depoimento Cliente", ctr: 2.41, gasto: 720.4 },
  { id: 2, name: "Carrossel — 4 produtos", ctr: 1.91, gasto: 520.4 },
  { id: 3, name: "Imagem — Promo Frete Grátis", ctr: 1.78, gasto: 410.8 },
  { id: 4, name: "Vídeo 15s — UGC", ctr: 1.64, gasto: 380.2 },
];

export const generatedCopy = {
  variations: [
    {
      titulo: "Frete grátis acabando — corre",
      texto: "Mais de 12.000 clientes já compraram. Garantia de 30 dias e entrega expressa. Aproveite hoje com frete grátis em todo o Brasil.",
      cta: "Comprar agora",
    },
    {
      titulo: "O tênis que vendeu 3.000 unidades",
      texto: "Conforto que dura o dia todo. Modelo mais pedido do mês com 4,9 estrelas. Estoque limitado — escolha seu número antes que acabe.",
      cta: "Quero o meu",
    },
    {
      titulo: "Você ainda não viu? Olha isso 👇",
      texto: "Coleção nova chegando com até 40% OFF nas primeiras 48h. Frete grátis acima de R$ 199 e troca fácil em qualquer loja parceira.",
      cta: "Ver coleção",
    },
  ],
};

// Gerenciar Anúncios
export const ads = [
  { id: "a1", name: "Black Friday — Carrossel", campanha: "Black Friday — Aquisição", status: "ACTIVE" as const, gasto: 520.4, ctr: 1.91 },
  { id: "a2", name: "Depoimento Cliente — Vídeo", campanha: "Black Friday — Aquisição", status: "ACTIVE" as const, gasto: 720.4, ctr: 2.41 },
  { id: "a3", name: "Promo Frete Grátis — Imagem", campanha: "Retargeting — Site 30d", status: "ACTIVE" as const, gasto: 410.8, ctr: 1.78 },
  { id: "a4", name: "UGC 15s — Bastidores", campanha: "Prospecção — Reels", status: "PAUSED" as const, gasto: 180.2, ctr: 1.12 },
  { id: "a5", name: "Carrossel 4 produtos", campanha: "Black Friday — Aquisição", status: "ACTIVE" as const, gasto: 320.6, ctr: 1.66 },
  { id: "a6", name: "Stories — Cupom 10%", campanha: "Retargeting — Site 30d", status: "PAUSED" as const, gasto: 90.4, ctr: 0.92 },
];

export const adLog = [
  { ts: "03/06 19:42", action: "Pausou", target: "Black Friday — Carrossel" },
  { ts: "03/06 18:10", action: "Ativou", target: "Depoimento Cliente — Vídeo" },
  { ts: "03/06 14:22", action: "Editou orçamento de", target: "Retargeting — Site 30d" },
  { ts: "02/06 22:05", action: "Pausou", target: "UGC 15s — Bastidores" },
  { ts: "02/06 11:38", action: "Duplicou", target: "Carrossel 4 produtos" },
];

// Google
export const googleKpis = [
  { label: "Custo", value: fmtBRL(2721.7) },
  { label: "Impressões", value: fmtInt(98420) },
  { label: "Cliques", value: fmtInt(4144) },
  { label: "CTR", value: "4,21%" },
  { label: "CPC", value: fmtBRL(0.66) },
  { label: "Conversões", value: "80" },
  { label: "CPA", value: fmtBRL(34.02) },
  { label: "Parcela impr. (Search)", value: "62%" },
];

export const googleCampaigns = [
  { name: "Search — Marca", tipo: "Search", custo: 482.1, cliques: 980, ctr: 8.4, conv: 32, cpa: 15.07 },
  { name: "Search — Genéricas", tipo: "Search", custo: 1120.2, cliques: 1820, ctr: 3.2, conv: 24, cpa: 46.68 },
  { name: "PMax — Catálogo Geral", tipo: "Performance Max", custo: 880.4, cliques: 1140, ctr: 4.1, conv: 18, cpa: 48.91 },
  { name: "PMax — Lançamento", tipo: "Performance Max", custo: 239.0, cliques: 204, ctr: 2.8, conv: 6, cpa: 39.83 },
];

// Unificado
export const unifiedKpis = [
  { label: "Investimento total", value: fmtBRL(6842.5) },
  { label: "Conversões totais", value: "248" },
  { label: "CPA blended", value: fmtBRL(27.59) },
  { label: "ROAS blended", value: "3,2x" },
];

// Negativas
export const searchTerms = [
  { term: "tênis preto barato 50 reais", cliques: 84, custo: 142.8, conv: 0, tema: "Irrelevante" },
  { term: "como limpar tênis branco", cliques: 62, custo: 98.4, conv: 0, tema: "Informacional" },
  { term: "tênis nike outlet", cliques: 41, custo: 88.2, conv: 1, tema: "Concorrente" },
  { term: "vaga emprego loja calçados", cliques: 22, custo: 38.4, conv: 0, tema: "Emprego" },
  { term: "diy tênis customizado", cliques: 18, custo: 28.1, conv: 0, tema: "DIY" },
  { term: "loja tênis fortaleza", cliques: 32, custo: 52.4, conv: 0, tema: "Geográfico" },
  { term: "tênis infantil tamanho 22", cliques: 14, custo: 22.6, conv: 0, tema: "Público errado" },
];

export const negativeGroups = [
  { tema: "Irrelevante", terms: [{ t: "barato", match: "frase" as const }, { t: "50 reais", match: "exata" as const }, { t: "grátis", match: "frase" as const }] },
  { tema: "Informacional", terms: [{ t: "como limpar", match: "frase" as const }, { t: "tutorial", match: "frase" as const }, { t: "o que é", match: "frase" as const }] },
  { tema: "Concorrente", terms: [{ t: "nike outlet", match: "exata" as const }, { t: "adidas", match: "exata" as const }, { t: "centauro", match: "exata" as const }] },
  { tema: "Emprego", terms: [{ t: "vaga", match: "frase" as const }, { t: "trabalhe conosco", match: "frase" as const }] },
  { tema: "DIY", terms: [{ t: "diy", match: "frase" as const }, { t: "customizado", match: "frase" as const }] },
  { tema: "Geográfico", terms: [{ t: "fortaleza", match: "exata" as const }, { t: "manaus", match: "exata" as const }] },
  { tema: "Público errado", terms: [{ t: "infantil", match: "frase" as const }, { t: "tamanho 22", match: "exata" as const }] },
];

// ===== Sites (Construtor de sites com IA) =====
export type Site = {
  id: string;
  name: string;
  domain: string;
  status: "rascunho" | "em-desenvolvimento" | "publicado";
  updatedAt: string;
  pages: number;
  thumbColor: string;
  html: string;
};

const baseHtml = (title: string, headline: string, sub: string, color: string) => `<!doctype html>
<html lang="pt-br"><head><meta charset="utf-8"><title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif}
  body{background:#fafafa;color:#1a1a2e}
  header{background:${color};color:#fff;padding:80px 24px;text-align:center}
  header h1{font-size:42px;margin-bottom:12px;letter-spacing:-.5px}
  header p{font-size:18px;opacity:.9;max-width:560px;margin:0 auto}
  .cta{display:inline-block;margin-top:28px;background:#fff;color:${color};padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600}
  section{max-width:960px;margin:0 auto;padding:64px 24px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .card h3{margin-bottom:8px;font-size:18px}
  .card p{color:#666;font-size:14px;line-height:1.5}
  footer{text-align:center;padding:32px;color:#888;font-size:13px;border-top:1px solid #eee}
</style></head>
<body>
  <header>
    <h1>${headline}</h1>
    <p>${sub}</p>
    <a class="cta" href="#">Começar agora</a>
  </header>
  <section>
    <div class="grid">
      <div class="card"><h3>Rápido</h3><p>Carregamento otimizado em todos os dispositivos.</p></div>
      <div class="card"><h3>Bonito</h3><p>Design moderno com foco em conversão.</p></div>
      <div class="card"><h3>Inteligente</h3><p>Construído com apoio de IA, do zero.</p></div>
    </div>
  </section>
  <footer>© 2026 ${title} — feito com LBCode</footer>
</body></html>`;

export const sites: Site[] = [
  {
    id: "dordrian-lp",
    name: "Dordrian — Landing Black Friday",
    domain: "dordrian-bf.lovable.app",
    status: "em-desenvolvimento",
    updatedAt: "há 2 horas",
    pages: 3,
    thumbColor: "#FF6B35",
    html: baseHtml("Dordrian BF", "Black Friday Dordrian", "Até 70% OFF nas melhores marcas. Frete grátis acima de R$ 199.", "#FF6B35"),
  },
  {
    id: "sorriso-site",
    name: "Clínica Sorriso — Site Institucional",
    domain: "clinicasorriso.com.br",
    status: "publicado",
    updatedAt: "há 3 dias",
    pages: 6,
    thumbColor: "#1A8FE3",
    html: baseHtml("Clínica Sorriso", "Cuidando do seu sorriso", "Odontologia humanizada no coração de São Paulo. Agende sua avaliação.", "#1A8FE3"),
  },
  {
    id: "beta-lp",
    name: "Loja Beta — Captura de Leads",
    domain: "lojabeta-lead.lovable.app",
    status: "rascunho",
    updatedAt: "há 5 dias",
    pages: 1,
    thumbColor: "#7A5CFF",
    html: baseHtml("Loja Beta", "Cadastre-se e ganhe 15% OFF", "Receba antes de todo mundo os lançamentos exclusivos da Loja Beta.", "#7A5CFF"),
  },
  {
    id: "evento-2026",
    name: "Summit LBCode 2026",
    domain: "summit.lbcode.app",
    status: "em-desenvolvimento",
    updatedAt: "há 6 horas",
    pages: 4,
    thumbColor: "#15803D",
    html: baseHtml("Summit 2026", "LBCode Summit 2026", "O maior evento de tráfego pago com IA do Brasil. 12 e 13 de março, São Paulo.", "#15803D"),
  },
];
