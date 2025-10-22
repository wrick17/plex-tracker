export const getShowStatus = (show) => {
	if (!show) return "unknown";

	const seasonEndDate = show.lastSeasonEndDate;
	const seasonStartDate = show.lastSeasonStartDate || show.originallyAvailableAt;
	const year = show.year;

	const now = new Date();

	if (seasonEndDate) {
		const endDate = new Date(seasonEndDate);
		const daysSinceEnd = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));

		if (daysSinceEnd < 0) {
			return "currently-airing";
		}

		return "finished-airing";
	}

	if (seasonStartDate) {
		const startDate = new Date(seasonStartDate);
		const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

		if (daysSinceStart < 0) {
			return "not-yet-aired";
		}

		if (daysSinceStart < 90) {
			return "currently-airing";
		}

		return "finished-airing";
	}

	if (year) {
		const yearDate = new Date(`${year}-01-01`);
		const daysSinceYear = Math.floor((now - yearDate) / (1000 * 60 * 60 * 24));

		if (daysSinceYear < 0) {
			return "not-yet-aired";
		}

		return "finished-airing";
	}

	return "not-yet-aired";
};

export const groupShows = (shows) => {
	const hasShows = Boolean(shows);
	const isArray = Array.isArray(shows);
	const isInvalidShows = !(hasShows && isArray);
	if (isInvalidShows) {
		return {
			"finished-airing": [],
			"currently-airing": [],
			"not-yet-aired": [],
		};
	}

	const tvShows = shows.filter((show) => show.type === "show");

	const grouped = {
		"finished-airing": [],
		"currently-airing": [],
		"not-yet-aired": [],
	};

	for (const show of tvShows) {
		const status = getShowStatus(show);
		if (grouped[status]) {
			grouped[status].push(show);
		}
	}

	for (const key of Object.keys(grouped)) {
		grouped[key].sort((a, b) => {
			const dateA = new Date(a.lastViewedAt || a.originallyAvailableAt || a.year);
			const dateB = new Date(b.lastViewedAt || b.originallyAvailableAt || b.year);
			return dateB - dateA;
		});
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
		"not-yet-aired": "Not Yet Aired",
	};
	return titles[status] || "Unknown";
};
