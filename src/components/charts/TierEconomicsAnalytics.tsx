"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { useTierEconomicsQuery } from "@/hooks/useTierEconomicsQuery";
import { buildTierEconomicsSeries, EconomicsWindow, tierRangeTotals } from "@/utils/tierEconomics";
import { formatCredits } from "@/utils/format";
import { segmentLabel } from "@/utils/subscriptions";
import { ChartDate } from "@/types/dates";

const WINDOWS = [
	{ value: "cumulative", label: "Cumulative" },
	{ value: "daily", label: "Daily" },
] as const;

export function TierEconomicsAnalytics({ dates }: { dates: ChartDate }) {
	const [windowMode, setWindowMode] = useState<EconomicsWindow>("cumulative");

	const { data: queryData, isLoading, isFetching } = useTierEconomicsQuery(dates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return buildTierEconomicsSeries(deferred.daily, deferred.tier_prices, dates, windowMode);
	}, [deferred, dates, windowMode]);

	const cards = useMemo(() => {
		if (!deferred) return [];
		return tierRangeTotals(deferred.daily, deferred.tier_prices).map((t) => ({
			number: t.value ?? 0,
			description: segmentLabel(t.tier),
			formatter: formatCredits,
		}));
	}, [deferred]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tier value</CardTitle>
				<CardDescription>
					PAYG credit value delivered per $1 of subscription revenue for each tier. Counts only credits the
					subscription covered, across all providers.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex justify-end mb-4">
					<ChartModeToggle modes={WINDOWS} value={windowMode} onChange={setWindowMode} />
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
						<MultiModelChartContainer data={data} cards={cards} />
					)}
				</div>
			</CardContent>
		</Card>
	);
}
