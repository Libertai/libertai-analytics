import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SubscriberStatus, SUBSCRIBER_STATUSES, useLatestSubscribersQuery } from "@/hooks/useLatestSubscribersQuery";

const LIMITS = [20, 50, 100] as const;

const STATUS_LABELS: Record<SubscriberStatus, string> = {
	active: "Active",
	pending: "Pending",
	overdue: "Overdue",
	cancelled: "Cancelled",
	expired: "Expired",
	upgrading: "Upgrading",
};

const DEFAULT_STATUSES = SUBSCRIBER_STATUSES.filter((s) => s !== "pending");

function statusLabel(statuses: SubscriberStatus[]): string {
	if (statuses.length === SUBSCRIBER_STATUSES.length) return "All statuses";
	if (statuses.length === DEFAULT_STATUSES.length && !statuses.includes("pending")) return "All (no pending)";
	if (statuses.length === 1) return STATUS_LABELS[statuses[0]];
	return `${statuses.length} statuses`;
}

export function LatestSubscribersTable() {
	const [limit, setLimit] = useState<number>(20);
	const [statuses, setStatuses] = useState<SubscriberStatus[]>(DEFAULT_STATUSES);
	const { data, isLoading } = useLatestSubscribersQuery(limit, statuses);

	const toggleStatus = (status: SubscriberStatus) => {
		setStatuses((prev) => {
			if (prev.includes(status)) {
				if (prev.length === 1) return prev; // keep at least one selected
				return prev.filter((s) => s !== status);
			}
			return [...prev, status];
		});
	};

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle>Latest subscribers</CardTitle>
					<CardDescription>Most recent plan subscriptions across all providers</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="w-40 justify-between font-normal">
								{statusLabel(statuses)}
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-48 p-1">
							{SUBSCRIBER_STATUSES.map((status) => {
								const checked = statuses.includes(status);
								return (
									<label
										key={status}
										className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
									>
										<Checkbox
											checked={checked}
											disabled={checked && statuses.length === 1}
											onCheckedChange={() => toggleStatus(status)}
										/>
										{STATUS_LABELS[status]}
									</label>
								);
							})}
						</PopoverContent>
					</Popover>
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
