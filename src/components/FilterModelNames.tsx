import React, { useEffect, useRef, useState } from "react";
import { getModelsNames } from "@/utils/models";

const FilterModelNames = ({setSelectedModels}: {setSelectedModels: React.Dispatch<React.SetStateAction<string[]>>}) => {
	const [options, setOptions] = useState<string[]>([]);
	const [selected, setSelected] = useState<string[]>([]);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchModelsNames = async () => {
			try {
				const modelsNames = await getModelsNames();
				setOptions(modelsNames);
			} catch {
				// silently fail — dropdown stays empty
			}
		}
		fetchModelsNames();
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggle = (model: string) => {
		const next = selected.includes(model)
			? selected.filter(m => m !== model)
			: [...selected, model];
		setSelected(next);
		setSelectedModels(next);
	};

	const clearAll = () => {
		setSelected([]);
		setSelectedModels([]);
	};

	const label = selected.length === 0
		? "All Models"
		: selected.length === 1
			? selected[0]
			: `${selected.length} models`;

	return (
		<div className="inline-block relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="ml-2 px-4 py-[7px] rounded-[5px] border border-gray-300 focus:outline-none bg-white text-left min-w-[160px] flex items-center justify-between gap-2"
			>
				<span className="truncate">{label}</span>
				<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
				</svg>
			</button>
			{open && (
				<div className="absolute z-20 mt-1 ml-2 bg-white border border-gray-300 rounded-[5px] shadow-lg max-h-60 overflow-y-auto min-w-[200px]">
					{selected.length > 0 && (
						<button
							type="button"
							onClick={clearAll}
							className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 border-b border-gray-200"
						>
							Clear selection
						</button>
					)}
					{options.map((option) => (
						<label
							key={option}
							className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
						>
							<input
								type="checkbox"
								checked={selected.includes(option)}
								onChange={() => toggle(option)}
								className="rounded"
							/>
							<span className="truncate">{option}</span>
						</label>
					))}
				</div>
			)}
		</div>
	);
};

export default FilterModelNames;
