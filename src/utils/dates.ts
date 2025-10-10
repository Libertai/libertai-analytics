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

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const createEmptyResultByRangeDate = <T extends Record<string, any>>(
  timeframe: number,
  rangeDate: { start_date: string },
  startDate: Date,
  defaultValue: T[keyof T]
): T => {
  const result = {} as T;

  for (let i = 1; i < timeframe; i++) {
    const sDate = new Date(rangeDate.start_date);
    sDate.setDate(startDate.getDate() + i);
    const dateStr = sDate.toISOString().split("T")[0];

    (result as Record<string, any>)[dateStr] = { ...defaultValue };
  }

  return result;
};


export const isSameDay = (d1: Date, d2: Date): boolean => {
	return d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate();
}
