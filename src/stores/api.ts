import axios from 'axios';
import { create } from "zustand";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";
import { ApiUsage, ApiUsageStatsSchema } from '@/types/api';

type ApiStatsState = {
	totalCalls: number;
	apiUsage: ApiUsage[];
	isLoaded: boolean;

	fetchApiCalls: (rangeDate: ChartDate) => void;
};

const useApiUsageStats = create<ApiStatsState>((set) => ({
	totalCalls: 0,
	apiUsage: [],
	isLoaded: false,

	fetchApiCalls: async (rangeDate: ChartDate) => {
		const res = await axios.get(`${env.INFERENCE_BACKEND_URL}/stats/global/api?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`).then(res => res.data);
		const apiUsage = res["api_usage"];
		const parsedApiUsage: ApiUsage[] = apiUsage.map((usage: ApiUsage) => ApiUsageStatsSchema.parse(usage));

		set({totalCalls: res["total_calls"], apiUsage: parsedApiUsage, isLoaded: true});
	}
}))

export default useApiUsageStats;
