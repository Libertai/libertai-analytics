"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCreditsConsumptionQuery } from "@/hooks/useCreditsConsumptionQuery";
import { groupCreditsConsumptionPerDay } from "@/utils/subscriptions";
import { formatCredits } from "@/utils/format";

// Credits are only tracked since metering launched.
const ALL_TIME_START = "2026-06-01";

export function CreditsConsumptionAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, ALL_TIME_START);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: queryData, isLoading, isFetching } = useCreditsConsumptionQuery(selectedDates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return groupCreditsConsumptionPerDay(deferred.daily, selectedDates);
	}, [deferred, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Credits consumption</CardTitle>
				<CardDescription>Credits ($) consumed per day, split by tier-covered (subscription) vs prepaid balance</CardDescription>
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
					{!queryData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[
								{ number: queryData?.total_credits || 0, description: "Total credits", formatter: formatCredits },
								{ number: queryData?.total_tier_credits || 0, description: "Tier-covered", formatter: formatCredits },
								{ number: queryData?.total_prepaid_credits || 0, description: "Prepaid", formatter: formatCredits },
							]}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
