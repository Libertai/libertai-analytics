import { ChartDate } from "@/types/dates";

// Days are UTC days, matching the backend: "today" is the current UTC day.
export const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const formatUTCDay = (date: Date, options: Intl.DateTimeFormatOptions) =>
	date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });

// Expires at the end of the picked UTC day.
export const expirationPayload = (d: Date) => `${formatDate(d)}T23:59:59Z`;


export function getDateRange(days: number): ChartDate {
	const end_date = new Date();
	const start_date = new Date();
	start_date.setUTCDate(end_date.getUTCDate() - days);

	return {
		start_date: formatDate(start_date),
		end_date: formatDate(end_date),
	};
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const createEmptyResultByRangeDate = <T extends Record<string, any>>(
  timeframe: number,
  rangeDate: { start_date: string },
  defaultValue: T[keyof T]
): T => {
  const result = {} as T;

  for (let i = 0; i < timeframe; i++) {
    const sDate = new Date(rangeDate.start_date);
    sDate.setUTCDate(sDate.getUTCDate() + i);
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
