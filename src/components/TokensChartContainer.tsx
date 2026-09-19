import { CHART_TOOLTIP_PROPS, formatXAxis } from "@/utils/charts";
import { formatLargeNumber } from "@/utils/format";
import { ChartRow, partialKey, splitPartialPeriod } from "@/utils/partialPeriod";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SummaryCard, SummaryCards } from "./SummaryCards";
import { memo, useMemo } from "react";

type TokensChartContainerProps = {
	data: ChartRow[];
	cards: SummaryCard[];
	mode?: "by-type" | "combined";
};

const TokensChartContainer = memo(({ data, cards, mode }: TokensChartContainerProps) => {
	const chartData = useMemo(() => {
		if (mode !== "combined") return data;
		return data.map((row) => {
			const total =
				(Number(row.total_input_tokens) || 0) +
				(Number(row.total_cached_tokens) || 0) +
				(Number(row.total_output_tokens) || 0);
			return { date: row.date, "Total tokens": total };
		});
	}, [data, mode]);

	const series = useMemo(
		() =>
			mode === "combined"
				? [{ key: "Total tokens", name: "Total tokens", color: "#8884d8" }]
				: [
						{ key: "total_input_tokens", name: "Input Tokens", color: "#8884d8" },
						{ key: "total_output_tokens", name: "Output Tokens", color: "#82ca9d" },
						{ key: "total_cached_tokens", name: "Cached Input Tokens", color: "#ffc658" },
					],
		[mode],
	);

	const partial = useMemo(() => splitPartialPeriod(chartData), [chartData]);

	return (
		<div>
			<div className="h-[350px] md:h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={partial.rows}>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
							tickFormatter={formatXAxis}
						/>
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={formatLargeNumber} />
						<Tooltip {...CHART_TOOLTIP_PROPS} formatter={(value) => formatLargeNumber(Number(value) || 0)} />
						<Legend />
						{series.map((item) => (
							<Area
								key={item.key}
								type="monotone"
								dataKey={item.key}
								stroke={item.color}
								fill={item.color}
								fillOpacity={0.1}
								strokeWidth={2}
								name={item.name}
							/>
						))}
						{partial.hasPartial &&
							series.map((item) =>
								partial.partialKeys.has(item.key) ? (
									<Area
										key={partialKey(item.key)}
										type="monotone"
										dataKey={partialKey(item.key)}
										stroke={item.color}
										fill="none"
										fillOpacity={0}
										strokeWidth={2}
										strokeDasharray="6 4"
										legendType="none"
										name={`${item.name} (today, partial)`}
									/>
								) : null,
							)}
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<SummaryCards cards={cards} />
		</div>
	);
});

TokensChartContainer.displayName = "TokensChartContainer";

export default TokensChartContainer;
