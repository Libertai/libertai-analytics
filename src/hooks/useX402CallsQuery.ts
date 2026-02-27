import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiUsage, ApiUsageStatsSchema } from "@/types/api";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type X402CallsResponse = {
	total_calls: number;
	api_usage: ApiUsage[];
};

async function fetchX402Calls(rangeDate: ChartDate): Promise<X402CallsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/x402/calls?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const apiUsage = res.data["api_usage"];
	const parsedApiUsage: ApiUsage[] = apiUsage.map((usage: ApiUsage) => ApiUsageStatsSchema.parse(usage));

	return {
		total_calls: res.data["total_calls"],
		api_usage: parsedApiUsage,
	};
}

export function useX402CallsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["x402-calls", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchX402Calls(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
