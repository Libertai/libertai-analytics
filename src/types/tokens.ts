import { z } from "zod";

export const TokensStatsSchema = z.object({
	total_input_tokens: z.number(),
	total_output_tokens: z.number(),
	calls: z.array(z.object({
		date: z.string(),
		nb_input_tokens: z.number(),
		nb_output_tokens: z.number(),
		model_name: z.string(),
	}))
})

export type Token = {
	date: string,
	nb_input_tokens: number,
	nb_output_tokens: number
	model_name: string,
};
