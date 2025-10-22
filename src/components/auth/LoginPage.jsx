import LoginButton from "./LoginButton";

const LoginPage = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
			<div className="w-full max-w-md space-y-8 px-4">
				<div className="text-center">
					<h1 className="font-bold text-4xl text-zinc-900 tracking-tight dark:text-zinc-50">
						Plex Tracker
					</h1>
					<p className="mt-3 text-zinc-600 dark:text-zinc-400">
						Track your Plex watchlist and stay updated on your favorite shows
					</p>
				</div>
				<div className="mt-8 flex justify-center">
					<LoginButton />
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
