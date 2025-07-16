import { formatXAxis } from "@/utils/charts";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";

type Card = {
	number: number;
	description: string;
};

type MultiModelChartContainerProps = {
	data: Record<string, string>[];
	cards: Card[];
	selectedModel?: string;
};

// Predefined color palette for different models
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

const MultiModelChartContainer = ({ data, cards, selectedModel }: MultiModelChartContainerProps) => {
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

	// If a model is selected, show only that model with primary color
	const modelsToShow = selectedModel ? [selectedModel] : modelNames;

	return (
		<div>
			<div className="h-[300px]">
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
						{!selectedModel && <Legend />}
						{modelsToShow.map((modelName, index) => (
							<Area
								key={modelName}
								type="monotone"
								dataKey={modelName}
								stroke={selectedModel ? "hsl(var(--primary))" : COLORS[index % COLORS.length]}
								fill={selectedModel ? "hsl(var(--primary))" : COLORS[index % COLORS.length]}
								fillOpacity={selectedModel ? 0.2 : 0.1}
								strokeWidth={2}
								name={modelName}
							/>
						))}
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<div className="md:flex max-md:space-y-4">
				{cards.map((card: Card) => {
					return (
						<Card key={card.description} className="w-fit mx-auto">
							<CardHeader className="text-center">
								<CardTitle>{card.number}</CardTitle>
								<CardDescription>{card.description}</CardDescription>
							</CardHeader>
						</Card>
					);
				})}
			</div>
		</div>
	);
};

export default MultiModelChartContainer;
