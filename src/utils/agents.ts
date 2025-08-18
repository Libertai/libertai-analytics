import { DateRange } from "react-day-picker";
import { Agent } from "@/types/agents.ts";
import { isSameDay } from "@/utils/dates.ts";

type ChartDataAgent = Record<string, Record<string, number>>;

export const groupAgentsCustomDatePerDay = (agents: Agent[], rangeDate: DateRange | undefined) => {
	console.log("1")
	if (!rangeDate || !rangeDate.from || !rangeDate.to)
		return [];

	const diffTime = Math.abs(rangeDate.to.valueOf() - rangeDate.from.valueOf());
	const timeframe = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
	const result: ChartDataAgent = {};

	// Initialize all days in the range with 0 agents
	for (let i = 0; i < timeframe; i++) {
		const currentDate = new Date(rangeDate.from.valueOf());
		currentDate.setDate(rangeDate.from.getDate() + i);
		const dateStr = currentDate.toISOString().split("T")[0];
		result[dateStr] = { agents: 0 };
	}


	// Count agents created on each day
	agents.forEach((agent) => {
		const createdDate = new Date(agent.created_at);
		const createdDateStr = createdDate.toISOString().split("T")[0];
		

		// Only count if the creation date falls within our range and we have initialized that date
		if (result[createdDateStr] !== undefined) {
			result[createdDateStr].agents++;
		}
	});

	console.log(result);

	return Object.entries(result)
		.map(([date, values]) => ({
			date,
			...values,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export const groupAgentsPerDay = (agents: Agent[], timeframe: number) => {
	const result: ChartDataAgent = {};
	const today = new Date();
	const startTime = new Date();

	startTime.setDate(today.getDate() - timeframe + 1);

	for (let i = 0; i < timeframe; i++) {
		const date = new Date(startTime);
		date.setDate(startTime.getDate() + i);
		const dateStr = date.toISOString().split("T")[0];
		result[dateStr] = { agents: 0 };
	}

	agents.forEach((agent: Agent) => {
		const creationDate = new Date(agent.created_at);

		for (let i = 0; i < timeframe; i++) {
			const date = new Date(startTime);
			date.setDate(startTime.getDate() + i);
			if (isSameDay(date ,creationDate)) {
				const dateStr = date.toISOString().split("T")[0];
				result[dateStr].agents++;
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
