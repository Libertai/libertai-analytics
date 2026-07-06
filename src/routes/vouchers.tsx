import { createFileRoute } from "@tanstack/react-router";
import { VoucherForm } from "@/components/VoucherForm";
import { VoucherLookup } from "@/components/VoucherLookup";

export const Route = createFileRoute("/vouchers")({
	component: Vouchers,
});

function Vouchers() {
	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Vouchers</h1>
				<p className="text-sm text-muted-foreground mt-1">Grant credits to a user account or wallet.</p>
			</div>
			<VoucherForm />
			<VoucherLookup />
		</div>
	);
}
