"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAgentSubscriptions from "@/hooks/useAgentSubscriptions";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { groupSubscriptionsCustomDatePerDay, groupSubscriptionsPerDay } from "@/utils/subscriptions";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";

const formatXAxis = (tickItem: string) => {
	const date = new Date(tickItem);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const timeframes = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "90 days", days: 90 },
];

export function ApiUsageAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false)

	const agentSubscriptions = useAgentSubscriptions();
	const data = selectedCustomDates ? groupSubscriptionsCustomDatePerDay(agentSubscriptions, rangeDate) : groupSubscriptionsPerDay(agentSubscriptions, selectedTimeframe.days);
	const totalVouchers = useMemo(
		() => agentSubscriptions.filter((sub) => sub.provider === "vouchers").length,
		[agentSubscriptions],
	);
	const totalSubscriptions = useMemo(
		() => agentSubscriptions.filter((sub) => sub.provider === "hold").length,
		[agentSubscriptions],
	);


	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Agents</CardTitle>
				<CardDescription>Running agents instances over time</CardDescription>
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
								dataKey="vouchers"
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
							<CardTitle>{agentSubscriptions.length}</CardTitle>
							<CardDescription>Total agents created</CardDescription>
						</CardHeader>
					</Card>
					<Card className="w-fit mx-auto">
						<CardHeader className="text-center">
							<CardTitle>{totalVouchers}</CardTitle>
							<CardDescription>Total vouchers</CardDescription>
						</CardHeader>
					</Card>
					<Card className="w-fit mx-auto">
						<CardHeader className="text-center">
							<CardTitle>{totalSubscriptions}</CardTitle>
							<CardDescription>Total subscriptions</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</CardContent>
		</Card>
	);
}
