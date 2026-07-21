import { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Code, Coins, CreditCard, LayoutDashboard, MessageSquare, PawPrint, Terminal, Ticket } from "lucide-react";
import { LibertaiLogo } from "@libertai/branding";
import AccountFooter from "./AccountFooter";
import { ThemeToggle } from "@libertai/ui/theme-toggle";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@libertai/ui/sidebar";

const SIDEBAR_ITEMS = [
	{ to: "/", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
	{ to: "/api", icon: <Code className="h-4 w-4" />, label: "API" },
	{ to: "/chat", icon: <MessageSquare className="h-4 w-4" />, label: "Chat" },
	{ to: "/liberclaw", icon: <PawPrint className="h-4 w-4" />, label: "LiberClaw" },
	{ to: "/subscriptions", icon: <CreditCard className="h-4 w-4" />, label: "Subscriptions" },
	{ to: "/cli", icon: <Terminal className="h-4 w-4" />, label: "CLI" },
	{ to: "/x402", icon: <Coins className="h-4 w-4" />, label: "x402" },
	{ to: "/vouchers", icon: <Ticket className="h-4 w-4" />, label: "Vouchers" },
] as const;

// Wraps menu items to auto-close the sidebar on mobile.
function SidebarMenuItemWithAutoClose({
	to,
	isActive,
	icon,
	label,
}: Readonly<{
	to: string;
	isActive: boolean;
	icon: ReactNode;
	label: string;
}>) {
	const { isMobile, setOpenMobile } = useSidebar();

	const handleClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild tooltip={label} isActive={isActive}>
				<Link to={to} onClick={handleClick}>
					{icon}
					<span>{label}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function isPathActive(currentPath: string, path: string): boolean {
	if (path === "/") return currentPath === "/";
	return currentPath === path || currentPath.startsWith(path + "/");
}

export function Layout({ children }: Readonly<{ children: ReactNode }>) {
	const currentPath = useRouterState({ select: (state) => state.location.pathname });

	return (
		<SidebarProvider>
			<div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row w-full">
				{/* Mobile Header */}
				<header className="fixed z-20 top-0 left-0 right-0 h-16 border-b border-border px-4 flex items-center justify-between md:hidden bg-background">
					<SidebarTrigger />
					<Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
						<LibertaiLogo className="h-5 w-auto text-foreground" />
					</Link>
					<ThemeToggle />
				</header>

				{/* Desktop Sidebar */}
				<Sidebar className="border-r-0">
					<SidebarHeader className="h-16 flex items-center justify-center">
						<Link to="/">
							<LibertaiLogo className="h-6 w-auto text-foreground" />
						</Link>
					</SidebarHeader>

					<SidebarContent>
						<SidebarMenu>
							{SIDEBAR_ITEMS.map((item) => (
								<SidebarMenuItemWithAutoClose
									to={item.to}
									isActive={isPathActive(currentPath, item.to)}
									icon={item.icon}
									label={item.label}
									key={item.to}
								/>
							))}
						</SidebarMenu>
					</SidebarContent>

					<SidebarFooter>
						<AccountFooter />
					</SidebarFooter>
				</Sidebar>

				<SidebarInset className="w-full">
					{/* Desktop Header */}
					<header className="sticky top-0 z-10 h-16 border-b border-border px-4 hidden md:flex items-center justify-between bg-background">
						<SidebarTrigger />
						<ThemeToggle />
					</header>

					{/* Content wrapper (SidebarInset is the <main> landmark); mobile padding clears the fixed header */}
					{/* The scroll container: the router owns its scroll position via scrollRestoration. */}
					<div data-scroll-restoration-id="content" className="flex-1 overflow-auto md:pt-0 pt-16 w-full">
						{children}
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
