"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import FilterModelNames from "@/components/FilterModelNames";
import { groupApiUsagePerDayAllModels } from "@/utils/api";
import { BY_MODEL_MODES, ByModelMode } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCallsQuery } from "@/hooks/useCallsQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { ChartDate } from "@/types/dates";

export function CallsAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	const [mode, setMode] = useState<ByModelMode>("by-model");

	const { data: apiData, isLoading, isFetching } = useCallsQuery(type, dates);

	const deferredApiData = useDeferredValue(apiData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredApiData) return [];
		return groupApiUsagePerDayAllModels(deferredApiData.calls, dates, deferredSelectedModels);
	}, [deferredApiData, dates, deferredSelectedModels]);

	// Scope the total-calls card to the selected models (whole range when none selected).
	const totalCalls = useMemo(() => {
		if (!deferredApiData) return 0;
		if (deferredSelectedModels.length === 0) return deferredApiData.total_calls;
		return deferredApiData.calls
			.filter(
				(call) =>
					deferredSelectedModels.includes(call.model_name) &&
					call.used_at >= dates.start_date &&
					call.used_at <= dates.end_date,
			)
			.reduce((sum, call) => sum + call.call_count, 0);
	}, [deferredApiData, deferredSelectedModels, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.calls.title}</CardTitle>
				<CardDescription>{type.calls.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
					<FilterModelNames setSelectedModels={setSelectedModels} />
					<ChartModeToggle modes={BY_MODEL_MODES} value={mode} onChange={setMode} />
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
							mode={mode}
							combineLabel="Total Calls"
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
