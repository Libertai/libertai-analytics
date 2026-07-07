import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/http";
import { SubscriptionActivityEvent, SubscriptionActivityEventSchema } from "@/types/revenue";

export type ActivityType = SubscriptionActivityEvent["type"];

export const ACTIVITY_TYPES: ActivityType[] = [
	"subscribed",
	"upgraded",
	"downgraded",
	"cancelled",
	"churned",
	"payment_failed",
];

function typesParam(types: ActivityType[]): string {
	if (types.length === 0) return "";
	return `&types=${[...types].sort().join(",")}`;
}

type Response = {
	events: SubscriptionActivityEvent[];
};

async function fetchSubscriptionActivity(limit: number, types: ActivityType[]): Promise<Response> {
	const res = await api.get(`/stats/global/subscriptions/activity?limit=${limit}${typesParam(types)}`);
	return {
		events: (res.data["events"] ?? []).map((e: SubscriptionActivityEvent) => SubscriptionActivityEventSchema.parse(e)),
	};
}

export function useSubscriptionActivityQuery(limit: number, types: ActivityType[]) {
	return useQuery({
		queryKey: ["subscription-activity", limit, typesParam(types)],
		queryFn: () => fetchSubscriptionActivity(limit, types),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
