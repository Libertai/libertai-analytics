import axios from 'axios';
import { Credit, CreditsStatsSchema } from "@/types/credits";
import { create } from "zustand";
import { ChartDate } from "@/types/dates";
import env from "@/config/env";

type CreditsStatsState = {
	totalCreditsUsed: number;
	credits: Credit[];
	isLoaded: boolean;

	fetchCredits: (rangeDate: ChartDate) => void;
};

const useCreditsStats = create<CreditsStatsState>((set) => ({
	totalCreditsUsed: 0,
	credits: [],
	isLoaded: false,

	fetchCredits: async (rangeDate: ChartDate) => {
		try {
			const res = await axios.get(`${env.INFERENCE_BACKEND_URL}/stats/global/credits?start_date=${rangeDate.start_date}&end_date=${rangeDate.end_date}`).then(res => res.data);
			const credits = res["credits_usage"];
			const parsedCredits: Credit[] = credits.map((credit: Credit) => CreditsStatsSchema.parse(credit));

			set({totalCreditsUsed: res["total_credits_used"], credits: parsedCredits, isLoaded: true});
		} catch (error) {
			console.error(error);
		}
	}
}))

export default useCreditsStats;
