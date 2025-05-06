"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import useCreditsStats from "@/stores/credits";
import { getDateRange } from "@/utils/dates";
import { groupCreditsPerDay } from "@/utils/credits";
import FilterModelNames from "@/components/FilterModelNames";
import { formatDate } from "@/utils/dates";
import { ChartDate } from "@/types/dates";

const formatXAxis = (tickItem: string) => {
	const date = new Date(tickItem);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const timeframes = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "90 days", days: 90 },
];

const getDates = (days: number): ChartDate => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	return {
		start_date: formatDate(startDate),
		end_date: formatDate(new Date()),
	}
}

export function CreditsAnalytics() {
	const { fetchCredits } = useCreditsStats();
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedDates, setSelectedDates] = useState<ChartDate>(getDates(timeframes[1].days));
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false)
	const creditsStats = useCreditsStats();
	const [selectedModel, setSelectedModel] = useState<string>("hermes-3-8b-tee");
	const data = groupCreditsPerDay(creditsStats.credits, selectedDates, selectedModel);

	useEffect(() => {
		if (!rangeDate || !rangeDate.from || !rangeDate.to) {
			const dates = getDates(selectedTimeframe.days);
			fetchCredits(dates);
			setSelectedDates(dates);
			return;
		}
		const dates = selectedCustomDates ? {start_date: formatDate(rangeDate?.from), end_date: formatDate(rangeDate?.to)} :  getDateRange(selectedTimeframe.days);
		fetchCredits(dates);
		setSelectedDates(dates);
	}, [fetchCredits, rangeDate, selectedCustomDates, selectedTimeframe.days, selectedModel]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Credits</CardTitle>
				<CardDescription>Credits consumption over time</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="sm:flex mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"}
							className="mr-2"
							onClick={() => {
								setSelectedTimeframe(timeframe)
								setSelectedCustomDates(false)
							}}
						>
							{timeframe.label}
						</Button>
					))}
					<div onClick={() => setSelectedCustomDates(true)} className={"mt-3 sm:mt-0"}>
						<DateRangePicker hasCustomDateBeenClicked={selectedCustomDates} rangeDate={rangeDate} setRangeDate={setRangeDate} />
					</div>
					<FilterModelNames setSelectedModel={setSelectedModel}/>
				</div>
				<div className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data}>
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 12 }}
								tickFormatter={formatXAxis}
							/>
							<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="credits_used"
								stroke="hsl(var(--primary))"
								fill="hsl(var(--primary))"
								fillOpacity={0.2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="md:flex max-md:space-y-4">
					<Card className="w-fit mx-auto">
						<CardHeader className="text-center">
							<CardTitle>{creditsStats.totalCreditsConsumed}</CardTitle>
							<CardDescription>Total credits used</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</CardContent>
		</Card>
	);
}
