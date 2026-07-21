import { CHART_TOOLTIP_PROPS, formatXAxis } from "@/utils/charts";
import { formatLargeNumber } from "@/utils/format";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SummaryCard, SummaryCards } from "./SummaryCards";
import { memo, useMemo } from "react";

type TokensChartContainerProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>[];
	cards: SummaryCard[];
	mode?: "by-type" | "combined";
};

const TokensChartContainer = memo(({ data, cards, mode }: TokensChartContainerProps) => {
	const chartData = useMemo(() => {
		if (mode !== "combined") return data;
		return data.map((row) => {
			const total = (Number(row.total_input_tokens) || 0) + (Number(row.total_cached_tokens) || 0) + (Number(row.total_output_tokens) || 0);
			return { date: row.date, "Total tokens": total };
		});
	}, [data, mode]);

	return (
		<div>
			<div className="h-[350px] md:h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData}>
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
						{mode === "combined" ? (
							<Area
								type="monotone"
								dataKey="Total tokens"
								stroke="#8884d8"
								fill="#8884d8"
								fillOpacity={0.1}
								strokeWidth={2}
								name="Total tokens"
							/>
						) : (
							// recharts ignores children wrapped in a Fragment — must be an array of direct Area children
							[
								<Area
									key="total_input_tokens"
									type="monotone"
									dataKey="total_input_tokens"
									stroke="#8884d8"
									fill="#8884d8"
									fillOpacity={0.1}
									strokeWidth={2}
									name="Input Tokens"
								/>,
								<Area
									key="total_output_tokens"
									type="monotone"
									dataKey="total_output_tokens"
									stroke="#82ca9d"
									fill="#82ca9d"
									fillOpacity={0.1}
									strokeWidth={2}
									name="Output Tokens"
								/>,
								<Area
									key="total_cached_tokens"
									type="monotone"
									dataKey="total_cached_tokens"
									stroke="#ffc658"
									fill="#ffc658"
									fillOpacity={0.1}
									strokeWidth={2}
									name="Cached Input Tokens"
								/>,
							]
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
