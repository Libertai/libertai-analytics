"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { getDateRange } from "@/utils/dates";
import FilterModelNames from "@/components/FilterModelNames";
import { formatDate } from "@/utils/dates";
import { ChartDate } from "@/types/dates";
import useApiUsageStats from "@/stores/api";
import { groupApiUsagePerDay, groupApiUsagePerDayAllModels } from "@/utils/api";
import { getDates, timeframes } from "@/utils/charts";
import ChartContainer from "../ChartContainer";
import MultiModelChartContainer from "../MultiModelChartContainer";

export function ApiAnalytics() {
	const { fetchApiCalls } = useApiUsageStats();
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedDates, setSelectedDates] = useState<ChartDate>(getDates(timeframes[1].days));
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false)
	const apiUsageStats = useApiUsageStats();
	const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
	const data = groupApiUsagePerDayAllModels(apiUsageStats.apiUsage, selectedDates, selectedModel);

	useEffect(() => {
		if (!rangeDate || !rangeDate.from || !rangeDate.to) {
			const dates = getDates(selectedTimeframe.days);
			fetchApiCalls(dates);
			setSelectedDates(dates);
			return;
		}
		const dates = selectedCustomDates ? {start_date: formatDate(rangeDate?.from), end_date: formatDate(rangeDate?.to)} :  getDateRange(selectedTimeframe.days);
		fetchApiCalls(dates);
		setSelectedDates(dates);
	}, [fetchApiCalls, rangeDate, selectedCustomDates, selectedTimeframe.days, selectedModel]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>API </CardTitle>
				<CardDescription>API usage over time</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="sm:flex mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"}
							className="mr-2"
							onClick={() => {
								setSelectedTimeframe(timeframe)
								setSelectedCustomDates(false)
							}}
						>
							{timeframe.label}
						</Button>
					))}
					<div onClick={() => setSelectedCustomDates(true)} className={"mt-3 sm:mt-0"}>
						<DateRangePicker hasCustomDateBeenClicked={selectedCustomDates} rangeDate={rangeDate} setRangeDate={setRangeDate} />
					</div>
					<FilterModelNames setSelectedModel={setSelectedModel}/>
				</div>
				<MultiModelChartContainer
				  data={data}
				  cards={[{number: apiUsageStats.totalCalls, description: "Total api calls" }]}
				  selectedModel={selectedModel}
				/>
			</CardContent>
		</Card>
	);
}
