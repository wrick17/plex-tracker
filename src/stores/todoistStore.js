import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTodoistStore = create(
	persist(
		(set, get) => ({
			apiToken: null,
			projectId: null,
			projectName: null,
			isEnabled: false,
			lastSyncTime: null,
			syncStatus: "idle", // 'idle' | 'syncing' | 'success' | 'error'
			syncError: null,

			setApiToken: (token) => {
				set({ apiToken: token });
			},

			setProject: (projectId, projectName) => {
				set({ projectId, projectName });
			},

			setEnabled: (enabled) => {
				set({ isEnabled: enabled });
			},

			setSyncStatus: (status, error = null) => {
				set({
					syncStatus: status,
					syncError: error,
					...(status === "success" ? { lastSyncTime: Date.now() } : {}),
				});
			},

			isConfigured: () => {
				const state = get();
				return Boolean(state.apiToken && state.projectId);
			},

			clearConfig: () => {
				set({
					apiToken: null,
					projectId: null,
					projectName: null,
					isEnabled: false,
					lastSyncTime: null,
					syncStatus: "idle",
					syncError: null,
				});
			},
		}),
		{
			name: "todoist-storage",
		}
	)
);

export default useTodoistStore;
