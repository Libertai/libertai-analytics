import { z } from "zod";

const SubscriptionTypeSchema = z.union([z.literal("agent"), z.literal("pro")]);
export type SubscriptionType = z.infer<typeof SubscriptionTypeSchema>;

const SubscriptionProviderSchema = z.union([z.literal("vouchers"), z.literal("hold")]);
export type SubscriptionProvider = z.infer<typeof SubscriptionProviderSchema>;

export const AlephSubscriptionSchema = z.object({
	started_at: z.number(),
	ended_at: z
		.number()
		.nullable()
		.transform((date) => (date !== null ? date : Date.now())), // /!\ TODO: This means that charts in the future can be incorrect
	type: SubscriptionTypeSchema,
	provider: SubscriptionProviderSchema,
	account: z.object({
		chain: z.union([z.literal("base"), z.literal("solana")]),
		address: z.string(),
	}),
});

export type Subscription = { start: string; end: string; type: SubscriptionType; provider: SubscriptionProvider };
