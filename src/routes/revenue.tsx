import { createFileRoute } from "@tanstack/react-router";
import { RevenueAnalytics } from "@/components/charts/RevenueAnalytics";
import { TopupsTable } from "@/components/TopupsTable";
import { DateFilterBar } from "@/components/DateFilterBar";
import { dateFilterSearchSchema, useDateFilter } from "@/hooks/useDateFilter";

// Payments launched 2026-06-22; "All time" starts there.
const ALL_TIME_START = "2026-06-22";

export const Route = createFileRoute("/revenue")({
	component: Revenue,
	validateSearch: dateFilterSearchSchema.parse,
});

function Revenue() {
	const filter = useDateFilter(ALL_TIME_START);
	const dates = filter.selectedDates;

	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Revenue</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Fiat revenue: subscription MRR and prepaid credit topups (Revolut).
				</p>
			</div>
			<DateFilterBar filter={filter} />
			<RevenueAnalytics dates={dates} />
			<TopupsTable dates={dates} />
		</div>
	);
}
