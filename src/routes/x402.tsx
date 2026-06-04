import { createFileRoute } from "@tanstack/react-router";
import { InferenceAnalytics } from "@/components/InferenceAnalytics";
import { REQUEST_TYPES } from "@/config/requestTypes";

export const Route = createFileRoute("/x402")({
	component: () => <InferenceAnalytics type={REQUEST_TYPES.x402} />,
});
