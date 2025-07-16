import { z } from "zod";

const envSchema = z.object({
	INFERENCE_BACKEND_URL: z.string().url(),
});

const env = envSchema.parse({
	INFERENCE_BACKEND_URL: import.meta.env.VITE_INFERENCE_BACKEND_URL,
});

export default env;
