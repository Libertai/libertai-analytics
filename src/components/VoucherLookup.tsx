import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/DatePicker";
import { useVouchersQuery, VoucherLookupType } from "@/hooks/useVouchersQuery";
import { Voucher } from "@/types/vouchers";
import { api } from "@/utils/http";
import { expirationPayload } from "@/utils/dates";

export function VoucherLookup() {
	const [type, setType] = useState<VoucherLookupType>("base");
	const [value, setValue] = useState("");
	const [submitted, setSubmitted] = useState<{ type: VoucherLookupType; value: string }>({
		type: "base",
		value: "",
	});

	const { data: vouchers, isLoading } = useVouchersQuery(submitted.type, submitted.value);
	const queryClient = useQueryClient();

	const [editing, setEditing] = useState<Voucher | null>(null);
	const [expiration, setExpiration] = useState<Date | undefined>();
	const [saving, setSaving] = useState(false);

	const search = () => setSubmitted({ type, value: value.trim() });

	const openEdit = (voucher: Voucher) => {
		setEditing(voucher);
		setExpiration(voucher.expired_at ? new Date(voucher.expired_at) : undefined);
	};

	const saveExpiration = async () => {
		if (!editing) return;
		setSaving(true);
		try {
			await api.post("/credits/voucher/expiration", {
				voucher_id: editing.id,
				expired_at: expiration ? expirationPayload(expiration) : null,
			});
			toast.success("Voucher expiration updated");
			await queryClient.invalidateQueries({ queryKey: ["vouchers", submitted.type, submitted.value] });
			setEditing(null);
		} catch (error) {
			const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
			toast.error(typeof detail === "string" ? detail : "Failed to update expiration");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card className="max-w-3xl">
			<CardHeader>
				<CardTitle>Vouchers lookup</CardTitle>
				<CardDescription>Search vouchers by wallet address or email, and edit their expiration.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Select value={type} onChange={(e) => setType(e.target.value as VoucherLookupType)} className="w-32">
						<option value="base">Base</option>
						<option value="solana">Solana</option>
						<option value="email">Email</option>
					</Select>
					<Input
						placeholder={type === "email" ? "user@example.com" : "0x… / wallet address"}
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<Button onClick={search} disabled={!value.trim()}>
						Search
					</Button>
				</div>

				{isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : submitted.value.length > 0 ? (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Amount</TableHead>
									<TableHead>Left</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead>Active</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{(vouchers ?? []).map((voucher) => (
									<TableRow key={voucher.id}>
										<TableCell>{voucher.amount}</TableCell>
										<TableCell>{voucher.amount_left}</TableCell>
										<TableCell>{voucher.created_at.slice(0, 10)}</TableCell>
										<TableCell>{voucher.expired_at?.slice(0, 10) ?? "—"}</TableCell>
										<TableCell>{voucher.is_active ? "yes" : "no"}</TableCell>
										<TableCell>
											<Button size="sm" variant="outline" onClick={() => openEdit(voucher)}>
												Edit expiry
											</Button>
										</TableCell>
									</TableRow>
								))}
								{(vouchers ?? []).length === 0 && (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground">
											No vouchers found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : null}

				<Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit voucher expiration</DialogTitle>
							<DialogDescription>Set a new expiration date, or clear it to remove expiration.</DialogDescription>
						</DialogHeader>
						<div className="space-y-2">
							<DatePicker date={expiration} setDate={setExpiration} placeholder="No expiration" />
							{expiration && (
								<Button variant="ghost" size="sm" onClick={() => setExpiration(undefined)}>
									Clear expiration
								</Button>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
								Cancel
							</Button>
							<Button onClick={() => void saveExpiration()} disabled={saving}>
								{saving ? "Saving…" : "Save"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
