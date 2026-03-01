import { formatXAxis } from "@/utils/charts";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useMemo, memo } from "react";

type Card = {
	number: number;
	description: string;
	formatter?: (num: number) => string;
};

type MultiModelChartContainerProps = {
	data: Record<string, string>[];
	cards: Card[];
	selectedModels?: string[];
};


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

const MultiModelChartContainer = memo(({ data, cards, selectedModels }: MultiModelChartContainerProps) => {
	const modelNames = useMemo(() => {
		if (!data || data.length === 0) return [];

		const allKeys = new Set<string>();
		data.forEach((item) => {
			Object.keys(item).forEach((key) => {
				if (key !== "date") {
					allKeys.add(key);
				}
			});
		});

		return Array.from(allKeys);
	}, [data]);

	const modelsToShow = selectedModels && selectedModels.length > 0 ? selectedModels : modelNames;

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
						{modelsToShow.map((modelName, index) => {
							const colorIndex = selectedModels && selectedModels.length > 0 ? modelNames.indexOf(modelName) : index;
							return (
								<Area
									key={modelName}
									type="monotone"
									dataKey={modelName}
									stroke={COLORS[colorIndex % COLORS.length]}
									fill={COLORS[colorIndex % COLORS.length]}
									fillOpacity={0.1}
									strokeWidth={2}
									name={modelName}
								/>
							);
						})}
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

MultiModelChartContainer.displayName = "MultiModelChartContainer";

export default MultiModelChartContainer;
