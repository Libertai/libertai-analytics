import { createFileRoute } from "@tanstack/react-router";
import { AgentsAnalytics } from "@/components/charts/Agents";
import { CreditsAnalytics } from "@/components/charts/Credits";
import { ApiAnalytics } from "@/components/charts/Api";
import { TokensAnalytics } from "@/components/charts/Tokens.tsx";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">LibertAI Analytics</h1>
			<AgentsAnalytics />
			<br />
			<CreditsAnalytics />
			<br />
			<TokensAnalytics />
			<br />
			<ApiAnalytics />
		</main>
	);
}
