export const FILTER_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "movies", label: "Movies" },
	{ value: "tv-shows", label: "TV Shows" },
	{ value: "anime", label: "Anime" },
	{ value: "anime-movies", label: "Anime Movies" },
];

export const SORT_OPTIONS = [
	{ value: "airing-date", label: "By airing date" },
	{ value: "title", label: "Title" },
	{ value: "rating", label: "Rating / popularity" },
];

export const GROUP_OPTIONS = [
	{ value: "airing-date", label: "By airing date" },
	{ value: "type", label: "Type" },
];

export const AIRING_GROUPS = [
	"currently-airing",
	"not-yet-aired",
	"recently-ended",
	"finished-airing",
];

export const TYPE_GROUPS = ["movies", "tv-shows", "anime", "anime-movies"];

const createGroups = (keys) => Object.fromEntries(keys.map((key) => [key, []]));

export const getMediaGenres = (media) => {
	if (!media) return [];

	const values = [media.Genre, media.genre, media.genres].filter(Boolean);

	return values.flatMap((value) => {
		if (Array.isArray(value)) {
			return value
				.map((item) =>
					typeof item === "string" ? item : item.tag || item.name || item.label,
				)
				.filter(Boolean);
		}

		if (typeof value === "string") {
			return value
				.split(",")
				.map((genre) => genre.trim())
				.filter(Boolean);
		}

		return [];
	});
};

export const isAnimeMedia = (media) =>
	getMediaGenres(media).some((genre) => genre.toLowerCase().includes("anime"));

export const getMediaCategory = (media) => {
	const isMovie = media?.type === "movie";
	const isAnime = isAnimeMedia(media);

	if (isAnime) return isMovie ? "anime-movies" : "anime";
	return isMovie ? "movies" : "tv-shows";
};

export const getMediaDate = (media) =>
	media?.lastSeasonEndDate ||
	media?.lastSeasonStartDate ||
	media?.originallyAvailableAt ||
	(media?.year ? `${media.year}-01-01` : null);

const getDateValue = (media) => {
	const date = getMediaDate(media);
	if (!date) return 0;

	const value = new Date(date).getTime();
	return Number.isNaN(value) ? 0 : value;
};

const getRatingValue = (media) => Number(media?.audienceRating || media?.rating || 0);

const compareByTitle = (a, b) => (a.title || "").localeCompare(b.title || "");

const isFutureDate = (date) => date && new Date(date) > new Date();

const getDaysSince = (date) => Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));

const getAiredShowStatus = (show, seasonStartDate) => {
	if (show.lastSeasonEndDate) {
		const daysSinceEnd = getDaysSince(show.lastSeasonEndDate);

		if (daysSinceEnd < 0) return "currently-airing";
		if (daysSinceEnd <= 90) return "recently-ended";
		return "finished-airing";
	}

	if (seasonStartDate) {
		return getDaysSince(seasonStartDate) < 90 ? "currently-airing" : "finished-airing";
	}

	if (show.year) {
		return isFutureDate(`${show.year}-01-01`) ? "not-yet-aired" : "finished-airing";
	}

	return "not-yet-aired";
};

export const getShowStatus = (show) => {
	if (!show) return "unknown";

	const seasonStartDate = show.lastSeasonStartDate || show.originallyAvailableAt;

	if (isFutureDate(seasonStartDate)) return "not-yet-aired";

	if (show.type !== "show") {
		return "finished-airing";
	}

	return getAiredShowStatus(show, seasonStartDate);
};

const sortMedia = (items, sortBy, groupKey) =>
	[...items].sort((a, b) => {
		if (sortBy === "title") return compareByTitle(a, b);

		if (sortBy === "rating") {
			const rating = getRatingValue(b) - getRatingValue(a);
			return rating || compareByTitle(a, b);
		}

		const dateSort = getDateValue(a) - getDateValue(b);
		if (groupKey === "currently-airing") return dateSort || compareByTitle(a, b);
		return -dateSort || compareByTitle(a, b);
	});

export const getGroupOrder = (groupBy = "airing-date") =>
	groupBy === "type" ? TYPE_GROUPS : AIRING_GROUPS;

export const groupShows = (
	shows,
	{ filter = "all", sortBy = "airing-date", groupBy = "airing-date" } = {},
) => {
	const groupKeys = getGroupOrder(groupBy);
	const grouped = createGroups(groupKeys);

	if (!Array.isArray(shows)) return grouped;

	const filteredMedia = shows
		.filter(Boolean)
		.filter((media) => filter === "all" || getMediaCategory(media) === filter);

	for (const media of filteredMedia) {
		const groupKey = groupBy === "type" ? getMediaCategory(media) : getShowStatus(media);
		grouped[groupKey]?.push(media);
	}

	for (const key of groupKeys) {
		grouped[key] = sortMedia(grouped[key], sortBy, key);
	}

	return grouped;
};

export const formatAirDate = (dateString) => {
	if (!dateString) return "Unknown";

	const date = new Date(dateString);
	const now = new Date();

	if (date > now) {
		return `Airs ${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
	}

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export const getGroupTitle = (status) => {
	const titles = {
		"finished-airing": "Finished Airing",
		"currently-airing": "Currently Airing",
		"recently-ended": "Recently Ended",
		"not-yet-aired": "Not Yet Aired",
		movies: "Movies",
		"tv-shows": "TV Shows",
		anime: "Anime",
		"anime-movies": "Anime Movies",
	};
	return titles[status] || "Unknown";
};
