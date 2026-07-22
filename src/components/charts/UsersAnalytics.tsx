"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeferredValue, useMemo, useState } from "react";
import { averageDau, describeWindow, DAU_SERIES_KEY, groupDauPerDay, groupDauByTierPerDay, USER_WINDOWS, WINDOW_LABEL_SUFFIX, USERS_VIEW_MODES, UsersViewMode } from "@/utils/users";
import MultiModelChartContainer from "../MultiModelChartContainer";
import { FilterSegments } from "@/components/FilterSegments";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { formatCount } from "@/utils/format";
import { CREDITS_TIER_ORDER, segmentLabel } from "@/utils/subscriptions";
import { RequestTypeConfig } from "@/config/requestTypes";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { UsersWindow } from "@/types/users";
import { ChartDate } from "@/types/dates";

// Label-cased to match the chart series keys produced by segmentLabel(). No liberclaw
// bucket here: per-type pages with byTier only ever see account users (free/go/plus/max).
const TIER_OPTIONS = CREDITS_TIER_ORDER.map(segmentLabel);

// Daily-active-users (DAU) chart for one request type. Single series (no per-model split),
// with headline cards for unique users over the range and the average DAU on active days.
export function UsersAnalytics({ type, dates }: { type: RequestTypeConfig; dates: ChartDate }) {
	const [usersWindow, setUsersWindow] = useState<UsersWindow>("day");
	const [usersMode, setUsersMode] = useState<UsersViewMode>("combined");
	const [selectedTiers, setSelectedTiers] = useState<string[]>([]);

	const byTier = type.users?.byTier ?? false;

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
		if (usersMode === "by-tier") return groupDauByTierPerDay(deferredUsersData.daily_active_users_by_tier, dates);
		return groupDauPerDay(deferredUsersData.daily_active_users, dates, seriesLabel);
	}, [deferredUsersData, dates, seriesLabel, usersMode]);

	const description = type.users && describeWindow(type.users.description, usersWindow);

	const avgDau = useMemo(() => (dauData ? averageDau(dauData.daily_active_users) : 0), [dauData]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{type.users?.title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="max-md:px-3">
				<div className="flex items-center justify-end gap-2 mb-4 flex-wrap">
					{byTier && usersMode === "by-tier" && (
						<FilterSegments selected={selectedTiers} onChange={setSelectedTiers} options={TIER_OPTIONS} />
					)}
					{byTier && <ChartModeToggle modes={USERS_VIEW_MODES} value={usersMode} onChange={setUsersMode} />}
					<ChartModeToggle modes={USER_WINDOWS} value={usersWindow} onChange={setUsersWindow} />
				</div>
				<div className="relative">
					{isFetching && (
						<div className="absolute top-2 right-2 z-10">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
						</div>
					)}
					{!usersData && isLoading ? (
						<div className="flex justify-center items-center py-8">
							<p className="text-muted-foreground">Loading...</p>
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
							selectedModels={usersMode === "by-tier" ? selectedTiers : []}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
