import { useQuery } from "@tanstack/react-query";
import { ChartDate } from "@/types/dates";
import { GlobalTopUsageStats, GlobalTopUsageStatsSchema, TopUsageGroup, TopUsageType } from "@/types/topUsage";
import { api } from "@/utils/http";

async function fetchTopUsage(
	type: TopUsageType,
	rangeDate: ChartDate,
	groupBy: TopUsageGroup,
	limit: number,
): Promise<GlobalTopUsageStats> {
	const res = await api.get(
		`/stats/global/top-users?type=${type}&start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}&group_by=${groupBy}&limit=${limit}`,
	);
	return GlobalTopUsageStatsSchema.parse(res.data);
}

export function useTopUsersQuery(
	type: TopUsageType,
	rangeDate: ChartDate,
	groupBy: TopUsageGroup = "user",
	limit: number = 10,
) {
	return useQuery({
		queryKey: ["top-users", type, rangeDate.start_date, rangeDate.end_date, groupBy, limit],
		queryFn: () => fetchTopUsage(type, rangeDate, groupBy, limit),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
