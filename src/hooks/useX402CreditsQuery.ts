import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Credit, CreditsStatsSchema } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type X402CreditsResponse = {
	total_credits_used: number;
	credits_usage: Credit[];
};

async function fetchX402Credits(rangeDate: ChartDate): Promise<X402CreditsResponse> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/x402/credits?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	const credits = res.data["credits_usage"];
	const parsedCredits: Credit[] = credits.map((credit: Credit) => CreditsStatsSchema.parse(credit));

	return {
		total_credits_used: res.data["total_credits_used"],
		credits_usage: parsedCredits,
	};
}

export function useX402CreditsQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["x402-credits", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchX402Credits(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
