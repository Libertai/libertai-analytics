import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { ChartDate } from "@/types/dates";
import { MrrByTier, MrrByTierSchema, MrrDay, MrrDaySchema, TopupDay, TopupDaySchema } from "@/types/revenue";

type Response = {
	current_mrr: number;
	mrr_by_tier: MrrByTier[];
	daily: MrrDay[];
	topups_daily: TopupDay[];
	total_topups: number;
};

async function fetchRevenue(rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/subscriptions/revenue?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	return {
		current_mrr: res.data["current_mrr"] ?? 0,
		mrr_by_tier: (res.data["mrr_by_tier"] ?? []).map((t: MrrByTier) => MrrByTierSchema.parse(t)),
		daily: (res.data["daily"] ?? []).map((d: MrrDay) => MrrDaySchema.parse(d)),
		topups_daily: (res.data["topups_daily"] ?? []).map((t: TopupDay) => TopupDaySchema.parse(t)),
		total_topups: res.data["total_topups"] ?? 0,
	};
}

export function useSubscriptionsRevenueQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["subscriptions-revenue", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchRevenue(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
