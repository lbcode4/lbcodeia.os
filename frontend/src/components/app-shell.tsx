import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Menu, X, Moon, Sun, ChevronDown, User, Bot, Globe, FileBarChart, Target, Library, Newspaper, TrendingUp,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { clients, periods } from "@/lib/mock";
import { hubs } from "@/lib/skills";

const topNav = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/assistente", label: "Assistente IA", icon: Bot },
  { to: "/prospeccao", label: "Prospecção", icon: Target },
  { to: "/dashboard-conteudo", label: "Dashboard de Posts", icon: LayoutDashboard },
  { to: "/conteudo", label: "Conteúdo", icon: Newspaper },
  { to: "/organico-instagram", label: "Reels Orgânicos", icon: TrendingUp },
  { to: "/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/sites", label: "Sites", icon: Globe },
];

const bottomNav = [
  { to: "/relatorio-unificado", label: "Relatório Unificado", icon: FileBarChart },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const [client, setClient] = useState(clients[0].id);
  const [period, setPeriod] = useState(periods[2]);
  const [clientOpen, setClientOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);

  const activeClient = clients.find((c) => c.id === client)!;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">L</div>
            <span className="font-bold text-[15px] tracking-tight">LBCode Ads</span>
          </Link>
          <button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {topNav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-6 py-2.5 text-[13.5px] transition-colors ${
                  active
                    ? "text-foreground font-medium bg-sidebar-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />}
                <Icon size={18} strokeWidth={2} className={active ? "text-foreground" : "text-muted-foreground"} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="px-6 pt-5 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Hubs de Skills
          </div>
          {hubs.map((hub) => {
            const to = `/hub/${hub.id}`;
            const active = pathname === to;
            const Icon = hub.icon;
            return (
              <Link
                key={hub.id}
                to="/hub/$hubId"
                params={{ hubId: hub.id }}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-6 py-2.5 text-[13.5px] transition-colors ${
                  active
                    ? "text-foreground font-medium bg-sidebar-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />}
                <Icon size={18} strokeWidth={2} className={active ? "text-foreground" : "text-muted-foreground"} />
                <span className="flex-1">{hub.name}</span>
                <span className="text-[10.5px] text-muted-foreground/80">{hub.skills.length}</span>
              </Link>
            );
          })}

          <div className="px-6 pt-5 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Relatórios
          </div>
          {bottomNav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 px-6 py-2.5 text-[13.5px] transition-colors ${
                  active
                    ? "text-foreground font-medium bg-sidebar-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                {active && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />}
                <Icon size={18} strokeWidth={2} className={active ? "text-foreground" : "text-muted-foreground"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border text-[11px] text-muted-foreground">
          v0.1 · Protótipo
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <Menu size={20} />
            </button>

            {/* Client selector */}
            <div className="relative">
              <button
                onClick={() => { setClientOpen((o) => !o); setPeriodOpen(false); }}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-[13px] hover:bg-accent"
              >
                <span className="font-medium">{activeClient.name}</span>
                <span className="text-muted-foreground hidden sm:inline">{activeClient.handle}</span>
                <ChevronDown size={14} />
              </button>
              {clientOpen && (
                <div className="absolute mt-1 left-0 w-64 bg-popover border border-border rounded-md shadow-md py-1 z-50">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setClient(c.id); setClientOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[13px] hover:bg-accent flex justify-between"
                    >
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">{c.handle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setPeriodOpen((o) => !o); setClientOpen(false); }}
                className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-[13px] hover:bg-accent"
              >
                {period}
                <ChevronDown size={14} />
              </button>
              {periodOpen && (
                <div className="absolute mt-1 left-0 w-48 bg-popover border border-border rounded-md shadow-md py-1 z-50">
                  {periods.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[13px] hover:bg-accent"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-accent"
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-[14px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-[0_2px_4px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children, variant = "primary", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md font-semibold text-[14px] transition-colors disabled:opacity-50";
  const styles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 px-6 py-3",
    secondary: "bg-card border border-border text-foreground hover:bg-accent px-6 py-3",
    ghost: "text-foreground hover:bg-accent px-3 py-2",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children, tone = "neutral",
}: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "error" | "primary" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    error: "bg-destructive/15 text-destructive",
    primary: "bg-primary/15 text-primary",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
