const TODOIST_API_BASE = "https://api.todoist.com/rest/v2";

const makeRequest = async (apiToken, endpoint, options = {}) => {
	const response = await fetch(`${TODOIST_API_BASE}${endpoint}`, {
		...options,
		headers: {
			Authorization: `Bearer ${apiToken}`,
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Todoist API error: ${response.status} ${errorText}`);
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
};

export const getProjects = async (apiToken) => {
	return makeRequest(apiToken, "/projects");
};

export const getSections = async (apiToken, projectId) => {
	return makeRequest(apiToken, `/sections?project_id=${projectId}`);
};

export const createSection = async (apiToken, projectId, name) => {
	return makeRequest(apiToken, "/sections", {
		method: "POST",
		body: JSON.stringify({
			project_id: projectId,
			name,
		}),
	});
};

export const getTasks = async (apiToken, projectId) => {
	return makeRequest(apiToken, `/tasks?project_id=${projectId}`);
};

export const createTask = async (apiToken, projectId, sectionId, content, description, dueDate) => {
	const taskData = {
		project_id: projectId,
		section_id: sectionId,
		content,
		description,
	};

	if (dueDate) {
		taskData.due_date = dueDate;
	}

	return makeRequest(apiToken, "/tasks", {
		method: "POST",
		body: JSON.stringify(taskData),
	});
};

export const updateTask = async (apiToken, taskId, updates) => {
	return makeRequest(apiToken, `/tasks/${taskId}`, {
		method: "POST",
		body: JSON.stringify(updates),
	});
};

export const moveTask = async (apiToken, taskId, sectionId) => {
	return makeRequest(apiToken, `/tasks/${taskId}`, {
		method: "POST",
		body: JSON.stringify({
			section_id: sectionId,
		}),
	});
};

export const deleteTask = async (apiToken, taskId) => {
	return makeRequest(apiToken, `/tasks/${taskId}`, {
		method: "DELETE",
	});
};

export const validateToken = async (apiToken) => {
	try {
		await getProjects(apiToken);
		return true;
	} catch {
		return false;
	}
};
