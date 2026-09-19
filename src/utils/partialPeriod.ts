import { formatDate } from "./dates";

export type ChartRow = Record<string, string | number | null>;

export const PARTIAL_SUFFIX = "__partial";
export const partialKey = (key: string) => `${key}${PARTIAL_SUFFIX}`;

export type PartialPeriod = {
	rows: ChartRow[];
	// False when the range doesn't end today: callers then render the rows untouched,
	// with no dashed series.
	hasPartial: boolean;
	partialKeys: ReadonlySet<string>;
};

export type PartialPeriodOptions = {
	// Last date of the series. Defaults to today (UTC), matching the UTC date buckets.
	// Tests pass a fixed date to keep the split deterministic.
	periodEnd?: string;
};

/**
 * Moves the incomplete last bucket (today) into a parallel ``<key>__partial`` series, so
 * charts can draw its segment dashed and signal that the period is still filling up.
 *
 * The partial series carries the value of the last complete period too, so the dashed
 * segment connects to the end of the solid line. Values are the observed ones: nothing
 * is estimated.
 */
export const splitPartialPeriod = (
	rows: ChartRow[],
	{ periodEnd = formatDate(new Date()) }: PartialPeriodOptions = {},
): PartialPeriod => {
	const last = rows[rows.length - 1];
	if (!last || last.date !== periodEnd || rows.length < 2) {
		return { rows, hasPartial: false, partialKeys: new Set() };
	}

	const keys = new Set(rows.flatMap((row) => Object.keys(row)));
	keys.delete("date");
	if (keys.size === 0) {
		return { rows, hasPartial: false, partialKeys: new Set() };
	}

	const lastCompleteIndex = rows.length - 2;
	const splitRows = rows.map((row, index) => {
		const out: ChartRow = { ...row };
		for (const key of keys) out[partialKey(key)] = null;
		if (index === lastCompleteIndex) {
			for (const key of keys) out[partialKey(key)] = out[key] ?? null;
		}
		if (index === rows.length - 1) {
			for (const key of keys) {
				out[partialKey(key)] = out[key] ?? null;
				out[key] = null;
			}
		}
		return out;
	});

	return { rows: splitRows, hasPartial: true, partialKeys: new Set(keys) };
};

/**
 * True when the weekly bucket starting at ``weekStart`` (a Monday, ``YYYY-MM-DD``) ended
 * before ``today``. Both dates are UTC, matching the backend's week bucketing.
 */
export const isWeekComplete = (weekStart: string, today: string): boolean => {
	const sunday = new Date(`${weekStart}T00:00:00Z`);
	sunday.setUTCDate(sunday.getUTCDate() + 6);
	return sunday.toISOString().slice(0, 10) < today;
};
