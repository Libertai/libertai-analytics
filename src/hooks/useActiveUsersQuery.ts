import { useQuery } from "@tanstack/react-query";
import { ChartDate } from "@/types/dates";
import { GlobalActiveUsersStats, GlobalActiveUsersStatsSchema } from "@/types/topUsage";
import { api } from "@/utils/http";

async function fetchActiveUsers(rangeDate: ChartDate, limit: number, offset: number): Promise<GlobalActiveUsersStats> {
	const res = await api.get(
		`/stats/global/users/active?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}&limit=${limit}&offset=${offset}`,
	);
	return GlobalActiveUsersStatsSchema.parse(res.data);
}

export function useActiveUsersQuery(rangeDate: ChartDate, limit: number = 20, offset: number = 0) {
	return useQuery({
		queryKey: ["active-users", rangeDate.start_date, rangeDate.end_date, limit, offset],
		queryFn: () => fetchActiveUsers(rangeDate, limit, offset),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
