import { ChartDate } from "@/types/dates";
import { CreditsConsumptionDay, SegmentMessage, TierSubscribersDay } from "@/types/subscriptions";
import { createEmptyResultByRangeDate } from "./dates";

const SEGMENT_ORDER = ["anonymous", "free", "go", "plus", "max"];
const TIER_ORDER = ["go", "plus", "max"];

/** "free" -> "Free", "go" -> "Go", etc. — the chart series label. */
export const segmentLabel = (segment: string): string => segment.charAt(0).toUpperCase() + segment.slice(1);

const timeframeDays = (rangeDate: ChartDate): number => {
	const start = new Date(rangeDate.start_date);
	const end = new Date(rangeDate.end_date);
	const diff = Math.abs(start.valueOf() - end.valueOf());
	return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

/** [{date, Anonymous, Free, Go, Plus, Max}] — one zero-filled row per day, message counts per segment. */
export const groupMessagesBySegmentPerDay = (messages: SegmentMessage[], rangeDate: ChartDate) => {
	const timeframe = timeframeDays(rangeDate);

	const segments = Array.from(new Set(messages.map((m) => m.segment))).sort(
		(a, b) => (SEGMENT_ORDER.indexOf(a) + 1 || 99) - (SEGMENT_ORDER.indexOf(b) + 1 || 99),
	);
	const initial: Record<string, number> = {};
	segments.forEach((s) => {
		initial[segmentLabel(s)] = 0;
	});

	const result = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(timeframe, rangeDate, initial);

	for (const m of messages) {
		if (result[m.date]) result[m.date][segmentLabel(m.segment)] += m.message_count;
	}

	return Object.entries(result)
		.map(([date, values]) => ({ date, ...values }))
		.sort((a, b) => a.date.localeCompare(b.date));
};

/** [{date, Go, Plus, Max}] — one zero-filled row per day, active paid subscribers per tier. */
export const groupSubscribersByTierPerDay = (daily: TierSubscribersDay[], rangeDate: ChartDate) => {
	const timeframe = timeframeDays(rangeDate);

	const tiers = Array.from(new Set(daily.map((d) => d.tier))).sort(
		(a, b) => (TIER_ORDER.indexOf(a) + 1 || 99) - (TIER_ORDER.indexOf(b) + 1 || 99),
	);
	const initial: Record<string, number> = {};
	tiers.forEach((t) => {
		initial[segmentLabel(t)] = 0;
	});

	const result = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(timeframe, rangeDate, initial);

	for (const d of daily) {
		if (result[d.date]) result[d.date][segmentLabel(d.tier)] = d.active_subscribers;
	}

	return Object.entries(result)
		.map(([date, values]) => ({ date, ...values }))
		.sort((a, b) => a.date.localeCompare(b.date));
};

/** [{date, "Tier-covered", "Prepaid"}] — daily credit consumption split by what paid for it. */
export const groupCreditsConsumptionPerDay = (daily: CreditsConsumptionDay[], rangeDate: ChartDate) => {
	const timeframe = timeframeDays(rangeDate);

	const result = createEmptyResultByRangeDate<Record<string, Record<string, number>>>(timeframe, rangeDate, {
		"Tier-covered": 0,
		Prepaid: 0,
	});

	for (const d of daily) {
		if (result[d.date]) {
			result[d.date]["Tier-covered"] = d.tier_credits;
			result[d.date]["Prepaid"] = d.prepaid_credits;
		}
	}

	return Object.entries(result)
		.map(([date, values]) => ({ date, ...values }))
		.sort((a, b) => a.date.localeCompare(b.date));
};
