import { createFileRoute } from "@tanstack/react-router";
import { UsersBySegment } from "@/components/charts/UsersBySegment";
import { CreditsConsumptionAnalytics } from "@/components/charts/CreditsConsumptionAnalytics";

export const Route = createFileRoute("/subscriptions")({
	component: Subscriptions,
});

function Subscriptions() {
	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Subscriptions &amp; credits</h1>
				<p className="text-sm text-muted-foreground mt-1">
					User base by segment and credit consumption across all usage (chat, API, CLI).
				</p>
			</div>
			<UsersBySegment />
			<CreditsConsumptionAnalytics />
		</div>
	);
}
