"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { groupCreditsPerDayAllModels } from "@/utils/credits";
import FilterModelNames from "@/components/FilterModelNames";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useX402CreditsQuery } from "@/hooks/useX402CreditsQuery";
import { formatCredits } from "@/utils/format";

export function X402CreditsAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getDates(selectedTimeframe.days);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: creditsData, isLoading, isFetching } = useX402CreditsQuery(selectedDates);

	const deferredCreditsData = useDeferredValue(creditsData);
	const deferredSelectedModel = useDeferredValue(selectedModel);

	const data = useMemo(() => {
		if (!deferredCreditsData) return [];
		return groupCreditsPerDayAllModels(deferredCreditsData.credits_usage, selectedDates, deferredSelectedModel);
	}, [deferredCreditsData, selectedDates, deferredSelectedModel]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>x402 Credits</CardTitle>
				<CardDescription>Credits ($) consumed by x402</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex flex-wrap gap-2">
						{timeframes.map((timeframe) => (
							<Button
								key={timeframe.label}
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
					<FilterModelNames setSelectedModel={setSelectedModel} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!creditsData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[
								{
									number: creditsData?.total_credits_used || 0,
									description: "Total credits used",
									formatter: formatCredits,
								},
							]}
							selectedModel={selectedModel}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
