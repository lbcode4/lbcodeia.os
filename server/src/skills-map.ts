export type SkillSpec = {
  skillName: string;
  allowedTools: string[];
  mode: "text" | "data";
  outputContract?: unknown;
};

const TEXT_TOOLS = ["Skill", "Read", "Glob", "Grep"];
const SCRIPT_TOOLS = ["Skill", "Bash", "Read", "Write", "Edit", "Glob", "Grep"];
const ONBOARDING_TOOLS = ["Skill", "Read", "Write", "Edit", "Bash", "WebFetch", "Glob", "Grep"];

const SKILLS: Record<string, SkillSpec> = {
  // ── Meta Ads ──────────────────────────────────────────────────────────
  "lb-meta-copy": { skillName: "lb-meta-copy", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-relatorio": { skillName: "lb-meta-relatorio", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-completo": { skillName: "lb-meta-completo", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-campanha-seguidores": { skillName: "lb-meta-campanha-seguidores", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-meta-campanha-whatsapp": { skillName: "lb-meta-campanha-whatsapp", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-meta-gerenciar": { skillName: "lb-meta-gerenciar", allowedTools: SCRIPT_TOOLS, mode: "text" },

  // ── Meta Ads — data-driven ─────────────────────────────────────────────
  "lb-meta-dashboard": {
    skillName: "lb-meta-dashboard", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      periodo: "string",
      gastos: "number",
      impressoes: "number",
      cliques: "number",
      ctr: "number",
      cpm: "number",
      topCreativos: [{ id: "string", nome: "string", ctr: "number", gastos: "number" }],
    },
  },
  "lb-meta-diagnostico": {
    skillName: "lb-meta-diagnostico", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      score: "number (0-100)",
      alertas: [{ nivel: "critico|atencao|ok", mensagem: "string" }],
      recomendacoes: ["string"],
      metricas: { "chave": "number" },
    },
  },
  "lb-meta-auditoria": {
    skillName: "lb-meta-auditoria", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      estrutura: { campanhas: "number", conjuntos: "number", anuncios: "number" },
      copys: [{ anuncio: "string", problema: "string", sugestao: "string" }],
      segmentacoes: [{ conjunto: "string", problema: "string" }],
      itensCriticos: ["string"],
    },
  },
  "lb-meta-analise-reels": {
    skillName: "lb-meta-analise-reels", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      reels: [{ id: "string", views: "number", retencao: "number", ctaRate: "number", sugestao: "string" }],
    },
  },

  // ── Google Ads ─────────────────────────────────────────────────────────
  "lb-google-ads": { skillName: "lb-google-ads", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-seo": { skillName: "lb-google-seo", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-avaliacoes": { skillName: "lb-google-avaliacoes", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-meu-negocio": { skillName: "lb-google-meu-negocio", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-google-dashboard": {
    skillName: "lb-google-dashboard", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      campanhas: [{ nome: "string", gastos: "number", conversoes: "number", roas: "number" }],
      cpc: "number",
      conversoes: "number",
      roas: "number",
      alertas: ["string"],
    },
  },

  // ── Ads unificado ─────────────────────────────────────────────────────
  "lb-ads-unificado": { skillName: "lb-ads-unificado", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-ads-conectar": { skillName: "lb-ads-conectar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-ads-negativas": {
    skillName: "lb-ads-negativas", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      novasNegativas: [{ termo: "string", motivo: "string", campanha: "string" }],
      existentes: ["string"],
      impactoEstimado: "string",
    },
  },

  // ── Conteúdo Orgânico ─────────────────────────────────────────────────
  "lb-conteudo-reels": { skillName: "lb-conteudo-reels", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-conteudo-stories": { skillName: "lb-conteudo-stories", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-conteudo-carrossel": { skillName: "lb-conteudo-carrossel", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-conteudo-calendario": { skillName: "lb-conteudo-calendario", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-publicar": { skillName: "lb-conteudo-publicar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-aprovar": { skillName: "lb-conteudo-aprovar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-conteudo-auditoria-insta": { skillName: "lb-conteudo-auditoria-insta", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-meta-analise-reels-organico": {
    skillName: "lb-meta-analise-reels-organico", allowedTools: SCRIPT_TOOLS, mode: "data",
    outputContract: {
      cliente: "string",
      handle: "string",
      periodo: "string",
      geradoEm: "string (DD/MM/AAAA)",
      objetivo: "string",
      reelsAnalisados: "number",
      reels: [{
        rank: "number",
        titulo: "string",
        data: "string (DD/MM/AA)",
        permalink: "string",
        alcance: "number",
        likes: "number",
        cmts: "number",
        shares: "number",
        saves: "number",
        watch: "number (segundos)",
        engRate: "number",
        classe: "TOP | ALTO | MÉDIO | BAIXO",
        caption: ["string"],
        insight: "string",
        insightTone: "success | info | warning | error",
      }],
      padroesVencedores: [{ titulo: "string", desc: "string" }],
      padroesPerdedores: [{ titulo: "string", desc: "string" }],
      impulsionar: [{
        prioridade: "string (ex: PRIORIDADE 1 — IMPULSIONAR AGORA)",
        reelRank: "number (rank do reel em reels[])",
        desc: "string",
        publico: "string",
        objetivo: "string",
        orcamento: "string",
        duracao: "string",
      }],
      naoImpulsionar: [{ titulo: "string", motivo: "string" }],
      roteiros: [{
        n: "string (01, 02, 03)",
        titulo: "string",
        tema: "string",
        formato: "string",
        duracao: "string",
        gancho: "string",
        estrutura: ["string"],
        cta: "string",
        porque: "string",
        copy: ["string"],
        tags: ["string"],
      }],
      alertas: [{ tipo: "success | warning | info | error", titulo: "string", desc: "string" }],
      leituraRetina: "string",
    },
  },

  // ── Vendas & CRM ──────────────────────────────────────────────────────
  "lb-venda-prospectar": { skillName: "lb-venda-prospectar", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-venda-diagnostico": { skillName: "lb-venda-diagnostico", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-dossie": { skillName: "lb-venda-dossie", allowedTools: SCRIPT_TOOLS, mode: "text" },
  "lb-venda-proposta": { skillName: "lb-venda-proposta", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-precificar": { skillName: "lb-venda-precificar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-objecoes": { skillName: "lb-venda-objecoes", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-follow-up": { skillName: "lb-venda-follow-up", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-venda-email": { skillName: "lb-venda-email", allowedTools: TEXT_TOOLS, mode: "text" },

  // ── Negócio do Cliente ────────────────────────────────────────────────
  "lb-negocio-site": { skillName: "lb-negocio-site", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-plano-mensal": { skillName: "lb-negocio-plano-mensal", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-mapear-rotinas": { skillName: "lb-negocio-mapear-rotinas", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-negocio-analisar-dados": { skillName: "lb-negocio-analisar-dados", allowedTools: SCRIPT_TOOLS, mode: "text" },

  // ── Sistema ───────────────────────────────────────────────────────────
  "lb-sistema-novo-projeto": { skillName: "lb-sistema-novo-projeto", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-contexto": { skillName: "lb-sistema-contexto", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-onboarding": { skillName: "lb-sistema-onboarding", allowedTools: ONBOARDING_TOOLS, mode: "text" },
  "lb-sistema-sincronizar": { skillName: "lb-sistema-sincronizar", allowedTools: TEXT_TOOLS, mode: "text" },
  "lb-sistema-versionar": { skillName: "lb-sistema-versionar", allowedTools: TEXT_TOOLS, mode: "text" },
};

export function isAllowedSkill(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(SKILLS, id);
}

export function resolveSkill(id: string): SkillSpec {
  const spec = SKILLS[id];
  if (!spec) throw new Error(`Skill não permitida: ${id}`);
  return spec;
}

export function getAllSkillIds(): string[] {
  return Object.keys(SKILLS);
}
