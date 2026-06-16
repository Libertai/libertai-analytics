"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionsQuery } from "@/hooks/useSubscriptionsQuery";

const TIER_ORDER = ["go", "plus", "max"];
const tierLabel = (tier: string) => tier.charAt(0).toUpperCase() + tier.slice(1);

export function SubscribersByTier() {
	const { data, isLoading } = useSubscriptionsQuery();

	const byTier = [...(data?.subscribers_by_tier ?? [])].sort(
		(a, b) => (TIER_ORDER.indexOf(a.tier) + 1 || 99) - (TIER_ORDER.indexOf(b.tier) + 1 || 99),
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Active subscribers</CardTitle>
				<CardDescription>Current paid subscribers per tier (live snapshot)</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<p className="text-gray-500">Loading...</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:flex gap-3">
						<Card className="md:w-fit md:mx-auto">
							<CardHeader className="text-center py-4">
								<CardTitle>{data?.total_paid_subscribers ?? 0}</CardTitle>
								<CardDescription>Total paid</CardDescription>
							</CardHeader>
						</Card>
						{byTier.map((t) => (
							<Card key={t.tier} className="md:w-fit md:mx-auto">
								<CardHeader className="text-center py-4">
									<CardTitle>{t.active_subscribers}</CardTitle>
									<CardDescription>{tierLabel(t.tier)}</CardDescription>
								</CardHeader>
							</Card>
						))}
						{byTier.length === 0 && <p className="text-gray-500 py-4">No active paid subscribers yet.</p>}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
