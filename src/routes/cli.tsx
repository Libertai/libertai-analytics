import { createFileRoute } from "@tanstack/react-router";
import { InferenceAnalytics } from "@/components/InferenceAnalytics";
import { REQUEST_TYPES } from "@/config/requestTypes";
import { dateFilterSearchSchema } from "@/hooks/useDateFilter";

export const Route = createFileRoute("/cli")({
	component: () => <InferenceAnalytics type={REQUEST_TYPES.cli} />,
	validateSearch: dateFilterSearchSchema.parse,
});
