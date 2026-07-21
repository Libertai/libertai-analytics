"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import { groupCreditsPerDayAllModels } from "@/utils/credits";
import FilterModelNames from "@/components/FilterModelNames";
import { BY_MODEL_MODES, ByModelMode } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCreditsQuery } from "@/hooks/useCreditsQuery";
import { formatCredits } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { ChartDate } from "@/types/dates";

export function CreditsAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [mode, setMode] = useState<ByModelMode>("by-model");

	const { data: creditsData, isLoading, isFetching } = useCreditsQuery(type, dates);

	const deferredCreditsData = useDeferredValue(creditsData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredCreditsData) return [];
		return groupCreditsPerDayAllModels(deferredCreditsData.credits, dates, deferredSelectedModels);
	}, [deferredCreditsData, dates, deferredSelectedModels]);

	// Scope the total-credits card to the selected models (whole range when none selected).
	const totalCreditsUsed = useMemo(() => {
		if (!deferredCreditsData) return 0;
		if (deferredSelectedModels.length === 0) return deferredCreditsData.total_credits_used;
		return deferredCreditsData.credits
			.filter(
				(credit) =>
					deferredSelectedModels.includes(credit.model_name) &&
					credit.used_at >= dates.start_date &&
					credit.used_at <= dates.end_date,
			)
			.reduce((sum, credit) => sum + credit.credits_used, 0);
	}, [deferredCreditsData, deferredSelectedModels, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.credits?.title}</CardTitle>
				<CardDescription>{type.credits?.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
					<FilterModelNames setSelectedModels={setSelectedModels} />
					<ChartModeToggle modes={BY_MODEL_MODES} value={mode} onChange={setMode} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!creditsData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[{ number: totalCreditsUsed, description: "Total credits used", formatter: formatCredits }]}
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
