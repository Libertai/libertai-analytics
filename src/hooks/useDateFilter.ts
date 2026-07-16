import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { DateRange } from "react-day-picker";
import { z } from "zod";
import { ChartDate } from "@/types/dates";
import { getDates } from "@/utils/charts";
import { formatDate } from "@/utils/dates";

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/)
	.optional()
	.catch(undefined);

// Page-level date filter in the URL: `tf` is a timeframe in days ("all" for all-time,
// absent for the 30-day default); `from`+`to` switch to a custom range. Invalid values
// silently fall back so a mangled URL never crashes the page.
export const dateFilterSearchSchema = z.object({
	tf: z
		.union([z.coerce.number().int().positive(), z.literal("all")])
		.optional()
		.catch(undefined),
	from: isoDate,
	to: isoDate,
});
export type DateFilterSearch = z.infer<typeof dateFilterSearchSchema>;

export type DateFilter = {
	selectedDates: ChartDate;
	// null = all time, mirroring `timeframes` entries.
	timeframeDays: number | null;
	isCustom: boolean;
	rangeDate: DateRange | undefined;
	setTimeframe: (days: number | null) => void;
	setRange: (range: DateRange) => void;
};

const DEFAULT_TIMEFRAME_DAYS = 30;

/**
 * Single source of truth for a page's date range, persisted in the route's search params
 * so filters survive reloads and links are shareable. Every route using it must include
 * `dateFilterSearchSchema` in its `validateSearch`.
 */
export const useDateFilter = (allTimeStartDate?: string): DateFilter => {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as DateFilterSearch;

	const isCustom = Boolean(search.from && search.to);
	const timeframeDays = search.tf === "all" ? null : (search.tf ?? DEFAULT_TIMEFRAME_DAYS);

	const rangeDate = useMemo<DateRange | undefined>(() => {
		if (!search.from || !search.to) return undefined;
		return { from: new Date(`${search.from}T00:00:00`), to: new Date(`${search.to}T00:00:00`) };
	}, [search.from, search.to]);

	const selectedDates = useMemo<ChartDate>(() => {
		if (search.from && search.to) return { start_date: search.from, end_date: search.to };
		return getDates(timeframeDays, allTimeStartDate);
	}, [search.from, search.to, timeframeDays, allTimeStartDate]);

	const setTimeframe = useCallback(
		(days: number | null) => {
			void navigate({
				to: ".",
				search: (prev: DateFilterSearch) => ({
					...prev,
					tf: days === null ? ("all" as const) : days === DEFAULT_TIMEFRAME_DAYS ? undefined : days,
					from: undefined,
					to: undefined,
				}),
				replace: true,
			});
		},
		[navigate],
	);

	const setRange = useCallback(
		(range: DateRange) => {
			if (!range.from || !range.to) return;
			const from = formatDate(range.from);
			const to = formatDate(range.to);
			void navigate({
				to: ".",
				search: (prev: DateFilterSearch) => ({ ...prev, tf: undefined, from, to }),
				replace: true,
			});
		},
		[navigate],
	);

	return { selectedDates, timeframeDays, isCustom, rangeDate, setTimeframe, setRange };
};
