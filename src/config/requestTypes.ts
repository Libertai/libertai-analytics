// Per request-type analytics config. Each entry drives the generic hooks,
// chart components, and route pages so adding a type (e.g. CLI) is one entry.
//
// Inference types (api / liberclaw / x402 / cli) are served by the backend's
// generic /stats/global/{key}/{calls,tokens,credits} routes and share response
// shapes. Chat lives in a separate table, has no credits, and uses different
// response field names + a later all-time start date.

export type RequestTypeKey = "api" | "chat" | "liberclaw" | "x402" | "cli";

export type RequestTypeConfig = {
	key: RequestTypeKey;
	navLabel: string;
	pageTitle: string;
	// "All time" range start; defaults to the inference launch date when omitted.
	allTimeStartDate?: string;
	calls: {
		title: string;
		description: string;
		cardLabel: string;
		// Backend response field holding the per-model call rows.
		responseField: string;
	};
	tokens: {
		title: string;
		description: string;
		// Backend response field holding the per-model token rows.
		responseField: string;
	};
	// null when the type has no credits (chat).
	credits: { title: string; description: string } | null;
	// Daily-active-users (DAU) chart config. null when distinct users aren't tracked (x402).
	users: { title: string; description: string } | null;
	// "Calls by plan" chart config. null when the type has no per-plan split (chat/liberclaw/x402).
	callsBySegment: { title: string; description: string } | null;
};

export const REQUEST_TYPES: Record<RequestTypeKey, RequestTypeConfig> = {
	api: {
		key: "api",
		navLabel: "API",
		pageTitle: "API Analytics",
		calls: { title: "API", description: "Number of API calls", cardLabel: "API calls", responseField: "api_usage" },
		tokens: { title: "Tokens", description: "Tokens consumption by users", responseField: "calls" },
		credits: { title: "Credits", description: "Number of credits ($) consumed" },
		users: { title: "Active Users", description: "Distinct users making API calls per day" },
		callsBySegment: { title: "Calls by plan", description: "API calls per day, split by subscriber tier" },
	},
	chat: {
		key: "chat",
		navLabel: "Chat",
		pageTitle: "Chat Analytics",
		allTimeStartDate: "2025-10-02",
		calls: {
			title: "Chat Requests",
			description: "Number of chat requests",
			cardLabel: "Chat requests",
			responseField: "chat_usage",
		},
		tokens: {
			title: "Chat Tokens",
			description: "Tokens consumption for chat requests",
			responseField: "token_usage",
		},
		credits: null,
		users: { title: "Active Users", description: "Distinct users making chat requests per day" },
		callsBySegment: null,
	},
	liberclaw: {
		key: "liberclaw",
		navLabel: "LiberClaw",
		pageTitle: "Liberclaw Analytics",
		calls: {
			title: "Liberclaw API",
			description: "Number of Liberclaw API calls",
			cardLabel: "Liberclaw API calls",
			responseField: "api_usage",
		},
		tokens: { title: "Liberclaw Tokens", description: "Tokens consumption by Liberclaw users", responseField: "calls" },
		credits: { title: "Liberclaw Credits", description: "Credits ($) consumed by Liberclaw" },
		users: { title: "Active Users", description: "Distinct Liberclaw users per day" },
		callsBySegment: null,
	},
	x402: {
		key: "x402",
		navLabel: "x402",
		pageTitle: "x402 Analytics",
		calls: {
			title: "x402 API",
			description: "Number of x402 API calls",
			cardLabel: "x402 API calls",
			responseField: "api_usage",
		},
		tokens: { title: "x402 Tokens", description: "Tokens consumption by x402", responseField: "calls" },
		credits: { title: "x402 Credits", description: "Credits ($) consumed by x402" },
		// x402 payments are anonymous — no user identity to count.
		users: null,
		callsBySegment: null,
	},
	cli: {
		key: "cli",
		navLabel: "CLI",
		pageTitle: "CLI Analytics",
		calls: { title: "CLI", description: "Number of CLI calls", cardLabel: "CLI calls", responseField: "api_usage" },
		tokens: { title: "CLI Tokens", description: "Tokens consumption by CLI", responseField: "calls" },
		credits: { title: "CLI Credits", description: "Credits ($) consumed by CLI" },
		users: { title: "Active Users", description: "Distinct users making CLI calls per day" },
		callsBySegment: { title: "Calls by plan", description: "CLI calls per day, split by subscriber tier" },
	},
};
