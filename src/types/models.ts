export type Model = {
	"id": string;
	"name": string;
	"hf_id": string;
	"pricing": {
		"text": {
			"price_per_million_input_tokens": number;
			"price_per_million_output_tokens": number;
		}
	};
	"capabilities": {
		"text": {
			"tee": boolean;
			"reasoning": boolean;
			"context_window": number;
			"function_calling": boolean
		}
	}
}
