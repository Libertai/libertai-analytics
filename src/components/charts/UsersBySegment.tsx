"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useUserBaseActivityQuery } from "@/hooks/useUserBaseActivityQuery";
import { useSubscribersOverTimeQuery } from "@/hooks/useSubscribersOverTimeQuery";
import { groupSubscribersByTierPerDay } from "@/utils/subscriptions";
import { ChartDate } from "@/types/dates";

const TIER_ORDER = ["go", "plus", "max"];
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Active paid subscribers per tier over time. Cards are scoped to the selected range:
 * anonymous/free activity within it, paid subscribers per tier at its end. */
export function UsersBySegment({ dates }: { dates: ChartDate }) {
	const { data: activity } = useUserBaseActivityQuery(dates);

	const { data: overTimeData, isLoading, isFetching } = useSubscribersOverTimeQuery(dates);
	const deferred = useDeferredValue(overTimeData);

	const chartData = useMemo(() => {
		if (!deferred) return [];
		return groupSubscribersByTierPerDay(deferred.daily, dates);
	}, [deferred, dates]);

	const cards = useMemo(() => {
		const rangeEnd = chartData.at(-1) ?? {};
		return [
			{ number: activity?.anonymous_active_users ?? 0, description: "Anonymous (range)" },
			{ number: activity?.free_active_users ?? 0, description: "Free (range)" },
			...TIER_ORDER.map(label)
				.filter((tier) => tier in rangeEnd)
				.map((tier) => ({ number: Number(rangeEnd[tier as keyof typeof rangeEnd]) || 0, description: `${tier} (range end)` })),
		];
	}, [activity, chartData]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Users by segment</CardTitle>
				<CardDescription>
					Active paid subscribers per tier per day. Cards are scoped to the selected range: anonymous
					(distinct logged-out IPs) and free users active within it, and paid subscribers per tier at its end.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!overTimeData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer data={chartData} cards={cards} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
