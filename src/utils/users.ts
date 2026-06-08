import { ChartDate } from "@/types/dates";
import { DailyActiveUsers } from "@/types/users";
import { createEmptyResultByRangeDate } from "./dates";

// Series key used for the single DAU line (shown in the chart legend/tooltip).
export const DAU_SERIES_KEY = "Active users";

type ChartDataDAU = Record<string, Record<typeof DAU_SERIES_KEY, number>>;

// Spread the (sparse) daily active-user counts over every day in the range so the chart
// has a continuous x-axis with zero-filled gaps, matching the other per-day utils.
export const groupDauPerDay = (daily: DailyActiveUsers[], rangeDate: ChartDate) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const result: ChartDataDAU = createEmptyResultByRangeDate<ChartDataDAU>(timeframe, rangeDate, startDate, {
		[DAU_SERIES_KEY]: 0,
	});

	for (const day of daily) {
		if (result[day.date]) {
			result[day.date][DAU_SERIES_KEY] = day.active_users;
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
