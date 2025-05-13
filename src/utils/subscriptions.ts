import { Subscription, SubscriptionProvider } from "@/types/subscriptions";
import { DateRange } from "react-day-picker";

type ChartDataSubscription = Record<string, Record<SubscriptionProvider, number>>;

export const groupSubscriptionsCustomDatePerDay = (subscriptions: Subscription[], rangeDate: DateRange | undefined) => {
	if (!rangeDate || !rangeDate.from || !rangeDate.to)
		return [];

	const diffTime = Math.abs(rangeDate.from.valueOf() - rangeDate.to.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
	const startDate: Date = new Date(rangeDate.from.valueOf());
  const result: ChartDataSubscription = {};

	for (let i = 0; i <= timeframe; i++) {
	  const startDate: Date = new Date(rangeDate.from.valueOf());
		startDate.setDate(rangeDate.from.getDate() + i);
		const dateStr = startDate.toISOString().split("T")[0];
		result[dateStr] = { vouchers: 0, hold: 0 };
	}

	subscriptions.forEach((sub) => {
		const endDate = new Date(sub.end);

		for (let i = 0; i < timeframe; i++) {
			if (rangeDate && rangeDate.from && rangeDate.to) {
				const date: Date = new Date(rangeDate?.from.valueOf());
				date.setDate(rangeDate?.from.getDate() + i);
				if (date >= startDate && date <= endDate) {
					const dateStr = date.toISOString().split("T")[0];
					result[dateStr][sub.provider]++;
				}
			}
		}
	});

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export const groupSubscriptionsPerDay = (subscriptions: Subscription[], timeframe: number) => {
	const result: ChartDataSubscription = {};
	const today = new Date();
	const startTime = new Date();
	startTime.setDate(today.getDate() - timeframe + 1);

	// Initialize result with zeros for each day in timeframe
	for (let i = 0; i < timeframe; i++) {
		const date = new Date(startTime);
		date.setDate(startTime.getDate() + i);
		const dateStr = date.toISOString().split("T")[0];
		result[dateStr] = { vouchers: 0, hold: 0 };
	}

	// Count active items per day
	subscriptions.forEach((sub) => {
		const startDate = new Date(sub.start);
		const endDate = new Date(sub.end);

		for (let i = 0; i < timeframe; i++) {
			const date = new Date(startTime);
			date.setDate(startTime.getDate() + i);
			if (date >= startDate && date <= endDate) {
				const dateStr = date.toISOString().split("T")[0];
				result[dateStr][sub.provider]++;
			}
		}
	});

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
};
