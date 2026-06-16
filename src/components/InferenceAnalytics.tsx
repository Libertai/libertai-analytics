import { ReactNode } from "react";
import { CallsAnalytics } from "@/components/charts/CallsAnalytics";
import { TokensAnalytics } from "@/components/charts/TokensAnalytics";
import { CreditsAnalytics } from "@/components/charts/CreditsAnalytics";
import { UsersAnalytics } from "@/components/charts/UsersAnalytics";
import { RequestTypeConfig } from "@/config/requestTypes";

// Stacks the calls / tokens / (optional) credits / (optional) users charts for one request type.
// `extra` renders additional type-specific charts at the end (e.g. messages-by-plan on chat).
export function InferenceAnalytics({ type, extra }: { type: RequestTypeConfig; extra?: ReactNode }) {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">{type.pageTitle}</h2>
			<CallsAnalytics type={type} />
			<br />
			<TokensAnalytics type={type} />
			{type.credits && (
				<>
					<br />
					<CreditsAnalytics type={type} />
				</>
			)}
			{type.users && (
				<>
					<br />
					<UsersAnalytics type={type} />
				</>
			)}
			{extra && (
				<>
					<br />
					{extra}
				</>
			)}
		</main>
	);
}
