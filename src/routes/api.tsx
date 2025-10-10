import { createFileRoute } from "@tanstack/react-router";
import { CreditsAnalytics } from "@/components/charts/Credits";
import { ApiAnalytics } from "@/components/charts/Api";
import { TokensAnalytics } from "@/components/charts/Tokens";

export const Route = createFileRoute("/api")({
	component: ApiPage,
});

function ApiPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">API Analytics</h2>
			<ApiAnalytics />
			<br />
			<TokensAnalytics />
			<br />
			<CreditsAnalytics />
		</main>
	);
}
