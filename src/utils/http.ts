import axios from "axios";
import { useAccountStore } from "@libertai/auth";
import env from "@/config/env";

export const api = axios.create({
	baseURL: env.INFERENCE_BACKEND_URL,
	withCredentials: true,
});

// A 401 means the session cookie expired mid-use: re-probe so the root gate
// flips back to the login screen instead of every chart erroring silently.
api.interceptors.response.use(undefined, (error) => {
	if (error?.response?.status === 401) {
		void useAccountStore.getState().checkSession();
	}
	return Promise.reject(error);
});
