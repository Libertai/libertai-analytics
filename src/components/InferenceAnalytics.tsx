import { CallsAnalytics } from "@/components/charts/CallsAnalytics";
import { TokensAnalytics } from "@/components/charts/TokensAnalytics";
import { CreditsAnalytics } from "@/components/charts/CreditsAnalytics";
import { RequestTypeConfig } from "@/config/requestTypes";

// Stacks the calls / tokens / (optional) credits charts for one request type.
export function InferenceAnalytics({ type }: { type: RequestTypeConfig }) {
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
		</main>
	);
}
