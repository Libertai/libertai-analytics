import { ChartDate } from "@/types/dates";
import { TopupDay } from "@/types/revenue";

/**
 * date -> topups accumulated so far within that calendar month, resetting on the 1st.
 *
 * The API widens its topups window back to the 1st of the range's first month, so a range
 * starting mid-month still accumulates from the true start of that month.
 */
export const monthToDateTopups = (topups: TopupDay[], rangeDate: ChartDate): Record<string, number> => {
	const byDate = new Map<string, number>();
	for (const t of topups) {
		byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.amount);
	}

	const first = new Date(`${rangeDate.start_date}T00:00:00Z`);
	first.setUTCDate(1);
	const last = new Date(`${rangeDate.end_date}T00:00:00Z`);

	const result: Record<string, number> = {};
	let running = 0;
	let currentMonth = -1;

	for (const day = new Date(first); day <= last; day.setUTCDate(day.getUTCDate() + 1)) {
		if (day.getUTCMonth() !== currentMonth) {
			currentMonth = day.getUTCMonth();
			running = 0;
		}
		const key = day.toISOString().split("T")[0];
		running += byDate.get(key) ?? 0;
		if (key >= rangeDate.start_date) result[key] = Number(running.toFixed(2));
	}

	return result;
};
