import axios from "axios";
import env from "@/config/env";
import { Model } from "@/types/models";

export const getModelsNames = async (): Promise<string[]> => {
	const url = `${env.ALEPH_API_URL}/api/v0/aggregates/0xe1F7220D201C64871Cefb25320a8a588393eE508.json?keys=TEST_LTAI_PRICING`
	const response = await axios.get(url).then((res) => res.data);
	const models: string[] = [];

	if (response.data && response.data.TEST_LTAI_PRICING && response.data.TEST_LTAI_PRICING.models) {
		const gotModels =  response.data.TEST_LTAI_PRICING.models;

		gotModels.forEach((model: Model) => {
			models.push(model.id);
		})
	}
	return models;
}
