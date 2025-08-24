import useAgentsStore from "@/stores/agents.ts";

export default function useAgentSubscriptions() {
	const { agents } = useAgentsStore();

	return agents;
}
