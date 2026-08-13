import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createThirdwebClient } from "thirdweb";
import { initLibertaiAuth, useAccountStore, LibertaiProviders } from "@libertai/auth";
import { ThemeProvider } from "@libertai/ui/theme-provider";
import { routeTree } from "./routeTree.gen";
import env from "@/config/env";
import "./globals.css";

// The app's only thirdweb client — a second instance breaks WalletConnect sessions.
const thirdwebClient = createThirdwebClient({ clientId: env.THIRDWEB_CLIENT_ID });

initLibertaiAuth({
	apiBaseUrl: env.INFERENCE_BACKEND_URL,
	thirdwebClient,
	solanaRpc: env.SOLANA_RPC,
	ltaiBaseAddress: env.LTAI_BASE_ADDRESS,
	ltaiSolanaAddress: env.LTAI_SOLANA_ADDRESS,
});

const router = createRouter({ routeTree, scrollRestoration: true });

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry: 1,
			networkMode: "always",
		},
	},
});

useAccountStore.getState().setQueryClient(queryClient);
void useAccountStore.getState().checkSession();

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="libertai-analytics-theme">
				<LibertaiProviders>
					<RouterProvider router={router} />
					<Toaster richColors />
				</LibertaiProviders>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
