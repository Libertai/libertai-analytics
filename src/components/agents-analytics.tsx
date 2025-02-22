"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAgentSubscriptions from "@/hooks/useAgentSubscriptions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { groupSubscriptionsPerDay } from "@/utils/subscriptions";

const formatXAxis = (tickItem: string) => {
	const date = new Date(tickItem);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const timeframes = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "90 days", days: 90 },
];

export function AgentsAnalytics() {
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);

	const agentSubscriptions = useAgentSubscriptions();
	const data = groupSubscriptionsPerDay(agentSubscriptions, selectedTimeframe.days);

	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Agents</CardTitle>
				<CardDescription>Running agents instances over time</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="mb-4">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={timeframe.days === selectedTimeframe.days ? "default" : "outline"}
							className="mr-2"
							onClick={() => setSelectedTimeframe(timeframe)}
						>
							{timeframe.label}
						</Button>
					))}
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
			</CardContent>
		</Card>
	);
}
