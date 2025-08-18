import { create } from "zustand";
import { Agent, AgentsSchema } from "@/types/agents.ts";
import axios from "axios";
import env from "@/config/env.ts";

type SubscriptionsStoreState = {
	totalAgentsCreated: number,
	totalVouchers: number,
	totalSubscriptions: number,
	agents: Agent[];
	isLoaded: boolean;

	fetchAgents: (startDate: string, endDate: string) => void;
};

const useAgentsStore = create<SubscriptionsStoreState>((set) => ({
	totalAgentsCreated: 0,
	totalVouchers: 0,
	totalSubscriptions: 0,
	agents: [],
	isLoaded: false,

	fetchAgents: async (startDate: string, endDate: string) => {
		try {
			const response = await axios.get(`${env.INFERENCE_BACKEND_URL}/stats/global/agents?start_date=${startDate}&end_date=${endDate}`).then(res => res.data);
			const agentsUsage = AgentsSchema.parse(response);

			set({
				totalAgentsCreated: agentsUsage.total_agents_created,
				totalVouchers: agentsUsage.total_vouchers,
				totalSubscriptions: agentsUsage.total_subscriptions,
				agents: agentsUsage.agents,
				isLoaded: true
			});
		} catch (err) {
			console.error(err);
		}
	}
}));

export default useAgentsStore;
