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

		const maxByKey = new Map<string, number>();
		data.forEach((item) => {
			Object.keys(item).forEach((key) => {
				if (key === "date") return;
				const value = Number(item[key]) || 0;
				const current = maxByKey.get(key) ?? -Infinity;
				if (value > current) maxByKey.set(key, value);
			});
		});

		return Array.from(maxByKey.keys()).sort((a, b) => (maxByKey.get(b) ?? 0) - (maxByKey.get(a) ?? 0));
	}, [data]);

	const modelsToShow = useMemo(() => {
		if (!selectedModels || selectedModels.length === 0) return modelNames;
		const selected = new Set(selectedModels);
		return modelNames.filter((name) => selected.has(name));
	}, [modelNames, selectedModels]);

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
						<Tooltip itemSorter={(item) => -(Number(item.value) || 0)} />
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
			<div className="grid grid-cols-2 md:flex gap-3 mt-4">
				{cards.map((card: Card) => {
					const displayNumber = card.formatter ? card.formatter(card.number) : card.number;
					return (
						<Card key={card.description} className="md:w-fit md:mx-auto">
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
