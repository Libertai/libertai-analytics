import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { LatestSubscriber, LatestSubscriberSchema } from "@/types/revenue";

export type SubscriberStatus = "active" | "pending" | "overdue" | "cancelled" | "expired" | "upgrading";

export const SUBSCRIBER_STATUSES: SubscriberStatus[] = [
	"active",
	"pending",
	"overdue",
	"cancelled",
	"expired",
	"upgrading",
];

// Backend: no status param = all except pending; else CSV set → rows whose status is in the set.
function statusParam(statuses: SubscriberStatus[]): string {
	if (statuses.length === 0) return "";
	return `&status=${[...statuses].sort().join(",")}`;
}

type Response = {
	subscribers: LatestSubscriber[];
};

async function fetchLatestSubscribers(limit: number, statuses: SubscriberStatus[]): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions/latest?limit=${limit}${statusParam(statuses)}`);
	return {
		subscribers: (res.data["subscribers"] ?? []).map((s: LatestSubscriber) => LatestSubscriberSchema.parse(s)),
	};
}

export function useLatestSubscribersQuery(limit: number, statuses: SubscriberStatus[]) {
	return useQuery({
		queryKey: ["latest-subscribers", limit, statusParam(statuses)],
		queryFn: () => fetchLatestSubscribers(limit, statuses),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
