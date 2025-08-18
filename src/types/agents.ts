import { z } from "zod";

export const AgentsSchema = z.object({
	total_agents_created: z.number(),
	total_vouchers: z.number(),
	total_subscriptions: z.number(),
	agents: z.array(z.object({
		name: z.string(),
		created_at: z.string()
	}))
});

export type Agent = {name: string; created_at: string};
