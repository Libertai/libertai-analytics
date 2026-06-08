import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DailyActiveUsers, DailyActiveUsersSchema } from "@/types/users";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import env from "@/config/env";

export type UsersResponse = {
	total_unique_users: number;
	daily_active_users: DailyActiveUsers[];
};

async function fetchUsers(type: RequestTypeConfig, rangeDate: ChartDate): Promise<UsersResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/${type.key}/users?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const daily = (res.data["daily_active_users"] ?? []).map((d: DailyActiveUsers) => DailyActiveUsersSchema.parse(d));

	return {
		total_unique_users: res.data["total_unique_users"] ?? 0,
		daily_active_users: daily,
	};
}

export function useUsersQuery(type: RequestTypeConfig, rangeDate: ChartDate) {
	return useQuery({
		queryKey: [`${type.key}-users`, rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchUsers(type, rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
