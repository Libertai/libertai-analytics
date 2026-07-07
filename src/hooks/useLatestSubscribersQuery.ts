import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { LatestSubscriber, LatestSubscriberSchema } from "@/types/revenue";

// Backend semantics: no status param = all except pending; "all" = everything; else exact match.
export type SubscriberStatusFilter = "default" | "all" | "active" | "pending" | "overdue" | "cancelled" | "expired";

type Response = {
	subscribers: LatestSubscriber[];
};

async function fetchLatestSubscribers(limit: number, status: SubscriberStatusFilter): Promise<Response> {
	const statusParam = status === "default" ? "" : `&status=${status}`;
	const res = await api.get(`/stats/global/subscriptions/latest?limit=${limit}${statusParam}`);
	return {
		subscribers: (res.data["subscribers"] ?? []).map((s: LatestSubscriber) => LatestSubscriberSchema.parse(s)),
	};
}

export function useLatestSubscribersQuery(limit: number, status: SubscriberStatusFilter = "default") {
	return useQuery({
		queryKey: ["latest-subscribers", limit, status],
		queryFn: () => fetchLatestSubscribers(limit, status),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
