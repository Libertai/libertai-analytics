import { Credit } from "@/types/credits";
import { ChartDate } from "@/types/dates";
import { CreditProvider } from "@/types/credits";
import { createEmptyResultByRangeDate } from "./dates";

type ChartDataCredits = Record<string, Record<CreditProvider, number>>;

export const groupCreditsPerDay = (credits: Credit[], rangeDate: ChartDate, model_name: string)  => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const result: ChartDataCredits = createEmptyResultByRangeDate<ChartDataCredits>(timeframe, rangeDate, startDate, {credits_used: 0});

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

export const groupCreditsPerDayAllModels = (credits: Credit[], rangeDate: ChartDate, selectedModel?: string) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
	
	const modelNames = Array.from(new Set(credits.map(credit => credit.model_name)));
	
	const initialModelData: Record<string, number> = {};
	modelNames.forEach(model => {
		initialModelData[model] = 0;
	});

	const result: Record<string, Record<string, number>> = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(timeframe, rangeDate, startDate, initialModelData);

	credits.forEach((credit: Credit) => {
		for (let i = 1; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === credit.used_at) {
				if (selectedModel && credit.model_name !== selectedModel) {
					// If a model is selected, only show that model's data
					return;
				}
				result[dateStr][credit.model_name] += credit.credits_used;
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
