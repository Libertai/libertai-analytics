import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActivityType, ACTIVITY_TYPES, useSubscriptionActivityQuery } from "@/hooks/useSubscriptionActivityQuery";

const LIMITS = [20, 50, 100] as const;

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
	const [limit, setLimit] = useState<number>(20);
	const [types, setTypes] = useState<ActivityType[]>(ACTIVITY_TYPES);
	const { data, isLoading } = useSubscriptionActivityQuery(limit, types);

	const toggleType = (type: ActivityType) => {
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
			<CardHeader className="flex-row items-center justify-between space-y-0">
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
										<TableCell className="capitalize">{event.tier}</TableCell>
										<TableCell>{event.provider}</TableCell>
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
