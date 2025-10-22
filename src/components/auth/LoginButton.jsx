import { useState } from "react";
import {
	checkPinStatus,
	fetchPlexUser,
	generatePlexPin,
	getPlexAuthUrl,
} from "../../services/plexAuth";
import useAuthStore from "../../stores/authStore";
import { Button } from "../ui/Button";

const LoginButton = () => {
	const [isLoading, setIsLoading] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const pinData = await generatePlexPin();
			const authUrl = getPlexAuthUrl(pinData.id, pinData.code);

			const authWindow = window.open(authUrl, "_blank");

			const checkInterval = setInterval(async () => {
				try {
					const status = await checkPinStatus(pinData.id);

					if (status.authToken) {
						clearInterval(checkInterval);
						if (authWindow) authWindow.close();

						const user = await fetchPlexUser(status.authToken);
						setAuth(status.authToken, user);
						setIsLoading(false);
					}
				} catch (error) {
					console.error("Error checking PIN status:", error);
				}
			}, 1000);

			setTimeout(
				() => {
					clearInterval(checkInterval);
					setIsLoading(false);
					if (authWindow) authWindow.close();
				},
				5 * 60 * 1000
			);
		} catch (error) {
			console.error("Login error:", error);
			setIsLoading(false);
		}
	};

	return (
		<Button onClick={handleLogin} disabled={isLoading} size="lg">
			{isLoading ? "Waiting for authentication..." : "Sign in with Plex"}
		</Button>
	);
};

export default LoginButton;
