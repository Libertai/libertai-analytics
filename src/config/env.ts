import { z } from "zod";

const envSchema = z.object({
	INFERENCE_BACKEND_URL: z.string().url(),
	ALEPH_API_URL: z.string().url(),
});

const env = envSchema.parse({
	INFERENCE_BACKEND_URL: process.env.NEXT_PUBLIC_INFERENCE_BACKEND_URL,
	ALEPH_API_URL: process.env.NEXT_PUBLIC_ALEPH_API_URL
});

export default env;
