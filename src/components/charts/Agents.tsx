"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAgentSubscriptions from "@/hooks/useAgentSubscriptions";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { groupSubscriptionsCustomDatePerDay, groupSubscriptionsPerDay } from "@/utils/subscriptions";
import DateRangePicker from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { timeframes } from "@/utils/charts";
import ChartContainer from "../ChartContainer";


export function AgentsAnalytics() {
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
				<ChartContainer
				  data={data}
				  areaDataKey="vouchers"
				  cards={[
						{number: agentSubscriptions.length, description: "Total agents created" },
						{number: totalVouchers, description: "Total vouchers" },
						{number: totalSubscriptions, description: "Total subscriptions" },
					]}
				/>
			</CardContent>
		</Card>
	);
}
