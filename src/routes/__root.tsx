import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { AuthGate } from "@/components/AuthGate";

// OAuth/magic-link landing pages must render outside the gate (the session
// only exists after they run their exchange).
const CHROMELESS_ROUTES = ["/auth/callback", "/auth/verify"];

function RootComponent() {
	const chromeless = useRouterState({
		select: (state) => state.matches.some((match) => CHROMELESS_ROUTES.includes(match.pathname)),
	});
	if (chromeless) {
		return <Outlet />;
	}
	return (
		<AuthGate>
			<div className="font-sans antialiased">
				<Navbar />
				<Outlet />
			</div>
		</AuthGate>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
});
