import { useQuery } from "@tanstack/react-query";
import { TopupRow, TopupRowSchema } from "@/types/revenue";
import { ChartDate } from "@/types/dates";
import { api } from "@/utils/http";

type Response = {
	total: number;
	topups: TopupRow[];
};

async function fetchRevenueTopups(rangeDate: ChartDate, limit: number, offset: number): Promise<Response> {
	const res = await api.get(
		`/stats/global/revenue/topups?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}&limit=${limit}&offset=${offset}`,
	);
	const topups: TopupRow[] = (res.data["topups"] ?? []).map((t: TopupRow) => TopupRowSchema.parse(t));
	return { total: res.data["total"] ?? 0, topups };
}

export function useRevenueTopupsQuery(rangeDate: ChartDate, limit: number, offset: number) {
	return useQuery({
		queryKey: ["revenue-topups", rangeDate.start_date, rangeDate.end_date, limit, offset],
		queryFn: () => fetchRevenueTopups(rangeDate, limit, offset),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
