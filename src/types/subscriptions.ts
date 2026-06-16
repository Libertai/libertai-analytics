import { z } from "zod";

export const SegmentMessageSchema = z.object({
	date: z.string(),
	segment: z.string(),
	message_count: z.number(),
});
export type SegmentMessage = { date: string; segment: string; message_count: number };

export const CreditsConsumptionDaySchema = z.object({
	date: z.string(),
	tier_credits: z.number(),
	prepaid_credits: z.number(),
});
export type CreditsConsumptionDay = { date: string; tier_credits: number; prepaid_credits: number };

export const TierSubscribersSchema = z.object({
	tier: z.string(),
	active_subscribers: z.number(),
});
export type TierSubscribers = { tier: string; active_subscribers: number };
