import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h2 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h2>
			<p className="text-gray-600 dark:text-gray-400">Dashboard content coming soon...</p>
		</main>
	);
}
