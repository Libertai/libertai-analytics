import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@libertai/ui/table";
import { Button } from "@libertai/ui/button";
import { useRevenueTopupsQuery } from "@/hooks/useRevenueTopupsQuery";
import { ChartDate } from "@/types/dates";

const PAGE_SIZE = 20;

export function TopupsTable({ dates }: { dates: ChartDate }) {
	const [page, setPage] = useState(0);
	// Reset to page 0 when the date range changes, without an effect (React's
	// render-time state adjustment pattern) — avoids an extra render + stale-page fetch.
	const [prevDates, setPrevDates] = useState(dates);
	if (dates.start_date !== prevDates.start_date || dates.end_date !== prevDates.end_date) {
		setPrevDates(dates);
		setPage(0);
	}
	const { data, isLoading } = useRevenueTopupsQuery(dates, PAGE_SIZE, page * PAGE_SIZE);

	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Topups</CardTitle>
				<CardDescription>Completed Revolut credit purchases in the selected range.</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : (data?.topups.length ?? 0) === 0 ? (
					<p className="py-8 text-center text-muted-foreground">No topups in this range.</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Amount ($)</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{(data?.topups ?? []).map((t, i) => (
									<TableRow key={`${t.user_label}-${t.created_at}-${i}`}>
										<TableCell>{t.created_at.slice(0, 10)}</TableCell>
										<TableCell className="font-medium">{t.user_label}</TableCell>
										<TableCell>{t.amount.toFixed(2)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{total > PAGE_SIZE && (
							<div className="flex items-center justify-between mt-3">
								<span className="text-xs text-muted-foreground">
									Page {page + 1} of {pageCount}
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
