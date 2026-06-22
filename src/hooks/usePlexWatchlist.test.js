import { describe, expect, test } from "bun:test";
import {
	createWatchlistCacheStorage,
	hasUsableCachedShows,
	WATCHLIST_CACHE_VERSION,
} from "../stores/watchlistCacheStore";
import { shouldFetchWatchlist, shouldRefreshCachedShows } from "./usePlexWatchlist";

describe("shouldRefreshCachedShows", () => {
	test("starts one cached-data refresh for an authenticated token", () => {
		expect(shouldRefreshCachedShows("plex-token", [{ ratingKey: "show-1" }], null)).toBe(true);
	});

	test("does not restart the cached-data refresh after the same token has run it", () => {
		expect(
			shouldRefreshCachedShows("plex-token", [{ ratingKey: "show-1" }], "plex-token"),
		).toBe(false);
	});

	test("allows a cached-data refresh for a new authenticated token", () => {
		expect(
			shouldRefreshCachedShows("new-plex-token", [{ ratingKey: "show-1" }], "old-plex-token"),
		).toBe(true);
	});

	test("does not refresh without auth or cached shows", () => {
		expect(shouldRefreshCachedShows(null, [{ ratingKey: "show-1" }], null)).toBe(false);
		expect(shouldRefreshCachedShows("plex-token", null, null)).toBe(false);
	});
});

describe("shouldFetchWatchlist", () => {
	test("waits for async cache hydration before fetching", () => {
		expect(shouldFetchWatchlist("plex-token", false, false)).toBe(false);
		expect(shouldFetchWatchlist("plex-token", true, false)).toBe(true);
		expect(shouldFetchWatchlist(null, true, false)).toBe(false);
		expect(shouldFetchWatchlist("plex-token", true, true)).toBe(false);
	});
});

describe("hasUsableCachedShows", () => {
	test("rejects stale persisted watchlist cache versions", () => {
		expect(hasUsableCachedShows([{ ratingKey: "show-1" }], 0)).toBe(false);
		expect(hasUsableCachedShows([{ ratingKey: "show-1" }], WATCHLIST_CACHE_VERSION)).toBe(true);
		expect(hasUsableCachedShows(null, WATCHLIST_CACHE_VERSION)).toBe(false);
	});
});

describe("createWatchlistCacheStorage", () => {
	test("migrates a legacy localStorage watchlist cache into async storage", async () => {
		const asyncValues = new Map();
		const legacyValues = new Map([["watchlist-cache", "legacy-value"]]);
		const storage = {
			getItem: async (key) => asyncValues.get(key) ?? null,
			removeItem: async (key) => asyncValues.delete(key),
			setItem: async (key, value) => asyncValues.set(key, value),
		};
		const legacyStorage = {
			getItem: (key) => legacyValues.get(key) ?? null,
			removeItem: (key) => legacyValues.delete(key),
		};
		const cacheStorage = createWatchlistCacheStorage(storage, legacyStorage);

		expect(await cacheStorage.getItem("watchlist-cache")).toBe("legacy-value");
		expect(asyncValues.get("watchlist-cache")).toBe("legacy-value");
		expect(legacyValues.has("watchlist-cache")).toBe(false);
	});

	test("swallows async cache write failures", async () => {
		const storage = {
			getItem: async () => null,
			removeItem: async () => {},
			setItem: async () => {
				throw new Error("quota");
			},
		};
		const cacheStorage = createWatchlistCacheStorage(storage);

		expect(await cacheStorage.setItem("watchlist-cache", "value")).toBeUndefined();
	});

	test("swallows legacy localStorage access failures", async () => {
		const storage = {
			getItem: async () => null,
			removeItem: async () => {},
			setItem: async () => {},
		};
		const legacyStorage = {
			getItem: () => {
				throw new Error("quota");
			},
			removeItem: () => {
				throw new Error("quota");
			},
		};
		const cacheStorage = createWatchlistCacheStorage(storage, legacyStorage);

		expect(await cacheStorage.getItem("watchlist-cache")).toBeNull();
		expect(await cacheStorage.removeItem("watchlist-cache")).toBeUndefined();
		expect(await cacheStorage.setItem("watchlist-cache", "value")).toBeUndefined();
	});
});
