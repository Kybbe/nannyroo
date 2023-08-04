import { NextApiRequest, NextApiResponse } from "next";
import admin from "./firebase/adminInit";

export async function checkReadPermissions(
	req: NextApiRequest,
	res: NextApiResponse,
	targetSchedule: EventStore
) {
	let mainErr: string | null = null;
	if (!req.headers.authorization) {
		res.status(401).json({ error: "Unauthorized" });
	} else {
		const user = await admin
			.auth()
			.verifyIdToken(req.headers.authorization.split(" ")[1])
			.catch(err => {
				console.error(err);
				res.status(401).json({ error: "Unauthorized" });
			});

		const userEmail = user?.email;
		if (!userEmail) {
			mainErr = "Unauthorized, no user email provided";
		}
		const isOwner = targetSchedule.users.ownerEmail === userEmail;
		const isShared = targetSchedule.users.sharingWith.some(
			u => u.userEmail === userEmail
		);
		if (!isOwner && !isShared) {
			mainErr = "Unauthorized, not owner or shared user";
		}
	}

	return mainErr || null;
}

export async function checkWritePermissions(
	req: NextApiRequest,
	res: NextApiResponse,
	targetSchedule: EventStore
) {
	let mainErr: string | null = null;
	if (!req.headers.authorization) {
		res.status(401).json({ error: "Unauthorized" });
	} else {
		const user = await admin
			.auth()
			.verifyIdToken(req.headers.authorization.split(" ")[1])
			.catch(err => {
				console.error(err);
				res.status(401).json({ error: "Unauthorized" });
			});

		const userEmail = user?.email;
		if (!userEmail) {
			mainErr = "Unauthorized, no user email provided";
		}
		const isOwner = targetSchedule.users.ownerEmail === userEmail;
		const isShared = targetSchedule.users.sharingWith.some(
			u => u.userEmail === userEmail
		);
		const hasWritePermissions =
			isShared &&
			targetSchedule.users.sharingWith.some(
				u => u.userEmail === userEmail && u.permissions === "write"
			);
		if (!isOwner && !hasWritePermissions) {
			mainErr = "Unauthorized, not owner or shared user with write permissions";
		}
	}

	return mainErr || null;
}
