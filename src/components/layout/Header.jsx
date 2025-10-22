import { LogOut, Monitor, Moon, RefreshCw, Sun } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useRefreshStore from "../../stores/refreshStore";
import useThemeStore from "../../stores/themeStore";
import { Button } from "../ui/Button";

const Header = ({ onRefresh, isRefreshing }) => {
	const { theme, setTheme } = useThemeStore();
	const { clearAuth, user } = useAuthStore();
	const { autoRefresh, setAutoRefresh } = useRefreshStore();

	const cycleTheme = () => {
		const themes = ["light", "dark", "system"];
		const currentIndex = themes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		setTheme(themes[nextIndex]);
	};

	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return <Sun className="h-5 w-5" />;
			case "dark":
				return <Moon className="h-5 w-5" />;
			default:
				return <Monitor className="h-5 w-5" />;
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-zinc-200 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-backdrop-filter:bg-zinc-950/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<h1 className="font-bold text-xl text-zinc-900 dark:text-zinc-50">Plex Tracker</h1>
					{user && (
						<span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
							• {user.username || user.email}
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setAutoRefresh(!autoRefresh)}
						title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
						className={autoRefresh ? "bg-zinc-100 dark:bg-zinc-800" : ""}
					>
						<RefreshCw className={`h-5 w-5 ${autoRefresh ? "text-blue-500" : ""}`} />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						onClick={onRefresh}
						disabled={isRefreshing}
						title="Refresh watchlist"
					>
						<RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
					</Button>

					<Button variant="ghost" size="icon" onClick={cycleTheme} title={`Theme: ${theme}`}>
						{getThemeIcon()}
					</Button>

					<Button variant="ghost" size="icon" onClick={clearAuth} title="Sign out">
						<LogOut className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</header>
	);
};

export default Header;
