import { createFileRoute } from "@tanstack/react-router";
import { OnboardingChat } from "@/components/onboarding-chat";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return <OnboardingChat />;
}
