const PLEX_API_BASE = "https://metadata.provider.plex.tv";
const PLEX_DISCOVER_API = "https://discover.provider.plex.tv";
const PLEX_CLIENT_ID = "plex-tracker-app";
const WATCHLIST_PAGE_SIZE = 100;

const plexHeaders = (authToken) => ({
	Accept: "application/json",
	"X-Plex-Token": authToken,
	"X-Plex-Client-Identifier": PLEX_CLIENT_ID,
});

const fetchWatchlistPage = async (authToken, start) => {
	const response = await fetch(
		`${PLEX_DISCOVER_API}/library/sections/watchlist/all?X-Plex-Container-Size=${WATCHLIST_PAGE_SIZE}&X-Plex-Container-Start=${start}`,
		{
			headers: {
				...plexHeaders(authToken),
				"X-Plex-Product": "Plex Tracker",
				"X-Plex-Platform": "Web",
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch watchlist: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return {
		items: data.MediaContainer?.Metadata || [],
		totalSize: data.MediaContainer?.totalSize || 0,
	};
};

export const fetchWatchlist = async (authToken) => {
	const media = [];
	let start = 0;
	let totalSize = null;

	while (totalSize === null || start < totalSize) {
		const { items, totalSize: pageTotalSize } = await fetchWatchlistPage(authToken, start);
		media.push(...items);
		totalSize = pageTotalSize;
		start += items.length;

		if (items.length === 0) break;
	}

	const enrichedMedia = await Promise.all(
		media.map((item) => enrichMediaWithMetadata(authToken, item)),
	);

	return enrichedMedia;
};

export const fetchMediaMetadata = async (authToken, ratingKey) => {
	const response = await fetch(`${PLEX_API_BASE}/library/metadata/${ratingKey}`, {
		headers: plexHeaders(authToken),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch metadata for ${ratingKey}`);
	}

	const data = await response.json();
	return data.MediaContainer?.Metadata?.[0] || null;
};

export const fetchShowMetadata = fetchMediaMetadata;

export const fetchShowSeasons = async (authToken, ratingKey) => {
	const response = await fetch(
		`${PLEX_API_BASE}/library/metadata/${ratingKey}/children?X-Plex-Container-Size=100&X-Plex-Container-Start=0`,
		{
			headers: plexHeaders(authToken),
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch seasons for ${ratingKey}`);
	}

	const data = await response.json();
	return data.MediaContainer?.Metadata || [];
};

export const fetchSeasonEpisodes = async (authToken, seasonRatingKey) => {
	const allEpisodes = [];
	let offset = 0;
	let totalSize = null;

	while (totalSize === null || offset < totalSize) {
		const response = await fetch(
			`${PLEX_API_BASE}/library/metadata/${seasonRatingKey}/children?X-Plex-Container-Start=${offset}`,
			{
				headers: plexHeaders(authToken),
			},
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch episodes for season ${seasonRatingKey}`);
		}

		const data = await response.json();
		const episodes = data.MediaContainer?.Metadata || [];
		totalSize = data.MediaContainer?.totalSize || 0;

		allEpisodes.push(...episodes);
		offset += episodes.length;

		if (episodes.length === 0) break;
	}

	return allEpisodes;
};

export const enrichMediaWithMetadata = async (authToken, item) => {
	let media = item;

	try {
		const metadata = await fetchMediaMetadata(authToken, item.ratingKey);
		if (metadata) {
			media = { ...item, ...metadata };
		}
	} catch (error) {
		console.warn(`Failed to enrich metadata for ${item.title}:`, error);
	}

	return enrichShowWithSeasonData(authToken, media);
};

export const enrichShowWithSeasonData = async (authToken, show) => {
	if (show.type !== "show") {
		return show;
	}

	try {
		const seasons = await fetchShowSeasons(authToken, show.ratingKey);
		if (!seasons.length) {
			return show;
		}

		const sortedSeasons = [...seasons].sort((a, b) => a.index - b.index);
		const lastSeason = sortedSeasons[sortedSeasons.length - 1];
		const episodes = await fetchSeasonEpisodes(authToken, lastSeason.ratingKey);

		if (!episodes.length) {
			return show;
		}

		const episodesWithDates = episodes.filter((ep) => ep.originallyAvailableAt);
		if (!episodesWithDates.length) {
			return show;
		}

		const lastEpisode = episodesWithDates.reduce((latest, ep) => {
			const latestDate = new Date(latest.originallyAvailableAt);
			const epDate = new Date(ep.originallyAvailableAt);
			return epDate > latestDate ? ep : latest;
		});
		const lastEpisodeAirDate = lastEpisode.originallyAvailableAt;

		return {
			...show,
			lastSeasonEndDate: lastEpisodeAirDate,
			lastSeasonStartDate: lastSeason.originallyAvailableAt,
			lastSeasonIndex: lastSeason.index,
		};
	} catch (error) {
		console.error(`Failed to enrich show ${show.title}:`, error);
		return show;
	}
};
