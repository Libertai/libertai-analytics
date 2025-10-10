import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiUsage, ApiUsageStatsSchema } from "@/types/api";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type ApiUsageResponse = {
	total_calls: number;
	api_usage: ApiUsage[];
};

async function fetchApiUsage(rangeDate: ChartDate): Promise<ApiUsageResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/api/calls?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const apiUsage = res.data["api_usage"];
	const parsedApiUsage: ApiUsage[] = apiUsage.map((usage: ApiUsage) => ApiUsageStatsSchema.parse(usage));

	return {
		total_calls: res.data["total_calls"],
		api_usage: parsedApiUsage,
	};
}

export function useApiQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["api-usage", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchApiUsage(rangeDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
		refetchOnMount: false, // Don't refetch on mount if data is fresh
		refetchOnReconnect: false,
	});
}
