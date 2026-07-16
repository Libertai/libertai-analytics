"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useSubscriptionsRevenueQuery } from "@/hooks/useSubscriptionsRevenueQuery";
import { formatCredits } from "@/utils/format";
import { monthToDateTopups } from "@/utils/revenue";
import { clampStartDate } from "@/utils/charts";
import { ChartDate } from "@/types/dates";

// Subscriptions launched 2026-06-22; earlier days have no revenue to show.
const LAUNCH_DATE = "2026-06-22";

// MRR (Revolut/fiat only, nominal $) over time, with current MRR + per-tier cards.
export function RevenueAnalytics({ dates: pageDates }: { dates: ChartDate }) {
	const dates = useMemo(() => clampStartDate(pageDates, LAUNCH_DATE), [pageDates]);
	const { data: revenue, isLoading, isFetching } = useSubscriptionsRevenueQuery(dates);
	const deferredRevenue = useDeferredValue(revenue);

	const data = useMemo(() => {
		if (!deferredRevenue) return [];
		const mtd = monthToDateTopups(deferredRevenue.topups_daily, dates);
		return deferredRevenue.daily.map((d) => ({
			date: d.date,
			MRR: d.mrr,
			"Topups (MTD)": mtd[d.date] ?? 0,
		}));
	}, [deferredRevenue, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue (MRR and prepaid topups)</CardTitle>
				<CardDescription>
					Monthly recurring revenue from fiat (Revolut) subscriptions — nominal, VAT-inclusive for EUR. Topups are
					completed Revolut credit purchases, accumulated within each calendar month.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!revenue && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[
								{ number: revenue?.current_mrr || 0, description: "Current MRR ($)", formatter: formatCredits },
								...(revenue?.mrr_by_tier ?? []).map((t) => ({
									number: t.mrr,
									description: `MRR ${t.tier} ($)`,
									formatter: formatCredits,
								})),
								{
									number: revenue?.total_topups || 0,
									description: "Topups in range ($)",
									formatter: formatCredits,
								},
							]}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
