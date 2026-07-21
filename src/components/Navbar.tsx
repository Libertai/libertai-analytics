import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useAccountStore } from "@libertai/auth";
import { cn } from "@/lib/utils";
import { Button } from "@libertai/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@libertai/ui/sheet";

const navLinks = [
	{ to: "/", label: "Dashboard" },
	{ to: "/api", label: "API" },
	{ to: "/chat", label: "Chat" },
	{ to: "/liberclaw", label: "LiberClaw" },
	{ to: "/subscriptions", label: "Subscriptions" },
	{ to: "/cli", label: "CLI" },
	{ to: "/x402", label: "x402" },
	{ to: "/vouchers", label: "Vouchers" },
] as const;

export function Navbar() {
	const [open, setOpen] = useState(false);
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const logout = useAccountStore((s) => s.logout);

	const linkClasses =
		"px-4 py-2 rounded-md font-medium transition-colors hover:bg-accent";
	const activeLinkClasses = "bg-accent";

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link to="/">
						<h1 className="text-xl font-bold">LibertAI</h1>
					</Link>

					{/* Desktop nav */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={cn(
									linkClasses,
									currentPath === link.to && activeLinkClasses,
								)}
							>
								{link.label}
							</Link>
						))}
						<Button variant="ghost" onClick={() => void logout()}>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</div>

					{/* Mobile nav */}
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button variant="ghost" size="icon">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Navigation</SheetTitle>
							</SheetHeader>
							<div className="flex flex-col gap-1 mt-4">
								{navLinks.map((link) => (
									<Link
										key={link.to}
										to={link.to}
										className={cn(
											linkClasses,
											currentPath === link.to && activeLinkClasses,
										)}
										onClick={() => setOpen(false)}
									>
										{link.label}
									</Link>
								))}
								<Button
									variant="ghost"
									className="justify-start"
									onClick={() => {
										setOpen(false);
										void logout();
									}}
								>
									<LogOut className="h-4 w-4" />
									Sign out
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	);
}
