import { createFileRoute } from "@tanstack/react-router";
import { X402CallsAnalytics } from "@/components/charts/X402Calls";
import { X402TokensAnalytics } from "@/components/charts/X402Tokens";
import { X402CreditsAnalytics } from "@/components/charts/X402Credits";

export const Route = createFileRoute("/x402")({
	component: X402Page,
});

function X402Page() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">x402 Analytics</h2>
			<X402CallsAnalytics />
			<br />
			<X402TokensAnalytics />
			<br />
			<X402CreditsAnalytics />
		</main>
	);
}
