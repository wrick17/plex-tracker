import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { enrichShowWithSeasonData, fetchWatchlist } from "../services/plexApi";
import useAuthStore from "../stores/authStore";
import useWatchlistCacheStore from "../stores/watchlistCacheStore";
import { getShowStatus } from "../utils/groupShows";

export const shouldRefreshCachedShows = (authToken, cachedShows, refreshedCachedToken) => {
	return Boolean(authToken && cachedShows && refreshedCachedToken !== authToken);
};

export const shouldFetchWatchlist = (authToken, isCacheHydrated, hasCachedData) => {
	return Boolean(authToken && isCacheHydrated && !hasCachedData);
};

export const usePlexWatchlist = () => {
	const authToken = useAuthStore((state) => state.authToken);
	const cachedShows = useWatchlistCacheStore((state) => state.cachedShows);
	const isCacheHydrated = useWatchlistCacheStore((state) => state.isHydrated);
	const setCachedShows = useWatchlistCacheStore((state) => state.setCachedShows);
	const hasCachedData = useWatchlistCacheStore((state) => state.hasCachedData);
	const [shows, setShows] = useState(cachedShows);
	const [isLoading, setIsLoading] = useState(!(isCacheHydrated && hasCachedData()));
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const refreshedCachedTokenRef = useRef(null);

	const refreshCurrentlyAiring = useCallback(
		async (currentShows) => {
			if (!(authToken && currentShows)) return currentShows;

			const currentlyAiringShows = currentShows.filter(
				(show) => getShowStatus(show) === "currently-airing",
			);

			if (currentlyAiringShows.length === 0) return currentShows;

			const refreshedShows = await Promise.all(
				currentlyAiringShows.map((show) => enrichShowWithSeasonData(authToken, show)),
			);

			const refreshedMap = new Map(refreshedShows.map((show) => [show.ratingKey, show]));

			return currentShows.map((show) => refreshedMap.get(show.ratingKey) || show);
		},
		[authToken],
	);

	const fetchAll = useCallback(async () => {
		if (!authToken) return;

		setIsLoading(true);
		setError(null);

		try {
			const data = await fetchWatchlist(authToken);
			setShows(data);
			setCachedShows(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [authToken, setCachedShows]);

	const refetch = useCallback(async () => {
		if (!authToken) return;

		setIsRefreshing(true);
		setError(null);

		try {
			const data = await fetchWatchlist(authToken);
			setShows(data);
			setCachedShows(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsRefreshing(false);
		}
	}, [authToken, setCachedShows]);

	useEffect(() => {
		if (!authToken) {
			refreshedCachedTokenRef.current = null;
			return;
		}

		if (!isCacheHydrated) {
			setIsLoading(true);
			return;
		}

		if (hasCachedData() && cachedShows) {
			setShows(cachedShows);
			setIsLoading(false);

			if (
				!shouldRefreshCachedShows(authToken, cachedShows, refreshedCachedTokenRef.current)
			) {
				return;
			}

			refreshedCachedTokenRef.current = authToken;
			setIsRefreshing(true);
			refreshCurrentlyAiring(cachedShows)
				.then((updatedShows) => {
					setShows(updatedShows);
					setCachedShows(updatedShows);
				})
				.catch((err) => {
					console.error("Failed to refresh currently airing:", err);
				})
				.finally(() => {
					setIsRefreshing(false);
				});
		} else if (shouldFetchWatchlist(authToken, isCacheHydrated, hasCachedData())) {
			fetchAll();
		}
	}, [
		authToken,
		cachedShows,
		fetchAll,
		hasCachedData,
		isCacheHydrated,
		refreshCurrentlyAiring,
		setCachedShows,
	]);

	const data = useMemo(() => shows, [shows]);

	return {
		data,
		isLoading,
		isRefreshing,
		error,
		refetch,
		isSuccess: !(isLoading || error) && data !== null,
	};
};

export default usePlexWatchlist;
