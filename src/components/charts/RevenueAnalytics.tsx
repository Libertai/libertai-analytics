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

// MRR (nominal $) over time across both paid rails, with current MRR + per-tier cards.
export function RevenueAnalytics({ dates: pageDates }: { dates: ChartDate }) {
	const dates = useMemo(() => clampStartDate(pageDates, LAUNCH_DATE), [pageDates]);
	const { data: revenue, isLoading, isFetching } = useSubscriptionsRevenueQuery(dates);
	const deferredRevenue = useDeferredValue(revenue);

	const data = useMemo(() => {
		if (!deferredRevenue) return [];
		const mtd = monthToDateTopups(deferredRevenue.topups_daily, dates);
		// The two rails are separate series and the chart is stacked, so the top edge is total MRR.
		const creditsByDate = new Map(deferredRevenue.credits_daily.map((d) => [d.date, d.mrr]));
		return deferredRevenue.daily.map((d) => ({
			date: d.date,
			"MRR (fiat)": d.mrr,
			"MRR (credits)": creditsByDate.get(d.date) ?? 0,
			"Topups (MTD)": mtd[d.date] ?? 0,
		}));
	}, [deferredRevenue, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue (MRR and prepaid topups)</CardTitle>
				<CardDescription>
					Monthly recurring revenue — nominal, VAT-inclusive for EUR. Fiat is Revolut card subscriptions; credits is
					subscriptions billed against a prepaid balance, counting only subscribers who bought their credits (accounts
					ever granted a voucher, and staff, are excluded — their balance was never paid for). Both rails count a
					subscription until it lapses, so one already set to cancel still shows here and churns at period end. Topups
					are completed Revolut credit purchases, accumulated within each calendar month.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!revenue && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							stacked
							cards={[
								{
									number: (revenue?.current_mrr || 0) + (revenue?.credits_mrr || 0),
									description: "Current MRR ($)",
									formatter: formatCredits,
								},
								{ number: revenue?.current_mrr || 0, description: "MRR fiat ($)", formatter: formatCredits },
								{ number: revenue?.credits_mrr || 0, description: "MRR credits ($)", formatter: formatCredits },
								...(revenue?.mrr_by_tier ?? []).map((t) => ({
									number: t.mrr,
									description: `MRR fiat ${t.tier} ($)`,
									formatter: formatCredits,
								})),
								...(revenue?.credits_mrr_by_tier ?? []).map((t) => ({
									number: t.mrr,
									description: `MRR credits ${t.tier} ($)`,
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
