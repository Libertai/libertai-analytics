"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import FilterModelNames from "@/components/FilterModelNames";
import { groupChatCallsPerDayAllModels } from "@/utils/chat";
import { getChatDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useChatCallsQuery } from "@/hooks/useChatCallsQuery";
import { formatCount } from "@/utils/format";

export function ChatCallsAnalytics() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [selectedModels, setSelectedModels] = useState<string[]>([]);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getChatDates(selectedTimeframe.days);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: chatData, isLoading, isFetching } = useChatCallsQuery(selectedDates);

	// Defer heavy computation to avoid blocking UI
	const deferredChatData = useDeferredValue(chatData);
	const deferredSelectedModels = useDeferredValue(selectedModels);

	const data = useMemo(() => {
		if (!deferredChatData) return [];
		return groupChatCallsPerDayAllModels(deferredChatData.chat_calls, selectedDates, deferredSelectedModels);
	}, [deferredChatData, selectedDates, deferredSelectedModels]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Chat Requests</CardTitle>
				<CardDescription>Number of chat requests</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex flex-wrap gap-2">
						{timeframes.map((timeframe) => (
							<Button
								key={timeframe.label}
								variant={
									timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"
								}
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
					<FilterModelNames setSelectedModels={setSelectedModels} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!chatData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[{ number: chatData?.total_calls || 0, description: "Chat requests", formatter: formatCount }]}
							selectedModels={selectedModels}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
