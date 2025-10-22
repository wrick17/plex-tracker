import { useMemo } from "react";
import { groupShows } from "../../utils/groupShows";
import { Skeleton } from "../ui/Skeleton";
import ShowGroup from "./ShowGroup";

const ShowList = ({ shows, isLoading, error }) => {
	const groupedShows = useMemo(() => groupShows(shows), [shows]);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={`skeleton-${i}`} className="space-y-2">
								<Skeleton className="aspect-2/3 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
						Error loading watchlist
					</p>
					<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
						{error.message || "Something went wrong"}
					</p>
				</div>
			</div>
		);
	}

	const hasShows =
		groupedShows["finished-airing"].length > 0 ||
		groupedShows["currently-airing"].length > 0 ||
		groupedShows["not-yet-aired"].length > 0;

	if (!hasShows) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
						No shows in your watchlist
					</p>
					<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
						Add some shows to your Plex watchlist to get started
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			<ShowGroup status="currently-airing" shows={groupedShows["currently-airing"]} />
			<ShowGroup status="not-yet-aired" shows={groupedShows["not-yet-aired"]} />
			<ShowGroup status="finished-airing" shows={groupedShows["finished-airing"]} />
		</div>
	);
};

export default ShowList;
