import { createFileRoute } from "@tanstack/react-router";
import { SkillPanel } from "@/components/skill-panel";

export const Route = createFileRoute("/skill/$skillId")({
  component: SkillRoute,
});

function SkillRoute() {
  const { skillId } = Route.useParams();
  return <SkillPanel skillId={skillId} />;
}
