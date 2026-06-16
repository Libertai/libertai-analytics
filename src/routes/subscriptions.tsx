import { createFileRoute } from "@tanstack/react-router";
import { SubscribersByTier } from "@/components/charts/SubscribersByTier";
import { MessagesBySegmentAnalytics } from "@/components/charts/MessagesBySegmentAnalytics";
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
					Plan adoption, chat volume per segment, and credit consumption.
				</p>
			</div>
			<SubscribersByTier />
			<MessagesBySegmentAnalytics />
			<CreditsConsumptionAnalytics />
		</div>
	);
}
