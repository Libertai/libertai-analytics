import { ChartDate } from "@/types/dates";
import { ApiUsage, ApiUsageProvider } from "@/types/api";
import { createEmptyResultByRangeDate } from "./dates";

type ChartDataAPI = Record<string, Record<ApiUsageProvider, number>>;

export const groupApiUsagePerDay = (apiUsage: ApiUsage[], rangeDate: ChartDate, model_name: string)  => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const result: ChartDataAPI = createEmptyResultByRangeDate<ChartDataAPI>(timeframe, rangeDate, startDate, {calls: 0});

	apiUsage.forEach((apiUsage: ApiUsage) => {
		for (let i = 1; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === apiUsage.used_at && apiUsage.model_name === model_name) {
				result[dateStr].calls += 1;
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

export const groupApiUsagePerDayAllModels = (apiUsage: ApiUsage[], rangeDate: ChartDate, selectedModel?: string) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
	
	const modelNames = Array.from(new Set(apiUsage.map(usage => usage.model_name)));
	
	const initialModelData: Record<string, number> = {};
	modelNames.forEach(model => {
		initialModelData[model] = 0;
	});

	const result: Record<string, Record<string, number>> = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(timeframe, rangeDate, startDate, initialModelData);

	apiUsage.forEach((usage: ApiUsage) => {
		for (let i = 1; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === usage.used_at) {
				if (selectedModel && usage.model_name !== selectedModel) {
					return;
				}
				result[dateStr][usage.model_name] += 1;
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
