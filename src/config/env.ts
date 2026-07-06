import { z } from "zod";

const envSchema = z.object({
	INFERENCE_BACKEND_URL: z.url(),
	THIRDWEB_CLIENT_ID: z.string().min(1),
	SOLANA_RPC: z.url(),
	LTAI_BASE_ADDRESS: z.string().min(1),
	LTAI_SOLANA_ADDRESS: z.string().min(1),
});

const env = envSchema.parse({
	INFERENCE_BACKEND_URL: import.meta.env.VITE_INFERENCE_BACKEND_URL,
	THIRDWEB_CLIENT_ID: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
	SOLANA_RPC: import.meta.env.VITE_SOLANA_RPC,
	LTAI_BASE_ADDRESS: import.meta.env.VITE_LTAI_BASE_ADDRESS,
	LTAI_SOLANA_ADDRESS: import.meta.env.VITE_LTAI_SOLANA_ADDRESS,
});

export default env;
