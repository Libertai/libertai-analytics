import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@libertai/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ChartModeToggle } from "@/components/ChartModeToggle";
import { useTopUsersQuery } from "@/hooks/useTopUsersQuery";
import { ChartDate } from "@/types/dates";
import {
	TOP_USAGE_SIZES,
	TOP_USAGE_TYPES,
	TopUsageGroup,
	TopUsageSize,
	TopUsageType,
} from "@/types/topUsage";
import { formatCount } from "@/utils/format";

const TYPE_LABELS: Record<TopUsageType, string> = {
	api: "API",
	cli: "CLI",
	liberclaw: "Liberclaw",
	chat: "Chat",
	x402: "x402",
};

const GROUP_MODES = [
	{ label: "By user", value: "user" },
	{ label: "By API key", value: "api_key" },
];

function formatDate(iso: string | null): string {
	if (!iso) return "-";
	return iso.slice(0, 10);
}

export function TopUsersTable({ dates }: { dates: ChartDate }) {
	const [type, setType] = useState<TopUsageType>("api");
	const [size, setSize] = useState<TopUsageSize>(10);
	const [groupBy, setGroupBy] = useState<TopUsageGroup>("user");

	const { data, isLoading } = useTopUsersQuery(type, dates, groupBy, size);
	const rows = data?.rows ?? [];

	return (
		<Card>
			<CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Top Users by Usage</CardTitle>
					<CardDescription>Heaviest consumers of the selected usage type in the range</CardDescription>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Select value={type} onValueChange={(v) => setType(v as TopUsageType)}>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Usage type" />
						</SelectTrigger>
						<SelectContent>
							{TOP_USAGE_TYPES.map((t) => (
								<SelectItem key={t} value={t}>
									{TYPE_LABELS[t]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<ChartModeToggle modes={GROUP_MODES} value={groupBy} onChange={setGroupBy} />
					<Select value={String(size)} onValueChange={(v) => setSize(Number(v) as TopUsageSize)}>
						<SelectTrigger className="w-24">
							<SelectValue placeholder="Rows" />
						</SelectTrigger>
						<SelectContent>
							{TOP_USAGE_SIZES.map((s) => (
								<SelectItem key={s} value={String(s)}>
									Top {s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : rows.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">No usage in this range.</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									<TableHead>User</TableHead>
									<TableHead>API key</TableHead>
									<TableHead className="text-right">Spent</TableHead>
									<TableHead className="text-right">Calls</TableHead>
									<TableHead>Account created</TableHead>
									<TableHead>API key created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={`${row.rank}-${row.user_label}`}>
										<TableCell className="text-muted-foreground">#{row.rank}</TableCell>
										<TableCell className="font-medium">{row.user_label}</TableCell>
										<TableCell className="font-mono text-xs">{row.api_key_label ?? "-"}</TableCell>
										<TableCell className="text-right">${formatCount(row.credits_spent)}</TableCell>
										<TableCell className="text-right">{formatCount(row.calls)}</TableCell>
										<TableCell>{formatDate(row.account_created_at)}</TableCell>
										<TableCell>{formatDate(row.api_key_created_at)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
