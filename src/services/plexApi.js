const PLEX_API_BASE = "https://metadata.provider.plex.tv";
const PLEX_DISCOVER_API = "https://discover.provider.plex.tv";
const PLEX_CLIENT_ID = "plex-tracker-app";

export const fetchWatchlist = async (authToken) => {
	const response = await fetch(
		`${PLEX_DISCOVER_API}/library/sections/watchlist/all?X-Plex-Container-Size=100&X-Plex-Container-Start=0`,
		{
			headers: {
				Accept: "application/json",
				"X-Plex-Token": authToken,
				"X-Plex-Client-Identifier": PLEX_CLIENT_ID,
				"X-Plex-Product": "Plex Tracker",
				"X-Plex-Platform": "Web",
			},
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch watchlist: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	const shows = data.MediaContainer?.Metadata || [];

	const enrichedShows = await Promise.all(
		shows.map((show) => enrichShowWithSeasonData(authToken, show))
	);

	return enrichedShows;
};

export const fetchShowMetadata = async (authToken, ratingKey) => {
	const response = await fetch(`${PLEX_API_BASE}/library/metadata/${ratingKey}`, {
		headers: {
			Accept: "application/json",
			"X-Plex-Token": authToken,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch metadata for ${ratingKey}`);
	}

	const data = await response.json();
	return data.MediaContainer?.Metadata?.[0] || null;
};

export const fetchShowSeasons = async (authToken, ratingKey) => {
	const response = await fetch(`${PLEX_API_BASE}/library/metadata/${ratingKey}/children`, {
		headers: {
			Accept: "application/json",
			"X-Plex-Token": authToken,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch seasons for ${ratingKey}`);
	}

	const data = await response.json();
	return data.MediaContainer?.Metadata || [];
};

export const fetchSeasonEpisodes = async (authToken, seasonRatingKey) => {
	const response = await fetch(`${PLEX_API_BASE}/library/metadata/${seasonRatingKey}/children`, {
		headers: {
			Accept: "application/json",
			"X-Plex-Token": authToken,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch episodes for season ${seasonRatingKey}`);
	}

	const data = await response.json();
	return data.MediaContainer?.Metadata || [];
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

		const lastSeason = seasons[seasons.length - 1];
		const episodes = await fetchSeasonEpisodes(authToken, lastSeason.ratingKey);

		if (!episodes.length) {
			return show;
		}

		const lastEpisode = episodes[episodes.length - 1];
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
