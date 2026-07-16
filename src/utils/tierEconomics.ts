import { ChartDate } from "@/types/dates";
import { TierEconomicsDay, TierPrice } from "@/types/subscriptions";
import { segmentLabel } from "@/utils/subscriptions";

export type EconomicsWindow = "cumulative" | "daily";

// Revenue is prorated over a flat 30-day month, so a subscriber's daily revenue does not
// wobble with month length. A 31-day month's summed revenue overshoots the true price by ~3%.
const DAYS_PER_MONTH = 30;

type TierTotals = { credits: number; revenue: number };

/**
 * [{date, Go, Plus, Max}] — one row per day in the range, each value being the PAYG credits
 * delivered per $1 of subscription revenue.
 *
 * A tier's value is `null` (not 0) on days it had no subscribers, so Recharts draws a gap
 * instead of a line pinned to the floor before that tier's first subscriber ever existed.
 */
export const buildTierEconomicsSeries = (
	daily: TierEconomicsDay[],
	tierPrices: TierPrice[],
	rangeDate: ChartDate,
	window: EconomicsWindow,
): Record<string, string | number | null>[] => {
	const planByTier = new Map(tierPrices.map((t) => [t.tier, t]));
	const tiers = tierPrices.map((t) => t.tier);

	const byDate = new Map<string, Map<string, TierEconomicsDay>>();
	for (const d of daily) {
		if (!byDate.has(d.date)) byDate.set(d.date, new Map());
		byDate.get(d.date)!.set(d.tier, d);
	}

	const running = new Map<string, TierTotals>(tiers.map((t) => [t, { credits: 0, revenue: 0 }]));

	const rows: Record<string, string | number | null>[] = [];
	const last = new Date(`${rangeDate.end_date}T00:00:00Z`);

	for (const day = new Date(`${rangeDate.start_date}T00:00:00Z`); day <= last; day.setUTCDate(day.getUTCDate() + 1)) {
		const key = day.toISOString().split("T")[0];
		const row: Record<string, string | number | null> = { date: key };

		for (const tier of tiers) {
			const entry = byDate.get(key)?.get(tier);
			const subscribers = entry?.active_subscribers ?? 0;
			const plan = planByTier.get(tier);
			const today = {
				credits: entry?.credits ?? 0,
				revenue: (subscribers * (plan?.monthly_price ?? 0)) / DAYS_PER_MONTH,
			};

			const totals = running.get(tier)!;
			totals.credits += today.credits;
			totals.revenue += today.revenue;

			row[segmentLabel(tier)] = paygRatio(window === "cumulative" ? totals : today);
		}
		rows.push(row);
	}

	return rows;
};

const paygRatio = (t: TierTotals): number | null => {
	if (t.revenue <= 0) return null;
	return Number((t.credits / t.revenue).toFixed(3));
};

/** Per-tier cumulative PAYG value per $1 over the whole range, for the summary cards. */
export const tierRangeTotals = (
	daily: TierEconomicsDay[],
	tierPrices: TierPrice[],
): { tier: string; value: number | null }[] =>
	tierPrices.map((plan) => {
		const rows = daily.filter((d) => d.tier === plan.tier);
		const totals = rows.reduce<TierTotals>(
			(acc, d) => ({
				credits: acc.credits + d.credits,
				revenue: acc.revenue + (d.active_subscribers * plan.monthly_price) / DAYS_PER_MONTH,
			}),
			{ credits: 0, revenue: 0 },
		);
		return { tier: plan.tier, value: paygRatio(totals) };
	});
