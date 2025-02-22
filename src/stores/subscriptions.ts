import { create } from "zustand";
import { AlephSubscriptionSchema, Subscription } from "@/types/subscriptions";
import { AlephHttpClient } from "@aleph-sdk/client";

type SubscriptionsStoreState = {
	subscriptions: Subscription[];
	isLoaded: boolean;

	fetchSubscriptions: () => void;
};

const useSubscriptionsStore = create<SubscriptionsStoreState>((set) => ({
	subscriptions: [],
	isLoaded: false,

	fetchSubscriptions: async () => {
		const client = new AlephHttpClient();

		// TODO: handle pagination etc to make sure to fetch everything
		const alephData = await client.getPosts({
			types: ["libertai-subscription"],
			addresses: ["0xa1A6c622De314B7ff7eE3758ad3d1542e307288D"],
			channels: ["libertai-subscriptions"],
			pageSize: 200,
		});

		const parsedSubscriptions = alephData.posts
			.map((subscription) => AlephSubscriptionSchema.parse(subscription.content))
			.filter((sub) => sub.account.address !== "0x7ab98f6b22ecb42e27dc9c7d2d488f69b5cdd0b2") // Exclude team testing address
			.map(
				(sub): Subscription => ({
					start: new Date(sub.started_at * 1000).toISOString(),
					end: new Date(sub.ended_at * 1000).toISOString(),
					type: sub.type,
					provider: sub.provider,
				}),
			);

		set({ subscriptions: parsedSubscriptions, isLoaded: true });
	},
}));

export default useSubscriptionsStore;
