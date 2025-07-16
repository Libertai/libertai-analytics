"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import useCreditsStats from "@/stores/credits";
import { formatDate, getDateRange } from "@/utils/dates";
import { groupCreditsPerDayAllModels } from "@/utils/credits";
import FilterModelNames from "@/components/FilterModelNames";
import { ChartDate } from "@/types/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";

export function CreditsAnalytics() {
	const { fetchCredits } = useCreditsStats();
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedDates, setSelectedDates] = useState<ChartDate>(getDates(timeframes[1].days));
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const creditsStats = useCreditsStats();
	const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
	const data = groupCreditsPerDayAllModels(creditsStats.credits, selectedDates, selectedModel);

	useEffect(() => {
		if (!rangeDate || !rangeDate.from || !rangeDate.to) {
			const dates = getDates(selectedTimeframe.days);
			fetchCredits(dates);
			setSelectedDates(dates);
			return;
		}
		const dates = selectedCustomDates
			? {
					start_date: formatDate(rangeDate?.from),
					end_date: formatDate(rangeDate?.to),
				}
			: getDateRange(selectedTimeframe.days);
		fetchCredits(dates);
		setSelectedDates(dates);
	}, [fetchCredits, rangeDate, selectedCustomDates, selectedTimeframe.days, selectedModel]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Credits</CardTitle>
				<CardDescription>Credits usage over time</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="sm:flex mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={
								timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"
							}
							className="mr-2"
							onClick={() => {
								setSelectedTimeframe(timeframe);
								setSelectedCustomDates(false);
							}}
						>
							{timeframe.label}
						</Button>
					))}
					<div onClick={() => setSelectedCustomDates(true)} className={"mt-3 sm:mt-0"}>
						<DateRangePicker
							hasCustomDateBeenClicked={selectedCustomDates}
							rangeDate={rangeDate}
							setRangeDate={setRangeDate}
						/>
					</div>
					<FilterModelNames setSelectedModel={setSelectedModel} />
				</div>
				<MultiModelChartContainer
					data={data}
					cards={[{ number: creditsStats.totalCreditsUsed, description: "Total credits used" }]}
					selectedModel={selectedModel}
				/>
			</CardContent>
		</Card>
	);
}
