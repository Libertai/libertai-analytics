import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { LatestSubscriber, LatestSubscriberSchema } from "@/types/revenue";

// The DB's one-active-sub index guarantees at most one active/overdue row per user, so
// filtering to those statuses yields the current subscriber base with no duplicates.
type Response = {
	subscribers: LatestSubscriber[];
	total: number;
};

async function fetchCurrentSubscribers(): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions/latest?status=active,overdue`);
	return {
		subscribers: (res.data["subscribers"] ?? []).map((s: LatestSubscriber) => LatestSubscriberSchema.parse(s)),
		total: res.data["total"] ?? 0,
	};
}

export function useCurrentSubscribersQuery() {
	return useQuery({
		queryKey: ["current-subscribers"],
		queryFn: fetchCurrentSubscribers,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
