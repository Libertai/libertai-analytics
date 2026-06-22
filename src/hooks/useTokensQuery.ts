import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Token, TokenItemSchema } from "@/types/tokens";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import env from "@/config/env";

type TokensResponse = {
	total_input_tokens: number;
	total_output_tokens: number;
	total_cached_tokens: number;
	tokens: Token[];
};

async function fetchTokens(type: RequestTypeConfig, rangeDate: ChartDate): Promise<TokensResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/${type.key}/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const usage = res.data[type.tokens.responseField] ?? [];

	// Backend `nb_input_tokens` includes cached as a subset; expose non-cached here so buckets are disjoint.
	const tokens: Token[] = usage.map((t: Token) => {
		const parsed = TokenItemSchema.parse(t);
		return { ...parsed, nb_input_tokens: Math.max(0, parsed.nb_input_tokens - parsed.nb_cached_tokens) };
	});

	const totalCached = res.data["total_cached_tokens"] ?? 0;

	return {
		total_input_tokens: Math.max(0, res.data["total_input_tokens"] - totalCached),
		total_output_tokens: res.data["total_output_tokens"],
		total_cached_tokens: totalCached,
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
