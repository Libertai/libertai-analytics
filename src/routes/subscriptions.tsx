import { createFileRoute } from "@tanstack/react-router";
import { UsersBySegment } from "@/components/charts/UsersBySegment";
import { CreditsConsumptionAnalytics } from "@/components/charts/CreditsConsumptionAnalytics";
import { TierEconomicsAnalytics } from "@/components/charts/TierEconomicsAnalytics";
import { ChurnAnalytics } from "@/components/charts/ChurnAnalytics";
import { CurrentSubscribersTable } from "@/components/CurrentSubscribersTable";
import { RecentActivityTable } from "@/components/RecentActivityTable";
import { DateFilterBar } from "@/components/DateFilterBar";
import { dateFilterSearchSchema, useDateFilter } from "@/hooks/useDateFilter";

// Earliest date any subscriptions chart has data (metering launch; paid plans came 06-22).
const ALL_TIME_START = "2026-06-01";

export const Route = createFileRoute("/subscriptions")({
	component: Subscriptions,
	validateSearch: dateFilterSearchSchema.parse,
});

function Subscriptions() {
	const filter = useDateFilter(ALL_TIME_START);
	const dates = filter.selectedDates;

	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Subscriptions</h1>
				<p className="text-sm text-muted-foreground mt-1">
					User base by segment and credit consumption across all usage (chat, API, CLI).
				</p>
			</div>
			<DateFilterBar filter={filter} />
			<UsersBySegment dates={dates} />
			<ChurnAnalytics dates={dates} />
			<CreditsConsumptionAnalytics dates={dates} />
			<TierEconomicsAnalytics dates={dates} />
			<CurrentSubscribersTable />
			<RecentActivityTable />
		</div>
	);
}
