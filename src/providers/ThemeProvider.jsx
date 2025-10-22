import { useEffect } from "react";
import useThemeStore from "../stores/themeStore";

const ThemeProvider = ({ children }) => {
	const theme = useThemeStore((state) => state.theme);
	const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
	const updateResolvedTheme = useThemeStore((state) => state.updateResolvedTheme);

	useEffect(() => {
		updateResolvedTheme();

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				updateResolvedTheme();
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, updateResolvedTheme]);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		if (resolvedTheme === "dark") {
			root.classList.add("dark");
		} else if (resolvedTheme === "light") {
			root.classList.add("light");
		}
	}, [resolvedTheme]);

	return children;
};

export default ThemeProvider;
