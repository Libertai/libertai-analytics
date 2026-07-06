import { cn } from "@/lib/utils";

type Mode<T extends string> = { value: T; label: string };

// Small segmented control for chart display modes (by-model/combined, DAU/WAU/MAU).
export function ChartModeToggle<T extends string>({
	modes,
	value,
	onChange,
}: {
	modes: readonly Mode<T>[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<div className="inline-flex rounded-md border bg-muted p-0.5">
			{modes.map((mode) => (
				<button
					key={mode.value}
					type="button"
					onClick={() => onChange(mode.value)}
					className={cn(
						"px-3 py-1 text-xs font-medium rounded-[5px] transition-colors",
						value === mode.value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
					)}
				>
					{mode.label}
				</button>
			))}
		</div>
	);
}
