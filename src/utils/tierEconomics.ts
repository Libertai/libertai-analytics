import { ChartDate } from "@/types/dates";
import { TierEconomicsDay, TierPrice } from "@/types/subscriptions";
import { segmentLabel } from "@/utils/subscriptions";

export type EconomicsLens = "payg-ratio" | "entitlement-used" | "credits-per-sub";
export type EconomicsWindow = "cumulative" | "daily";

// Revenue is prorated over a flat 30-day month, so a subscriber's daily revenue does not
// wobble with month length. A 31-day month's summed revenue overshoots the true price by ~3%.
const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;

type TierTotals = { credits: number; revenue: number; subscribers: number; allowance: number };

/**
 * [{date, Go, Plus, Max}] — one row per day in the range.
 *
 * A tier's value is `null` (not 0) on days it had no subscribers, so Recharts draws a gap
 * instead of a line pinned to the floor before that tier's first subscriber ever existed.
 */
export const buildTierEconomicsSeries = (
	daily: TierEconomicsDay[],
	tierPrices: TierPrice[],
	rangeDate: ChartDate,
	lens: EconomicsLens,
	window: EconomicsWindow,
): Record<string, string | number | null>[] => {
	const planByTier = new Map(tierPrices.map((t) => [t.tier, t]));
	const tiers = tierPrices.map((t) => t.tier);

	const byDate = new Map<string, Map<string, TierEconomicsDay>>();
	for (const d of daily) {
		if (!byDate.has(d.date)) byDate.set(d.date, new Map());
		byDate.get(d.date)!.set(d.tier, d);
	}

	const running = new Map<string, TierTotals>(
		tiers.map((t) => [t, { credits: 0, revenue: 0, subscribers: 0, allowance: 0 }]),
	);

	const rows: Record<string, string | number | null>[] = [];
	const last = new Date(`${rangeDate.end_date}T00:00:00Z`);

	for (const day = new Date(`${rangeDate.start_date}T00:00:00Z`); day <= last; day.setUTCDate(day.getUTCDate() + 1)) {
		const key = day.toISOString().split("T")[0];
		const row: Record<string, string | number | null> = { date: key };

		for (const tier of tiers) {
			const entry = byDate.get(key)?.get(tier);
			const subscribers = entry?.active_subscribers ?? 0;
			const credits = entry?.credits ?? 0;
			const plan = planByTier.get(tier);
			const today = {
				credits,
				subscribers,
				revenue: (subscribers * (plan?.monthly_price ?? 0)) / DAYS_PER_MONTH,
				allowance: (subscribers * (plan?.weekly_credits ?? 0)) / DAYS_PER_WEEK,
			};

			const totals = running.get(tier)!;
			totals.credits += today.credits;
			totals.revenue += today.revenue;
			totals.subscribers += today.subscribers;
			totals.allowance += today.allowance;

			row[segmentLabel(tier)] = value(lens, window, today, totals);
		}
		rows.push(row);
	}

	return rows;
};

const value = (lens: EconomicsLens, window: EconomicsWindow, today: TierTotals, totals: TierTotals): number | null => {
	const t = window === "cumulative" ? totals : today;
	return lensValue(lens, t);
};

const lensValue = (lens: EconomicsLens, t: TierTotals): number | null => {
	if (lens === "payg-ratio") {
		if (t.revenue <= 0) return null;
		return Number((t.credits / t.revenue).toFixed(3));
	}
	if (lens === "entitlement-used") {
		if (t.allowance <= 0) return null;
		return Number(((100 * t.credits) / t.allowance).toFixed(1));
	}
	if (t.subscribers <= 0) return null;
	return Number((t.credits / t.subscribers).toFixed(3));
};

/** Per-tier cumulative value of the selected lens over the whole range, for the summary cards. */
export const tierRangeTotals = (
	daily: TierEconomicsDay[],
	tierPrices: TierPrice[],
	lens: EconomicsLens,
): { tier: string; value: number | null }[] =>
	tierPrices.map((plan) => {
		const rows = daily.filter((d) => d.tier === plan.tier);
		const totals = rows.reduce<TierTotals>(
			(acc, d) => ({
				credits: acc.credits + d.credits,
				subscribers: acc.subscribers + d.active_subscribers,
				revenue: acc.revenue + (d.active_subscribers * plan.monthly_price) / DAYS_PER_MONTH,
				allowance: acc.allowance + (d.active_subscribers * plan.weekly_credits) / DAYS_PER_WEEK,
			}),
			{ credits: 0, revenue: 0, subscribers: 0, allowance: 0 },
		);
		return { tier: plan.tier, value: lensValue(lens, totals) };
	});
