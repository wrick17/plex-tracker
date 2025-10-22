import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			authToken: null,
			user: null,
			isAuthenticated: false,
			setAuth: (token, user) => {
				set({
					authToken: token,
					user,
					isAuthenticated: !!token,
				});
			},
			clearAuth: () => {
				set({
					authToken: null,
					user: null,
					isAuthenticated: false,
				});
			},
		}),
		{
			name: "plex-auth-storage",
		}
	)
);

export default useAuthStore;
