import { getGroupTitle } from "../../utils/groupShows";
import ShowCard from "./ShowCard";

const ShowGroup = ({ status, shows }) => {
	if (!shows || shows.length === 0) return null;

	const title = getGroupTitle(status);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-2xl text-zinc-900 tracking-tight dark:text-zinc-50">
					{title}
				</h2>
				<span className="text-sm text-zinc-500 dark:text-zinc-400">
					{shows.length} show{shows.length !== 1 ? "s" : ""}
				</span>
			</div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{shows.map((show) => (
					<ShowCard key={show.ratingKey} show={show} />
				))}
			</div>
		</div>
	);
};

export default ShowGroup;
