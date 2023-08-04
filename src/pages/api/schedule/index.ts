import { NextApiRequest, NextApiResponse } from "next";
import Schedule from "@/helpers/Mongo/Schemas/Schedule";
import mongoConnection from "@/helpers/Mongo/mongoConnection";
import admin from "@/helpers/backend/firebase/adminInit";
import {
	checkReadPermissions,
	checkWritePermissions,
} from "@/helpers/backend/checkPermission";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// cors
	// logger

	if (!req.headers.authorization) {
		res.status(401).json({ error: "Unauthorized" });
		console.error("Unauthorized, no auth header");
		return;
	}

	const user = await admin
		.auth()
		.verifyIdToken(req.headers.authorization.split(" ")[1])
		.catch(error => {
			console.error(error);
			res.status(401).json({ error: "Unauthorized" });
		});

	console.log(`New ${req.method} request to /api/schedule by ${user?.email}.`);

	try {
		switch (req.method) {
			case "GET":
				getSchedule(req, res);
				break;
			case "POST":
				createSchedule(req, res);
				break;
			case "PUT":
				updateSchedule(req, res);
				break;
			case "DELETE":
				deleteSchedule(req, res);
				break;
			default:
				res.status(405).json({ error: "Method not supported" });
				break;
		}
	} catch (error) {
		console.error(error);
		res.status(500).json("Server error, please try again later.");
	}
}

async function getSchedule(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		const target = await Schedule.findById<EventStore>(req.query.id);
		if (!target) {
			res.status(404).json({ error: "Schedule not found" });
			return;
		}

		const readError = await checkReadPermissions(req, res, target);
		if (readError) {
			res.status(401).json({ error: readError });
			return;
		}

		res.status(200).json(target);
	} catch (error) {
		console.error(error);
		res.status(500).json("Server error, please try again later.");
	}
}

async function createSchedule(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		if (!req.headers.authorization) {
			res.status(401).json({ error: "Unauthorized" });
			console.error("Unauthorized, no auth header");
			return;
		}

		const user = await admin
			.auth()
			.verifyIdToken(req.headers.authorization.split(" ")[1])
			.catch(error => {
				console.error(error);
				res.status(401).json({ error: "Unauthorized" });
			});

		const ownerEmail = user?.email;
		if (!ownerEmail) {
			res.status(401).json({ error: "Unauthorized" });
			console.error("Unauthorized, no email");
			return;
		}

		const { title } = req.body;
		if (!title) res.status(400).json({ error: "No title provided" });

		const scheduleObj = {
			title,
			users: {
				ownerEmail,
				sharingWith: [],
			},
			events: [],
		};

		const newSchedule = await Schedule.create<EventStore>(scheduleObj);

		res.status(200).json(newSchedule);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Creating schedule went wrong..." });
	}
}

async function updateSchedule(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		const target = await Schedule.findById<EventStore>(req.query.id);
		if (!target) {
			res.status(404).json({ error: "Schedule not found..." });
			return;
		}

		const writeError = await checkWritePermissions(req, res, target);
		if (writeError) {
			res.status(401).json({ error: writeError });
			return;
		}

		const updatedSchedule = await Schedule.findByIdAndUpdate<EventStore>(
			req.query.id,
			req.body,
			{ new: true }
		);

		res.status(200).json({ success: true, updatedSchedule });
	} catch (error: Error | unknown) {
		res.status(500).json({ error: "Updating schedule went wrong..." });
	}
}

async function deleteSchedule(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		const target = await Schedule.findById<EventStore>(req.query.id);
		if (!target) {
			res.status(404).json({ error: "Schedule not found..." });
			return;
		}

		const writeError = await checkWritePermissions(req, res, target);
		if (writeError) {
			res.status(401).json({ error: writeError });
			return;
		}

		await Schedule.deleteOne({ _id: req.query.id });

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: "Deleting schedule went wrong..." });
	}
}
