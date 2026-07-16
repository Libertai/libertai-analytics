import { ReactNode } from "react";
import { CallsAnalytics } from "@/components/charts/CallsAnalytics";
import { TokensAnalytics } from "@/components/charts/TokensAnalytics";
import { CreditsAnalytics } from "@/components/charts/CreditsAnalytics";
import { UsersAnalytics } from "@/components/charts/UsersAnalytics";
import { CallsBySegmentAnalytics } from "@/components/charts/CallsBySegmentAnalytics";
import { RequestTypeConfig } from "@/config/requestTypes";
import { DateFilterBar } from "@/components/DateFilterBar";
import { useDateFilter } from "@/hooks/useDateFilter";
import { ChartDate } from "@/types/dates";

// Stacks the calls / tokens / (optional) credits / (optional) users charts for one request type,
// all driven by a single page-level date filter persisted in the URL.
// `extra` renders additional type-specific charts at the end (e.g. messages-by-plan on chat).
export function InferenceAnalytics({
	type,
	extra,
}: {
	type: RequestTypeConfig;
	extra?: (dates: ChartDate) => ReactNode;
}) {
	const filter = useDateFilter(type.allTimeStartDate);
	const dates = filter.selectedDates;

	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">{type.pageTitle}</h2>
			<div className="mb-6">
				<DateFilterBar filter={filter} />
			</div>
			<CallsAnalytics type={type} dates={dates} />
			<br />
			<TokensAnalytics type={type} dates={dates} />
			{type.credits && (
				<>
					<br />
					<CreditsAnalytics type={type} dates={dates} />
				</>
			)}
			{type.users && (
				<>
					<br />
					<UsersAnalytics type={type} dates={dates} />
				</>
			)}
			{type.callsBySegment && (
				<>
					<br />
					<CallsBySegmentAnalytics type={type} dates={dates} />
				</>
			)}
			{extra && (
				<>
					<br />
					{extra(dates)}
				</>
			)}
		</main>
	);
}
