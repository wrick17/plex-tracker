import { CheckCircle, ExternalLink, Loader2, Square, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTodoistSync } from "../../hooks/useTodoistSync";
import { getProjects, validateToken } from "../../services/todoistApi";
import useTodoistStore from "../../stores/todoistStore";
import { Button } from "../ui/Button";

const TODOIST_SETTINGS_URL = "https://app.todoist.com/app/settings/integrations/developer";

const TodoistSettings = ({ isOpen, onClose }) => {
	const {
		apiToken,
		projectId,
		projectName,
		isEnabled,
		lastSyncTime,
		syncStatus,
		syncError,
		setApiToken,
		setProject,
		setEnabled,
		clearConfig,
	} = useTodoistStore();

	const { stopSync } = useTodoistSync();

	const [tokenInput, setTokenInput] = useState("");
	const [isValidating, setIsValidating] = useState(false);
	const [tokenError, setTokenError] = useState(null);
	const [projects, setProjects] = useState([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(false);

	useEffect(() => {
		if (apiToken && isOpen) {
			loadProjects();
		}
	}, [apiToken, isOpen]);

	useEffect(() => {
		if (isOpen) {
			setTokenInput("");
			setTokenError(null);
		}
	}, [isOpen]);

	const loadProjects = async () => {
		setIsLoadingProjects(true);
		try {
			const fetchedProjects = await getProjects(apiToken);
			setProjects(fetchedProjects);
		} catch (error) {
			console.error("Failed to load projects:", error);
			setProjects([]);
		} finally {
			setIsLoadingProjects(false);
		}
	};

	const handleGetToken = () => {
		window.open(TODOIST_SETTINGS_URL, "_blank", "noopener,noreferrer");
	};

	const handleSaveToken = async () => {
		if (!tokenInput.trim()) {
			setTokenError("Please paste your API token");
			return;
		}

		setIsValidating(true);
		setTokenError(null);

		const isValid = await validateToken(tokenInput.trim());

		if (isValid) {
			setApiToken(tokenInput.trim());
			setTokenInput("");
			setTokenError(null);
		} else {
			setTokenError("Invalid token. Please check and try again.");
		}

		setIsValidating(false);
	};

	const handleProjectSelect = (e) => {
		const selectedId = e.target.value;
		const selectedProject = projects.find((p) => p.id === selectedId);
		if (selectedProject) {
			setProject(selectedId, selectedProject.name);
		}
	};

	const handleDisconnect = () => {
		clearConfig();
		setTokenInput("");
		setProjects([]);
		setTokenError(null);
	};

	const formatLastSync = () => {
		if (!lastSyncTime) return "Never";
		const date = new Date(lastSyncTime);
		return date.toLocaleString();
	};

	const getSyncStatusDisplay = () => {
		switch (syncStatus) {
			case "syncing":
				return (
					<span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
						<Loader2 className="h-4 w-4 animate-spin" />
						Syncing...
					</span>
				);
			case "success":
				return (
					<span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
						<CheckCircle className="h-4 w-4" />
						Synced
					</span>
				);
			case "error":
				return (
					<span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
						<XCircle className="h-4 w-4" />
						{syncError || "Sync failed"}
					</span>
				);
			default:
				return <span className="text-zinc-500 dark:text-zinc-400">Idle</span>;
		}
	};

	if (!isOpen) return null;

	const isConnected = Boolean(apiToken);
	const isConfigured = apiToken && projectId;

	const modalContent = (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-zinc-200 border-b px-5 py-4 dark:border-zinc-700">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
							<svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
								<path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 16H4V6h16v13z" />
								<path d="M6 8h12v2H6zm0 4h12v2H6zm0 4h8v2H6z" />
							</svg>
						</div>
						<div>
							<h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Todoist</h2>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								{isConnected ? "Connected" : "Not connected"}
							</p>
						</div>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="space-y-5 p-5">
					{!isConnected ? (
						<>
							{/* Step 1: Get Token */}
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">
										1
									</span>
									<span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
										Get your API token
									</span>
								</div>
								<p className="ml-8 text-sm text-zinc-500 dark:text-zinc-400">
									Click the button below to open Todoist settings. Copy the API token shown there.
								</p>
								<div className="ml-8">
									<Button variant="outline" onClick={handleGetToken} className="gap-2">
										Open Todoist Settings
										<ExternalLink className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* Step 2: Paste Token */}
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 font-medium text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">
										2
									</span>
									<span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
										Paste your token
									</span>
								</div>
								<div className="ml-8 space-y-2">
									<input
										type="password"
										value={tokenInput}
										onChange={(e) => setTokenInput(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleSaveToken()}
										placeholder="Paste your API token here"
										className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
									/>
									{tokenError && (
										<p className="flex items-center gap-1 text-red-500 text-sm">
											<XCircle className="h-4 w-4" />
											{tokenError}
										</p>
									)}
									<Button
										onClick={handleSaveToken}
										disabled={isValidating || !tokenInput.trim()}
										className="w-full"
									>
										{isValidating ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Connecting...
											</>
										) : (
											"Connect to Todoist"
										)}
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Project Selector */}
							<div className="space-y-2">
								<label
									htmlFor="project-select"
									className="block font-medium text-sm text-zinc-700 dark:text-zinc-300"
								>
									Select Project
								</label>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Choose where to sync your Plex watchlist
								</p>
								{isLoadingProjects ? (
									<div className="flex items-center gap-2 py-2 text-sm text-zinc-500">
										<Loader2 className="h-4 w-4 animate-spin" />
										Loading your projects...
									</div>
								) : (
									<select
										id="project-select"
										value={projectId || ""}
										onChange={handleProjectSelect}
										className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
									>
										<option value="">Select a project...</option>
										{projects.map((project) => (
											<option key={project.id} value={project.id}>
												{project.name}
											</option>
										))}
									</select>
								)}
							</div>

							{/* Enable/Disable Toggle */}
							{isConfigured && (
								<div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
									<div>
										<p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
											Auto-sync enabled
										</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											Sync when watchlist refreshes
										</p>
									</div>
									<button
										type="button"
										role="switch"
										aria-checked={isEnabled}
										onClick={() => setEnabled(!isEnabled)}
										className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
											isEnabled
												? "bg-green-500 dark:bg-green-600"
												: "bg-zinc-300 dark:bg-zinc-600"
										}`}
									>
										<span
											className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
												isEnabled ? "translate-x-5" : "translate-x-0"
											}`}
										/>
									</button>
								</div>
							)}

							{/* Sync Status */}
							{isConfigured && (
								<div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
										{getSyncStatusDisplay()}
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">Last sync</span>
										<span className="text-sm text-zinc-900 dark:text-zinc-100">
											{formatLastSync()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-zinc-600 dark:text-zinc-400">Project</span>
										<span className="text-sm text-zinc-900 dark:text-zinc-100">
											{projectName}
										</span>
									</div>
									{syncStatus === "syncing" && (
										<Button
											variant="outline"
											size="sm"
											onClick={stopSync}
											className="w-full gap-2"
										>
											<Square className="h-3 w-3 fill-current" />
											Stop Sync
										</Button>
									)}
								</div>
							)}

							{/* Disconnect Button */}
							<Button variant="outline" onClick={handleDisconnect} className="w-full text-red-600">
								Disconnect Todoist
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default TodoistSettings;
