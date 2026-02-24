import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

const SummaryStatsSchema = z.object({
	total_requests: z.number(),
	total_input_tokens: z.number(),
	total_output_tokens: z.number(),
});

export type SummaryStats = z.infer<typeof SummaryStatsSchema>;

async function fetchSummary(rangeDate: ChartDate): Promise<SummaryStats> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/summary?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);

	return SummaryStatsSchema.parse(res.data);
}

export function useSummaryQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["summary", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchSummary(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
