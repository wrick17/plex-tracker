import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const WATCHLIST_CACHE_VERSION = 1;
const WATCHLIST_CACHE_DB_NAME = "plex-tracker-watchlist";
const WATCHLIST_CACHE_STORE_NAME = "cache";

export const hasUsableCachedShows = (cachedShows, cacheVersion) =>
	cacheVersion === WATCHLIST_CACHE_VERSION && cachedShows !== null;

const requestToPromise = (request) =>
	new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const openWatchlistCacheDb = () =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open(WATCHLIST_CACHE_DB_NAME, 1);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(WATCHLIST_CACHE_STORE_NAME)) {
				db.createObjectStore(WATCHLIST_CACHE_STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const withWatchlistCacheStore = async (mode, callback) => {
	const db = await openWatchlistCacheDb();
	const transaction = db.transaction(WATCHLIST_CACHE_STORE_NAME, mode);
	try {
		return await requestToPromise(
			callback(transaction.objectStore(WATCHLIST_CACHE_STORE_NAME)),
		);
	} finally {
		db.close();
	}
};

const getLegacyLocalStorage = () => {
	try {
		return localStorage;
	} catch {
		return null;
	}
};

const getLegacyStorageItem = (storage, key) => {
	try {
		return storage?.getItem(key) ?? null;
	} catch {
		return null;
	}
};

const removeLegacyStorageItem = (storage, key) => {
	try {
		storage?.removeItem(key);
	} catch {
		// Legacy localStorage cleanup is best effort.
	}
};

export const createWatchlistCacheStorage = (storage, legacyStorage = null) => ({
	getItem: async (key) => {
		try {
			const value = await storage.getItem(key);
			if (value != null) return value;
		} catch {
			// Persisted watchlist cache is optional; a failed read should not block the app.
		}

		const legacyValue = getLegacyStorageItem(legacyStorage, key);
		if (legacyValue != null) {
			try {
				await storage.setItem(key, legacyValue);
				removeLegacyStorageItem(legacyStorage, key);
			} catch {
				// Keep rendering from the legacy cache if migration cannot complete.
			}
		}

		return legacyValue;
	},
	removeItem: async (key) => {
		try {
			await storage.removeItem(key);
		} catch {
			// Clearing a best-effort cache should not make the app unusable.
		}
		removeLegacyStorageItem(legacyStorage, key);
	},
	setItem: async (key, value) => {
		try {
			await storage.setItem(key, value);
			removeLegacyStorageItem(legacyStorage, key);
		} catch {
			// Keep the in-memory store usable if IndexedDB persistence is unavailable.
		}
	},
});

const createWatchlistIndexedDbStorage = () =>
	createWatchlistCacheStorage(
		{
			getItem: (key) => withWatchlistCacheStore("readonly", (store) => store.get(key)),
			removeItem: (key) => withWatchlistCacheStore("readwrite", (store) => store.delete(key)),
			setItem: (key, value) =>
				withWatchlistCacheStore("readwrite", (store) => store.put(value, key)),
		},
		getLegacyLocalStorage(),
	);

const useWatchlistCacheStore = create(
	persist(
		(set, get) => ({
			cachedShows: null,
			cacheVersion: 0,
			isHydrated: false,
			lastFetchTime: null,

			setCachedShows: (shows) => {
				set({
					cachedShows: shows,
					cacheVersion: WATCHLIST_CACHE_VERSION,
					lastFetchTime: Date.now(),
				});
			},
			setCacheHydrated: () => {
				set({ isHydrated: true });
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
			partialize: (state) => ({
				cachedShows: state.cachedShows,
				cacheVersion: state.cacheVersion,
				lastFetchTime: state.lastFetchTime,
			}),
			onRehydrateStorage: (state) => () => {
				state.setCacheHydrated();
			},
			storage: createJSONStorage(createWatchlistIndexedDbStorage),
		},
	),
);

export default useWatchlistCacheStore;
