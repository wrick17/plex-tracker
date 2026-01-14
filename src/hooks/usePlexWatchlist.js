import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchWatchlist } from "../services/plexApi";
import useAuthStore from "../stores/authStore";
import useRefreshStore from "../stores/refreshStore";
import { groupShows } from "../utils/groupShows";
import { useTodoistSync } from "./useTodoistSync";

export const usePlexWatchlist = () => {
	const authToken = useAuthStore((state) => state.authToken);
	const { autoRefresh, refreshInterval } = useRefreshStore();
	const { syncToTodoist } = useTodoistSync();

	const query = useQuery({
		queryKey: ["watchlist", authToken],
		queryFn: () => fetchWatchlist(authToken),
		enabled: !!authToken,
		staleTime: 2 * 60 * 1000,
		refetchInterval: autoRefresh ? refreshInterval : false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (query.data && query.isSuccess) {
			const groupedShows = groupShows(query.data);
			syncToTodoist(groupedShows);
		}
	}, [query.data, query.isSuccess, syncToTodoist]);

	return query;
};

export const useAutoRefresh = (refetch) => {
	const { autoRefresh, refreshInterval } = useRefreshStore();

	useEffect(() => {
		const shouldRefresh = autoRefresh && refetch;
		if (!shouldRefresh) return;

		const interval = setInterval(() => {
			refetch();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [autoRefresh, refreshInterval, refetch]);
};
