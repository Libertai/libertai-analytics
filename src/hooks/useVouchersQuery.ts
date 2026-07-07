import { useQuery } from "@tanstack/react-query";
import { Voucher, VoucherSchema } from "@/types/vouchers";
import { api } from "@/utils/http";

export type VoucherLookupType = "base" | "solana" | "email";

async function fetchVouchers(type: VoucherLookupType, value: string): Promise<Voucher[]> {
	const query =
		type === "email"
			? `email=${encodeURIComponent(value)}`
			: `chain=${type}&address=${encodeURIComponent(value)}`;
	const res = await api.get(`/credits/vouchers?${query}`);
	return (res.data ?? []).map((v: Voucher) => VoucherSchema.parse(v));
}

export function useVouchersQuery(type: VoucherLookupType, value: string) {
	return useQuery({
		queryKey: ["vouchers", type, value],
		queryFn: () => fetchVouchers(type, value),
		enabled: value.length > 0,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
