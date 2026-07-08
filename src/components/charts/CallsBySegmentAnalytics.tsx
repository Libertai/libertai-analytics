"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCallsBySegmentQuery } from "@/hooks/useCallsBySegmentQuery";
import { groupBySegmentPerDay } from "@/utils/subscriptions";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";

export function CallsBySegmentAnalytics({ type }: { type: RequestTypeConfig }) {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, type.allTimeStartDate);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days, type.allTimeStartDate]);

	const { data: queryData, isLoading, isFetching } = useCallsBySegmentQuery(type, selectedDates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return groupBySegmentPerDay(deferred.calls, selectedDates, "call_count");
	}, [deferred, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.callsBySegment?.title}</CardTitle>
				<CardDescription>{type.callsBySegment?.description}</CardDescription>
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
							cards={[{ number: queryData?.total_calls || 0, description: "Total calls", formatter: formatCount }]}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
