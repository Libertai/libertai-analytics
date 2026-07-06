"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes, formatXAxis } from "@/utils/charts";
import { useSubscriptionsChurnQuery } from "@/hooks/useSubscriptionsChurnQuery";
import { formatCount } from "@/utils/format";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ChurnAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return { start_date: formatDate(rangeDate.from), end_date: formatDate(rangeDate.to) };
		}
		return getDates(selectedTimeframe.days);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: churn, isLoading, isFetching } = useSubscriptionsChurnQuery(selectedDates);
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
					{!churn && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
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
										<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
										<Tooltip />
										<Legend />
										<Bar dataKey="new" name="New" fill="#82ca9d" radius={[3, 3, 0, 0]} />
										<Bar dataKey="churned" name="Churned" fill="#ff7300" radius={[3, 3, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
							<div className="grid grid-cols-2 md:flex gap-3 mt-4">
								{[
									{ number: deferredChurn?.total_new ?? 0, description: "Total new" },
									{ number: deferredChurn?.total_churned ?? 0, description: "Total churned" },
									{ number: net, description: "Net" },
								].map((card) => (
									<Card key={card.description} className="md:w-fit md:mx-auto">
										<CardHeader className="text-center py-4">
											<CardTitle>{formatCount(card.number)}</CardTitle>
											<CardDescription>{card.description}</CardDescription>
										</CardHeader>
									</Card>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
