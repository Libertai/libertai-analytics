import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	SUBSCRIBER_STATUSES,
	SubscriberStatus,
	useCurrentSubscribersQuery,
} from "@/hooks/useCurrentSubscribersQuery";
import { LatestSubscriber } from "@/types/revenue";

const DEFAULT_STATUSES: SubscriberStatus[] = ["active", "overdue"];
const PAGE_SIZE = 25;

type SortKey = "user_label" | "tier" | "status" | "provider" | "created_at" | "current_period_end";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
	{ key: "user_label", label: "User" },
	{ key: "tier", label: "Tier" },
	{ key: "status", label: "Status" },
	{ key: "provider", label: "Provider" },
	{ key: "created_at", label: "Started" },
	{ key: "current_period_end", label: "Period end" },
];

function statusesLabel(statuses: SubscriberStatus[]): string {
	if (statuses.length === SUBSCRIBER_STATUSES.length) return "All statuses";
	if (statuses.length === 1) return statuses[0];
	return `${statuses.length} statuses`;
}

function compare(a: LatestSubscriber, b: LatestSubscriber, key: SortKey): number {
	const av = a[key];
	const bv = b[key];
	// Missing period-end sorts last regardless of direction being applied after.
	if (av === null) return bv === null ? 0 : 1;
	if (bv === null) return -1;
	return String(av).localeCompare(String(bv));
}

export function CurrentSubscribersTable() {
	const [statuses, setStatuses] = useState<SubscriberStatus[]>(DEFAULT_STATUSES);
	const [search, setSearch] = useState("");
	const [tiers, setTiers] = useState<string[]>([]);
	const [sortKey, setSortKey] = useState<SortKey>("created_at");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [page, setPage] = useState(0);

	const { data, isLoading } = useCurrentSubscribersQuery(statuses);

	const tierOptions = useMemo(
		() => [...new Set((data?.subscribers ?? []).map((s) => s.tier))].sort(),
		[data],
	);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		const rows = (data?.subscribers ?? []).filter(
			(s) =>
				(query === "" || s.user_label.toLowerCase().includes(query)) &&
				(tiers.length === 0 || tiers.includes(s.tier)),
		);
		rows.sort((a, b) => (sortDir === "asc" ? 1 : -1) * compare(a, b, sortKey));
		return rows;
	}, [data, search, tiers, sortKey, sortDir]);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, pageCount - 1);
	const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

	const toggleStatus = (status: SubscriberStatus) => {
		setPage(0);
		setStatuses((prev) => {
			if (prev.includes(status)) {
				if (prev.length === 1) return prev; // keep at least one selected
				return prev.filter((s) => s !== status);
			}
			return [...prev, status];
		});
	};

	const toggleTier = (tier: string) => {
		setPage(0);
		setTiers((prev) => (prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]));
	};

	const toggleSort = (key: SortKey) => {
		setPage(0);
		if (key === sortKey) {
			setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir(key === "created_at" || key === "current_period_end" ? "desc" : "asc");
		}
	};

	return (
		<Card>
			<CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Subscribers</CardTitle>
					<CardDescription>One row per subscription matching the selected statuses</CardDescription>
				</div>
				{data && (
					<div className="text-right">
						<div className="text-2xl font-bold">{data.total}</div>
						<div className="text-xs text-muted-foreground">total</div>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2 flex-wrap mb-4">
					<Input
						placeholder="Search user…"
						value={search}
						onChange={(e) => {
							setPage(0);
							setSearch(e.target.value);
						}}
						className="max-w-56 h-8"
					/>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="w-36 justify-between font-normal capitalize">
								{statusesLabel(statuses)}
								<ChevronDown className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-44 p-1">
							{SUBSCRIBER_STATUSES.map((status) => {
								const checked = statuses.includes(status);
								return (
									<label
										key={status}
										className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm capitalize hover:bg-accent"
									>
										<Checkbox
											checked={checked}
											disabled={checked && statuses.length === 1}
											onCheckedChange={() => toggleStatus(status)}
										/>
										{status}
									</label>
								);
							})}
						</PopoverContent>
					</Popover>
					{tierOptions.length > 0 && (
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="sm" className="w-32 justify-between font-normal capitalize">
									{tiers.length === 0 ? "All tiers" : tiers.length === 1 ? tiers[0] : `${tiers.length} tiers`}
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent align="start" className="w-40 p-1">
								{tierOptions.map((tier) => (
									<label
										key={tier}
										className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm capitalize hover:bg-accent"
									>
										<Checkbox checked={tiers.includes(tier)} onCheckedChange={() => toggleTier(tier)} />
										{tier}
									</label>
								))}
							</PopoverContent>
						</Popover>
					)}
				</div>
				{isLoading ? (
					<p className="py-8 text-center text-muted-foreground">Loading...</p>
				) : (
					<>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										{COLUMNS.map((col) => (
											<TableHead key={col.key}>
												<button
													className="inline-flex items-center gap-1 hover:text-foreground"
													onClick={() => toggleSort(col.key)}
												>
													{col.label}
													{sortKey === col.key ? (
														sortDir === "asc" ? (
															<ArrowUp className="h-3 w-3" />
														) : (
															<ArrowDown className="h-3 w-3" />
														)
													) : (
														<ArrowUpDown className="h-3 w-3 opacity-40" />
													)}
												</button>
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{pageRows.map((sub) => (
										<TableRow key={`${sub.user_label}-${sub.created_at}`}>
											<TableCell className="font-medium">{sub.user_label}</TableCell>
											<TableCell className="capitalize">{sub.tier}</TableCell>
											<TableCell>
												{sub.status}
												{sub.cancel_at_period_end && " (ending)"}
												{sub.is_trial && " (trial)"}
											</TableCell>
											<TableCell>{sub.provider}</TableCell>
											<TableCell>{sub.created_at.slice(0, 10)}</TableCell>
											<TableCell>{sub.current_period_end?.slice(0, 10) ?? "—"}</TableCell>
										</TableRow>
									))}
									{pageRows.length === 0 && (
										<TableRow>
											<TableCell colSpan={COLUMNS.length} className="py-8 text-center text-muted-foreground">
												No subscriptions match the current filters
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
						{filtered.length > PAGE_SIZE && (
							<div className="flex items-center justify-between mt-3">
								<span className="text-xs text-muted-foreground">
									{safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of{" "}
									{filtered.length}
								</span>
								<div className="flex gap-1">
									<Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={safePage >= pageCount - 1}
										onClick={() => setPage(safePage + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
