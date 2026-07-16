"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useSubscriptionsQuery } from "@/hooks/useSubscriptionsQuery";
import { useSubscribersOverTimeQuery } from "@/hooks/useSubscribersOverTimeQuery";
import { groupSubscribersByTierPerDay } from "@/utils/subscriptions";
import { ChartDate } from "@/types/dates";

const TIER_ORDER = ["go", "plus", "max"];
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Active paid subscribers per tier over time, with current user-base totals (anonymous + free +
 * paid tiers) as cards. Subscriptions cover all usage, so this is a users view, not a chat metric. */
export function UsersBySegment({ dates }: { dates: ChartDate }) {
	const { data } = useSubscriptionsQuery();

	const byTier = [...(data?.subscribers_by_tier ?? [])].sort(
		(a, b) => (TIER_ORDER.indexOf(a.tier) + 1 || 99) - (TIER_ORDER.indexOf(b.tier) + 1 || 99),
	);

	const cards = [
		{ number: data?.anonymous_users ?? 0, description: "Anonymous (total)" },
		{ number: data?.free_users ?? 0, description: "Free (total)" },
		...byTier.map((t) => ({ number: t.active_subscribers, description: `${label(t.tier)} (total)` })),
	];

	const { data: overTimeData, isLoading, isFetching } = useSubscribersOverTimeQuery(dates);
	const deferred = useDeferredValue(overTimeData);

	const chartData = useMemo(() => {
		if (!deferred) return [];
		return groupSubscribersByTierPerDay(deferred.daily, dates);
	}, [deferred, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Users by segment</CardTitle>
				<CardDescription>
					Active paid subscribers per tier per day. Cards show current totals: anonymous (distinct logged-out IPs),
					registered free users, and active paid subscribers per tier.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!overTimeData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer data={chartData} cards={cards} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
