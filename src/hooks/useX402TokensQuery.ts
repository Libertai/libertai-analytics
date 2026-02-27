import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TokensStatsSchema } from "@/types/tokens";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

async function fetchX402Tokens(rangeDate: ChartDate) {
	const response = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/x402/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	return TokensStatsSchema.parse(response.data);
}

export function useX402TokensQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["x402-tokens", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchX402Tokens(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
