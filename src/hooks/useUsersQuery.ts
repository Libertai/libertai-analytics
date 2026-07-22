import { useQuery } from "@tanstack/react-query";
import { DailyActiveUsers, DailyActiveUsersSchema, DailyTierActiveUsers, UsersWindow } from "@/types/users";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import { api } from "@/utils/http";

export type UsersResponse = {
	total_unique_users: number;
	daily_active_users: DailyActiveUsers[];
	daily_active_users_by_tier: DailyTierActiveUsers[];
};

async function fetchUsers(type: RequestTypeConfig, rangeDate: ChartDate, window: UsersWindow): Promise<UsersResponse> {
	const res = await api.get(
		`/stats/global/${type.key}/users?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}&window=${window}`,
	);

	const daily = (res.data["daily_active_users"] ?? []).map((d: DailyActiveUsers) => DailyActiveUsersSchema.parse(d));

	return {
		total_unique_users: res.data["total_unique_users"] ?? 0,
		daily_active_users: daily,
		daily_active_users_by_tier: [],
	};
}

export function useUsersQuery(type: RequestTypeConfig, rangeDate: ChartDate, window: UsersWindow = "day") {
	return useQuery({
		queryKey: [`${type.key}-users`, rangeDate.start_date, rangeDate.end_date, window],
		queryFn: () => fetchUsers(type, rangeDate, window),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
