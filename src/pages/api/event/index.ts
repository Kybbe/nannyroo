import { NextApiRequest, NextApiResponse } from "next";
import mongoConnection from "@/helpers/Mongo/mongoConnection";
import Schedule from "@/helpers/Mongo/Schemas/Schedule";
import { checkWritePermissions } from "@/helpers/backend/checkPermission";
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
	res.setHeader("Access-Control-Allow-Methods", [
		"GET",
		"POST",
		"PUT",
		"DELETE",
	]);

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
			case "GET":
				getEvent(req, res);
				break;
			case "POST":
				createEvent(req, res);
				break;
			case "PUT":
				updateEvent(req, res);
				break;
			case "DELETE":
				deleteEvent(req, res);
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

async function getEvent(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		const { email } = await getAndCheckAuth(req, res);

		const allowedSchedules = (await Schedule.find({
			$or: [
				{ "users.ownerEmail": email },
				{ "users.sharingWith.userEmail": email },
			],
		})) as EventStore[];

		const events = allowedSchedules.reduce(
			(acc, schedule) => [...acc, ...schedule.events],
			[] as ScheduleEvent[]
		);

		const event = events.find(ev => ev.id === req.query.id);

		if (!event) {
			res.status(404).json({ error: "Event not found..." });
			return;
		}

		res.status(200).json(event);
	} catch (error) {
		console.error(error);
		res.status(500).json("Server error, please try again later.");
	}
}

async function createEvent(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		await getAndCheckAuth(req, res);

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

		const event = req.body as ScheduleEvent;

		const newEvent = await Schedule.findByIdAndUpdate<EventStore>(
			req.query.id,
			{
				$push: {
					events: event,
				},
			},
			{ new: true }
		);

		res.status(200).json({ success: true, newEvent });
	} catch (error: Error | unknown) {
		res.status(500).json({ error: "Creating event went wrong..." });
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

		const writeError = await checkWritePermissions(req, res, target);
		if (writeError) {
			res.status(401).json({ error: writeError });
			return;
		}

		const event = req.body as ScheduleEvent;

		const newTarget = {
			_id: target._id,
			title: target.title,
			users: target.users,
			events: target.events.map(ev => {
				if (ev.id === event.id) return event;
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

async function deleteEvent(req: NextApiRequest, res: NextApiResponse) {
	try {
		await mongoConnection();

		await getAndCheckAuth(req, res);

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

		const event = req.body as ScheduleEvent;

		const updatedSchedule = await Schedule.findByIdAndUpdate<EventStore>(
			req.query.id,
			{
				$pull: {
					events: { id: event.id },
				},
			},
			{ new: true }
		);

		res.status(200).json({ success: true, updatedSchedule });
	} catch (error: Error | unknown) {
		res.status(500).json({ error: "Deleting event went wrong..." });
	}
}
