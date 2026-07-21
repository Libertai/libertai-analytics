"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { FilterSegments } from "@/components/FilterSegments";
import { useCallsBySegmentQuery } from "@/hooks/useCallsBySegmentQuery";
import { groupBySegmentPerDay, segmentLabel } from "@/utils/subscriptions";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartDate } from "@/types/dates";

export function CallsBySegmentAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
	const { data: queryData, isLoading, isFetching } = useCallsBySegmentQuery(type, dates);
	const deferred = useDeferredValue(queryData);
	const deferredSegments = useDeferredValue(selectedSegments);

	const data = useMemo(() => {
		if (!deferred) return [];
		return groupBySegmentPerDay(deferred.calls, dates, "call_count");
	}, [deferred, dates]);

	// Scope the total-calls card to the selected plans (whole range when none selected).
	const totalCalls = useMemo(() => {
		if (!deferred) return 0;
		if (deferredSegments.length === 0) return deferred.total_calls;
		return deferred.calls
			.filter((c) => deferredSegments.includes(segmentLabel(c.segment)))
			.reduce((sum, c) => sum + c.call_count, 0);
	}, [deferred, deferredSegments]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.callsBySegment?.title}</CardTitle>
				<CardDescription>{type.callsBySegment?.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center gap-2 mb-4 flex-wrap">
					<FilterSegments selected={selectedSegments} onChange={setSelectedSegments} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!queryData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[{ number: totalCalls, description: "Total calls", formatter: formatCount }]}
							selectedModels={selectedSegments}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
