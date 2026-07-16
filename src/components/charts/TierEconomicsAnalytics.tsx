"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { useTierEconomicsQuery } from "@/hooks/useTierEconomicsQuery";
import { buildTierEconomicsSeries, EconomicsWindow, tierRangeTotals } from "@/utils/tierEconomics";
import { formatCredits } from "@/utils/format";
import { segmentLabel } from "@/utils/subscriptions";

// Subscriptions launched 2026-06-22.
const ALL_TIME_START = "2026-06-22";

const WINDOWS = [
	{ value: "cumulative", label: "Cumulative" },
	{ value: "daily", label: "Daily" },
] as const;

export function TierEconomicsAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [windowMode, setWindowMode] = useState<EconomicsWindow>("cumulative");

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, ALL_TIME_START);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: queryData, isLoading, isFetching } = useTierEconomicsQuery(selectedDates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return buildTierEconomicsSeries(deferred.daily, deferred.tier_prices, selectedDates, windowMode);
	}, [deferred, selectedDates, windowMode]);

	const cards = useMemo(() => {
		if (!deferred) return [];
		return tierRangeTotals(deferred.daily, deferred.tier_prices).map((t) => ({
			number: t.value ?? 0,
			description: segmentLabel(t.tier),
			formatter: formatCredits,
		}));
	}, [deferred]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tier value</CardTitle>
				<CardDescription>
					PAYG credit value delivered per $1 of subscription revenue for each tier. Counts only credits the
					subscription covered, across all providers.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
					<div className="flex flex-wrap gap-2">
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
					<ChartModeToggle modes={WINDOWS} value={windowMode} onChange={setWindowMode} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!queryData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer data={data} cards={cards} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
