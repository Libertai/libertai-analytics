import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChatCall, ChatCallsSchema } from "@/types/chat";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type ChatCallsResponse = {
	total_calls: number;
	chat_calls: ChatCall[];
};

async function fetchChatCalls(rangeDate: ChartDate): Promise<ChatCallsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/chat/calls?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`
	);

	const chatUsage = res.data["chat_usage"] ?? [];
	const parsedChatCalls: ChatCall[] = chatUsage.map((call: ChatCall) => ChatCallsSchema.parse(call));

	return {
		total_calls: res.data["total_calls"],
		chat_calls: parsedChatCalls,
	};
}

export function useChatCallsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["chat-calls", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchChatCalls(rangeDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
