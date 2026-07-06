import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { LoginPanel, useAccountStore } from "@libertai/auth";
import type { CurrentUserResponse } from "@libertai/inference-sdk";
import { Button } from "@/components/ui/button";

// Three-state gate: session probe pending -> spinner; no session -> login;
// session without the staff flag -> blocked. Only staff reach the app.
export function AuthGate({ children }: { children: ReactNode }) {
	const isInitialLoad = useAccountStore((state) => state.isInitialLoad);
	const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
	const me = useAccountStore((state) => state.me) as CurrentUserResponse | null;
	const logout = useAccountStore((state) => state.logout);

	if (isInitialLoad) {
		return (
			<div className="flex min-h-screen items-center justify-center text-muted-foreground">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center px-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<h1 className="text-2xl font-bold">LibertAI Backoffice</h1>
						<p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
					</div>
					<LoginPanel />
				</div>
			</div>
		);
	}

	if (!me?.is_libertai_staff) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
				<h1 className="text-2xl font-bold">Not authorized</h1>
				<p className="text-muted-foreground">This account does not have staff access.</p>
				<Button variant="outline" onClick={() => void logout()}>
					Sign out
				</Button>
			</div>
		);
	}

	return <>{children}</>;
}
