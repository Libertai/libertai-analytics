"use client";

import { useEffect } from "react";
import useSubscriptionsStore from "@/stores/subscriptions";
import { AgentsAnalytics } from "@/components/agents-analytics";
import { CreditsAnalytics } from "@/components/credits-analytics";

export default function Home() {
	const { fetchSubscriptions } = useSubscriptionsStore();

	useEffect(() => {
		fetchSubscriptions();
	}, [fetchSubscriptions]);

	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">LibertAI Analytics</h1>
			<AgentsAnalytics/>
			<br/>
			<CreditsAnalytics/>
			<br/>
			{/*<ApiUsageAnalytics/>*/}
		</main>
	);
}
