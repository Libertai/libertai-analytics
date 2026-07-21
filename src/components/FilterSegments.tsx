import { useState } from "react";
import { Button } from "@libertai/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@libertai/ui/popover";
import { ChevronDown } from "lucide-react";

// Label-cased to match the chart series keys produced by segmentLabel().
const SEGMENT_OPTIONS = ["Anonymous", "Free", "Go", "Plus", "Max"];

export function FilterSegments({
	selected,
	onChange,
}: { selected: string[]; onChange: (next: string[]) => void }) {
	const [open, setOpen] = useState(false);

	const toggle = (segment: string) => {
		onChange(selected.includes(segment) ? selected.filter((s) => s !== segment) : [...selected, segment]);
	};

	const label = selected.length === 0 ? "All plans" : selected.length === 1 ? selected[0] : `${selected.length} plans`;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="w-fit gap-2 max-md:h-8 max-md:px-3 max-md:text-xs">
					<span className="truncate max-w-[150px]">{label}</span>
					<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56 p-0" align="start">
				<div className="max-h-60 overflow-y-auto">
					{selected.length > 0 && (
						<button
							type="button"
							onClick={() => onChange([])}
							className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent border-b"
						>
							Clear selection
						</button>
					)}
					{SEGMENT_OPTIONS.map((option) => (
						<label
							key={option}
							className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer text-sm"
						>
							<Checkbox checked={selected.includes(option)} onCheckedChange={() => toggle(option)} />
							<span className="truncate">{option}</span>
						</label>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
