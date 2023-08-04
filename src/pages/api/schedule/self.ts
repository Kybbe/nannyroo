import { NextApiRequest, NextApiResponse } from "next";
import mongoConnection from "@/helpers/Mongo/mongoConnection";
import Schedule from "@/helpers/Mongo/Schemas/Schedule";
import admin from "@/helpers/backend/firebase/adminInit";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// cors
	// atuhorization
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

	try {
		console.log(
			`New ${req.method} request to /api/schedule/self by ${user?.email}.`
		);
		switch (req.method) {
			case "GET":
				getSchedule(req, res);
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

		const email = user?.email;
		if (!email) {
			res.status(401).json({ error: "Unauthorized" });
			console.error("Unauthorized, no email");
			return;
		}

		const ownerSchedules = (await Schedule.find({
			"users.ownerEmail": email,
		})) as EventStore[];

		const sharedSchedules = (await Schedule.find({
			"users.sharingWith.userEmail": email,
		})) as EventStore[];

		const schedules = {
			ownerSchedules,
			sharedSchedules,
		};

		res.status(200).json(schedules);
	} catch (error) {
		console.error(error);
		res.status(500).json("Server error, please try again later.");
	}
}
