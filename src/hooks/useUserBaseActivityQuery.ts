import { useQuery } from "@tanstack/react-query";
import { ChartDate } from "@/types/dates";
import { api } from "@/utils/http";

type Response = {
	anonymous_active_users: number;
	free_active_users: number;
};

async function fetchUserBaseActivity(rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/user-base-activity?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	return {
		anonymous_active_users: res.data["anonymous_active_users"] ?? 0,
		free_active_users: res.data["free_active_users"] ?? 0,
	};
}

export function useUserBaseActivityQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["user-base-activity", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchUserBaseActivity(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
