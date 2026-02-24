import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TokensStatsSchema } from "@/types/tokens";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

async function fetchLiberclawTokens(rangeDate: ChartDate) {
	const response = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/liberclaw/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	return TokensStatsSchema.parse(response.data);
}

export function useLiberclawTokensQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["liberclaw-tokens", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchLiberclawTokens(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
