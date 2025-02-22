import { Subscription, SubscriptionProvider } from "@/types/subscriptions";

type ChartData = Record<string, Record<SubscriptionProvider, number>>;

export const groupSubscriptionsPerDay = (subscriptions: Subscription[], timeframe: number) => {
	const result: ChartData = {};
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
