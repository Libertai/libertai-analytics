import { z } from "zod";

export const TokenItemSchema = z.object({
	date: z.string(),
	nb_input_tokens: z.number(),
	nb_output_tokens: z.number(),
	// Cached input tokens (prompt caching). Defaults to 0 for older payloads that omit it.
	nb_cached_tokens: z.number().default(0),
	model_name: z.string(),
});

export const TokensStatsSchema = z.object({
	total_input_tokens: z.number(),
	total_output_tokens: z.number(),
	total_cached_tokens: z.number().default(0),
	calls: z.array(TokenItemSchema),
})

export type Token = {
	date: string,
	nb_input_tokens: number,
	nb_output_tokens: number
	nb_cached_tokens: number,
	model_name: string,
};
