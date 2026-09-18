import { formatDate } from "./dates";

export type ChartRow = Record<string, string | number | null>;

export const PROJECTED_SUFFIX = "__projected";
export const projectedKey = (key: string) => `${key}${PROJECTED_SUFFIX}`;

// How many complete periods the projection averages over.
const COMPLETE_PERIODS = 3;

export type PartialPeriodProjection = {
	rows: ChartRow[];
	// False when the range doesn't end today (or has no complete period to learn from):
	// callers then render the rows untouched, with no dashed series.
	hasProjection: boolean;
	projectedKeys: ReadonlySet<string>;
};

export type PartialPeriodOptions = {
	// Last date of the series. Defaults to today (UTC), matching the UTC date buckets.
	periodEnd?: string;
	// Series accumulate over the range (running totals). The partial period then continues
	// the recent *increments*; averaging the running values themselves would project a
	// point below the last complete one.
	cumulative?: boolean;
	periods?: number;
};

const toNumber = (value: unknown): number | null => {
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
};

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

// What the series should read at the end of the incomplete period, from the last
// periods' average level.
const projectLevel = (complete: ChartRow[], key: string): number | null => {
	const values = complete.map((row) => toNumber(row[key])).filter((value): value is number => value !== null);
	return values.length > 0 ? mean(values) : null;
};

// Same, from the last complete periods' average period-over-period delta.
const projectIncrement = (complete: ChartRow[], key: string): number | null => {
	if (complete.length < 2) return null;

	const deltas: number[] = [];
	for (let i = 1; i < complete.length; i++) {
		const previous = toNumber(complete[i - 1][key]);
		const current = toNumber(complete[i][key]);
		if (previous === null || current === null) return null;
		deltas.push(current - previous);
	}

	const last = toNumber(complete[complete.length - 1][key]);
	return last === null ? null : last + mean(deltas);
};

/**
 * Replaces the incomplete last bucket (today) with an estimate for the full period and
 * exposes it as a parallel ``<key>__projected`` series, so charts can draw the final
 * segment dashed instead of showing the partial-period dip as a real decline.
 *
 * The estimate is the average of the last complete periods (or, for cumulative series,
 * the last value plus the average increment). The projected series carries the value of
 * the last complete period too, so the dashed segment connects to the end of the solid
 * line. Series without enough complete periods are left alone.
 */
export const applyPartialPeriodProjection = (
	rows: ChartRow[],
	{ periodEnd = formatDate(new Date()), cumulative = false, periods = COMPLETE_PERIODS }: PartialPeriodOptions = {},
): PartialPeriodProjection => {
	const last = rows[rows.length - 1];
	if (!last || last.date !== periodEnd || rows.length < 2) {
		return { rows, hasProjection: false, projectedKeys: new Set() };
	}

	const complete = rows.slice(0, -1).slice(-periods);
	const keys = new Set(rows.flatMap((row) => Object.keys(row)));
	keys.delete("date");

	const projectedValues = new Map<string, number>();
	for (const key of keys) {
		const projected = cumulative ? projectIncrement(complete, key) : projectLevel(complete, key);
		if (projected !== null) projectedValues.set(key, projected);
	}

	if (projectedValues.size === 0) {
		return { rows, hasProjection: false, projectedKeys: new Set() };
	}

	const lastCompleteIndex = rows.length - 2;
	const projectedRows = rows.map((row, index) => {
		const out: ChartRow = { ...row };
		for (const key of projectedValues.keys()) {
			out[projectedKey(key)] = null;
		}
		if (index === lastCompleteIndex) {
			for (const key of projectedValues.keys()) {
				out[projectedKey(key)] = out[key];
			}
		}
		if (index === rows.length - 1) {
			for (const [key, value] of projectedValues) {
				out[key] = null;
				out[projectedKey(key)] = value;
			}
		}
		return out;
	});

	return { rows: projectedRows, hasProjection: true, projectedKeys: new Set(projectedValues.keys()) };
};
