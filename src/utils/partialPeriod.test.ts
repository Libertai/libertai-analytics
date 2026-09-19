import { describe, expect, it } from "vitest";
import { ChartRow, isWeekComplete, partialKey, splitPartialPeriod } from "./partialPeriod";

const TODAY = "2026-09-18";

describe("splitPartialPeriod", () => {
	it("moves today's observed value into the partial series", () => {
		const rows = [
			{ date: "2026-09-15", calls: 10 },
			{ date: "2026-09-16", calls: 20 },
			{ date: "2026-09-17", calls: 30 },
			{ date: TODAY, calls: 2 },
		];

		const result = splitPartialPeriod(rows, { periodEnd: TODAY });

		expect(result.hasPartial).toBe(true);
		expect([...result.partialKeys]).toEqual(["calls"]);
		expect(result.rows[3]).toEqual({ date: TODAY, calls: null, [partialKey("calls")]: 2 });
		// The dashed segment connects to the end of the solid line.
		expect(result.rows[2][partialKey("calls")]).toBe(30);
		expect(result.rows[1][partialKey("calls")]).toBeNull();
		expect(result.rows[0][partialKey("calls")]).toBeNull();
	});

	it("splits every series, including one that only exists today", () => {
		const rows: ChartRow[] = [
			{ date: "2026-09-17", calls: 6 },
			{ date: TODAY, calls: 1, fresh: 9 },
		];

		const result = splitPartialPeriod(rows, { periodEnd: TODAY });

		expect(result.rows[1]).toEqual({
			date: TODAY,
			calls: null,
			fresh: null,
			[partialKey("calls")]: 1,
			[partialKey("fresh")]: 9,
		});
		expect(result.rows[0][partialKey("fresh")]).toBeNull();
	});

	it("does nothing when the range does not end at periodEnd", () => {
		const rows = [
			{ date: "2026-09-15", calls: 10 },
			{ date: "2026-09-16", calls: 20 },
		];

		const result = splitPartialPeriod(rows, { periodEnd: TODAY });
		expect(result.hasPartial).toBe(false);
		expect(result.rows).toBe(rows);
	});

	it("does nothing with a single row or no rows", () => {
		expect(splitPartialPeriod([{ date: TODAY, calls: 1 }], { periodEnd: TODAY }).hasPartial).toBe(false);
		expect(splitPartialPeriod([], { periodEnd: TODAY }).hasPartial).toBe(false);
	});

	it("does not mutate the input rows", () => {
		const rows = [
			{ date: "2026-09-16", calls: 4 },
			{ date: "2026-09-17", calls: 6 },
			{ date: TODAY, calls: 1 },
		];
		const snapshot = JSON.stringify(rows);

		splitPartialPeriod(rows, { periodEnd: TODAY });

		expect(JSON.stringify(rows)).toBe(snapshot);
	});
});

describe("isWeekComplete", () => {
	it("is complete once its Sunday is before today", () => {
		expect(isWeekComplete("2026-09-07", "2026-09-18")).toBe(true);
	});

	it("is incomplete on any day within the week", () => {
		expect(isWeekComplete("2026-09-14", "2026-09-14")).toBe(false);
		expect(isWeekComplete("2026-09-14", "2026-09-17")).toBe(false);
		expect(isWeekComplete("2026-09-14", "2026-09-20")).toBe(false);
	});

	it("is complete the Monday after its Sunday", () => {
		expect(isWeekComplete("2026-09-14", "2026-09-21")).toBe(true);
	});
});
