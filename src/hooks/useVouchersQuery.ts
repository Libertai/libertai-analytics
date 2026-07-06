import { useQuery } from "@tanstack/react-query";
import { Voucher, VoucherSchema } from "@/types/vouchers";
import { api } from "@/utils/http";

async function fetchVouchers(chain: "base" | "solana", address: string): Promise<Voucher[]> {
	const res = await api.get(`/credits/vouchers?chain=${chain}&address=${encodeURIComponent(address)}`);
	return (res.data ?? []).map((v: Voucher) => VoucherSchema.parse(v));
}

export function useVouchersQuery(chain: "base" | "solana", address: string) {
	return useQuery({
		queryKey: ["vouchers", chain, address],
		queryFn: () => fetchVouchers(chain, address),
		enabled: address.length > 0,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		placeholderData: (previousData) => previousData,
		refetchOnMount: false,
		refetchOnReconnect: false,
	});
}
