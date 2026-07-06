import { z } from "zod";

export const DailyActiveUsersSchema = z.object({
	date: z.string(),
	active_users: z.number(),
});

export type DailyActiveUsers = z.infer<typeof DailyActiveUsersSchema>;

export type UsersWindow = "day" | "week" | "month";
