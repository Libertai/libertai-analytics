import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { ChartDate } from "@/types/dates";
import { ChurnWeek, ChurnWeekSchema } from "@/types/revenue";

type Response = {
	weekly: ChurnWeek[];
	total_new: number;
	total_churned: number;
};

async function fetchChurn(rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/subscriptions/churn?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	return {
		weekly: (res.data["weekly"] ?? []).map((w: ChurnWeek) => ChurnWeekSchema.parse(w)),
		total_new: res.data["total_new"] ?? 0,
		total_churned: res.data["total_churned"] ?? 0,
	};
}

export function useSubscriptionsChurnQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["subscriptions-churn", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchChurn(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
