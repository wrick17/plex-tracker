import { getShowStatus } from "../../utils/groupShows";
import { Badge } from "../ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

const ShowCard = ({ show }) => {
	const posterUrl = show.thumb || show.art;
	const title = show.title || "Unknown Title";
	const year = show.year;
	const seasonCount = show.leafCount || 0;
	const status = getShowStatus(show);

	const seasonEndDate = show.lastSeasonEndDate;
	const seasonStartDate = show.lastSeasonStartDate || show.originallyAvailableAt;

	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getBadgeText = () => {
		if (seasonEndDate) {
			const endDate = new Date(seasonEndDate);
			const now = new Date();

			if (status === "currently-airing") {
				if (endDate > now) {
					return `Ends on ${formatDate(seasonEndDate)}`;
				}
				return `Ended ${formatDate(seasonEndDate)}`;
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

	const handleCardClick = () => {
		const deeplink = show.guid;
		const webUrl = show.publicPagesURL;

		const hasDeeplink = Boolean(deeplink);
		const hasWebUrl = Boolean(webUrl);

		if (!hasDeeplink) {
			if (!hasWebUrl) return;
		}

		if (hasDeeplink) {
			const iframe = document.createElement("iframe");
			iframe.style.display = "none";
			iframe.src = deeplink;
			document.body.appendChild(iframe);

			// Attempt deeplink first, then fallback to web URL if app isn't installed
			// setTimeout allows time for the OS to handle the deeplink before checking if we're still visible
			setTimeout(() => {
				document.body.removeChild(iframe);
				if (!hasWebUrl) return;
				if (document.visibilityState === "visible") {
					window.open(webUrl, "_blank", "noopener,noreferrer");
				}
			}, 1000);
		} else if (hasWebUrl) {
			window.open(webUrl, "_blank", "noopener,noreferrer");
		}
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
