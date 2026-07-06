import { z } from "zod";

export const VoucherSchema = z.object({
	id: z.string(),
	address: z.string().nullable(),
	amount: z.number(),
	amount_left: z.number(),
	expired_at: z.string().nullable(),
	created_at: z.string(),
	is_active: z.boolean(),
});

export type Voucher = z.infer<typeof VoucherSchema>;
