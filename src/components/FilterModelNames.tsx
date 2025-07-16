import React, { useEffect, useState } from "react";
import { getModelsNames } from "@/utils/models";

const FilterModelNames = ({setSelectedModel}: {setSelectedModel: React.Dispatch<React.SetStateAction<string | undefined>>}) => {
	const [options, setOptions] = useState<string[]>([]);
	const [selected, setSelected] = useState<string | undefined>(undefined);

	useEffect(() => {
		const fetchModelsNames = async () => {
			const modelsNames = await getModelsNames();
			setOptions(modelsNames);
		}
		fetchModelsNames();
	}, []);

	return (
		<div className="inline-block">
			<select
				value={selected || ""}
				onChange={(e) => {
					const value = e.target.value === "" ? undefined : e.target.value;
					setSelected(value);
					setSelectedModel(value);
				}}
				className="ml-2 px-4 py-[7px] rounded-[5px] border border-gray-300 focus:outline-none "
			>
				<option value="">All Models</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
};

export default FilterModelNames;
