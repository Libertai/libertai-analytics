import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Credit, CreditsStatsSchema } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type CreditsResponse = {
	total_credits_used: number;
	credits_usage: Credit[];
};

async function fetchCredits(rangeDate: ChartDate): Promise<CreditsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/api/credits?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const credits = res.data["credits_usage"] ?? [];
	const parsedCredits: Credit[] = credits.map((credit: Credit) => CreditsStatsSchema.parse(credit));

	return {
		total_credits_used: res.data["total_credits_used"],
		credits_usage: parsedCredits,
	};
}

export function useCreditsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["credits", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchCredits(rangeDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
		refetchOnMount: false, // Don't refetch on mount if data is fresh
		refetchOnReconnect: false,
	});
}
