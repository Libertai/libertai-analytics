import { z } from "zod";

export const CreditsStatsSchema = z.object({
	credits_used: z.number(),
	used_at: z.string(),
	model_name: z.string()
})

export type CreditProvider = "credits_used";

export type Credit = {credits_used: number, used_at: string, model_name: string};
