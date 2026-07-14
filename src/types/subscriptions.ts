import { z } from "zod";

export const SegmentMessageSchema = z.object({
	date: z.string(),
	segment: z.string(),
	message_count: z.number(),
});
export type SegmentMessage = { date: string; segment: string; message_count: number };

export const SegmentCallSchema = z.object({
	date: z.string(),
	segment: z.string(),
	call_count: z.number(),
});
export type SegmentCall = { date: string; segment: string; call_count: number };

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

export const TierSubscribersDaySchema = z.object({
	date: z.string(),
	tier: z.string(),
	active_subscribers: z.number(),
});
export type TierSubscribersDay = { date: string; tier: string; active_subscribers: number };

export const TierCreditsDaySchema = z.object({
	date: z.string(),
	tier: z.string(),
	credits: z.number(),
});
export type TierCreditsDay = { date: string; tier: string; credits: number };

export const TierPriceSchema = z.object({ tier: z.string(), monthly_price: z.number() });
export type TierPrice = { tier: string; monthly_price: number };

export const TierEconomicsDaySchema = z.object({
	date: z.string(),
	tier: z.string(),
	active_subscribers: z.number(),
	credits: z.number(),
});
export type TierEconomicsDay = {
	date: string;
	tier: string;
	active_subscribers: number;
	credits: number;
};
