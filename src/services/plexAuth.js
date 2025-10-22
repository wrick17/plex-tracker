const PLEX_CLIENT_ID = "plex-tracker-app";
const PLEX_PRODUCT = "Plex Tracker";
const PLEX_DEVICE = "Web";
const PLEX_AUTH_URL = "https://app.plex.tv/auth#";
const PLEX_PIN_URL = "https://plex.tv/api/v2/pins";

export const generatePlexPin = async () => {
	const params = new URLSearchParams({
		strong: "true",
		"X-Plex-Product": PLEX_PRODUCT,
		"X-Plex-Client-Identifier": PLEX_CLIENT_ID,
	});

	const response = await fetch(`${PLEX_PIN_URL}?${params}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to generate Plex PIN");
	}

	return response.json();
};

export const checkPinStatus = async (pinId) => {
	const params = new URLSearchParams({
		"X-Plex-Client-Identifier": PLEX_CLIENT_ID,
	});

	const response = await fetch(`${PLEX_PIN_URL}/${pinId}?${params}`, {
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to check PIN status");
	}

	return response.json();
};

export const getPlexAuthUrl = (_pinId, pinCode) => {
	const params = new URLSearchParams({
		clientID: PLEX_CLIENT_ID,
		code: pinCode,
		"context[device][product]": PLEX_PRODUCT,
		"context[device][device]": PLEX_DEVICE,
	});

	return `${PLEX_AUTH_URL}?${params}`;
};

export const fetchPlexUser = async (authToken) => {
	const response = await fetch("https://plex.tv/api/v2/user", {
		headers: {
			Accept: "application/json",
			"X-Plex-Token": authToken,
			"X-Plex-Client-Identifier": PLEX_CLIENT_ID,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}

	return response.json();
};
