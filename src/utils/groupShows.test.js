import { describe, expect, test } from "bun:test";
import { getMediaCategory, getShowStatus, groupShows } from "./groupShows";

const media = [
	{
		ratingKey: "movie",
		title: "Plain Movie",
		type: "movie",
		originallyAvailableAt: "2024-01-01",
		audienceRating: 6,
	},
	{
		ratingKey: "show",
		title: "Plain Show",
		type: "show",
		originallyAvailableAt: "2020-01-01",
		audienceRating: 7,
	},
	{
		Genre: [{ tag: "Anime" }],
		ratingKey: "anime-show",
		title: "Anime Show",
		type: "show",
		originallyAvailableAt: "2021-01-01",
		audienceRating: 9,
	},
	{
		Genre: [{ tag: "Anime" }],
		ratingKey: "anime-movie",
		title: "Anime Movie",
		type: "movie",
		originallyAvailableAt: "2022-01-01",
		audienceRating: 8,
	},
];

describe("watchlist grouping", () => {
	test("assigns every media item to exactly one filter category", () => {
		expect(media.map(getMediaCategory)).toEqual([
			"movies",
			"tv-shows",
			"anime",
			"anime-movies",
		]);
	});

	test("filters to one exact category", () => {
		const grouped = groupShows(media, { filter: "anime", groupBy: "type" });

		expect(grouped.anime.map((item) => item.title)).toEqual(["Anime Show"]);
		expect(grouped.movies).toHaveLength(0);
		expect(grouped["tv-shows"]).toHaveLength(0);
		expect(grouped["anime-movies"]).toHaveLength(0);
	});

	test("groups by type without overlap", () => {
		const grouped = groupShows(media, { groupBy: "type", sortBy: "title" });

		expect(grouped.movies.map((item) => item.title)).toEqual(["Plain Movie"]);
		expect(grouped["tv-shows"].map((item) => item.title)).toEqual(["Plain Show"]);
		expect(grouped.anime.map((item) => item.title)).toEqual(["Anime Show"]);
		expect(grouped["anime-movies"].map((item) => item.title)).toEqual(["Anime Movie"]);
	});

	test("sorts by title and rating", () => {
		const byTitle = groupShows(media, { groupBy: "type", sortBy: "title" });
		const byRating = groupShows(media, { groupBy: "airing-date", sortBy: "rating" });

		expect(byTitle.anime[0].title).toBe("Anime Show");
		expect(byRating["finished-airing"].map((item) => item.title).slice(0, 2)).toEqual([
			"Anime Show",
			"Anime Movie",
		]);
	});

	test("keeps future titles in not yet aired", () => {
		const futureShow = {
			ratingKey: "future",
			title: "Future Show",
			type: "show",
			lastSeasonStartDate: "2999-01-01",
			lastSeasonEndDate: "2999-03-01",
		};

		expect(getShowStatus(futureShow)).toBe("not-yet-aired");
		expect(groupShows([futureShow])["not-yet-aired"]).toEqual([futureShow]);
	});
});
