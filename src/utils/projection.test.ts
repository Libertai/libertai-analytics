import { describe, expect, it } from "vitest";
import { applyPartialPeriodProjection, ChartRow, isWeekComplete, partialKey, projectedKey } from "./projection";

const TODAY = "2026-09-18";

describe("applyPartialPeriodProjection", () => {
	it("projects a flow series from the mean of the last 3 complete periods", () => {
		const rows = [
			{ date: "2026-09-15", calls: 10 },
			{ date: "2026-09-16", calls: 20 },
			{ date: "2026-09-17", calls: 30 },
			{ date: "2026-09-18", calls: 2 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });

		expect(result.hasProjection).toBe(true);
		expect([...result.projectedKeys]).toEqual(["calls"]);
		expect(result.rows[3]).toEqual({
			date: TODAY,
			calls: null,
			[projectedKey("calls")]: 20,
			[partialKey("calls")]: 2,
		});
		// The dashed segment connects to the end of the solid line.
		expect(result.rows[2][projectedKey("calls")]).toBe(30);
		expect(result.rows[2][partialKey("calls")]).toBeNull();
		expect(result.rows[0][projectedKey("calls")]).toBeNull();
	});

	it("only averages the last 3 complete periods", () => {
		const rows = [
			{ date: "2026-09-13", calls: 100 },
			{ date: "2026-09-14", calls: 100 },
			{ date: "2026-09-15", calls: 3 },
			{ date: "2026-09-16", calls: 6 },
			{ date: "2026-09-17", calls: 9 },
			{ date: TODAY, calls: 1 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });
		expect(result.rows[5][projectedKey("calls")]).toBe(6);
	});

	it("projects a single complete period with its own value", () => {
		const rows = [
			{ date: "2026-09-17", calls: 5 },
			{ date: TODAY, calls: 1 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });
		expect(result.rows[1][projectedKey("calls")]).toBe(5);
	});

	it("projects a cumulative series from the last value plus the mean increment", () => {
		const rows = [
			{ date: "2026-09-15", total: 10 },
			{ date: "2026-09-16", total: 25 },
			{ date: "2026-09-17", total: 45 },
			{ date: TODAY, total: 50 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY, cumulative: true });
		// 45 + mean(15, 20) = 62.5, never below the last complete value.
		expect(result.rows[3][projectedKey("total")]).toBe(62.5);
	});

	it("does not project a cumulative series without two complete periods", () => {
		const rows = [
			{ date: "2026-09-17", total: 5 },
			{ date: TODAY, total: 1 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY, cumulative: true });
		expect(result.hasProjection).toBe(false);
	});

	it("averages the non-null values of a flow series", () => {
		const rows = [
			{ date: "2026-09-15", calls: null },
			{ date: "2026-09-16", calls: 8 },
			{ date: "2026-09-17", calls: null },
			{ date: TODAY, calls: 1 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });
		expect(result.rows[3][projectedKey("calls")]).toBe(8);
	});

	it("leaves series without a complete value untouched", () => {
		const rows: ChartRow[] = [
			{ date: "2026-09-15", calls: null },
			{ date: "2026-09-16", calls: null },
			{ date: "2026-09-17", calls: null },
			{ date: TODAY, calls: 5, fresh: 7 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });
		expect(result.hasProjection).toBe(false);
		expect(result.rows).toEqual(rows);
	});

	it("keeps every series when nothing can be projected", () => {
		const rows = [
			{ date: "2026-09-17", calls: 6, fresh: 7 },
			{ date: TODAY, calls: 1, fresh: 9 },
		];

		// cumulative + one complete period: neither series is projected.
		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY, cumulative: true });
		expect(result.hasProjection).toBe(false);
		expect(result.rows[1]).toEqual({ date: TODAY, calls: 1, fresh: 9 });
	});

	it("does nothing when the range does not end at periodEnd", () => {
		const rows = [
			{ date: "2026-09-15", calls: 10 },
			{ date: "2026-09-16", calls: 20 },
		];

		const result = applyPartialPeriodProjection(rows, { periodEnd: TODAY });
		expect(result.hasProjection).toBe(false);
		expect(result.rows).toBe(rows);
	});

	it("does nothing with a single row or no rows", () => {
		expect(applyPartialPeriodProjection([{ date: TODAY, calls: 1 }], { periodEnd: TODAY }).hasProjection).toBe(false);
		expect(applyPartialPeriodProjection([], { periodEnd: TODAY }).hasProjection).toBe(false);
	});

	it("does not mutate the input rows", () => {
		const rows = [
			{ date: "2026-09-16", calls: 4 },
			{ date: "2026-09-17", calls: 6 },
			{ date: TODAY, calls: 1 },
		];
		const snapshot = JSON.stringify(rows);

		applyPartialPeriodProjection(rows, { periodEnd: TODAY });

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
