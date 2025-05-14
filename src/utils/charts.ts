import { ChartDate } from "@/types/dates";
import { formatDate } from "./dates";

export const formatXAxis = (tickItem: string) => {
	const date = new Date(tickItem);
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const timeframes = [
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
	{ label: "90 days", days: 90 },
];

export const getDates = (days: number): ChartDate => {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	return {
		start_date: formatDate(startDate),
		end_date: formatDate(new Date()),
	}
}