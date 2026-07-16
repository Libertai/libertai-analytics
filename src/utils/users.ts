import { ChartDate } from "@/types/dates";
import { DailyActiveUsers, UsersWindow } from "@/types/users";
import { createEmptyResultByRangeDate } from "./dates";

// Series key used for the single DAU line (shown in the chart legend/tooltip).
export const DAU_SERIES_KEY = "Active users";

// Options for the DAU/WAU/MAU window toggle.
export const USER_WINDOWS = [
	{ value: "day", label: "DAU" },
	{ value: "week", label: "WAU" },
	{ value: "month", label: "MAU" },
] as const;

// Suffix appended to the series/legend label when the window toggle is on week/month.
export const WINDOW_LABEL_SUFFIX: Record<UsersWindow, string> = {
	day: "",
	week: " (7d window)",
	month: " (30d window)",
};

// Replacement for the "per day" wording in chart descriptions, keyed by window.
const WINDOW_DESCRIPTION: Record<UsersWindow, string> = {
	day: "per day",
	week: "in the last 7 days",
	month: "in the last 30 days",
};

export const describeWindow = (description: string, window: UsersWindow) =>
	description.replace("per day", WINDOW_DESCRIPTION[window]);

type ChartDataDAU = Record<string, Record<string, number>>;

// Spread the (sparse) daily active-user counts over every day in the range so the chart
// has a continuous x-axis with zero-filled gaps, matching the other per-day utils.
export const groupDauPerDay = (daily: DailyActiveUsers[], rangeDate: ChartDate, seriesLabel: string = DAU_SERIES_KEY) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const result: ChartDataDAU = createEmptyResultByRangeDate<ChartDataDAU>(timeframe, rangeDate, {
		[seriesLabel]: 0,
	});

	for (const day of daily) {
		if (result[day.date]) {
			result[day.date][seriesLabel] = day.active_users;
		}
	}

	return Object.entries(result)
		.map(([date, values]) => ({ date, ...values }))
		.sort((a, b) => a.date.localeCompare(b.date));
};

// Average over days that had activity (the backend only returns active days). Returns 0
// when there was no traffic in the range.
export const averageDau = (daily: DailyActiveUsers[]): number => {
	if (daily.length === 0) return 0;
	const total = daily.reduce((sum, d) => sum + d.active_users, 0);
	return Math.round(total / daily.length);
};
