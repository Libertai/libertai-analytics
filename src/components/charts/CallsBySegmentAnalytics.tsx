"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo } from "react";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useCallsBySegmentQuery } from "@/hooks/useCallsBySegmentQuery";
import { groupBySegmentPerDay } from "@/utils/subscriptions";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartDate } from "@/types/dates";

export function CallsBySegmentAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const { data: queryData, isLoading, isFetching } = useCallsBySegmentQuery(type, dates);
	const deferred = useDeferredValue(queryData);

	const data = useMemo(() => {
		if (!deferred) return [];
		return groupBySegmentPerDay(deferred.calls, dates, "call_count");
	}, [deferred, dates]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.callsBySegment?.title}</CardTitle>
				<CardDescription>{type.callsBySegment?.description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
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
							cards={[{ number: queryData?.total_calls || 0, description: "Total calls", formatter: formatCount }]}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
