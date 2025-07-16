import axios from "axios";
import { Model } from "@/types/models";

export const getModelsNames = async (): Promise<string[]> => {
	const url = `https://api2.aleph.im/api/v0/aggregates/0xe1F7220D201C64871Cefb25320a8a588393eE508.json?keys=LTAI_PRICING`
	const response = await axios.get(url).then((res) => res.data);
	const models: string[] = [];

	if (response.data && response.data.LTAI_PRICING && response.data.LTAI_PRICING.models) {
		const gotModels =  response.data.LTAI_PRICING.models;

		gotModels.forEach((model: Model) => {
			models.push(model.id);
		})
	}
	return models;
}
