import { createFileRoute } from "@tanstack/react-router";
import { SkillPanel } from "@/components/skill-panel";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return <SkillPanel skillId="lb-sistema-onboarding" />;
}
