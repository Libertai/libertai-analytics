import { useQuery } from "@tanstack/react-query";
import { CreditsConsumptionDay, CreditsConsumptionDaySchema, TierCreditsDay, TierCreditsDaySchema } from "@/types/subscriptions";
import { ChartDate } from "@/types/dates";
import { api } from "@/utils/http";

type Response = {
	total_credits: number;
	total_tier_credits: number;
	total_prepaid_credits: number;
	daily: CreditsConsumptionDay[];
	daily_by_tier: TierCreditsDay[];
};

async function fetchCreditsConsumption(rangeDate: ChartDate): Promise<Response> {
	const res = await api.get(
		`/stats/global/credits-consumption?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	const daily: CreditsConsumptionDay[] = (res.data["daily"] ?? []).map((d: CreditsConsumptionDay) =>
		CreditsConsumptionDaySchema.parse(d),
	);
	return {
		total_credits: res.data["total_credits"] ?? 0,
		total_tier_credits: res.data["total_tier_credits"] ?? 0,
		total_prepaid_credits: res.data["total_prepaid_credits"] ?? 0,
		daily,
		daily_by_tier: (res.data["daily_by_tier"] ?? []).map((d: TierCreditsDay) => TierCreditsDaySchema.parse(d)),
	};
}

export function useCreditsConsumptionQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["credits-consumption", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchCreditsConsumption(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
