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
import { useCreditsQuery } from "@/hooks/useCreditsQuery";
import { formatCredits } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";

const CREDITS_MODES = [
	{ value: "by-model", label: "By model" },
	{ value: "combined", label: "Combined" },
] as const;
type CreditsMode = (typeof CREDITS_MODES)[number]["value"];

export function CreditsAnalytics({ type }: { type: RequestTypeConfig }) {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [mode, setMode] = useState<CreditsMode>("by-model");

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getDates(selectedTimeframe.days, type.allTimeStartDate);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days, type.allTimeStartDate]);

	const { data: creditsData, isLoading, isFetching } = useCreditsQuery(type, selectedDates);

	const deferredCreditsData = useDeferredValue(creditsData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredCreditsData) return [];
		return groupCreditsPerDayAllModels(deferredCreditsData.credits, selectedDates, deferredSelectedModels);
	}, [deferredCreditsData, selectedDates, deferredSelectedModels]);

	// Scope the total-credits card to the selected models (whole range when none selected).
	const totalCreditsUsed = useMemo(() => {
		if (!deferredCreditsData) return 0;
		if (deferredSelectedModels.length === 0) return deferredCreditsData.total_credits_used;
		return deferredCreditsData.credits
			.filter(
				(credit) =>
					deferredSelectedModels.includes(credit.model_name) &&
					credit.used_at >= selectedDates.start_date &&
					credit.used_at <= selectedDates.end_date,
			)
			.reduce((sum, credit) => sum + credit.credits_used, 0);
	}, [deferredCreditsData, deferredSelectedModels, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.credits?.title}</CardTitle>
				<CardDescription>{type.credits?.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex items-center justify-between gap-2 flex-wrap">
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
						<ChartModeToggle modes={CREDITS_MODES} value={mode} onChange={setMode} />
					</div>
					<FilterModelNames setSelectedModels={setSelectedModels} />
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
									number: totalCreditsUsed,
									description: "Total credits used",
									formatter: formatCredits,
								},
							]}
							selectedModels={selectedModels}
							mode={mode}
							combineLabel="Total credits"
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
