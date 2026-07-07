import { z } from "zod";

export const MrrDaySchema = z.object({ date: z.string(), mrr: z.number() });
export const MrrByTierSchema = z.object({ tier: z.string(), mrr: z.number() });
export const ChurnWeekSchema = z.object({
	week_start: z.string(),
	new: z.number(),
	churned: z.number(),
	net: z.number(),
});
export const LatestSubscriberSchema = z.object({
	user_label: z.string(),
	tier: z.string(),
	status: z.string(),
	provider: z.string(),
	is_trial: z.boolean(),
	cancel_at_period_end: z.boolean(),
	created_at: z.string(),
	current_period_end: z.string().nullable(),
});

export const SubscriptionActivityEventSchema = z.object({
	created_at: z.string(),
	type: z.enum(["subscribed", "upgraded", "downgraded", "cancelled", "churned", "payment_failed"]),
	user_label: z.string(),
	tier: z.string(),
	from_tier: z.string().nullish(),
	provider: z.string(),
});

export type SubscriptionActivityEvent = z.infer<typeof SubscriptionActivityEventSchema>;
export type MrrDay = z.infer<typeof MrrDaySchema>;
export type MrrByTier = z.infer<typeof MrrByTierSchema>;
export type ChurnWeek = z.infer<typeof ChurnWeekSchema>;
export type LatestSubscriber = z.infer<typeof LatestSubscriberSchema>;
