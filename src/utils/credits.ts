import { Credit } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import { CreditProvider } from "@/types/credits";

type ChartData = Record<string, Record<CreditProvider, number>>;

export const groupCreditsPerDay = (credits: Credit[], rangeDate: ChartDate, model_name: string)  => {
	const result: ChartData = {};
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	for (let i = 1; i <= timeframe; i++) {
		const sDate = new Date(rangeDate.start_date);
		sDate.setDate(startDate.getDate() + i);
		const dateStr = sDate.toISOString().split("T")[0];

		result[dateStr] = { credits_used: 0.0};
	}

	credits.forEach((credit: Credit) => {
		for (let i = 1; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === credit.used_at && credit.model_name === model_name) {
				result[dateStr].credits_used += credit.credits_used;
			}
		}
	})

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}
