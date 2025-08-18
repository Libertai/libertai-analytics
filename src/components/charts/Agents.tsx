"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useAgentSubscriptions from "@/hooks/useAgentSubscriptions";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { groupAgentsCustomDatePerDay, groupAgentsPerDay } from "@/utils/agents.ts";
import DateRangePicker from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { getDates, timeframes } from "@/utils/charts";
import ChartContainer from "../ChartContainer";
import useAgentsStore from "@/stores/agents.ts";


export function AgentsAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false)

	const agentSubscriptions = useAgentSubscriptions();
	const data = selectedCustomDates ? groupAgentsCustomDatePerDay(agentSubscriptions, rangeDate) : groupAgentsPerDay(agentSubscriptions, selectedTimeframe.days);
	const { fetchAgents, totalAgentsCreated, totalVouchers, totalSubscriptions } = useAgentsStore();

	useEffect(() => {
		if (!rangeDate || !rangeDate.from || !rangeDate.to) {
			const dates = getDates(selectedTimeframe.days);
			fetchAgents(dates.start_date, dates.end_date);
			return;
		}
	}, [fetchAgents, rangeDate, selectedCustomDates, selectedTimeframe]);

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
							variant={timeframe.days === selectedTimeframe.days && !selectedCustomDates ? "default" : "outline"}
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
				  areaDataKey="agents"
				  cards={[
						{number: totalAgentsCreated, description: "Total agents created" },
						{number: totalVouchers, description: "Total vouchers" },
						{number: totalSubscriptions, description: "Total subscriptions" },
					]}
				/>
			</CardContent>
		</Card>
	);
}
