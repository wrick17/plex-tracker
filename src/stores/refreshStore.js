import { create } from "zustand";
import { persist } from "zustand/middleware";

const useRefreshStore = create(
	persist(
		(set) => ({
			autoRefresh: false,
			refreshInterval: 5 * 60 * 1000,
			setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
			setRefreshInterval: (interval) => set({ refreshInterval: interval }),
		}),
		{
			name: "refresh-settings",
		}
	)
);

export default useRefreshStore;
