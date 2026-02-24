import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Navbar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const linkClasses = "px-4 py-2 rounded-md font-medium transition-colors hover:bg-accent";
	const activeLinkClasses = "bg-accent";

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link to="/">
						<h1 className="text-xl font-bold">LibertAI</h1>
					</Link>
					<div className="flex gap-1">
						<Link to="/" className={cn(linkClasses, currentPath === "/" && activeLinkClasses)}>
							Dashboard
						</Link>
						<Link to="/api" className={cn(linkClasses, currentPath === "/api" && activeLinkClasses)}>
							API
						</Link>
						<Link to="/chat" className={cn(linkClasses, currentPath === "/chat" && activeLinkClasses)}>
							Chat
						</Link>
						<Link to="/liberclaw" className={cn(linkClasses, currentPath === "/liberclaw" && activeLinkClasses)}>
							LiberClaw
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
