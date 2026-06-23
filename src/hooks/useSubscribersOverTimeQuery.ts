import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TierSubscribersDay, TierSubscribersDaySchema } from "@/types/subscriptions";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type Response = {
	daily: TierSubscribersDay[];
};

async function fetchSubscribersOverTime(rangeDate: ChartDate): Promise<Response> {
	const res = await axios.get(
		`${env.INFERENCE_BACKEND_URL}/stats/global/subscribers-over-time?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`,
	);
	const daily: TierSubscribersDay[] = (res.data["daily"] ?? []).map((d: TierSubscribersDay) =>
		TierSubscribersDaySchema.parse(d),
	);
	return { daily };
}

export function useSubscribersOverTimeQuery(rangeDate: ChartDate) {
	return useQuery({
		queryKey: ["subscribers-over-time", rangeDate.start_date, rangeDate.end_date],
		queryFn: () => fetchSubscribersOverTime(rangeDate),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
