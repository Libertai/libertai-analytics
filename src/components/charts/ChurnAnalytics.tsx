"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import { CHART_TOOLTIP_PROPS, clampStartDate, formatXAxis } from "@/utils/charts";
import { useSubscriptionsChurnQuery } from "@/hooks/useSubscriptionsChurnQuery";
import { formatCount, formatLargeNumber } from "@/utils/format";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SummaryCards } from "@/components/SummaryCards";
import { ChartDate } from "@/types/dates";

// Subscriptions launched 2026-06-22; no churn to show before that.
const LAUNCH_DATE = "2026-06-22";

export function ChurnAnalytics({ dates: pageDates }: { dates: ChartDate }) {
	const dates = useMemo(() => clampStartDate(pageDates, LAUNCH_DATE), [pageDates]);
	const { data: churn, isLoading, isFetching } = useSubscriptionsChurnQuery(dates);
	const deferredChurn = useDeferredValue(churn);

	const weekly = useMemo(() => deferredChurn?.weekly ?? [], [deferredChurn]);
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
										<Bar dataKey="new" name="New" fill="#82ca9d" radius={[3, 3, 0, 0]} />
										<Bar dataKey="churned" name="Churned" fill="#ff7300" radius={[3, 3, 0, 0]} />
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
