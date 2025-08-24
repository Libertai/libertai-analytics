import { ChartDate } from "@/types/dates";
import { createEmptyResultByRangeDate } from "./dates";
import { Token } from "@/types/tokens.ts";

export const groupTokensPerDayAllModels = (tokens: Token[], rangeDate: ChartDate, selectedModel?: string) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf())
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const initialData = { total_input_tokens: 0, total_output_tokens: 0 };
	const result: Record<string, { total_input_tokens: number; total_output_tokens: number }> = createEmptyResultByRangeDate<Record<string, { total_input_tokens: number; total_output_tokens: number }>>(timeframe, rangeDate, startDate, initialData);

	// Filter tokens by selected model if specified
	const filteredTokens = selectedModel 
		? tokens.filter(token => token.model_name === selectedModel)
		: tokens;

	filteredTokens.forEach((token: Token) => {
		for (let i = 1; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === token.date) {
				result[dateStr].total_input_tokens += token.nb_input_tokens;
				result[dateStr].total_output_tokens += token.nb_output_tokens;
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
