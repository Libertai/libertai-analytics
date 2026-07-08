import { useQuery } from "@tanstack/react-query";
import { SegmentCall, SegmentCallSchema } from "@/types/subscriptions";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import { api } from "@/utils/http";

type Response = { total_calls: number; calls: SegmentCall[] };

async function fetchCallsBySegment(type: RequestTypeConfig, rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/${type.key}/calls-by-segment?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	const calls: SegmentCall[] = (res.data["calls"] ?? []).map((c: SegmentCall) => SegmentCallSchema.parse(c));
	return { total_calls: res.data["total_calls"] ?? 0, calls };
}

export function useCallsBySegmentQuery(type: RequestTypeConfig, rangeDate: ChartDate) {
	return useQuery({
		queryKey: [`${type.key}-calls-by-segment`, rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchCallsBySegment(type, rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
