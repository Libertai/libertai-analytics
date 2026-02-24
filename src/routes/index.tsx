import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { getDates, timeframes } from "@/utils/charts";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import { formatCount } from "@/utils/format";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getDates(selectedTimeframe.days);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days]);

	const { data: summaryData, isLoading, isFetching } = useSummaryQuery(selectedDates);

	const stats = [
		{ label: "Total Requests", value: summaryData?.total_requests ?? 0 },
		{ label: "Input Tokens", value: summaryData?.total_input_tokens ?? 0 },
		{ label: "Output Tokens", value: summaryData?.total_output_tokens ?? 0 },
		{
			label: "Total Tokens",
			value: (summaryData?.total_input_tokens ?? 0) + (summaryData?.total_output_tokens ?? 0),
		},
	];

	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h2>

			<div className="flex flex-col gap-3 mb-6">
				<div className="flex flex-wrap gap-2">
					{timeframes.map((timeframe) => (
						<Button
							key={timeframe.label}
							variant={timeframe.days === selectedTimeframe.days && !selectedCustomDates ? "default" : "outline"}
							onClick={() => {
								setSelectedTimeframe(timeframe);
								setSelectedCustomDates(false);
							}}
						>
							{timeframe.label}
						</Button>
					))}
					<div onClick={() => setSelectedCustomDates(true)}>
						<DateRangePicker
							hasCustomDateBeenClicked={selectedCustomDates}
							rangeDate={rangeDate}
							setRangeDate={setRangeDate}
						/>
					</div>
				</div>
			</div>

			<div className="relative">
				{isFetching && (
					<div className="absolute top-2 right-2 z-10">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
					</div>
				)}
				{!summaryData && isLoading ? (
					<div className="flex justify-center items-center py-8">
						<p className="text-gray-500">Loading...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{stats.map((stat) => (
							<Card key={stat.label}>
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold">{formatCount(stat.value)}</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
