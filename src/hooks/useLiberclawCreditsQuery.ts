import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Credit, CreditsStatsSchema } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type LiberclawCreditsResponse = {
	total_credits_used: number;
	credits_usage: Credit[];
};

async function fetchLiberclawCredits(rangeDate: ChartDate): Promise<LiberclawCreditsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/liberclaw/credits?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const credits = res.data["credits_usage"];
	const parsedCredits: Credit[] = credits.map((credit: Credit) => CreditsStatsSchema.parse(credit));

	return {
		total_credits_used: res.data["total_credits_used"],
		credits_usage: parsedCredits,
	};
}

export function useLiberclawCreditsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["liberclaw-credits", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchLiberclawCredits(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
