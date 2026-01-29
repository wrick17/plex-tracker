import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWatchlistCacheStore = create(
	persist(
		(set, get) => ({
			cachedShows: null,
			lastFetchTime: null,

			setCachedShows: (shows) => {
				set({
					cachedShows: shows,
					lastFetchTime: Date.now(),
				});
			},

			getCachedShows: () => {
				return get().cachedShows;
			},

			hasCachedData: () => {
				return get().cachedShows !== null;
			},

			clearCache: () => {
				set({
					cachedShows: null,
					lastFetchTime: null,
				});
			},
		}),
		{
			name: "watchlist-cache",
		},
	),
);

export default useWatchlistCacheStore;
