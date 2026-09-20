import { DefaultTooltipContent, TooltipProps } from "recharts";

/**
 * Tooltip body that drops the entries recharts would otherwise render empty: series with
 * no value on the hovered date, and the dashed partial-period copy of a series on the day
 * it shares with the solid line (same name, first entry wins).
 */
export const ChartTooltipContent = (props: TooltipProps<number, string>) => {
	const seen = new Set<string>();
	const payload = (props.payload ?? []).filter((entry) => {
		if (entry.value === null || entry.value === undefined) return false;
		const name = String(entry.name ?? entry.dataKey);
		if (seen.has(name)) return false;
		seen.add(name);
		return true;
	});

	if (payload.length === 0) return null;
	return <DefaultTooltipContent {...props} payload={payload} />;
};
