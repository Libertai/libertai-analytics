import { z } from "zod";

export const TopUsageRowSchema = z.object({
	rank: z.number(),
	user_label: z.string(),
	api_key_label: z.string().nullable(),
	credits_spent: z.number(),
	calls: z.number(),
	account_created_at: z.string().nullable(),
	api_key_created_at: z.string().nullable(),
});

export type TopUsageRow = z.infer<typeof TopUsageRowSchema>;

export const GlobalTopUsageStatsSchema = z.object({
	rows: z.array(TopUsageRowSchema),
	total: z.number(),
});

export type GlobalTopUsageStats = z.infer<typeof GlobalTopUsageStatsSchema>;

export const ActiveUserRowSchema = z.object({
	user_label: z.string(),
	credits_spent: z.number(),
	calls: z.number(),
	first_active_at: z.string(),
	last_active_at: z.string(),
	account_created_at: z.string().nullable(),
});

export type ActiveUserRow = z.infer<typeof ActiveUserRowSchema>;

export const GlobalActiveUsersStatsSchema = z.object({
	users: z.array(ActiveUserRowSchema),
	total: z.number(),
});

export type GlobalActiveUsersStats = z.infer<typeof GlobalActiveUsersStatsSchema>;

export const TOP_USAGE_TYPES = ["api", "cli", "liberclaw", "chat"] as const;
export type TopUsageType = (typeof TOP_USAGE_TYPES)[number];

export const TOP_USAGE_SIZES = [10, 20, 30, 50] as const;
export type TopUsageSize = (typeof TOP_USAGE_SIZES)[number];

export const TOP_USAGE_GROUPS = ["user", "api_key"] as const;
export type TopUsageGroup = (typeof TOP_USAGE_GROUPS)[number];
