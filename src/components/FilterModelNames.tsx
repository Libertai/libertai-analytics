import React, { useEffect, useState } from "react";
import { getModelsNames } from "@/utils/models";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

const FilterModelNames = ({
	setSelectedModels,
}: { setSelectedModels: React.Dispatch<React.SetStateAction<string[]>> }) => {
	const [options, setOptions] = useState<string[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const fetchModelsNames = async () => {
			try {
				const modelsNames = await getModelsNames();
				setOptions(modelsNames);
			} catch {
				// silently fail — dropdown stays empty
			}
		};
		fetchModelsNames();
	}, []);

	const toggle = (model: string) => {
		const next = selected.includes(model)
			? selected.filter((m) => m !== model)
			: [...selected, model];
		setSelected(next);
		setSelectedModels(next);
	};

	const clearAll = () => {
		setSelected([]);
		setSelectedModels([]);
	};

	const label =
		selected.length === 0
			? "All Models"
			: selected.length === 1
				? selected[0]
				: `${selected.length} models`;

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
							onClick={clearAll}
							className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent border-b"
						>
							Clear selection
						</button>
					)}
					{options.map((option) => (
						<label
							key={option}
							className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer text-sm"
						>
							<Checkbox
								checked={selected.includes(option)}
								onCheckedChange={() => toggle(option)}
							/>
							<span className="truncate">{option}</span>
						</label>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default FilterModelNames;
