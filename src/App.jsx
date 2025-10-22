import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./components/auth/LoginPage";
import Header from "./components/layout/Header";
import ShowList from "./components/shows/ShowList";
import { usePlexWatchlist } from "./hooks/usePlexWatchlist";
import ThemeProvider from "./providers/ThemeProvider";
import useAuthStore from "./stores/authStore";
import "./App.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

const MainApp = () => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const { data: shows, isLoading, error } = usePlexWatchlist();

	if (!isAuthenticated) {
		return <LoginPage />;
	}

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
			<Header />
			<main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
				<ShowList shows={shows} isLoading={isLoading} error={error} />
			</main>
		</div>
	);
};

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<MainApp />
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
