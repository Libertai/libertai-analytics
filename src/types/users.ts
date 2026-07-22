import { z } from "zod";

export const DailyActiveUsersSchema = z.object({
	date: z.string(),
	active_users: z.number(),
});

export type DailyActiveUsers = z.infer<typeof DailyActiveUsersSchema>;

export const DailyTierActiveUsersSchema = z.object({
	date: z.string(),
	tier: z.string(),
	active_users: z.number(),
});

export type DailyTierActiveUsers = z.infer<typeof DailyTierActiveUsersSchema>;

export type UsersWindow = "day" | "week" | "month";
