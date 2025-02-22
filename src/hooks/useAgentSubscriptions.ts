import useSubscriptionsStore from "@/stores/subscriptions";

export default function useAgentSubscriptions() {
	const { subscriptions } = useSubscriptionsStore();

	return subscriptions.filter((sub) => sub.type === "agent");
}
