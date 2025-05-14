import React, { useEffect, useState } from "react";
import { getModelsNames } from "@/utils/models";

const FilterModelNames = ({setSelectedModel}: {setSelectedModel: React.Dispatch<React.SetStateAction<string>>}) => {
	const [options, setOptions] = useState<string[]>([]);
	const [selected, setSelected] = useState("hermes-3-8b-tee");

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
				value={selected}
				onChange={(e) => {
					setSelected(e.target.value);
					setSelectedModel(e.target.value);
				}}
				className="ml-2 px-4 py-[7px] rounded-[5px] border border-gray-300 focus:outline-none "
			>
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
