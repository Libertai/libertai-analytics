import { formatXAxis } from "@/utils/charts"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartAPIData } from "@/types/api";
import { ChartCreditData } from "@/types/credits";
import { ChartSubscriptionData } from "@/types/subscriptions";

type Card = {
  number: number,
  description: string
}

type chartContainerProps = {
  data: ChartAPIData[] | ChartCreditData[] | ChartSubscriptionData[],
  areaDataKey: string
  cards: Card[],
}

const ChartContainer = ({data, areaDataKey, cards}: chartContainerProps) => {
  return (
    <div>
			<div className="h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
				{/* eslint-disable  @typescript-eslint/no-explicit-any */}
					<AreaChart data={data as any}>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tick={{ fontSize: 12 }}
							tickFormatter={formatXAxis}
						/>
						<YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
						<Tooltip />
						<Area
							type="monotone"
							dataKey={areaDataKey}
							stroke="hsl(var(--primary))"
							fill="hsl(var(--primary))"
							fillOpacity={0.2}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<div className="md:flex max-md:space-y-4">
			{cards.map((card: Card) => {
			  return (
					<Card key={card.description} className="w-fit mx-auto">
						<CardHeader className="text-center">
							<CardTitle>{ card.number }</CardTitle>
              <CardDescription>{ card.description }</CardDescription>
						</CardHeader>
					</Card>
					)
			})}
			</div>
		</div>
  )
}

export default ChartContainer;
