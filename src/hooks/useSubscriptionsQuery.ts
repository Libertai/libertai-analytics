import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TierSubscribers, TierSubscribersSchema } from "@/types/subscriptions";
import env from "@/config/env";

type Response = { subscribers_by_tier: TierSubscribers[]; total_paid_subscribers: number };

async function fetchSubscriptions(): Promise<Response> {
	const res = await axios.get(`${env.INFERENCE_BACKEND_URL}/stats/global/subscriptions`);
	const subscribers_by_tier: TierSubscribers[] = (res.data["subscribers_by_tier"] ?? []).map((t: TierSubscribers) =>
		TierSubscribersSchema.parse(t),
	);
	return { subscribers_by_tier, total_paid_subscribers: res.data["total_paid_subscribers"] ?? 0 };
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
