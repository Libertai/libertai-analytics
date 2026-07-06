import { useQuery } from "@tanstack/react-query";
import { TierSubscribers, TierSubscribersSchema } from "@/types/subscriptions";
import { api } from "@/utils/http";

type Response = {
	subscribers_by_tier: TierSubscribers[];
	total_paid_subscribers: number;
	free_users: number;
	anonymous_users: number;
};

async function fetchSubscriptions(): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions`);
	const subscribers_by_tier: TierSubscribers[] = (res.data["subscribers_by_tier"] ?? []).map((t: TierSubscribers) =>
		TierSubscribersSchema.parse(t),
	);
	return {
		subscribers_by_tier,
		total_paid_subscribers: res.data["total_paid_subscribers"] ?? 0,
		free_users: res.data["free_users"] ?? 0,
		anonymous_users: res.data["anonymous_users"] ?? 0,
	};
}

export function useSubscriptionsQuery() {
	return useQuery({
		queryKey: ["subscriptions-snapshot"],
		queryFn: fetchSubscriptions,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
