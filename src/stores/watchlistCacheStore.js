import { create } from "zustand";
import { persist } from "zustand/middleware";

export const WATCHLIST_CACHE_VERSION = 1;

export const hasUsableCachedShows = (cachedShows, cacheVersion) =>
	cacheVersion === WATCHLIST_CACHE_VERSION && cachedShows !== null;

const useWatchlistCacheStore = create(
	persist(
		(set, get) => ({
			cachedShows: null,
			cacheVersion: 0,
			lastFetchTime: null,

			setCachedShows: (shows) => {
				set({
					cachedShows: shows,
					cacheVersion: WATCHLIST_CACHE_VERSION,
					lastFetchTime: Date.now(),
				});
			},

			getCachedShows: () => {
				return get().cachedShows;
			},

			hasCachedData: () => {
				return hasUsableCachedShows(get().cachedShows, get().cacheVersion);
			},

			clearCache: () => {
				set({
					cachedShows: null,
					cacheVersion: 0,
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
