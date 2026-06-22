import { useMemo, useState } from "react";
import {
	FILTER_OPTIONS,
	GROUP_OPTIONS,
	getGroupOrder,
	groupShows,
	SORT_OPTIONS,
} from "../../utils/groupShows";
import { Skeleton } from "../ui/Skeleton";
import ShowGroup from "./ShowGroup";
import ShowViewControls from "./ShowViewControls";

const skeletonKeys = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
	"skeleton-5",
	"skeleton-6",
];

const ShowList = ({ shows, isLoading, error }) => {
	const [filter, setFilter] = useState("all");
	const [sortBy, setSortBy] = useState("airing-date");
	const [groupBy, setGroupBy] = useState("airing-date");
	const [isControlsOpen, setIsControlsOpen] = useState(false);
	const groupedShows = useMemo(
		() => groupShows(shows, { filter, sortBy, groupBy }),
		[filter, groupBy, shows, sortBy],
	);
	const groupOrder = getGroupOrder(groupBy);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
						{skeletonKeys.map((key) => (
							<div key={key} className="space-y-2">
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

	const hasShows = groupOrder.some((group) => groupedShows[group].length > 0);

	if (!hasShows) {
		return (
			<>
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<p className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
							No titles in your watchlist
						</p>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
							Add titles to your Plex watchlist to get started
						</p>
					</div>
				</div>
				<ShowViewControls
					filter={filter}
					filterOptions={FILTER_OPTIONS}
					groupBy={groupBy}
					groupOptions={GROUP_OPTIONS}
					isOpen={isControlsOpen}
					onClose={() => setIsControlsOpen(false)}
					onFilterChange={setFilter}
					onGroupChange={setGroupBy}
					onSortChange={setSortBy}
					onToggle={() => setIsControlsOpen((open) => !open)}
					sortBy={sortBy}
					sortOptions={SORT_OPTIONS}
				/>
			</>
		);
	}

	return (
		<>
			<div>
				{groupOrder.map((group) => (
					<ShowGroup key={group} status={group} shows={groupedShows[group]} />
				))}
			</div>
			<ShowViewControls
				filter={filter}
				filterOptions={FILTER_OPTIONS}
				groupBy={groupBy}
				groupOptions={GROUP_OPTIONS}
				isOpen={isControlsOpen}
				onClose={() => setIsControlsOpen(false)}
				onFilterChange={setFilter}
				onGroupChange={setGroupBy}
				onSortChange={setSortBy}
				onToggle={() => setIsControlsOpen((open) => !open)}
				sortBy={sortBy}
				sortOptions={SORT_OPTIONS}
			/>
		</>
	);
};

export default ShowList;
