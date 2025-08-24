import axios from 'axios';
import { create } from "zustand";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";
import { Token, TokensStatsSchema } from "@/types/tokens.ts";

type CreditsStatsState = {
	totalInputTokens: number;
	totalOutputTokens: number;
	tokens: Token[];
	isLoaded: boolean;

	fetchTokens: (rangeDate: ChartDate) => void;
};

const useTokensStats = create<CreditsStatsState>((set) => ({
	totalInputTokens: 0,
	totalOutputTokens: 0,
	tokens: [],
	isLoaded: false,

	fetchTokens: async (rangeDate: ChartDate) => {
		try {
			const response = await axios.get(`${env.INFERENCE_BACKEND_URL}/stats/global/tokens?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`).then(res => res.data);
			const tokensUsage = TokensStatsSchema.parse(response);

			set({
				totalInputTokens: tokensUsage.total_input_tokens,
				totalOutputTokens: tokensUsage.total_output_tokens,
				tokens: tokensUsage.calls,
				isLoaded: true
			});
		} catch (error) {
			console.error(error);
		}
	}
}))

export default useTokensStats;
