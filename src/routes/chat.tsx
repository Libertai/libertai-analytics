import { createFileRoute } from "@tanstack/react-router";
import { ChatCallsAnalytics } from "@/components/charts/ChatCalls";
import { ChatTokensAnalytics } from "@/components/charts/ChatTokens";

export const Route = createFileRoute("/chat")({
	component: ChatPage,
});

function ChatPage() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">Chat Analytics</h2>
			<ChatCallsAnalytics />
			<br />
			<ChatTokensAnalytics />
		</main>
	);
}
