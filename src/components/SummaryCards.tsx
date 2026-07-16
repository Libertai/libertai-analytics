import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export type SummaryCard = {
	number: number;
	description: string;
	formatter?: (num: number) => string;
};

// Row of headline-number cards under a chart.
export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
	return (
		<div className="grid grid-cols-2 md:flex gap-3 mt-4">
			{cards.map((card) => (
				<Card key={card.description} className="md:w-fit md:mx-auto">
					<CardHeader className="text-center py-4">
						<CardTitle>{card.formatter ? card.formatter(card.number) : card.number}</CardTitle>
						<CardDescription>{card.description}</CardDescription>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
