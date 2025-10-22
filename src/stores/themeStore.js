import { create } from "zustand";
import { persist } from "zustand/middleware";

const getSystemTheme = () => {
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useThemeStore = create(
	persist(
		(set, get) => ({
			theme: "system",
			resolvedTheme: null,
			setTheme: (newTheme) => {
				set({ theme: newTheme });
				get().updateResolvedTheme();
			},
			updateResolvedTheme: () => {
				const { theme } = get();
				const resolved = theme === "system" ? getSystemTheme() : theme;
				set({ resolvedTheme: resolved });
			},
		}),
		{
			name: "theme-storage",
			partialize: (state) => ({ theme: state.theme }),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.updateResolvedTheme();
				}
			},
		}
	)
);

export default useThemeStore;
