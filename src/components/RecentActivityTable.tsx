import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@libertai/ui/table";
import { Button } from "@libertai/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@libertai/ui/popover";
import { ActivityType, ACTIVITY_TYPES, useSubscriptionActivityQuery } from "@/hooks/useSubscriptionActivityQuery";

const PAGE_SIZE = 20;

const TYPE_LABELS: Record<ActivityType, string> = {
	subscribed: "Subscribed",
	upgraded: "Upgraded",
	downgraded: "Downgraded",
	cancelled: "Cancelled",
	churned: "Churned",
	payment_failed: "Payment failed",
};

function typesLabel(types: ActivityType[]): string {
	if (types.length === ACTIVITY_TYPES.length) return "All events";
	if (types.length === 1) return TYPE_LABELS[types[0]];
	return `${types.length} events`;
}

export function RecentActivityTable() {
	const [page, setPage] = useState(0);
	const [types, setTypes] = useState<ActivityType[]>(ACTIVITY_TYPES);
	const { data, isLoading } = useSubscriptionActivityQuery(PAGE_SIZE, types, page * PAGE_SIZE);

	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const toggleType = (type: ActivityType) => {
		setPage(0);
		setTypes((prev) => {
			if (prev.includes(type)) {
				if (prev.length === 1) return prev; // keep at least one selected
				return prev.filter((t) => t !== type);
			}
			return [...prev, type];
		});
	};

	return (
		<Card>
			<CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Recent activity</CardTitle>
					<CardDescription>Subscription lifecycle events, newest first</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="w-40 justify-between font-normal">
								{typesLabel(types)}
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-48 p-1">
							{ACTIVITY_TYPES.map((type) => {
								const checked = types.includes(type);
								return (
									<label
										key={type}
										className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
									>
										<Checkbox
											checked={checked}
											disabled={checked && types.length === 1}
											onCheckedChange={() => toggleType(type)}
										/>
										{TYPE_LABELS[type]}
									</label>
								);
							})}
						</PopoverContent>
					</Popover>
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
									<TableHead>When</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Event</TableHead>
									<TableHead>Tier</TableHead>
									<TableHead>Provider</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(data?.events ?? []).map((event, i) => (
									<TableRow key={`${event.user_label}-${event.created_at}-${i}`}>
										<TableCell>{event.created_at.slice(0, 10)}</TableCell>
										<TableCell className="font-medium">{event.user_label}</TableCell>
										<TableCell>{TYPE_LABELS[event.type]}</TableCell>
										<TableCell className="capitalize">
											{event.from_tier ? `${event.from_tier} → ${event.tier}` : event.tier}
										</TableCell>
										<TableCell>{event.provider}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{total > PAGE_SIZE && (
							<div className="flex items-center justify-between mt-3">
								<span className="text-xs text-muted-foreground">
									{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
								</span>
								<div className="flex gap-1">
									<Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={page >= pageCount - 1}
										onClick={() => setPage(page + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
