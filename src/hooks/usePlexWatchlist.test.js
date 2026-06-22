import { describe, expect, test } from "bun:test";
import { hasUsableCachedShows, WATCHLIST_CACHE_VERSION } from "../stores/watchlistCacheStore";
import { shouldRefreshCachedShows } from "./usePlexWatchlist";

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

describe("hasUsableCachedShows", () => {
	test("rejects stale persisted watchlist cache versions", () => {
		expect(hasUsableCachedShows([{ ratingKey: "show-1" }], 0)).toBe(false);
		expect(hasUsableCachedShows([{ ratingKey: "show-1" }], WATCHLIST_CACHE_VERSION)).toBe(true);
		expect(hasUsableCachedShows(null, WATCHLIST_CACHE_VERSION)).toBe(false);
	});
});
