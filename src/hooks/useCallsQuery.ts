import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiUsage, ApiUsageStatsSchema } from "@/types/api";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import env from "@/config/env";

type CallsResponse = {
	total_calls: number;
	calls: ApiUsage[];
};

async function fetchCalls(type: RequestTypeConfig, rangeDate: ChartDate): Promise<CallsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/${type.key}/calls?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const usage = res.data[type.calls.responseField] ?? [];
	const calls: ApiUsage[] = usage.map((u: ApiUsage) => ApiUsageStatsSchema.parse(u));

	return {
		total_calls: res.data["total_calls"],
		calls,
	};
}

export function useCallsQuery(type: RequestTypeConfig, rangeDate: ChartDate) {
	return useQuery({
		queryKey: [`${type.key}-calls`, rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchCalls(type, rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
