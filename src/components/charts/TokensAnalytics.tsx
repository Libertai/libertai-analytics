"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDates, timeframes } from "@/utils/charts";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/DateRangePicker";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { formatDate } from "@/utils/dates";
import FilterModelNames from "@/components/FilterModelNames";
import { groupTokensPerDayAllModels } from "@/utils/tokens";
import TokensChartContainer from "@/components/TokensChartContainer";
import { useTokensQuery } from "@/hooks/useTokensQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";

export function TokensAnalytics({ type }: { type: RequestTypeConfig }) {
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

	const { data: tokensData, isLoading, isFetching } = useTokensQuery(type, selectedDates);

	const deferredTokensData = useDeferredValue(tokensData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredTokensData) return [];
		return groupTokensPerDayAllModels(deferredTokensData.tokens, selectedDates, deferredSelectedModels);
	}, [deferredTokensData, selectedDates, deferredSelectedModels]);

	const cards = useMemo(() => {
		if (!deferredTokensData) {
			return [
				{ number: 0, description: "Total Input Tokens", formatter: formatCount },
				{ number: 0, description: "Total Output Tokens", formatter: formatCount },
				{ number: 0, description: "Total Cached Input Tokens", formatter: formatCount },
			];
		}

		if (deferredSelectedModels.length > 0) {
			const filtered = deferredTokensData.tokens.filter(
				(token) =>
					deferredSelectedModels.includes(token.model_name) &&
					token.date >= selectedDates.start_date &&
					token.date <= selectedDates.end_date,
			);
			return [
				{
					number: filtered.reduce((sum, token) => sum + token.nb_input_tokens, 0),
					description: `Input Tokens`,
					formatter: formatCount,
				},
				{
					number: filtered.reduce((sum, token) => sum + token.nb_output_tokens, 0),
					description: `Output Tokens`,
					formatter: formatCount,
				},
				{
					number: filtered.reduce((sum, token) => sum + token.nb_cached_tokens, 0),
					description: `Cached Input Tokens`,
					formatter: formatCount,
				},
			];
		}

		return [
			{
				number: deferredTokensData.total_input_tokens,
				description: "Input Tokens",
				formatter: formatCount,
			},
			{
				number: deferredTokensData.total_output_tokens,
				description: "Output Tokens",
				formatter: formatCount,
			},
			{
				number: deferredTokensData.total_cached_tokens,
				description: "Cached Input Tokens",
				formatter: formatCount,
			},
		];
	}, [deferredTokensData, deferredSelectedModels, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.tokens.title}</CardTitle>
				<CardDescription>{type.tokens.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
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
					<FilterModelNames setSelectedModels={setSelectedModels} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!tokensData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<TokensChartContainer data={data} cards={cards} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
