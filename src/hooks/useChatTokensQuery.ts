import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChatToken, ChatTokensSchema } from "@/types/chat";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type ChatTokensResponse = {
	total_input_tokens: number;
	total_output_tokens: number;
	calls: ChatToken[];
};

async function fetchChatTokens(rangeDate: ChartDate): Promise<ChatTokensResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/chat/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`
	);

	const tokenUsage = res.data["token_usage"];
	const parsedCalls: ChatToken[] = tokenUsage.map((call: ChatToken) => ChatTokensSchema.parse(call));

	return {
		total_input_tokens: res.data["total_input_tokens"],
		total_output_tokens: res.data["total_output_tokens"],
		calls: parsedCalls,
	};
}

export function useChatTokensQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["chat-tokens", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchChatTokens(rangeDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
