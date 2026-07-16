"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import { averageDau, describeWindow, DAU_SERIES_KEY, groupDauPerDay, USER_WINDOWS, WINDOW_LABEL_SUFFIX } from "@/utils/users";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { formatCount } from "@/utils/format";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { UsersWindow } from "@/types/users";
import { ChartDate } from "@/types/dates";

// Daily-active-users (DAU) chart for one request type. Single series (no per-model split),
// with headline cards for unique users over the range and the average DAU on active days.
export function UsersAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [usersWindow, setUsersWindow] = useState<UsersWindow>("day");

	const { data: usersData, isLoading, isFetching } = useUsersQuery(type, dates, usersWindow);
	const { data: dauData } = useUsersQuery(type, dates, "day");
	const { data: wauData } = useUsersQuery(type, dates, "week");
	const { data: mauData } = useUsersQuery(type, dates, "month");
	const currentWau = wauData?.daily_active_users.at(-1)?.active_users ?? 0;
	const currentMau = mauData?.daily_active_users.at(-1)?.active_users ?? 0;

	const deferredUsersData = useDeferredValue(usersData);

	const seriesLabel = `${DAU_SERIES_KEY}${WINDOW_LABEL_SUFFIX[usersWindow]}`;

	const data = useMemo(() => {
		if (!deferredUsersData) return [];
		return groupDauPerDay(deferredUsersData.daily_active_users, dates, seriesLabel);
	}, [deferredUsersData, dates, seriesLabel]);

	const description = type.users && describeWindow(type.users.description, usersWindow);

	const avgDau = useMemo(() => (dauData ? averageDau(dauData.daily_active_users) : 0), [dauData]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.users?.title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex justify-end mb-4">
					<ChartModeToggle modes={USER_WINDOWS} value={usersWindow} onChange={setUsersWindow} />
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
