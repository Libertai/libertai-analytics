import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Credit, CreditsStatsSchema } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import { RequestTypeConfig } from "@/config/requestTypes";
import env from "@/config/env";

type CreditsResponse = {
	total_credits_used: number;
	credits: Credit[];
};

async function fetchCredits(type: RequestTypeConfig, rangeDate: ChartDate): Promise<CreditsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/${type.key}/credits?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const usage = res.data["credits_usage"] ?? [];
	const credits: Credit[] = usage.map((c: Credit) => CreditsStatsSchema.parse(c));

	return {
		total_credits_used: res.data["total_credits_used"],
		credits,
	};
}

export function useCreditsQuery(type: RequestTypeConfig, rangeDate: ChartDate) {
	return useQuery({
		queryKey: [`${type.key}-credits`, rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchCredits(type, rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
