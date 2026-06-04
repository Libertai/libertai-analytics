import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Token, TokenItemSchema } from "@/types/tokens";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import env from "@/config/env";

type TokensResponse = {
	total_input_tokens: number;
	total_output_tokens: number;
	tokens: Token[];
};

async function fetchTokens(type: RequestTypeConfig, rangeDate: ChartDate): Promise<TokensResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/${type.key}/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const usage = res.data[type.tokens.responseField] ?? [];
	const tokens: Token[] = usage.map((t: Token) => TokenItemSchema.parse(t));

	return {
		total_input_tokens: res.data["total_input_tokens"],
		total_output_tokens: res.data["total_output_tokens"],
		tokens,
	};
}

export function useTokensQuery(type: RequestTypeConfig, rangeDate: ChartDate) {
	return useQuery({
		queryKey: [`${type.key}-tokens`, rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchTokens(type, rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
