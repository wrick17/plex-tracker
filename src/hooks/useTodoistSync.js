import { useCallback, useRef } from "react";
import {
	createSection,
	createTask,
	deleteTask,
	getSections,
	getTasks,
	updateTask,
} from "../services/todoistApi";
import useTodoistStore from "../stores/todoistStore";
import { getGroupTitle } from "../utils/groupShows";

const PLEX_RATING_KEY_PREFIX = "plex:ratingKey:";

const extractRatingKey = (description) => {
	if (!description) return null;
	const match = description.match(/plex:ratingKey:([a-zA-Z0-9]+)/);
	return match ? match[1] : null;
};

const buildTaskDescription = (show) => {
	const plexUrl = show.publicPagesURL || "";
	const ratingKey = show.ratingKey;

	const parts = [];
	if (plexUrl) {
		parts.push(plexUrl);
	}
	parts.push("---");
	parts.push(`${PLEX_RATING_KEY_PREFIX}${ratingKey}`);

	return parts.join("\n\n");
};

const getShowDueDate = (show) => {
	const dateString = show.lastSeasonEndDate || show.lastSeasonStartDate;
	if (!dateString) return null;

	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return null;

	return date.toISOString().split("T")[0];
};

const needsUpdate = (existingTask, show) => {
	const newDescription = buildTaskDescription(show);
	const newDueDate = getShowDueDate(show);

	const descriptionChanged = existingTask.description !== newDescription;
	const existingDueDate = existingTask.due?.date || null;
	const dueDateChanged = existingDueDate !== newDueDate;

	return descriptionChanged || dueDateChanged;
};

const SECTION_ORDER = ["currently-airing", "recently-ended", "not-yet-aired", "finished-airing"];

export const useTodoistSync = () => {
	const syncInProgress = useRef(false);
	const abortControllerRef = useRef(null);
	const { apiToken, projectId, isEnabled, setSyncStatus, isConfigured } = useTodoistStore();

	const stopSync = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		syncInProgress.current = false;
		setSyncStatus("idle");
	}, [setSyncStatus]);

	const syncToTodoist = useCallback(
		async (groupedShows) => {
			const canSync = isEnabled && isConfigured() && !syncInProgress.current;
			if (!canSync) return;

			syncInProgress.current = true;
			abortControllerRef.current = new AbortController();
			setSyncStatus("syncing");

			const checkAborted = () => {
				if (abortControllerRef.current?.signal.aborted) {
					throw new Error("Sync cancelled");
				}
			};

			try {
				const [existingSections, existingTasks] = await Promise.all([
					getSections(apiToken, projectId),
					getTasks(apiToken, projectId),
				]);

				checkAborted();

				const sectionMap = new Map(existingSections.map((s) => [s.name, s.id]));

				const tasksByRatingKey = new Map();
				for (const task of existingTasks) {
					const ratingKey = extractRatingKey(task.description);
					if (ratingKey) {
						tasksByRatingKey.set(ratingKey, task);
					}
				}

				const sectionIdMap = {};
				for (const status of SECTION_ORDER) {
					checkAborted();
					const sectionName = getGroupTitle(status);
					if (!sectionMap.has(sectionName)) {
						const newSection = await createSection(apiToken, projectId, sectionName);
						sectionIdMap[status] = newSection.id;
						sectionMap.set(sectionName, newSection.id);
					} else {
						sectionIdMap[status] = sectionMap.get(sectionName);
					}
				}

				const plexRatingKeys = new Set();

				for (const status of SECTION_ORDER) {
					const shows = groupedShows[status] || [];
					const targetSectionId = sectionIdMap[status];

					for (const show of shows) {
						checkAborted();

						const ratingKey = String(show.ratingKey);
						plexRatingKeys.add(ratingKey);

						const existingTask = tasksByRatingKey.get(ratingKey);

						if (!existingTask) {
							await createTask(
								apiToken,
								projectId,
								targetSectionId,
								show.title,
								buildTaskDescription(show),
								getShowDueDate(show)
							);
						} else {
							const updates = {};
							let hasUpdates = false;

							if (existingTask.section_id !== targetSectionId) {
								updates.section_id = targetSectionId;
								hasUpdates = true;
							}

							if (needsUpdate(existingTask, show)) {
								updates.description = buildTaskDescription(show);
								const dueDate = getShowDueDate(show);
								if (dueDate) {
									updates.due_date = dueDate;
								}
								hasUpdates = true;
							}

							if (hasUpdates) {
								await updateTask(apiToken, existingTask.id, updates);
							}
						}
					}
				}

				for (const [ratingKey, task] of tasksByRatingKey) {
					checkAborted();
					if (!plexRatingKeys.has(ratingKey)) {
						await deleteTask(apiToken, task.id);
					}
				}

				setSyncStatus("success");
			} catch (error) {
				if (error.message === "Sync cancelled") {
					setSyncStatus("idle");
				} else {
					console.error("Todoist sync failed:", error);
					setSyncStatus("error", error.message);
				}
			} finally {
				syncInProgress.current = false;
				abortControllerRef.current = null;
			}
		},
		[apiToken, projectId, isEnabled, isConfigured, setSyncStatus]
	);

	return { syncToTodoist, stopSync, isSyncing: syncInProgress };
};

export default useTodoistSync;
