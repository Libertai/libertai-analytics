"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import FilterModelNames from "@/components/FilterModelNames";
import { groupApiUsagePerDayAllModels } from "@/utils/api";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCallsQuery } from "@/hooks/useCallsQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";

export function CallsAnalytics({ type }: { type: RequestTypeConfig }) {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [selectedModels, setSelectedModels] = useState<string[]>([]);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getDates(selectedTimeframe.days, type.allTimeStartDate);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days, type.allTimeStartDate]);

	const { data: apiData, isLoading, isFetching } = useCallsQuery(type, selectedDates);

	const deferredApiData = useDeferredValue(apiData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredApiData) return [];
		return groupApiUsagePerDayAllModels(deferredApiData.calls, selectedDates, deferredSelectedModels);
	}, [deferredApiData, selectedDates, deferredSelectedModels]);

	// Scope the total-calls card to the selected models (whole range when none selected).
	const totalCalls = useMemo(() => {
		if (!deferredApiData) return 0;
		if (deferredSelectedModels.length === 0) return deferredApiData.total_calls;
		return deferredApiData.calls
			.filter(
				(call) =>
					deferredSelectedModels.includes(call.model_name) &&
					call.used_at >= selectedDates.start_date &&
					call.used_at <= selectedDates.end_date,
			)
			.reduce((sum, call) => sum + call.call_count, 0);
	}, [deferredApiData, deferredSelectedModels, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.calls.title}</CardTitle>
				<CardDescription>{type.calls.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex flex-wrap gap-2">
						{timeframes.map((timeframe) => (
							<Button
								key={timeframe.label}
								className="max-md:h-8 max-md:px-3 max-md:text-xs"
								variant={
									timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"
								}
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
					<FilterModelNames setSelectedModels={setSelectedModels} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!apiData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[{ number: totalCalls, description: type.calls.cardLabel, formatter: formatCount }]}
							selectedModels={selectedModels}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
