"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionsQuery } from "@/hooks/useSubscriptionsQuery";

const TIER_ORDER = ["go", "plus", "max"];
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** User base by segment (snapshot): anonymous + free + paid tiers. Subscriptions cover all usage,
 * so this is a users view, not a chat metric. */
export function UsersBySegment() {
	const { data, isLoading } = useSubscriptionsQuery();

	const byTier = [...(data?.subscribers_by_tier ?? [])].sort(
		(a, b) => (TIER_ORDER.indexOf(a.tier) + 1 || 99) - (TIER_ORDER.indexOf(b.tier) + 1 || 99),
	);

	const cards = [
		{ key: "anonymous", value: data?.anonymous_users ?? 0, label: "Anonymous" },
		{ key: "free", value: data?.free_users ?? 0, label: "Free" },
		...byTier.map((t) => ({ key: t.tier, value: t.active_subscribers, label: label(t.tier) })),
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Users by segment</CardTitle>
				<CardDescription>
					Anonymous (distinct logged-out IPs), registered free users, and active paid subscribers per tier
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<p className="text-gray-500">Loading...</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:flex gap-3">
						{cards.map((c) => (
							<Card key={c.key} className="md:w-fit md:mx-auto">
								<CardHeader className="text-center py-4">
									<CardTitle>{c.value}</CardTitle>
									<CardDescription>{c.label}</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
