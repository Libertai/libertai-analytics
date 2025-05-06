import { ChartDate } from "@/types/dates";

export const formatDate = (date: Date) => date.toISOString().split("T")[0];


export function getDateRange(days: number): ChartDate {
	const end_date = new Date();
	const start_date = new Date();
	start_date.setDate(end_date.getDate() - days);

	return {
		start_date: formatDate(start_date),
		end_date: formatDate(end_date),
	};
}
