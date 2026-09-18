import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@libertai/ui/table";
import { Button } from "@libertai/ui/button";
import { useActiveUsersQuery } from "@/hooks/useActiveUsersQuery";
import { ChartDate } from "@/types/dates";
import { formatCount, formatUsd } from "@/utils/format";

const PAGE_SIZE = 20;

export function ActiveUsersTable({ dates }: { dates: ChartDate }) {
	const [page, setPage] = useState(0);
	// Reset to page 0 when the date range changes, without an effect (React's
	// render-time state adjustment pattern) — avoids a stale-page fetch.
	const [prevDates, setPrevDates] = useState(dates);
	if (dates.start_date !== prevDates.start_date || dates.end_date !== prevDates.end_date) {
		setPrevDates(dates);
		setPage(0);
	}

	const { data, isLoading, isError } = useActiveUsersQuery(dates, PAGE_SIZE, page * PAGE_SIZE);

	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Active Users</CardTitle>
				<CardDescription>All users with at least one request in the selected range (API, CLI and Chat)</CardDescription>
			</CardHeader>
			<CardContent>
				{isError ? (
					<p className="py-8 text-center text-muted-foreground">Failed to load active users.</p>
				) : isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : total === 0 ? (
					<p className="py-8 text-center text-muted-foreground">No active users in this range.</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									<TableHead>User</TableHead>
									<TableHead className="text-right">Spent</TableHead>
									<TableHead className="text-right">Calls</TableHead>
									<TableHead>First active</TableHead>
									<TableHead>Last active</TableHead>
									<TableHead>Account created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(data?.users ?? []).map((user, i) => (
									<TableRow key={`${user.user_label}-${i}`}>
										<TableCell className="text-muted-foreground">#{page * PAGE_SIZE + i + 1}</TableCell>
										<TableCell className="font-medium">{user.user_label}</TableCell>
										<TableCell className="text-right">{formatUsd(user.credits_spent)}</TableCell>
										<TableCell className="text-right">{formatCount(user.calls)}</TableCell>
										<TableCell>{user.first_active_at?.slice(0, 10) ?? "-"}</TableCell>
										<TableCell>{user.last_active_at?.slice(0, 10) ?? "-"}</TableCell>
										<TableCell>{user.account_created_at ? user.account_created_at.slice(0, 10) : "-"}</TableCell>
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
