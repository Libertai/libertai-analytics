import { ChartDate } from "@/types/dates";
import { formatDate } from "./dates";

export const formatXAxis = (tickItem: string) => {
	const [year, month, day] = tickItem.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const timeframes = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "All time", days: null },
];

// Shared by every per-model chart's display-mode toggle.
export const BY_MODEL_MODES = [
	{ value: "by-model", label: "By model" },
	{ value: "combined", label: "Combined" },
] as const;
export type ByModelMode = (typeof BY_MODEL_MODES)[number]["value"];

// For charts whose series can't exist before their feature launched: pull the range start
// up to `minStart` so the x-axis doesn't render weeks of empty leading days.
export const clampStartDate = (dates: ChartDate, minStart: string): ChartDate =>
	dates.start_date >= minStart ? dates : { ...dates, start_date: minStart };

export const getDates = (days: number | null, allTimeStartDate?: string): ChartDate => {
	let startDate: Date;

	if (days === null) {
		// All time: use provided start date or default to April 26, 2025
		startDate = new Date(allTimeStartDate || "2025-04-26");
	} else {
		startDate = new Date();
		startDate.setUTCDate(startDate.getUTCDate() - days);
	}

	return {
		start_date: formatDate(startDate),
		end_date: formatDate(new Date()),
	};
};
