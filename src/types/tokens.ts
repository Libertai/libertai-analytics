import { z } from "zod";

export const TokenItemSchema = z.object({
	date: z.string(),
	nb_input_tokens: z.number(),
	nb_output_tokens: z.number(),
	model_name: z.string(),
});

export const TokensStatsSchema = z.object({
	total_input_tokens: z.number(),
	total_output_tokens: z.number(),
	calls: z.array(TokenItemSchema),
})

export type Token = {
	date: string,
	nb_input_tokens: number,
	nb_output_tokens: number
	model_name: string,
};
