import { getGroupTitle } from "../../utils/groupShows";
import ShowCard from "./ShowCard";

const ShowGroup = ({ status, shows }) => {
	if (!shows || shows.length === 0) return null;

	const title = getGroupTitle(status);

	return (
		<div>
			<div className="sticky top-0 z-20 -mx-4 flex items-center justify-between bg-zinc-50/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-zinc-50/60 dark:bg-zinc-950/80 dark:supports-backdrop-filter:bg-zinc-950/60">
				<h2 className="font-bold text-2xl text-zinc-900 tracking-tight dark:text-zinc-50">
					{title}
				</h2>
				<span className="text-sm text-zinc-500 dark:text-zinc-400">
					{shows.length} show{shows.length !== 1 ? "s" : ""}
				</span>
			</div>
			<div className="grid grid-cols-2 gap-4 pt-4 pb-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{shows.map((show) => (
					<ShowCard key={show.ratingKey} show={show} />
				))}
			</div>
		</div>
	);
};

export default ShowGroup;
