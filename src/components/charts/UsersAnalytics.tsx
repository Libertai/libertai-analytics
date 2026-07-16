"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeferredValue, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/DateRangePicker";
import { formatDate } from "@/utils/dates";
import { averageDau, describeWindow, DAU_SERIES_KEY, groupDauPerDay, WINDOW_LABEL_SUFFIX } from "@/utils/users";
import { getDates, timeframes } from "@/utils/charts";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { UsersWindow } from "@/types/users";

const USER_WINDOWS = [
	{ value: "day", label: "DAU" },
	{ value: "week", label: "WAU" },
	{ value: "month", label: "MAU" },
] as const;

// Daily-active-users (DAU) chart for one request type. Single series (no per-model split),
// with headline cards for unique users over the range and the average DAU on active days.
export function UsersAnalytics({ type }: { type: RequestTypeConfig }) {
	const [rangeDate, setRangeDate] = useState<DateRange>();
	const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[1]);
	const [selectedCustomDates, setSelectedCustomDates] = useState<boolean>(false);
	const [usersWindow, setUsersWindow] = useState<UsersWindow>("day");

	const selectedDates = useMemo(() => {
		if (selectedCustomDates && rangeDate?.from && rangeDate?.to) {
			return {
				start_date: formatDate(rangeDate.from),
				end_date: formatDate(rangeDate.to),
			};
		}
		return getDates(selectedTimeframe.days, type.allTimeStartDate);
	}, [selectedCustomDates, rangeDate, selectedTimeframe.days, type.allTimeStartDate]);

	const { data: usersData, isLoading, isFetching } = useUsersQuery(type, selectedDates, usersWindow);
	const { data: dauData } = useUsersQuery(type, selectedDates, "day");
	const { data: wauData } = useUsersQuery(type, selectedDates, "week");
	const { data: mauData } = useUsersQuery(type, selectedDates, "month");
	const currentWau = wauData?.daily_active_users.at(-1)?.active_users ?? 0;
	const currentMau = mauData?.daily_active_users.at(-1)?.active_users ?? 0;

	const deferredUsersData = useDeferredValue(usersData);

	const seriesLabel = `${DAU_SERIES_KEY}${WINDOW_LABEL_SUFFIX[usersWindow]}`;

	const data = useMemo(() => {
		if (!deferredUsersData) return [];
		return groupDauPerDay(deferredUsersData.daily_active_users, selectedDates, seriesLabel);
	}, [deferredUsersData, selectedDates, seriesLabel]);

	const description = type.users && describeWindow(type.users.description, usersWindow);

	const avgDau = useMemo(
		() => (dauData ? averageDau(dauData.daily_active_users) : 0),
		[dauData],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.users?.title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex items-center justify-between gap-2 flex-wrap">
						<div className="flex flex-wrap gap-2">
							{timeframes.map((timeframe) => (
								<Button
									key={timeframe.label}
									className="max-md:h-8 max-md:px-3 max-md:text-xs"
									variant={
										timeframe.days === selectedTimeframe.days && selectedCustomDates == false ? "default" : "outline"
									}
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
						<ChartModeToggle modes={USER_WINDOWS} value={usersWindow} onChange={setUsersWindow} />
					</div>
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!usersData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-gray-500">Loading...</p>
						</div>
					) : (
						<MultiModelChartContainer
							data={data}
							cards={[
								{ number: usersData?.total_unique_users || 0, description: "Unique users (range)", formatter: formatCount },
								{ number: avgDau, description: "Avg DAU (active days)", formatter: formatCount },
								{ number: currentWau, description: "WAU (last day)", formatter: formatCount },
								{ number: currentMau, description: "MAU (last day)", formatter: formatCount },
							]}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
