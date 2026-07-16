"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCreditsConsumptionQuery } from "@/hooks/useCreditsConsumptionQuery";
import { groupCreditsByTierPerDay, groupCreditsConsumptionPerDay } from "@/utils/subscriptions";
import { formatCredits } from "@/utils/format";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { ChartDate } from "@/types/dates";

const CONSUMPTION_MODES = [
	{ value: "per-tier", label: "Per tier" },
	{ value: "tier-vs-prepaid", label: "Tier vs prepaid" },
	{ value: "combined", label: "Combined" },
] as const;
type ConsumptionMode = (typeof CONSUMPTION_MODES)[number]["value"];

export function CreditsConsumptionAnalytics({ dates }: { dates: ChartDate }) {
	const [mode, setMode] = useState<ConsumptionMode>("per-tier");

	const { data: queryData, isLoading, isFetching } = useCreditsConsumptionQuery(dates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		if (mode === "per-tier") return groupCreditsByTierPerDay(deferred.daily_by_tier, dates);
		return groupCreditsConsumptionPerDay(deferred.daily, dates);
	}, [deferred, dates, mode]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Credits consumption</CardTitle>
				<CardDescription>
					Credits ($) consumed per day — by the tier the user was on that day, or split by what covered them
					(subscription entitlement vs prepaid balance)
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex justify-end mb-4">
					<ChartModeToggle modes={CONSUMPTION_MODES} value={mode} onChange={setMode} />
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
						<MultiModelChartContainer
							data={data}
							cards={[
								{ number: queryData?.total_credits || 0, description: "Total credits", formatter: formatCredits },
								{ number: queryData?.total_tier_credits || 0, description: "Tier-covered", formatter: formatCredits },
								{ number: queryData?.total_prepaid_credits || 0, description: "Prepaid", formatter: formatCredits },
							]}
							mode={mode === "combined" ? "combined" : "by-model"}
							combineLabel="Total credits"
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
