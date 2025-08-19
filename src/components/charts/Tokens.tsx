"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { getDates, timeframes } from "@/utils/charts.ts";
import { Button } from "@/components/ui/button.tsx";
import DateRangePicker from "@/components/DateRangePicker.tsx";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import useTokensStats from "@/stores/tokens.ts";
import { formatDate, getDateRange } from "@/utils/dates.ts";
import { ChartDate } from "@/types/dates.ts";
import FilterModelNames from "@/components/FilterModelNames.tsx";
import { groupTokensPerDayAllModels } from "@/utils/tokens.ts";
import TokensChartContainer from "@/components/TokensChartContainer.tsx";

export function TokensAnalytics() {
	const { fetchTokens } = useTokensStats();
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false)
	const [selectedDates, setSelectedDates] = useState<ChartDate>(getDates(timeframes[1].days));
	const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
	const tokensStats = useTokensStats();
	const data = groupTokensPerDayAllModels(tokensStats.tokens, selectedDates, selectedModel);

	const cards = selectedModel ? [
		{
			number: tokensStats.tokens
				.filter(token => 
					token.model_name === selectedModel && 
					token.date >= selectedDates.start_date && 
					token.date <= selectedDates.end_date
				)
				.reduce((sum, token) => sum + token.nb_input_tokens, 0),
			description: `Input Tokens`
		},
		{
			number: tokensStats.tokens
				.filter(token => 
					token.model_name === selectedModel && 
					token.date >= selectedDates.start_date && 
					token.date <= selectedDates.end_date
				)
				.reduce((sum, token) => sum + token.nb_output_tokens, 0),
			description: `Output Tokens`
		}
	] : [
		{
			number: tokensStats.totalInputTokens,
			description: "Total Input Tokens"
		},
		{
			number: tokensStats.totalOutputTokens,
			description: "Total Output Tokens"
		}
	];

	useEffect(() => {
		if (!rangeDate || !rangeDate.from || !rangeDate.to) {
			const dates = getDates(selectedTimeframe.days);
			fetchTokens(dates);
			setSelectedDates(dates);
			return;
		}
		const dates = selectedCustomDates
			? {
				start_date: formatDate(rangeDate?.from),
				end_date: formatDate(rangeDate?.to),
			}
			: getDateRange(selectedTimeframe.days);
		fetchTokens(dates);
		setSelectedDates(dates);
	}, [fetchTokens, rangeDate, selectedCustomDates, selectedTimeframe.days, selectedModel]);


	return (
		<Card>
			<CardHeader>
				<CardTitle>Tokens used</CardTitle>
				<CardDescription>Tokens consumption by users</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="sm:flex mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={timeframe.days === selectedTimeframe.days && !selectedCustomDates ? "default" : "outline"}
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
						<DateRangePicker
							hasCustomDateBeenClicked={selectedCustomDates}
							rangeDate={rangeDate}
							setRangeDate={setRangeDate}
						/>
					</div>
					<FilterModelNames setSelectedModel={setSelectedModel} />
				</div>
				<TokensChartContainer 
					data={data} 
					cards={cards} 
				/>
			</CardContent>
		</Card>
	)
}
