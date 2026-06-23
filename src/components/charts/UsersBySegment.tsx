"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useSubscriptionsQuery } from "@/hooks/useSubscriptionsQuery";
import { useSubscribersOverTimeQuery } from "@/hooks/useSubscribersOverTimeQuery";
import { groupSubscribersByTierPerDay } from "@/utils/subscriptions";

const TIER_ORDER = ["go", "plus", "max"];
const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Paid plans launched alongside metering.
const ALL_TIME_START = "2026-06-01";

/** Active paid subscribers per tier over time, with current user-base totals (anonymous + free +
 * paid tiers) as cards. Subscriptions cover all usage, so this is a users view, not a chat metric. */
export function UsersBySegment() {
	const { data } = useSubscriptionsQuery();

	const byTier = [...(data?.subscribers_by_tier ?? [])].sort(
		(a, b) => (TIER_ORDER.indexOf(a.tier) + 1 || 99) - (TIER_ORDER.indexOf(b.tier) + 1 || 99),
	);

	const cards = [
		{ number: data?.anonymous_users ?? 0, description: "Anonymous (total)" },
		{ number: data?.free_users ?? 0, description: "Free (total)" },
		...byTier.map((t) => ({ number: t.active_subscribers, description: `${label(t.tier)} (total)` })),
	];

	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, ALL_TIME_START);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: overTimeData, isLoading, isFetching } = useSubscribersOverTimeQuery(selectedDates);
	const deferred = useDeferredValue(overTimeData);

	const chartData = useMemo(() => {
		if (!deferred) return [];
		return groupSubscribersByTierPerDay(deferred.daily, selectedDates);
	}, [deferred, selectedDates]);

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
				<div className="flex flex-wrap gap-2 mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							className="max-md:h-8 max-md:px-3 max-md:text-xs"
							variant={timeframe.days === selectedTimeframe.days && !selectedCustomDates ? "default" : "outline"}
							onClick={() => {
								setSelectedTimeframe(timeframe);
								setSelectedCustomDates(false);
							}}
						>
							{timeframe.label}
						</Button>
					))}
					<div onClick={() => setSelectedCustomDates(true)}>
						<DateRangePicker
							hasCustomDateBeenClicked={selectedCustomDates}
							rangeDate={rangeDate}
							setRangeDate={setRangeDate}
						/>
					</div>
				</div>
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
