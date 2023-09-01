import { NextApiRequest, NextApiResponse } from "next";
import mongoConnection from "@/helpers/Mongo/mongoConnection";
import Schedule from "@/helpers/Mongo/Schemas/Schedule";
import {
	checkReadPermissions,
	checkWritePermissions,
} from "@/helpers/backend/checkPermission";
import getAndCheckAuth from "@/helpers/backend/getAndCheckAuth";
import admin from "@/helpers/backend/firebase/adminInit";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// logger

	res.setHeader("Access-Control-Allow-Origin", [
		"http://localhost:3000",
		"https://sittersync.vercel.app/",
	]);
	res.setHeader("Access-Control-Allow-Methods", ["PUT"]);

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

	console.log(`New ${req.method} request to /api/event by ${user?.email}.`);

	try {
		switch (req.method) {
			case "PUT":
				updateEvent(req, res);
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

async function updateEvent(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		await getAndCheckAuth(req, res);

		const target = await Schedule.findById<EventStore>(req.query.id);
		if (!target) {
			res.status(404).json({ error: "Schedule not found..." });
			return;
		}

		const readError = await checkReadPermissions(req, res, target);
		if (readError) {
			res.status(401).json({ error: readError });
			return;
		}

		const event = req.body as ScheduleEvent;

		const newTarget = {
			...target,
			events: target.events.map(ev => {
				if (ev.id === event.id)
					return {
						...ev,
						extendedProps: {
							...ev.extendedProps,
							completed: event.extendedProps?.completed,
						},
					};
				return ev;
			}),
		};

		const updatedSchedule = await Schedule.findByIdAndUpdate<EventStore>(
			req.query.id,
			newTarget,
			{ new: true }
		);

		res.status(200).json({ success: true, updatedSchedule });
	} catch (error: Error | unknown) {
		res.status(500).json({ error: "Updating event went wrong..." });
	}
}
