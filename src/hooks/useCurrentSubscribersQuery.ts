import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { LatestSubscriber, LatestSubscriberSchema } from "@/types/revenue";

export const SUBSCRIBER_STATUSES = ["active", "overdue", "pending", "cancelled", "expired", "upgrading"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

// The DB's one-active-sub index guarantees at most one active/overdue row per user; other
// statuses (cancelled, expired…) can yield several rows per user — one per past subscription.
type Response = {
	subscribers: LatestSubscriber[];
	total: number;
};

async function fetchCurrentSubscribers(statuses: SubscriberStatus[]): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions/latest?status=${statuses.join(",")}`);
	return {
		subscribers: (res.data["subscribers"] ?? []).map((s: LatestSubscriber) => LatestSubscriberSchema.parse(s)),
		total: res.data["total"] ?? 0,
	};
}

export function useCurrentSubscribersQuery(statuses: SubscriberStatus[]) {
	return useQuery({
		queryKey: ["current-subscribers", [...statuses].sort().join(",")],
		queryFn: () => fetchCurrentSubscribers(statuses),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
