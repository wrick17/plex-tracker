import { getShowStatus } from "../../utils/groupShows";
import { Badge } from "../ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

const ShowCard = ({ show }) => {
	const posterUrl = show.thumb || show.art;
	const title = show.title || "Unknown Title";
	const year = show.year;
	const seasonCount = show.leafCount || 0;
	const status = getShowStatus(show);
	const lastSeasonIndex = show.lastSeasonIndex;

	const seasonEndDate = show.lastSeasonEndDate;
	const seasonStartDate = show.lastSeasonStartDate || show.originallyAvailableAt;

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "2-digit",
			month: "short",
			day: "numeric",
		});
	};

	const getDateText = () => {
		if (seasonEndDate) {
			const endDate = new Date(seasonEndDate);
			const now = new Date();

			if (status === "currently-airing" && endDate > now) {
				return `Ends ${formatDate(seasonEndDate)}`;
			}
			return `Ended ${formatDate(seasonEndDate)}`;
		}

		if (seasonStartDate) {
			if (status === "not-yet-aired") {
				return `Airs ${formatDate(seasonStartDate)}`;
			}
			return `Aired ${formatDate(seasonStartDate)}`;
		}

		return null;
	};

	const getBadgeText = () => {
		const dateText = getDateText();
		if (!dateText) return null;

		const seasonPrefix = lastSeasonIndex ? `S${lastSeasonIndex}: ` : "";
		return `${seasonPrefix}${dateText}`;
	};

	const handleCardClick = () => {
		const webUrl = show.publicPagesURL;
		const deeplink = webUrl.replace("https://watch.plex.tv/", "plex://");

		const hasDeeplink = Boolean(deeplink);
		const hasWebUrl = Boolean(webUrl);

		if (!hasDeeplink) {
			if (!hasWebUrl) return;
		}

		if (hasDeeplink) {
			window.location = deeplink;
			setTimeout(() => {
				if (document.hasFocus()) {
					window.open(webUrl, "_blank", "noopener,noreferrer");
				}
			}, 100);
			return;
		}
		window.open(webUrl, "_blank", "noopener,noreferrer");
	};

	const badgeText = getBadgeText();

	return (
		<Card
			className="flex cursor-pointer flex-col overflow-hidden transition-all hover:shadow-lg"
			onClick={handleCardClick}
		>
			{posterUrl && (
				<div className="aspect-2/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
					<img
						src={posterUrl}
						alt={title}
						className="h-full w-full object-cover transition-transform hover:scale-105"
						loading="lazy"
					/>
				</div>
			)}
			<CardHeader className="p-3 pb-2">
				<CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
				{year && (
					<CardDescription className="text-xs">
						{year}
						{seasonCount > 0 && ` • ${seasonCount} episode${seasonCount !== 1 ? "s" : ""}`}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="mt-auto p-3 pt-0">
				{badgeText && (
					<Badge variant="secondary" className="w-full justify-center text-xs">
						{badgeText}
					</Badge>
				)}
			</CardContent>
		</Card>
	);
};

export default ShowCard;
