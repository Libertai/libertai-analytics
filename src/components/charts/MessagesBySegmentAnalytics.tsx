"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { FilterSegments } from "@/components/FilterSegments";
import { useMessagesBySegmentQuery } from "@/hooks/useMessagesBySegmentQuery";
import { groupBySegmentPerDay, segmentLabel } from "@/utils/subscriptions";
import { formatCount } from "@/utils/format";
import { ChartDate } from "@/types/dates";

export function MessagesBySegmentAnalytics({ dates }: { dates: ChartDate }) {
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
	const { data: queryData, isLoading, isFetching } = useMessagesBySegmentQuery(dates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return groupBySegmentPerDay(deferred.messages, dates, "message_count");
	}, [deferred, dates]);

	// Scope the total-messages card to the selected plans (whole range when none selected).
	const totalMessages = useMemo(() => {
		if (!deferred) return 0;
		if (selectedSegments.length === 0) return deferred.total_messages;
		return deferred.messages
			.filter((m) => selectedSegments.includes(segmentLabel(m.segment)))
			.reduce((sum, m) => sum + m.message_count, 0);
	}, [deferred, selectedSegments]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Messages by plan</CardTitle>
				<CardDescription>Chat messages per day, split by subscription segment (anonymous, free, paid tiers)</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					<FilterSegments selected={selectedSegments} onChange={setSelectedSegments} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!queryData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[{ number: totalMessages, description: "Total messages", formatter: formatCount }]}
							selectedModels={selectedSegments}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
