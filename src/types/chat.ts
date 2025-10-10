import { z } from "zod";

export const ChatCallsSchema = z.object({
	model_name: z.string(),
	used_at: z.string(),
	call_count: z.number(),
});

export const ChatTokensSchema = z.object({
	model_name: z.string(),
	date: z.string(),
	nb_input_tokens: z.number(),
	nb_output_tokens: z.number(),
});

export type ChatCall = {
	model_name: string;
	used_at: string;
	call_count: number;
};

export type ChatToken = {
	model_name: string;
	date: string;
	nb_input_tokens: number;
	nb_output_tokens: number;
};
