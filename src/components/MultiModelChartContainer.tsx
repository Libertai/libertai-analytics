import { CHART_TOOLTIP_PROPS, formatXAxis } from "@/utils/charts";
import { formatLargeNumber, formatUsd, formatUsdCompact } from "@/utils/format";
import { ChartRow, partialKey, splitPartialPeriod } from "@/utils/partialPeriod";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SummaryCard, SummaryCards } from "./SummaryCards";
import { useMemo, memo } from "react";

type MultiModelChartContainerProps = {
	data: Record<string, string | number | null>[];
	cards: SummaryCard[];
	selectedModels?: string[];
	mode?: "by-model" | "combined";
	combineLabel?: string;
	// Stack the series on top of each other (top edge of the stack = sum of all series).
	stacked?: boolean;
	// Series are USD amounts: $-prefixed axis ticks, and full 2-decimal amounts in the tooltip.
	money?: boolean;
};

// Stacked series can't carry a per-series dashed overlay (the partial copy would stack on
// top of the real one), so the chart dashes the combined top edge instead.
const STACK_TOTAL_KEY = "stack total";

const COLORS = [
	"#8884d8",
	"#82ca9d",
	"#ffc658",
	"#ff7300",
	"#00ff00",
	"#0088fe",
	"#ff8042",
	"#8dd1e1",
	"#d084d0",
	"#ffb347",
	"#87ceeb",
	"#dda0dd",
	"#98fb98",
	"#f0e68c",
	"#ff6347",
];

const MultiModelChartContainer = memo((props: MultiModelChartContainerProps) => {
	const { data, cards, selectedModels, mode, combineLabel, stacked, money } = props;
	const chartData = useMemo(() => {
		if (mode !== "combined") return data;
		return data.map((row) => {
			let total = 0;
			Object.entries(row).forEach(([key, value]) => {
				if (key === "date") return;
				if (selectedModels && selectedModels.length > 0 && !selectedModels.includes(key)) return;
				total += Number(value) || 0;
			});
			return { date: row.date, [combineLabel ?? "Total"]: total };
		});
	}, [data, mode, selectedModels, combineLabel]);

	const modelNames = useMemo(() => {
		if (!chartData || chartData.length === 0) return [];

		const maxByKey = new Map<string, number>();
		chartData.forEach((item) => {
			Object.keys(item).forEach((key) => {
				if (key === "date") return;
				const value = Number(item[key]) || 0;
				const current = maxByKey.get(key) ?? -Infinity;
				if (value > current) maxByKey.set(key, value);
			});
		});

		return Array.from(maxByKey.keys()).sort((a, b) => (maxByKey.get(b) ?? 0) - (maxByKey.get(a) ?? 0));
	}, [chartData]);

	const modelsToShow = useMemo(() => {
		if (mode === "combined") return modelNames;
		if (!selectedModels || selectedModels.length === 0) return modelNames;
		const selected = new Set(selectedModels);
		return modelNames.filter((name) => selected.has(name));
	}, [modelNames, selectedModels, mode]);

	const partial = useMemo(() => (stacked ? null : splitPartialPeriod(chartData)), [stacked, chartData]);

	const stackedPartial = useMemo(() => {
		if (!stacked) return null;
		const totals: ChartRow[] = chartData.map((row) => {
			let total = 0;
			for (const name of modelsToShow) total += Number(row[name]) || 0;
			return { date: row.date, [STACK_TOTAL_KEY]: total };
		});
		return splitPartialPeriod(totals);
	}, [stacked, chartData, modelsToShow]);

	const displayData = useMemo(() => {
		if (!stacked) return partial?.rows ?? chartData;
		if (!stackedPartial) return chartData;
		const totalKey = partialKey(STACK_TOTAL_KEY);
		const lastIndex = chartData.length - 1;
		return chartData.map((row, index) => {
			const out: ChartRow = { ...row, [totalKey]: stackedPartial.rows[index]?.[totalKey] ?? null };
			for (const name of modelsToShow) {
				out[partialKey(name)] = index === lastIndex && stackedPartial.hasPartial ? (row[name] ?? null) : null;
			}
			// The dashed total replaces the stack's incomplete last day, like the solid
			// series are cut at the last complete day when the chart is not stacked.
			if (stackedPartial.hasPartial && index === lastIndex) {
				for (const name of modelsToShow) out[name] = null;
			}
			return out;
		});
	}, [stacked, partial, stackedPartial, chartData, modelsToShow]);

	const colorFor = (modelName: string, index: number) =>
		COLORS[(selectedModels && selectedModels.length > 0 ? modelNames.indexOf(modelName) : index) % COLORS.length];

	return (
		<div>
			<div className="h-[350px] md:h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={displayData}>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
							tickFormatter={formatXAxis}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
							tickFormatter={(value) =>
								money ? formatUsdCompact(Number(value) || 0) : formatLargeNumber(Number(value) || 0)
							}
						/>
						<Tooltip
							{...CHART_TOOLTIP_PROPS}
							itemSorter={(item) => -(Number(item.value) || 0)}
							formatter={(value) => (money ? formatUsd(Number(value) || 0) : formatLargeNumber(Number(value) || 0))}
						/>
						<Legend />
						{modelsToShow.map((modelName, index) => (
							<Area
								key={modelName}
								type="monotone"
								dataKey={modelName}
								stackId={stacked ? "total" : undefined}
								stroke={colorFor(modelName, index)}
								fill={colorFor(modelName, index)}
								fillOpacity={0.1}
								strokeWidth={2}
								name={modelName}
							/>
						))}
						{partial?.hasPartial &&
							modelsToShow.map((modelName, index) =>
								partial.partialKeys.has(modelName) ? (
									<Area
										key={partialKey(modelName)}
										type="monotone"
										dataKey={partialKey(modelName)}
										stroke={colorFor(modelName, index)}
										fill="none"
										fillOpacity={0}
										strokeWidth={2}
										strokeDasharray="6 4"
										legendType="none"
										name={`${modelName} (today, partial)`}
									/>
								) : null,
							)}
						{stackedPartial?.hasPartial && (
							<Area
								type="monotone"
								dataKey={partialKey(STACK_TOTAL_KEY)}
								stroke={COLORS[0]}
								fill="none"
								fillOpacity={0}
								strokeWidth={2}
								strokeDasharray="6 4"
								legendType="none"
								name="Total (today, partial)"
							/>
						)}
						{/* Tooltip-only: each stacked series' value so far today, which the dashed total hides. */}
						{stackedPartial?.hasPartial &&
							modelsToShow.map((modelName) => (
								<Area
									key={partialKey(modelName)}
									type="monotone"
									dataKey={partialKey(modelName)}
									stroke="none"
									fill="none"
									legendType="none"
									activeDot={false}
									dot={false}
									name={`${modelName} (so far)`}
								/>
							))}
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<SummaryCards cards={cards} />
		</div>
	);
});

MultiModelChartContainer.displayName = "MultiModelChartContainer";

export default MultiModelChartContainer;
