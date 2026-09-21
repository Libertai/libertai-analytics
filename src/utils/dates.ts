import { ChartDate } from "@/types/dates";

export const formatDate = (date: Date) => date.toISOString().split("T")[0];

// A calendar day the user picked or is living in, not an instant: the API takes plain
// YYYY-MM-DD and treats it as a whole day. toISOString() would renumber it to the UTC day,
// which east of UTC is the day before.
export const formatCalendarDate = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// react-day-picker returns local midnight; serialize from local parts so the
// selected calendar day survives UTC conversion, expiring at that day's end.
export const expirationPayload = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T23:59:59Z`;


export function getDateRange(days: number): ChartDate {
	const end_date = new Date();
	const start_date = new Date();
	start_date.setDate(end_date.getDate() - days);

	return {
		start_date: formatCalendarDate(start_date),
		end_date: formatCalendarDate(end_date),
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
