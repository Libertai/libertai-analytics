import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SegmentMessage, SegmentMessageSchema } from "@/types/subscriptions";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type Response = { total_messages: number; messages: SegmentMessage[] };

async function fetchMessagesBySegment(rangeDate: ChartDate): Promise<Response> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/messages-by-segment?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	const messages: SegmentMessage[] = (res.data["messages"] ?? []).map((m: SegmentMessage) => SegmentMessageSchema.parse(m));
	return { total_messages: res.data["total_messages"] ?? 0, messages };
}

export function useMessagesBySegmentQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["messages-by-segment", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchMessagesBySegment(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
