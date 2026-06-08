import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DailyActiveUsers, DailyActiveUsersSchema } from "@/types/users";
import { ChartDate } from "@/types/dates";
import { UsersResponse } from "@/hooks/useUsersQuery";
import env from "@/config/env";

// Aggregate distinct users across api / cli / chat / liberclaw, deduplicated server-side
// (a user active in several of api/cli/chat counts once). Backed by /stats/global/users.
async function fetchGlobalUsers(rangeDate: ChartDate): Promise<UsersResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/users?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const daily = (res.data["daily_active_users"] ?? []).map((d: DailyActiveUsers) => DailyActiveUsersSchema.parse(d));

	return {
		total_unique_users: res.data["total_unique_users"] ?? 0,
		daily_active_users: daily,
	};
}

export function useGlobalUsersQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["global-users", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchGlobalUsers(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
