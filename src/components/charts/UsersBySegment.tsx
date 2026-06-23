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

/** User base by segment: a snapshot of anonymous + free + paid tiers, plus paid subscribers per
 * tier over time. Subscriptions cover all usage, so this is a users view, not a chat metric. */
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

	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, ALL_TIME_START);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: overTimeData, isLoading: overTimeLoading, isFetching } = useSubscribersOverTimeQuery(selectedDates);
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
					Anonymous (distinct logged-out IPs), registered free users, and active paid subscribers per tier
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3 space-y-6">
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

				<div>
					<p className="text-sm font-medium">Paid subscribers per tier over time</p>
					<p className="text-sm text-muted-foreground mb-4">Active paid subscribers per day, split by tier</p>
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
						{!overTimeData && overTimeLoading ? (
							<div className="flex justify-center items-center py-8">
								<p className="text-gray-500">Loading...</p>
							</div>
						) : (
							<MultiModelChartContainer data={chartData} cards={[]} />
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
