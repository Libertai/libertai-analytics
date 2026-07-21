import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import { CHART_TOOLTIP_PROPS, formatXAxis } from "@/utils/charts";
import { useSummaryQuery } from "@/hooks/useSummaryQuery";
import { useCallsQuery } from "@/hooks/useCallsQuery";
import { useGlobalUsersQuery } from "@/hooks/useGlobalUsersQuery";
import { REQUEST_TYPES } from "@/config/requestTypes";
import { formatCount, formatLargeNumber } from "@/utils/format";
import { groupCumulativeTotal, groupCumulativePerModel } from "@/utils/cumulative";
import { averageDau, describeWindow, DAU_SERIES_KEY, groupDauPerDay, USER_WINDOWS, WINDOW_LABEL_SUFFIX } from "@/utils/users";
import MultiModelChartContainer from "@/components/MultiModelChartContainer";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { UsersWindow } from "@/types/users";
import { DateFilterBar } from "@/components/DateFilterBar";
import { dateFilterSearchSchema, useDateFilter } from "@/hooks/useDateFilter";

export const Route = createFileRoute("/")({
	component: Index,
	validateSearch: dateFilterSearchSchema.parse,
});

function Index() {
	const [usersWindow, setUsersWindow] = useState<UsersWindow>("day");

	const filter = useDateFilter();
	const selectedDates = filter.selectedDates;

	const { data: summaryData, isLoading, isFetching } = useSummaryQuery(selectedDates);
	const { data: usersData } = useGlobalUsersQuery(selectedDates, usersWindow);
	const { data: dauData } = useGlobalUsersQuery(selectedDates, "day");
	const { data: wauData } = useGlobalUsersQuery(selectedDates, "week");
	const { data: mauData } = useGlobalUsersQuery(selectedDates, "month");
	const currentWau = wauData?.daily_active_users.at(-1)?.active_users ?? 0;
	const currentMau = mauData?.daily_active_users.at(-1)?.active_users ?? 0;
	const { data: apiData } = useCallsQuery(REQUEST_TYPES.api, selectedDates);
	const { data: chatData } = useCallsQuery(REQUEST_TYPES.chat, selectedDates);
	const { data: x402Data } = useCallsQuery(REQUEST_TYPES.x402, selectedDates);
	const { data: liberclawData } = useCallsQuery(REQUEST_TYPES.liberclaw, selectedDates);
	const { data: cliData } = useCallsQuery(REQUEST_TYPES.cli, selectedDates);

	const allCalls = useMemo(() => {
		const calls = [
			...(apiData?.calls ?? []),
			...(chatData?.calls ?? []),
			...(x402Data?.calls ?? []),
			...(liberclawData?.calls ?? []),
			...(cliData?.calls ?? []),
		];
		return calls;
	}, [apiData, chatData, x402Data, liberclawData, cliData]);

	const deferredAllCalls = useDeferredValue(allCalls);

	const cumulativeTotalData = useMemo(() => {
		if (deferredAllCalls.length === 0) return [];
		return groupCumulativeTotal(deferredAllCalls, selectedDates);
	}, [deferredAllCalls, selectedDates]);

	const cumulativePerModelData = useMemo(() => {
		if (deferredAllCalls.length === 0) return [];
		return groupCumulativePerModel(deferredAllCalls, selectedDates);
	}, [deferredAllCalls, selectedDates]);

	const deferredUsersData = useDeferredValue(usersData);

	const usersSeriesLabel = `${DAU_SERIES_KEY}${WINDOW_LABEL_SUFFIX[usersWindow]}`;

	const dauChartData = useMemo(() => {
		if (!deferredUsersData) return [];
		return groupDauPerDay(deferredUsersData.daily_active_users, selectedDates, usersSeriesLabel);
	}, [deferredUsersData, selectedDates, usersSeriesLabel]);

	const avgDau = useMemo(() => (dauData ? averageDau(dauData.daily_active_users) : 0), [dauData]);

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

			<div className="mb-6">
				<DateFilterBar filter={filter} />
			</div>

			<div className="relative">
				{isFetching && (
					<div className="absolute top-2 right-2 z-10">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
					</div>
				)}
				{!summaryData && isLoading ? (
					<div className="flex justify-center items-center py-8">
						<p className="text-muted-foreground">Loading...</p>
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

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Cumulative Requests</CardTitle>
						<CardDescription>Total number of requests over time</CardDescription>
					</CardHeader>
					<CardContent className="max-md:px-3">
						<div className="h-[350px] md:h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={cumulativeTotalData}>
									<XAxis
										dataKey="date"
										tickLine={false}
										axisLine={false}
										tick={{ fontSize: 12 }}
										tickFormatter={formatXAxis}
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tick={{ fontSize: 12 }}
										tickFormatter={(value) => formatLargeNumber(Number(value) || 0)}
									/>
									<Tooltip {...CHART_TOOLTIP_PROPS} formatter={(value) => formatLargeNumber(Number(value) || 0)} />
									<Area
										type="monotone"
										dataKey="total"
										stroke="#8884d8"
										fill="#8884d8"
										fillOpacity={0.1}
										strokeWidth={2}
										name="Total Requests"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Cumulative Requests per Model</CardTitle>
						<CardDescription>Total number of requests over time by model</CardDescription>
					</CardHeader>
					<CardContent className="max-md:px-3">
						<MultiModelChartContainer
							data={cumulativePerModelData}
							cards={[]}
							selectedModels={[]}
						/>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Active Users</CardTitle>
					<CardDescription>
						{describeWindow(
							"Distinct users per day across API, CLI, Chat and Liberclaw (deduplicated; excludes x402)",
							usersWindow,
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="max-md:px-3">
					<div className="flex items-center justify-end gap-2 mb-4">
						<ChartModeToggle modes={USER_WINDOWS} value={usersWindow} onChange={setUsersWindow} />
					</div>
					<MultiModelChartContainer
						data={dauChartData}
						cards={[
							{ number: usersData?.total_unique_users ?? 0, description: "Unique users (range)", formatter: formatCount },
							{ number: avgDau, description: "Avg DAU (active days)", formatter: formatCount },
							{ number: currentWau, description: "WAU (last day)", formatter: formatCount },
							{ number: currentMau, description: "MAU (last day)", formatter: formatCount },
						]}
					/>
				</CardContent>
			</Card>
		</main>
	);
}
