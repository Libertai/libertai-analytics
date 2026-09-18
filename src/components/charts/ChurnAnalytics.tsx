"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import { CHART_TOOLTIP_PROPS, clampStartDate, formatXAxis } from "@/utils/charts";
import { useSubscriptionsChurnQuery } from "@/hooks/useSubscriptionsChurnQuery";
import { formatCount, formatLargeNumber } from "@/utils/format";
import { Bar, BarChart, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SummaryCards } from "@/components/SummaryCards";
import { ChartDate } from "@/types/dates";
import { formatDate } from "@/utils/dates";

// Subscriptions launched 2026-06-22; no churn to show before that.
const LAUNCH_DATE = "2026-06-22";

// A weekly bucket is complete once its Sunday is strictly before today (both UTC).
const isWeekComplete = (weekStart: string, today: string): boolean => {
	const sunday = new Date(`${weekStart}T00:00:00Z`);
	sunday.setUTCDate(sunday.getUTCDate() + 6);
	return sunday.toISOString().slice(0, 10) < today;
};

export function ChurnAnalytics({ dates: pageDates }: { dates: ChartDate }) {
	const dates = useMemo(() => clampStartDate(pageDates, LAUNCH_DATE), [pageDates]);
	const { data: churn, isLoading, isFetching } = useSubscriptionsChurnQuery(dates);
	const deferredChurn = useDeferredValue(churn);

	// The current week is still running: replace its partial counts with the average of the
	// last complete weeks and mark the bar dashed, so a mid-week dip isn't read as churn.
	const { weekly, projectedIndex } = useMemo(() => {
		const rows = deferredChurn?.weekly ?? [];
		const last = rows[rows.length - 1];
		const complete = rows.slice(0, -1).slice(-3);
		if (!last || isWeekComplete(last.week_start, formatDate(new Date())) || complete.length === 0) {
			return { weekly: rows, projectedIndex: -1 };
		}
		const average = (key: "new" | "churned") => complete.reduce((sum, row) => sum + row[key], 0) / complete.length;
		return {
			weekly: rows.map((row, index) =>
				index === rows.length - 1 ? { ...row, new: average("new"), churned: average("churned") } : row,
			),
			projectedIndex: rows.length - 1,
		};
	}, [deferredChurn]);

	const net = (deferredChurn?.total_new ?? 0) - (deferredChurn?.total_churned ?? 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Subscriber churn</CardTitle>
				<CardDescription>New vs churned fiat subscribers per week</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!churn && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<div>
							<div className="h-[350px] md:h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={weekly}>
										<XAxis
											dataKey="week_start"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
											tickFormatter={formatXAxis}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
											allowDecimals={false}
											tickFormatter={formatLargeNumber}
										/>
										<Tooltip {...CHART_TOOLTIP_PROPS} formatter={(value) => formatLargeNumber(Number(value) || 0)} />
										<Legend />
										<Bar dataKey="new" name="New" fill="#82ca9d" radius={[3, 3, 0, 0]}>
											{weekly.map((_, index) => (
												<Cell
													key={index}
													{...(index === projectedIndex
														? { strokeDasharray: "4 3", stroke: "#82ca9d", fillOpacity: 0.35 }
														: {})}
												/>
											))}
										</Bar>
										<Bar dataKey="churned" name="Churned" fill="#ff7300" radius={[3, 3, 0, 0]}>
											{weekly.map((_, index) => (
												<Cell
													key={index}
													{...(index === projectedIndex
														? { strokeDasharray: "4 3", stroke: "#ff7300", fillOpacity: 0.35 }
														: {})}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
							<SummaryCards
								cards={[
									{ number: deferredChurn?.total_new ?? 0, description: "Total new", formatter: formatCount },
									{ number: deferredChurn?.total_churned ?? 0, description: "Total churned", formatter: formatCount },
									{ number: net, description: "Net", formatter: formatCount },
								]}
							/>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
