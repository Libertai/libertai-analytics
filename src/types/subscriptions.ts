import { z } from "zod";

const SubscriptionTypeSchema = z.union([z.literal("agent"), z.literal("pro")]);
export type SubscriptionType = z.infer<typeof SubscriptionTypeSchema>;

const SubscriptionProviderSchema = z.union([z.literal("vouchers"), z.literal("hold")]);
export type SubscriptionProvider = z.infer<typeof SubscriptionProviderSchema>;

export type Subscription = { start: string; end: string; type: SubscriptionType; provider: SubscriptionProvider };

export type ChartSubscriptionData = {date: string, vouchers: number, hold: number}
