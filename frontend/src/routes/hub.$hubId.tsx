import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader, Card } from "@/components/app-shell";
import { findHub, hubs } from "@/lib/skills";

export const Route = createFileRoute("/hub/$hubId")({
  component: HubPage,
});

function HubPage() {
  const { hubId } = Route.useParams();
  const navigate = useNavigate();
  const hub = findHub(hubId);

  if (!hub) {
    return (
      <>
        <PageHeader title="Hub não encontrado" subtitle="Selecione um hub válido na barra lateral." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((h) => (
            <Link key={h.id} to="/hub/$hubId" params={{ hubId: h.id }} className="block">
              <Card className="hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <h.icon size={20} className="text-primary" />
                  <span className="font-medium">{h.name}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </>
    );
  }

  const Icon = hub.icon;

  return (
    <>
      <div
        className={`rounded-xl p-6 md:p-8 mb-8 text-white bg-gradient-to-br ${hub.gradient}`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Icon size={24} />
            </div>
            <div>
              <div className="text-[12px] uppercase tracking-wider opacity-80">Hub de Skills</div>
              <h1 className="text-2xl md:text-3xl font-bold mt-0.5">{hub.name}</h1>
              <p className="text-[14px] opacity-90 mt-1 max-w-xl">{hub.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{hub.skills.length}</div>
            <div className="text-[12px] opacity-80">skills disponíveis</div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Skills"
        subtitle="Clique em uma skill para executá-la com a IA ou abrir a tela dedicada."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hub.skills.map((skill) => {
          const SIcon = skill.icon;
          const content = (
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <SIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[14px] truncate">{skill.name}</h3>
                    {skill.route && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Tela</span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">{skill.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-[12px]">
                    <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                      {skill.route ? "Abrir tela" : "Executar com IA"} <ArrowRight size={12} />
                    </span>
                    {!skill.route && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Sparkles size={11} /> IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );

          if (skill.route) {
            return (
              <Link key={skill.id} to={skill.route} className="block">
                {content}
              </Link>
            );
          }
          return (
            <button
              key={skill.id}
              type="button"
              className="text-left"
              onClick={() =>
                navigate({
                  to: "/assistente",
                  search: { skill: skill.id, hub: hub.id } as never,
                })
              }
            >
              {content}
            </button>
          );
        })}
      </div>
    </>
  );
}
