import { ChartDate } from "@/types/dates";
import { createEmptyResultByRangeDate } from "./dates";

type CallEntry = { model_name: string; used_at: string; call_count: number };

export const groupCumulativeTotal = (calls: CallEntry[], rangeDate: ChartDate) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const daily: Record<string, { total: number }> = createEmptyResultByRangeDate<Record<string, { total: number }>>(
		timeframe, rangeDate, startDate, { total: 0 },
	);

	for (const call of calls) {
		if (call.used_at in daily) {
			daily[call.used_at].total += call.call_count;
		}
	}

	let cumulative = 0;
	return Object.entries(daily)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, { total }]) => {
			cumulative += total;
			return { date, total: cumulative };
		});
};

export const groupCumulativePerModel = (calls: CallEntry[], rangeDate: ChartDate) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const modelNames = Array.from(new Set(calls.map(c => c.model_name)));
	const initialModelData: Record<string, number> = {};
	modelNames.forEach(m => { initialModelData[m] = 0; });

	const daily: Record<string, Record<string, number>> = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(
		timeframe, rangeDate, startDate, initialModelData,
	);

	for (const call of calls) {
		if (call.used_at in daily) {
			daily[call.used_at][call.model_name] += call.call_count;
		}
	}

	const cumulatives: Record<string, number> = {};
	modelNames.forEach(m => { cumulatives[m] = 0; });

	return Object.entries(daily)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, values]) => {
			const entry: Record<string, string | number> = { date };
			for (const model of modelNames) {
				cumulatives[model] += values[model] ?? 0;
				entry[model] = cumulatives[model];
			}
			return entry;
		});
};
