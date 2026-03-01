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

export const getDates = (days: number | null, allTimeStartDate?: string): ChartDate => {
	let startDate: Date;

	if (days === null) {
		// All time: use provided start date or default to April 26, 2025
		startDate = new Date(allTimeStartDate || "2025-04-26");
	} else {
		startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
	}

	return {
		start_date: formatDate(startDate),
		end_date: formatDate(new Date()),
	};
};

export const getChatDates = (days: number | null): ChartDate => {
	return getDates(days, "2025-10-02");
};
