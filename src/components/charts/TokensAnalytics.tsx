"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BY_TYPE_MODES, ByTypeMode } from "@/utils/charts";
import { useDeferredValue, useMemo, useState } from "react";
import FilterModelNames from "@/components/FilterModelNames";
import { groupTokensPerDayAllModels } from "@/utils/tokens";
import TokensChartContainer from "@/components/TokensChartContainer";
import { useTokensQuery } from "@/hooks/useTokensQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { ChartDate } from "@/types/dates";

export function TokensAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [mode, setMode] = useState<ByTypeMode>("by-type");

	const { data: tokensData, isLoading, isFetching } = useTokensQuery(type, dates);

	const deferredTokensData = useDeferredValue(tokensData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredTokensData) return [];
		return groupTokensPerDayAllModels(deferredTokensData.tokens, dates, deferredSelectedModels);
	}, [deferredTokensData, dates, deferredSelectedModels]);

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
					token.date >= dates.start_date &&
					token.date <= dates.end_date,
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
	}, [deferredTokensData, deferredSelectedModels, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.tokens.title}</CardTitle>
				<CardDescription>{type.tokens.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
					<FilterModelNames setSelectedModels={setSelectedModels} />
					<ChartModeToggle modes={BY_TYPE_MODES} value={mode} onChange={setMode} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!tokensData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<TokensChartContainer data={data} cards={cards} mode={mode} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
