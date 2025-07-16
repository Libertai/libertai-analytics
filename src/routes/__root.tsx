import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<div className="font-sans antialiased">
			<Outlet />
		</div>
	),
});
