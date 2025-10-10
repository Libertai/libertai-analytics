import { z } from "zod";

export const ApiUsageStatsSchema = z.object({
	model_name: z.string(),
	used_at: z.string(),
	call_count: z.number(),
});

export type ApiUsageProvider = "calls";

export type ApiUsage = { model_name: string; used_at: string; call_count: number };
