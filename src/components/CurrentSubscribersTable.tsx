import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentSubscribersQuery } from "@/hooks/useCurrentSubscribersQuery";

export function CurrentSubscribersTable() {
	const { data, isLoading } = useCurrentSubscribersQuery();

	return (
		<Card>
			<CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Current subscribers</CardTitle>
					<CardDescription>Active and overdue subscriptions — one row per subscriber</CardDescription>
				</div>
				{data && (
					<div className="text-right">
						<div className="text-2xl font-bold">{data.total}</div>
						<div className="text-xs text-muted-foreground">total</div>
					</div>
				)}
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
