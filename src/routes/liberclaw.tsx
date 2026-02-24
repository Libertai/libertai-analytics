import { createFileRoute } from "@tanstack/react-router";
import { LiberclawAnalytics } from "@/components/charts/LiberclawCalls";
import { LiberclawTokensAnalytics } from "@/components/charts/LiberclawTokens";
import { LiberclawCreditsAnalytics } from "@/components/charts/LiberclawCredits";

export const Route = createFileRoute("/liberclaw")({
	component: LiberclawPage,
});

function LiberclawPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">Liberclaw Analytics</h2>
			<LiberclawAnalytics />
			<br />
			<LiberclawTokensAnalytics />
			<br />
			<LiberclawCreditsAnalytics />
		</main>
	);
}
