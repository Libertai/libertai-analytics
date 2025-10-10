import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TokensStatsSchema } from "@/types/tokens";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

async function fetchTokens(rangeDate: ChartDate) {
	const response = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/api/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	return TokensStatsSchema.parse(response.data);
}

export function useTokensQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["tokens", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchTokens(rangeDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
		refetchOnMount: false, // Don't refetch on mount if data is fresh
		refetchOnReconnect: false,
	});
}
