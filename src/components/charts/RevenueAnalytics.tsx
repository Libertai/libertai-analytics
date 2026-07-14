"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useSubscriptionsRevenueQuery } from "@/hooks/useSubscriptionsRevenueQuery";
import { formatCredits } from "@/utils/format";
import { monthToDateTopups } from "@/utils/revenue";

// Subscriptions launched 2026-06-22; earlier days have no revenue to show.
const ALL_TIME_START = "2026-06-22";

// MRR (Revolut/fiat only, nominal $) over time, with current MRR + per-tier cards.
export function RevenueAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days, ALL_TIME_START);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: revenue, isLoading, isFetching } = useSubscriptionsRevenueQuery(selectedDates);
	const deferredRevenue = useDeferredValue(revenue);

	const data = useMemo(() => {
		if (!deferredRevenue) return [];
		const mtd = monthToDateTopups(deferredRevenue.topups_daily, selectedDates);
		return deferredRevenue.daily.map((d) => ({
			date: d.date,
			MRR: d.mrr,
			"Topups (MTD)": mtd[d.date] ?? 0,
		}));
	}, [deferredRevenue, selectedDates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue (MRR and prepaid topups)</CardTitle>
				<CardDescription>
					Monthly recurring revenue from fiat (Revolut) subscriptions — nominal, VAT-inclusive for EUR.
					Topups are completed Revolut credit purchases, accumulated within each calendar month.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-wrap gap-2 mb-4">
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
