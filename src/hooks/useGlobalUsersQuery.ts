import { useQuery } from "@tanstack/react-query";
import { DailyActiveUsers, DailyActiveUsersSchema, UsersWindow } from "@/types/users";
import { ChartDate } from "@/types/dates";
import { UsersResponse } from "@/hooks/useUsersQuery";
import { api } from "@/utils/http";

// Aggregate distinct users across api / cli / chat / liberclaw, deduplicated server-side
// (a user active in several of api/cli/chat counts once). Backed by /stats/global/users.
async function fetchGlobalUsers(rangeDate: ChartDate, window: UsersWindow): Promise<UsersResponse> {
	const res = await api.get(
		`/stats/global/users?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}&window=${window}`,
	);

	const daily = (res.data["daily_active_users"] ?? []).map((d: DailyActiveUsers) => DailyActiveUsersSchema.parse(d));

	return {
		total_unique_users: res.data["total_unique_users"] ?? 0,
		daily_active_users: daily,
	};
}

export function useGlobalUsersQuery(rangeDate: ChartDate, window: UsersWindow = "day") {
	return useQuery({
		queryKey: ["global-users", rangeDate.start_date, rangeDate.end_date, window],
		queryFn: () => fetchGlobalUsers(rangeDate, window),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
