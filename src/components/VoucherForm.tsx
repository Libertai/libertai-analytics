import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { DatePicker } from "@/components/DatePicker";
import { api } from "@/utils/http";
import { expirationPayload } from "@/utils/dates";

const RECIPIENT_MODES = [
	{ value: "email", label: "Email" },
	{ value: "wallet", label: "Wallet" },
] as const;
type RecipientMode = (typeof RECIPIENT_MODES)[number]["value"];

export function VoucherForm() {
	const [recipientMode, setRecipientMode] = useState<RecipientMode>("email");
	const [email, setEmail] = useState("");
	const [chain, setChain] = useState<"base" | "solana">("base");
	const [address, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const [expiration, setExpiration] = useState<Date | undefined>();
	const [confirming, setConfirming] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const recipient = recipientMode === "email" ? email.trim() : address.trim();
	const parsedAmount = Number(amount);
	// Minimal shape checks to catch obvious typos before the round-trip; the backend fully validates.
	const recipientValid =
		recipientMode === "email"
			? recipient.includes("@")
			: chain === "base"
				? /^0x[0-9a-fA-F]{40}$/.test(recipient)
				: recipient.length >= 32 && recipient.length <= 44;
	const valid = recipientValid && Number.isFinite(parsedAmount) && parsedAmount > 0;

	const grant = async () => {
		setSubmitting(true);
		try {
			await api.post("/credits/vouchers", {
				amount: parsedAmount,
				expired_at: expiration ? expirationPayload(expiration) : undefined,
				...(recipientMode === "email" ? { email: email.trim() } : { chain, address: address.trim() }),
			});
			toast.success(`Granted $${parsedAmount} to ${recipient}`);
			setEmail("");
			setAddress("");
			setAmount("");
			setExpiration(undefined);
		} catch (error) {
			const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
			toast.error(typeof detail === "string" ? detail : "Voucher grant failed");
		} finally {
			setSubmitting(false);
			setConfirming(false);
		}
	};

	return (
		<Card className="max-w-xl">
			<CardHeader>
				<CardTitle>Grant a voucher</CardTitle>
				<CardDescription>Add credits to an existing email account or a wallet address.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<ChartModeToggle modes={RECIPIENT_MODES} value={recipientMode} onChange={setRecipientMode} />
				{recipientMode === "email" ? (
					<Input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
				) : (
					<div className="flex gap-2 flex-wrap sm:flex-nowrap">
						<Select value={chain} onChange={(e) => setChain(e.target.value as "base" | "solana")} className="w-32">
							<option value="base">Base</option>
							<option value="solana">Solana</option>
						</Select>
						<Input placeholder="0x… / wallet address" value={address} onChange={(e) => setAddress(e.target.value)} />
					</div>
				)}
				<Input
					type="number"
					min="0"
					step="0.01"
					placeholder="Amount (credits, $)"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<DatePicker date={expiration} setDate={setExpiration} placeholder="Expiration (optional)" />
				<Button disabled={!valid || submitting} onClick={() => setConfirming(true)}>
					Grant voucher
				</Button>

				<Dialog open={confirming} onOpenChange={setConfirming}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm voucher</DialogTitle>
							<DialogDescription>
								Grant <span className="font-semibold">${parsedAmount}</span> to{" "}
								<span className="font-semibold">{recipient}</span>
								{expiration ? ` (expires ${format(expiration, "PPP")})` : " (no expiration)"}?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>
								Cancel
							</Button>
							<Button onClick={() => void grant()} disabled={submitting}>
								{submitting ? "Granting…" : "Confirm"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
