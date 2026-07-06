import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { LatestSubscriber, LatestSubscriberSchema } from "@/types/revenue";

type Response = {
	subscribers: LatestSubscriber[];
};

async function fetchLatestSubscribers(limit: number): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions/latest?limit=${limit}`);
	return {
		subscribers: (res.data["subscribers"] ?? []).map((s: LatestSubscriber) => LatestSubscriberSchema.parse(s)),
	};
}

export function useLatestSubscribersQuery(limit: number) {
	return useQuery({
		queryKey: ["latest-subscribers", limit],
		queryFn: () => fetchLatestSubscribers(limit),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
