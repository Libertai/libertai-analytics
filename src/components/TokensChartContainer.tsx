import { formatXAxis } from "@/utils/charts";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { memo } from "react";

type Card = {
	number: number;
	description: string;
	formatter?: (num: number) => string;
};

type TokensChartContainerProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>[];
	cards: Card[];
};

const TokensChartContainer = memo(({ data, cards }: TokensChartContainerProps) => {
	return (
		<div>
			<div className="h-[350px] md:h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
							tickFormatter={formatXAxis}
						/>
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
						<Tooltip />
						<Legend />
						<Area
							type="monotone"
							dataKey="total_input_tokens"
							stroke="#8884d8"
							fill="#8884d8"
							fillOpacity={0.1}
							strokeWidth={2}
							name="Input Tokens"
						/>
						<Area
							type="monotone"
							dataKey="total_output_tokens"
							stroke="#82ca9d"
							fill="#82ca9d"
							fillOpacity={0.1}
							strokeWidth={2}
							name="Output Tokens"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<div className="md:flex max-md:space-y-3 mt-4">
				{cards.map((card: Card) => {
					const displayNumber = card.formatter ? card.formatter(card.number) : card.number;
					return (
						<Card key={card.description} className="w-fit mx-auto">
							<CardHeader className="text-center py-4">
								<CardTitle>{displayNumber}</CardTitle>
								<CardDescription>{card.description}</CardDescription>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
});

TokensChartContainer.displayName = "TokensChartContainer";

export default TokensChartContainer;