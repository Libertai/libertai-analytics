import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SubscriberStatusFilter, useLatestSubscribersQuery } from "@/hooks/useLatestSubscribersQuery";

const LIMITS = [20, 50, 100] as const;

const STATUS_OPTIONS: { value: SubscriberStatusFilter; label: string }[] = [
	{ value: "default", label: "All (no pending)" },
	{ value: "all", label: "All statuses" },
	{ value: "active", label: "Active" },
	{ value: "pending", label: "Pending" },
	{ value: "overdue", label: "Overdue" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "expired", label: "Expired" },
];

export function LatestSubscribersTable() {
	const [limit, setLimit] = useState<number>(20);
	const [status, setStatus] = useState<SubscriberStatusFilter>("default");
	const { data, isLoading } = useLatestSubscribersQuery(limit, status);

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle>Latest subscribers</CardTitle>
					<CardDescription>Most recent plan subscriptions across all providers</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Select
						value={status}
						onChange={(e) => setStatus(e.target.value as SubscriberStatusFilter)}
						className="w-40"
					>
						{STATUS_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
					<div className="flex gap-1">
						{LIMITS.map((l) => (
							<Button key={l} size="sm" variant={l === limit ? "default" : "outline"} onClick={() => setLimit(l)}>
								{l}
							</Button>
						))}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Tier</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Provider</TableHead>
									<TableHead>Started</TableHead>
									<TableHead>Period end</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(data?.subscribers ?? []).map((sub) => (
									<TableRow key={`${sub.user_label}-${sub.created_at}`}>
										<TableCell className="font-medium">{sub.user_label}</TableCell>
										<TableCell className="capitalize">{sub.tier}</TableCell>
										<TableCell>
											{sub.status}
											{sub.cancel_at_period_end && " (ending)"}
											{sub.is_trial && " (trial)"}
										</TableCell>
										<TableCell>{sub.provider}</TableCell>
										<TableCell>{sub.created_at.slice(0, 10)}</TableCell>
										<TableCell>{sub.current_period_end?.slice(0, 10) ?? "—"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
