import { ChartDate } from "@/types/dates";
import { ChatCall, ChatToken } from "@/types/chat";
import { createEmptyResultByRangeDate } from "./dates";

export const groupChatCallsPerDayAllModels = (
	chatCalls: ChatCall[],
	rangeDate: ChartDate,
	selectedModels?: string[]
) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const modelNames = Array.from(new Set(chatCalls.map((call) => call.model_name)));

	const initialModelData: Record<string, number> = {};
	modelNames.forEach((model) => {
		initialModelData[model] = 0;
	});

	const result: Record<string, Record<string, number>> = createEmptyResultByRangeDate<
		Record<string, Record<string, number>>
	>(timeframe, rangeDate, startDate, initialModelData);

	const filteredCalls = selectedModels && selectedModels.length > 0
		? chatCalls.filter(call => selectedModels.includes(call.model_name))
		: chatCalls;

	for (const call of filteredCalls) {
		for (let i = 0; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === call.used_at) {
				result[dateStr][call.model_name] += call.call_count;
			}
		}
	}

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
};

export const groupChatTokensPerDayAllModels = (
	tokens: ChatToken[],
	rangeDate: ChartDate,
	selectedModels?: string[]
) => {
	const startDate = new Date(rangeDate.start_date);
	const endDate = new Date(rangeDate.end_date);
	const diffTime = Math.abs(startDate.valueOf() - endDate.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

	const initialData = { total_input_tokens: 0, total_output_tokens: 0 };
	const result: Record<string, { total_input_tokens: number; total_output_tokens: number }> =
		createEmptyResultByRangeDate<Record<string, { total_input_tokens: number; total_output_tokens: number }>>(
			timeframe,
			rangeDate,
			startDate,
			initialData
		);

	const filteredTokens = selectedModels && selectedModels.length > 0
		? tokens.filter(token => selectedModels.includes(token.model_name))
		: tokens;

	for (const token of filteredTokens) {
		for (let i = 0; i < timeframe; i++) {
			const date: Date = new Date(startDate.valueOf());
			date.setDate(date.getDate() + i);
			const dateStr = date.toISOString().split("T")[0];

			if (dateStr === token.date) {
				result[dateStr].total_input_tokens += token.nb_input_tokens;
				result[dateStr].total_output_tokens += token.nb_output_tokens;
			}
		}
	}

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
};
