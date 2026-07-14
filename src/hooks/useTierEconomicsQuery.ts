import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { ChartDate } from "@/types/dates";
import {
	TierEconomicsDay,
	TierEconomicsDaySchema,
	TierPrice,
	TierPriceSchema,
} from "@/types/subscriptions";

type Response = {
	daily: TierEconomicsDay[];
	tier_prices: TierPrice[];
};

async function fetchTierEconomics(rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/subscriptions/tier-economics?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	return {
		daily: (res.data["daily"] ?? []).map((d: TierEconomicsDay) => TierEconomicsDaySchema.parse(d)),
		tier_prices: (res.data["tier_prices"] ?? []).map((t: TierPrice) => TierPriceSchema.parse(t)),
	};
}

export function useTierEconomicsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["tier-economics", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchTierEconomics(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
