import { getAuth } from "firebase/auth";

export default async function saveToDatabase(
	object: ScheduleEvent | EventStore,
	parentScheduleId: string | undefined,
	type: "event" | "schedule",
	action: "POST" | "PUT" | "DELETE"
) {
	if (parentScheduleId && parentScheduleId === "all") {
		console.error("Cannot save to all schedules");
		return;
	}
	const auth = getAuth();
	const token = await auth.currentUser?.getIdToken(true);
	if (!token) {
		console.error("Failed to get token");
		return;
	}

	const queryId = type === "event" ? parentScheduleId : object._id;

	const link = `http://localhost:3000/api/${type}${
		queryId ? `?id=${queryId}` : ""
	}`;

	const response = await fetch(link, {
		method: action,
		headers: {
			"Content-Type": "application/json",
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(object),
	});

	const result = await response.json();

	if (result.error) {
		console.error(result);
	}
	console.info(`Saved ${type} to database`, result);
}
