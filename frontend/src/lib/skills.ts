import {
  BarChart3, Stethoscope, ClipboardCheck, FileBarChart, Megaphone, Film, Sparkles, Layers,
  Users, MessageCircle,
  Search, LineChart, Star, MapPin, Globe2,
  Image as ImageIcon, Calendar, Send, CheckCircle2, Camera, BookOpen, ClipboardList,
  Target, FileSearch, FileText, DollarSign, Shield, Mail, Repeat,
  Globe, ListChecks, CalendarCheck, BarChart,
  FolderPlus, FolderOpen, Download, RefreshCw, Save, Package,
  type LucideIcon,
} from "lucide-react";

export type Skill = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** route path inside the app that this skill maps to (when available) */
  route?: string;
};

export type Hub = {
  id: string;
  name: string;
  tagline: string;
  /** tailwind gradient classes for the hub header */
  gradient: string;
  /** sidebar icon */
  icon: LucideIcon;
  skills: Skill[];
};

export const hubs: Hub[] = [
  {
    id: "meta",
    name: "Meta Ads",
    tagline: "Campanhas, criativos e análise de performance no Meta.",
    gradient: "from-[#7A5CFF] via-[#B14BD1] to-[#E04C8A]",
    icon: BarChart3,
    skills: [
      { id: "lb-meta-dashboard", name: "Dashboard Meta", description: "Visão executiva de gasto, alcance, cliques e conversões.", icon: BarChart3, route: "/dashboard-meta" },
      { id: "lb-meta-diagnostico", name: "Diagnóstico de Conta", description: "Identifica problemas estruturais e oportunidades imediatas.", icon: Stethoscope, route: "/diagnostico-meta" },
      { id: "lb-meta-auditoria", name: "Auditoria Completa", description: "Checklist técnica completa da conta (pixel, eventos, públicos).", icon: ClipboardCheck, route: "/auditoria-meta" },
      { id: "lb-meta-relatorio", name: "Relatório Meta", description: "Gera relatório executivo com insights por período.", icon: FileBarChart },
      { id: "lb-meta-gerenciar", name: "Gerenciar Anúncios", description: "Pausar, escalar e ajustar campanhas/conjuntos/anúncios.", icon: Megaphone, route: "/gerenciar-anuncios" },
      { id: "lb-meta-analise-reels", name: "Análise de Reels (Pago)", description: "Performance dos Reels pagos e ranking de criativos.", icon: Film, route: "/reels" },
      { id: "lb-meta-analise-reels-organico", name: "Análise de Reels (Orgânico)", description: "Padrões vencedores dos Reels orgânicos e roteiro do próximo.", icon: Film, route: "/reels-organico" },
      { id: "lb-meta-copy", name: "Gerador de Copy", description: "Variações de copy para anúncios (headline, primary, CTA).", icon: Sparkles, route: "/gerador-copy" },
      { id: "lb-meta-completo", name: "Análise Completa", description: "Roda diagnóstico + auditoria + relatório em sequência.", icon: Layers },
      { id: "lb-meta-campanha-seguidores", name: "Campanha de Seguidores", description: "Estrutura campanha para crescimento de seguidores no Instagram.", icon: Users },
      { id: "lb-meta-campanha-whatsapp", name: "Campanha p/ WhatsApp", description: "Campanha otimizada para conversa no WhatsApp.", icon: MessageCircle },
    ],
  },
  {
    id: "google",
    name: "Google Ads & SEO",
    tagline: "Search, Performance Max, SEO e perfil do Google.",
    gradient: "from-[#4285F4] via-[#34A853] to-[#FBBC05]",
    icon: Search,
    skills: [
      { id: "lb-google-dashboard", name: "Dashboard Google", description: "Performance de campanhas Search/PMax/Display.", icon: LineChart, route: "/dashboard-google" },
      { id: "lb-google-ads", name: "Estruturar Google Ads", description: "Planeja e estrutura novas campanhas no Google.", icon: Search },
      { id: "lb-google-seo", name: "SEO On-page", description: "Auditoria de SEO técnico e on-page do site.", icon: Globe2 },
      { id: "lb-google-avaliacoes", name: "Avaliações", description: "Análise e resposta a avaliações do Google.", icon: Star },
      { id: "lb-google-meu-negocio", name: "Google Meu Negócio", description: "Otimização do perfil do Google Meu Negócio.", icon: MapPin },
    ],
  },
  {
    id: "conteudo",
    name: "Conteúdo Orgânico",
    tagline: "Reels, stories, carrosséis e calendário editorial.",
    gradient: "from-[#E04C8A] via-[#F0649C] to-[#FCB045]",
    icon: Camera,
    skills: [
      { id: "lb-conteudo-reels", name: "Roteiros de Reels", description: "Roteiros virais com hook, retenção e CTA.", icon: Film },
      { id: "lb-conteudo-stories", name: "Sequência de Stories", description: "Sequência de stories com enquetes e CTAs.", icon: Camera },
      { id: "lb-conteudo-carrossel", name: "Carrosséis", description: "Carrosséis educativos e de venda.", icon: Layers },
      { id: "lb-conteudo-calendario", name: "Calendário Editorial", description: "Calendário mensal de conteúdos por pilar.", icon: Calendar },
      { id: "lb-conteudo-publicar", name: "Publicar Conteúdo", description: "Agendamento e publicação multi-plataforma.", icon: Send },
      { id: "lb-conteudo-aprovar", name: "Aprovação de Conteúdo", description: "Fluxo de aprovação com cliente.", icon: CheckCircle2 },
      { id: "lb-conteudo-auditoria-insta", name: "Auditoria do Instagram", description: "Auditoria de bio, destaques, grade e performance orgânica.", icon: ImageIcon, route: "/organico-instagram" },
    ],
  },
  {
    id: "vendas",
    name: "Vendas & CRM",
    tagline: "Prospecção, diagnóstico, proposta e follow-up.",
    gradient: "from-[#0EA5E9] via-[#2563EB] to-[#7C3AED]",
    icon: Target,
    skills: [
      { id: "lb-venda-prospectar", name: "Prospectar Cliente", description: "Pesquisa e qualificação de leads outbound.", icon: Target },
      { id: "lb-venda-diagnostico", name: "Diagnóstico de Vendas", description: "Reunião de diagnóstico estruturada.", icon: FileSearch },
      { id: "lb-venda-dossie", name: "Dossiê do Cliente", description: "Resumo completo do lead antes da reunião.", icon: BookOpen },
      { id: "lb-venda-proposta", name: "Proposta Comercial", description: "Gera proposta personalizada em PDF.", icon: FileText },
      { id: "lb-venda-precificar", name: "Precificação", description: "Calcula investimento e fee de gestão.", icon: DollarSign },
      { id: "lb-venda-objecoes", name: "Tratar Objeções", description: "Roteiro de respostas para objeções comuns.", icon: Shield },
      { id: "lb-venda-follow-up", name: "Follow-up", description: "Sequência de follow-up por canal.", icon: Repeat },
      { id: "lb-venda-email", name: "E-mail de Venda", description: "E-mails comerciais (cold, warm, fechamento).", icon: Mail },
    ],
  },
  {
    id: "negocio",
    name: "Negócio do Cliente",
    tagline: "Site, rotinas, plano mensal e análise de dados.",
    gradient: "from-[#16A34A] via-[#0D9488] to-[#0EA5E9]",
    icon: Globe,
    skills: [
      { id: "lb-negocio-site", name: "Criar Site", description: "Cria site institucional / landing do cliente.", icon: Globe, route: "/sites" },
      { id: "lb-negocio-plano-mensal", name: "Plano Mensal", description: "Plano mensal de tráfego + conteúdo + metas.", icon: CalendarCheck },
      { id: "lb-negocio-mapear-rotinas", name: "Mapear Rotinas", description: "Mapeia rotinas operacionais do cliente.", icon: ListChecks },
      { id: "lb-negocio-analisar-dados", name: "Analisar Dados", description: "Análise cruzada de dados de marketing e venda.", icon: BarChart },
    ],
  },
  {
    id: "sistema",
    name: "Sistema",
    tagline: "Projetos, instalação, atualização e backup.",
    gradient: "from-[#475569] via-[#334155] to-[#0F172A]",
    icon: Package,
    skills: [
      { id: "lb-sistema-novo-projeto", name: "Novo Projeto", description: "Inicia projeto/cliente com a estrutura padrão.", icon: FolderPlus },
      { id: "lb-sistema-contexto", name: "Contexto", description: "Carrega memória do negócio e devolve briefing da sessão.", icon: FolderOpen },
      { id: "lb-sistema-onboarding", name: "Onboarding", description: "Setup inicial: extrai site/Instagram, entrevista e preenche a memória.", icon: Download },
      { id: "lb-sistema-sincronizar", name: "Sincronizar", description: "Varre projeto, detecta mudanças e reconcilia a memória.", icon: RefreshCw },
      { id: "lb-sistema-versionar", name: "Versionar", description: "Commit + push no GitHub — tudo documentado e recuperável.", icon: Save },
      { id: "lb-ads-conectar", name: "Conectar Contas", description: "Conecta Meta Ads, Google Ads e demais integrações.", icon: ClipboardList, route: "/conectar-contas" },
    ],
  },
];

export function findHub(id: string) {
  return hubs.find((h) => h.id === id);
}

export function findSkillById(id: string): Skill | undefined {
  for (const hub of hubs) {
    const s = hub.skills.find((sk) => sk.id === id);
    if (s) return s;
  }
  return undefined;
}
